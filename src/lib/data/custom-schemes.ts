import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Scheme } from '@/lib/types';
import { SAMPLE_SCHEMES } from './sample-schemes';

const CUSTOM_SCHEMES_FILE = path.resolve(process.cwd(), 'data', 'custom-schemes.json');

/**
 * Read custom schemes added by admin through the admin dashboard.
 */
export function getCustomSchemes(): Scheme[] {
  try {
    if (!fs.existsSync(CUSTOM_SCHEMES_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(CUSTOM_SCHEMES_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('[CustomSchemes] Failed to read custom schemes file:', error);
    return [];
  }
}

/**
 * Save or append a new custom scheme.
 */
export function saveCustomScheme(scheme: Scheme): void {
  saveCustomSchemes([scheme]);
}

/**
 * Save or append multiple custom schemes in a single disk write.
 */
export function saveCustomSchemes(schemes: Scheme[]): void {
  const dir = path.dirname(CUSTOM_SCHEMES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const existing = getCustomSchemes();
  const indexMap = new Map<string, number>();
  existing.forEach((s, idx) => {
    indexMap.set(s.id, idx);
    indexMap.set(s.slug, idx);
  });

  for (const s of schemes) {
    const idx = indexMap.get(s.id) ?? indexMap.get(s.slug);
    if (idx !== undefined && idx >= 0) {
      existing[idx] = s;
    } else {
      existing.push(s);
      indexMap.set(s.id, existing.length - 1);
      indexMap.set(s.slug, existing.length - 1);
    }
  }

  fs.writeFileSync(CUSTOM_SCHEMES_FILE, JSON.stringify(existing, null, 2), 'utf-8');
}

/**
 * Delete a custom scheme by ID or slug.
 */
export function deleteCustomScheme(idOrSlug: string): boolean {
  if (!fs.existsSync(CUSTOM_SCHEMES_FILE)) return false;

  const existing = getCustomSchemes();
  const filtered = existing.filter((s) => s.id !== idOrSlug && s.slug !== idOrSlug);

  if (filtered.length !== existing.length) {
    fs.writeFileSync(CUSTOM_SCHEMES_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  }

  return false;
}

/**
 * Get all available schemes: baseline sample schemes + any admin-added custom schemes.
 */
export function getAllSchemes(): Scheme[] {
  const custom = getCustomSchemes();
  if (custom.length === 0) {
    return SAMPLE_SCHEMES;
  }

  const customIds = new Set(custom.map((c) => c.id));
  const baseFiltered = SAMPLE_SCHEMES.filter((b) => !customIds.has(b.id));

  return [...baseFiltered, ...custom];
}
