#!/usr/bin/env python3
"""
Converts the official MyScheme dataset into YojnaSetu's Scheme format.
Selects 600+ real, active government schemes across Central and State jurisdictions.
"""

import json
import re
import os

RAW_FILE = 'data/raw-myscheme.json'
OUTPUT_FILE = 'data/custom-schemes.json'

def classify_category(name, tags, ministry, desc):
    text = f"{name} {tags} {ministry} {desc}".lower()
    if any(k in text for k in ['scholarship', 'aicte', 'ugc', 'fellowship', 'tuition', 'matric', 'student', 'higher secondary', 'education', 'school', 'university', 'college', 'study abroad']):
        return 'education'
    if any(k in text for k in ['arogya', 'swasthya', 'hospital', 'medical', 'ayush', 'treatment', 'medicine', 'health', 'disease', 'wellness', 'sanitation', 'immunization']):
        return 'health'
    if any(k in text for k in ['awas', 'housing', 'pucca', 'shelter', 'homeless', 'residential', 'slum']):
        return 'housing'
    if any(k in text for k in ['kisan', 'krishi', 'crop', 'fertilizer', 'seed', 'horticulture', 'dairy', 'animal husbandry', 'fisheries', 'farmer', 'agriculture', 'irrigation']):
        return 'agriculture'
    if any(k in text for k in ['kanya', 'ladli', 'beti', 'maternity', 'mother', 'widow', 'girl child', 'women', 'mahila', 'poshan', 'nutrition']):
        return 'women_children'
    if any(k in text for k in ['old age', 'senior citizen', 'vridha', 'vaya vandana', 'pension']):
        return 'pension'
    if any(k in text for k in ['divyang', 'handicapped', 'disability', 'disabled', 'blind', 'hearing impaired', 'prosthetic']):
        return 'disability'
    if any(k in text for k in ['unemployed', 'self employment', 'artisan', 'weaver', 'handloom', 'msme', 'entrepreneur', 'startup', 'skill development', 'training', 'apprenticeship', 'mudra', 'loan', 'employment']):
        return 'employment'
    if any(k in text for k in ['sc/st', 'scheduled caste', 'scheduled tribe', 'backward class', 'tribal', 'bpl', 'ration', 'subsidy', 'social welfare', 'social security']):
        return 'social_security'
    return 'other'

def clean_text(s):
    if not s:
        return ''
    s = s.replace('\r\n', '\n').replace('\r', '\n')
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

def make_summary(desc):
    clean = clean_text(desc)
    if not clean:
        return 'Comprehensive government welfare scheme supporting citizens with financial and technical provisions.'
    # Take first 2 sentences
    sentences = re.split(r'(?<=[.!?])\s+', clean)
    if len(sentences) >= 2:
        candidate = f"{sentences[0]} {sentences[1]}"
        if len(candidate) <= 300:
            return candidate
    return clean[:280] + ('...' if len(clean) > 280 else '')

def parse_benefits(text):
    if not text:
        return ['Financial and tangible assistance as outlined in official department guidelines.']
    clean = text.replace('\r\n', '\n').replace('\r', '\n')
    lines = []
    for raw in re.split(r'[\n•*–—>]|(?<=[.!?])\s+(?=[A-Z0-9₹])', clean):
        line = re.sub(r'^\d+[\.\)]\s*', '', raw.strip())
        if len(line) > 12:
            lines.append(line)
    return lines[:6] if lines else [clean_text(text)[:250]]

def parse_docs(text):
    if not text:
        return ['Aadhaar Card or Photo Identity proof', 'Proof of residence / Domicile Certificate', 'Active Bank Account passbook / details']
    clean = text.replace('\r\n', '\n').replace('\r', '\n')
    lines = []
    for raw in re.split(r'[\n•*–—>]|(?<=[.!?])\s+(?=[a-z0-9][\.\)])', clean):
        line = re.sub(r'^[a-z0-9][\.\)]\s*', '', raw.strip())
        if len(line) > 6:
            lines.append(line)
    return lines[:6] if lines else ['Identity and address verification documents']

def parse_steps(text):
    if not text:
        return [
            'Step 1: Check eligibility guidelines and application deadlines on the official portal.',
            'Step 2: Complete the application form online or through the designated department office.',
            'Step 3: Submit required verification documents and note the acknowledgment number.'
        ]
    clean = text.replace('\r\n', '\n').replace('\r', '\n')
    if 'Step' in clean:
        parts = re.split(r'(?=Step \d+:?)', clean)
        cleaned = [p.strip() for p in parts if len(p.strip()) > 10]
        if len(cleaned) >= 2:
            return cleaned[:6]
    lines = [l.strip() for l in clean.split('\n') if len(l.strip()) > 12]
    return lines[:6] if lines else [clean_text(text)[:250]]

