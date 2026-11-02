export interface AIProviderConfig {
  provider: 'gemini' | 'openai';
  apiKey: string;
  model: string;
  embeddingModel?: string;
  baseUrl?: string;
}

export interface AICompletionRequest {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AICompletionResponse {
  content: string;
  finishReason: string;
}

export interface AIProvider {
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
  embed(texts: string[]): Promise<number[][]>;
}

function getProviderConfig(): AIProviderConfig {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    return {
      provider: 'gemini',
      apiKey: geminiKey,
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004',
    };
  }

  if (openaiKey) {
    return {
      provider: 'openai',
      apiKey: openaiKey,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    };
  }

  throw new Error(
    'No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY in your .env.local file. See .env.example for details.'
  );
}

async function geminiComplete(config: AIProviderConfig, request: AICompletionRequest): Promise<AICompletionResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${request.systemPrompt}\n\nUser Question: ${request.userMessage}` }],
        },
      ],
      generationConfig: {
        maxOutputTokens: request.maxTokens || 1024,
        temperature: request.temperature ?? 0.3,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const finishReason = data.candidates?.[0]?.finishReason || 'unknown';

  return { content, finishReason };
}

async function geminiEmbed(config: AIProviderConfig, texts: string[]): Promise<number[][]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.embeddingModel}:batchEmbedContents?key=${config.apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: texts.map((text) => ({
        model: `models/${config.embeddingModel}`,
        content: { parts: [{ text }] },
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini Embedding API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.embeddings?.map((e: { values: number[] }) => e.values) || [];
}

async function openaiComplete(config: AIProviderConfig, request: AICompletionRequest): Promise<AICompletionResponse> {
  const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  const url = `${baseUrl}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userMessage },
      ],
      max_tokens: request.maxTokens || 1024,
      temperature: request.temperature ?? 0.3,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || '',
    finishReason: data.choices?.[0]?.finish_reason || 'unknown',
  };
}

async function openaiEmbed(config: AIProviderConfig, texts: string[]): Promise<number[][]> {
  const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  const url = `${baseUrl}/embeddings`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.embeddingModel,
      input: texts,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI Embedding API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.data?.map((item: { embedding: number[] }) => item.embedding) || [];
}

export function createAIProvider(): AIProvider {
  const config = getProviderConfig();

  return {
    complete: (request) => {
      if (config.provider === 'gemini') return geminiComplete(config, request);
      return openaiComplete(config, request);
    },
    embed: (texts) => {
      if (config.provider === 'gemini') return geminiEmbed(config, texts);
      return openaiEmbed(config, texts);
    },
  };
}