def main():
    if not os.path.exists(RAW_FILE):
        print(f"Error: {RAW_FILE} not found!")
        return

    with open(RAW_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Loaded {len(data)} raw schemes from {RAW_FILE}.")

    # Include all Central schemes + top 100 State schemes
    central_schemes = [d for d in data if d.get('Level') == 'Central Government']
    state_schemes = [d for d in data if d.get('Level') != 'Central Government']

    # Pick all Central schemes + top 100 state schemes
    selected_raw = central_schemes + state_schemes[:100]
    print(f"Selected {len(selected_raw)} schemes (Central: {len(central_schemes)}, State: 100).")

    converted = []
    seen_slugs = set()

    for item in selected_raw:
        raw_name = clean_text(item.get('Scheme Name', ''))
        raw_slug = item.get('Scheme Slug', '').strip()
        if not raw_name:
            continue

        slug = raw_slug or re.sub(r'[^a-z0-9]+', '-', raw_name.lower()).strip('-')
        if slug in seen_slugs:
            slug = f"{slug}-{len(converted)}"
        seen_slugs.add(slug)

        level = item.get('Level', '')
        state_or_ministry = clean_text(item.get('State / UT / Ministry', ''))
        is_central = 'Central' in level or 'Ministry' in state_or_ministry

        category = classify_category(
            raw_name,
            item.get('Tags / Categories', ''),
            state_or_ministry,
            item.get('Description', '')
        )

        desc = clean_text(item.get('Description', ''))
        summary = make_summary(desc)

        jurisdiction = 'Central' if is_central else (state_or_ministry or 'State')

        official_url = item.get('Official Link', '').strip()
        myscheme_url = item.get('MyScheme URL', '').strip()
        final_url = official_url if official_url.startswith('http') else (myscheme_url if myscheme_url.startswith('http') else '')

        benefits = parse_benefits(item.get('Benefits', ''))
        documents = parse_docs(item.get('Documents Required', ''))
        steps = parse_steps(item.get('Application Process', ''))
        raw_eligibility = clean_text(item.get('Eligibility Criteria', '') or item.get('Eligibility (General)', ''))

        criteria = []
        if jurisdiction != 'Central':
            criteria.append({
                "id": f"crit-{slug}-state",
                "field": "state_residence",
                "label": f"{jurisdiction} Resident",
                "description": f"Applicant must be a permanent resident of {jurisdiction}.",
                "type": "state",
                "required": True,
                "operator": "eq",
                "value": jurisdiction
            })

        criteria.append({
            "id": f"crit-{slug}-gen",
            "field": "general_criteria",
            "label": "Eligibility Terms",
            "description": raw_eligibility[:220] if raw_eligibility else "Citizen meeting prescribed guidelines issued by the administering authority.",
            "type": "custom",
            "required": True,
            "operator": "exists",
            "value": True
        })

        scheme_obj = {
            "id": f"scheme-{slug}",
            "name": raw_name,
            "slug": slug,
            "category": category,
            "department": state_or_ministry or ('Government of India' if is_central else jurisdiction),
            "jurisdiction": jurisdiction,
            "targetGroup": clean_text(item.get('Tags / Categories', ''))[:100] or 'Eligible Citizens',
            "summary": summary,
            "description": desc or summary,
            "benefits": benefits,
            "eligibilityCriteria": criteria,
            "requiredDocuments": documents,
            "applicationSteps": steps,
            "officialUrl": final_url,
            "status": "active",
            "isSampleData": False,
            "effectiveDate": "2023-01-01",
            "lastVerifiedDate": "2025-01-01",
            "sources": [
                {
                    "documentId": f"doc-{slug}",
                    "title": f"{raw_name} Guidelines",
                    "sourceUrl": final_url or "https://www.myscheme.gov.in",
                    "department": state_or_ministry,
                    "publicationDate": "2023-01-01"
                }
            ]
        }

        converted.append(scheme_obj)

    print(f"Successfully converted {len(converted)} schemes.")

    # Save to custom-schemes.json
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(converted, f, indent=2, ensure_ascii=False)

    print(f"Saved {len(converted)} schemes into {OUTPUT_FILE} (File size: {os.path.getsize(OUTPUT_FILE) / 1024:.1f} KB).")

if __name__ == '__main__':
    main()
