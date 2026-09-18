import {
  getShortLangCode,
  SUPPORTED_LANGUAGES,
  DICTIONARY_SYNONYMS,
  SIMULATION_TRANSLATIONS,
  COMMON_WORD_DICTIONARY,
  PRONOUN_DICTIONARY
} from '../utils/languages.js';

// Unicode normalizer: strips punctuation while preserving letters, unicode vowel marks/viramas (\p{M}), numbers, spaces
export function normalizeText(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Known crowd-sourced spam/corrupted/transliterated translations returned by MyMemory to blacklist
const KNOWN_CORRUPTED_TRANSLATIONS = [
  'இவ வந்து குளிக்க போயிட்டு',
  'குளிக்க போயிட்டு',
  'ஒரு ஒத்திசைவான ஒருங்கிணைந்த வாக்கியத்தை உருவாக்குங்கள்',
  'அது மிகவும் வேடிக்கையானது',
  'ஒருபோதும் விடைபெற வேண்டாம்',
  'sooru saptiya',
  'sooru saptacha',
  'sooru',
  'saptiya',
  'ena panra',
  'enna panra',
  'ena panreenga',
  'enna panreenga',
  'yenna panra',
  'yenna panreenga',
  'nuvvu vishes cheppavuga andhuke same to you annanu',
  'nuvvu vishes',
  'mymemory warning',
  'please select two distinct languages',
  'query length limit exceeded',
  'quota exceeded',
  'you used all available',
  'invalid target language',
  'null',
  'undefined'
];

class TranslationService {
  constructor() {
    this.cache = new Map();
  }

  // Generate cache key
  getCacheKey(text, from, to) {
    return `${from}->${to}:${text.trim().toLowerCase()}`;
  }

  // Quick dictionary matching for common phrases, pronouns, greetings, and simulated calls
  findDictionaryMatch(text, fromCode, toCode) {
    if (!text || !text.trim()) return null;

    const fromShort = getShortLangCode(fromCode);
    const toShort = getShortLangCode(toCode);

    if (fromShort === toShort) return text;

    const normText = normalizeText(text);
    if (!normText) return text;

    // 1. Check Multilingual Pronoun & Core Word Dictionary (instant 0ms, 100% precision)
    if (Array.isArray(PRONOUN_DICTIONARY)) {
      for (const entry of PRONOUN_DICTIONARY) {
        if (entry[toShort]) {
          // Match by canonical key (e.g. 'i', 'you')
          if (entry.key && entry.key.toLowerCase() === normText) {
            return entry[toShort];
          }
          // Match by source language value (e.g. 'நான்' -> 'I' or 'I' -> 'நான்')
          if (entry[fromShort] && normalizeText(entry[fromShort]) === normText) {
            return entry[toShort];
          }
        }
      }
    }

    const fromLangObj = SUPPORTED_LANGUAGES.find(l => l.shortCode === fromShort);
    const toLangObj = SUPPORTED_LANGUAGES.find(l => l.shortCode === toShort);

    if (!fromLangObj || !toLangObj) return null;

    // 2. Check direct word dictionary (e.g. "நன்றி" -> "Thank you", "வணக்கம்" -> "Hello")
    if (COMMON_WORD_DICTIONARY) {
      if (fromShort === 'ta' && toShort === 'en' && COMMON_WORD_DICTIONARY.ta_to_en?.[normText]) {
        return COMMON_WORD_DICTIONARY.ta_to_en[normText];
      }
      if (fromShort === 'en' && toShort === 'ta' && COMMON_WORD_DICTIONARY.en_to_ta?.[normText]) {
        return COMMON_WORD_DICTIONARY.en_to_ta[normText];
      }
    }

    // 3. Check exact match in contact simulation dialogue pairs (e.g. Karthik, Sofia, Priya, Alex)
    if (Array.isArray(SIMULATION_TRANSLATIONS)) {
      for (const sim of SIMULATION_TRANSLATIONS) {
        if (sim[fromShort] && sim[toShort]) {
          if (normalizeText(sim[fromShort]) === normText) {
            return sim[toShort];
          }
        }
      }
    }

    // 4. Check multilingual synonyms dictionary (e.g. "நன்றி" or "thanks" or "thank you" -> thank_you key)
    if (DICTIONARY_SYNONYMS) {
      for (const [key, synonyms] of Object.entries(DICTIONARY_SYNONYMS)) {
        // Match key directly
        if (normalizeText(key) === normText) {
          if (toLangObj.phrases && toLangObj.phrases[key]) {
            return toLangObj.phrases[key];
          }
        }
        // Match any synonym in any language
        if (Array.isArray(synonyms) && synonyms.some(s => normalizeText(s) === normText)) {
          if (toLangObj.phrases && toLangObj.phrases[key]) {
            return toLangObj.phrases[key];
          }
        }
      }
    }

    // 5. Check exact match against fromLang phrases
    if (fromLangObj.phrases) {
      for (const [key, phraseVal] of Object.entries(fromLangObj.phrases)) {
        if (normalizeText(phraseVal) === normText || normalizeText(key) === normText) {
          if (toLangObj.phrases && toLangObj.phrases[key]) {
            return toLangObj.phrases[key];
          }
        }
      }
    }

    // 6. Reverse check against toLang phrases
    if (toLangObj.phrases) {
      for (const [key, phraseVal] of Object.entries(toLangObj.phrases)) {
        if (normalizeText(phraseVal) === normText) {
          return phraseVal;
        }
      }
    }

    // 7. Compound greeting checks (e.g., "Hello! How are you?" -> combine hello + how are you)
    if (normText.startsWith('hello ') || normText.startsWith('hi ') || normText.startsWith('hey ')) {
      const remainder = normText.replace(/^(hello|hi|hey)\s+/, '').trim();
      const helloTrans = toLangObj.phrases?.hello || 'Hello';
      const remainderTrans = this.findDictionaryMatch(remainder, fromCode, toCode);
      if (remainderTrans) {
        return `${helloTrans} ${remainderTrans}`;
      }
    }

    return null;
  }

  // Check if an online translation string is corrupted, spam, or transliterated slang
  isCorrupted(translated, originalText, targetLang = 'en') {
    if (!translated || !translated.trim()) return true;
    const lower = translated.toLowerCase().trim();

    // 1. Check blacklisted phrases
    for (const bad of KNOWN_CORRUPTED_TRANSLATIONS) {
      if (lower.includes(bad.toLowerCase())) {
        return true;
      }
    }

    // 2. Script validation: Non-Latin target languages MUST be rendered in their native script!
    const NON_LATIN_SCRIPTS = {
      ta: /[\u0B80-\u0BFF]/, // Tamil script
      hi: /[\u0900-\u097F]/, // Devanagari (Hindi) script
      zh: /[\u4E00-\u9FFF]/, // Chinese Han script
      ja: /[\u3040-\u30FF\u4E00-\u9FAF]/, // Japanese Hiragana/Katakana/Kanji
      ar: /[\u0600-\u06FF]/  // Arabic script
    };

    if (NON_LATIN_SCRIPTS[targetLang]) {
      // If target is Tamil, Hindi, Chinese, Japanese, or Arabic, but translation has NO native characters,
      // then it is transliterated Latin slang (e.g. "ena panra", "kya kar rahe ho") -> REJECT!
      if (!NON_LATIN_SCRIPTS[targetLang].test(translated)) {
        return true;
      }
    }

    // 3. If target is English, reject known Tanglish / non-English transliterated words & non-Latin scripts
    if (targetLang === 'en') {
      const tanglishWords = [
        'sooru', 'saptiya', 'saptacha', 'vannakam', 'nandri', 'aamam', 'illai',
        'eppadi', 'ena panra', 'enna panra', 'panreenga', 'panra'
      ];
      for (const tw of tanglishWords) {
        if (lower.includes(tw)) return true;
      }
      if (/[\u0B80-\u0BFF\u0900-\u097F\u0600-\u06FF\u4E00-\u9FFF]/.test(translated)) {
        return true;
      }
    }

    // 4. Length distortion check:
    // If input is 1 or 2 words, but output is 3+ words, it is suspicious crowd-sourced spam
    const originalWordCount = originalText.trim().split(/\s+/).length;
    const translatedWordCount = translated.trim().split(/\s+/).length;
    if (originalWordCount === 1 && translatedWordCount >= 3) {
      return true;
    }
    if (originalWordCount <= 2 && translatedWordCount >= 5) {
      return true;
    }
    if (originalWordCount <= 4 && translatedWordCount >= 10) {
      return true;
    }

    return false;
  }

  // Fetch from Google Translate via Vite Proxy (/api/translate) or direct fallback
  async fetchGoogleTranslation(text, fromShort, toShort) {
    // 1. Try local Vite proxy first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const url = `/api/translate?sl=${encodeURIComponent(fromShort)}&tl=${encodeURIComponent(toShort)}&q=${encodeURIComponent(text.trim())}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data?.translation && typeof data.translation === 'string' && data.translation.trim()) {
          return data.translation.trim();
        }
      }
    } catch {
      // Local proxy failed or aborted, continue to direct Google Translate
    }

    // 2. Direct Google Translate API call (client=gtx)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const directUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(fromShort)}&tl=${encodeURIComponent(toShort)}&dt=t&q=${encodeURIComponent(text.trim())}`;
      const res = await fetch(directUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.[0])) {
          const combined = data[0].map(s => s?.[0]).filter(Boolean).join('');
          if (combined && combined.trim()) {
            return combined.trim();
          }
        }
      }
    } catch {
      // Direct Google Translate failed
    }

    return null;
  }

  // Fallback to MyMemory with strict filtering
  async fetchMyMemoryTranslation(text, fromShort, toShort) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const langpair = `${fromShort}|${toShort}`;
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=${encodeURIComponent(langpair)}`;

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        let candidate = data?.responseData?.translatedText || '';

        candidate = candidate
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim();

        if (candidate && !this.isCorrupted(candidate, text, toShort)) {
          return candidate;
        }

        if (Array.isArray(data?.matches)) {
          for (const m of data.matches) {
            let mText = (m.translation || '')
              .replace(/&#39;/g, "'")
              .replace(/&quot;/g, '"')
              .replace(/&amp;/g, '&')
              .trim();
            if (mText && !this.isCorrupted(mText, text, toShort)) {
              return mText;
            }
          }
        }
      }
    } catch {
      // MyMemory failed
    }

    return null;
  }

  // Main translation function
  async translateText(text, fromLang = 'en-US', toLang = 'es-ES') {
    if (!text || !text.trim()) return '';

    const fromShort = getShortLangCode(fromLang);
    const toShort = getShortLangCode(toLang);

    // If same language, no translation needed
    if (fromShort === toShort) {
      return text;
    }

    const cacheKey = this.getCacheKey(text, fromShort, toShort);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // 1. Check verified offline dictionary first (instant, reliable, zero latency, 100% accurate)
    const dictMatch = this.findDictionaryMatch(text, fromLang, toLang);
    if (dictMatch) {
      this.cache.set(cacheKey, dictMatch);
      return dictMatch;
    }

    // 2. Primary Online Engine: Google Translate (high quality Neural Machine Translation)
    const googleResult = await this.fetchGoogleTranslation(text, fromShort, toShort);
    if (googleResult && !this.isCorrupted(googleResult, text, toShort)) {
      // Clean up Google Translate single-letter pronoun edge case for Tamil
      let finalResult = googleResult;
      if (normalizeText(text) === 'i' && toShort === 'ta' && (finalResult === 'ஐ' || finalResult === 'ஐ.')) {
        finalResult = 'நான்';
      }
      this.cache.set(cacheKey, finalResult);
      return finalResult;
    }

    // 3. Secondary Fallback: MyMemory API with strict spam validation
    const myMemoryResult = await this.fetchMyMemoryTranslation(text, fromShort, toShort);
    if (myMemoryResult && !this.isCorrupted(myMemoryResult, text, toShort)) {
      this.cache.set(cacheKey, myMemoryResult);
      return myMemoryResult;
    }

    // 4. Word-by-word fallback: check if any individual word in input matches dictionary
    const words = text.trim().split(/\s+/);
    if (words.length <= 4) {
      const translatedWords = [];
      let anyMatched = false;
      for (const w of words) {
        const singleMatch = this.findDictionaryMatch(w, fromLang, toLang);
        if (singleMatch) {
          translatedWords.push(singleMatch);
          anyMatched = true;
        } else {
          translatedWords.push(w);
        }
      }
      if (anyMatched) {
        const combined = translatedWords.join(' ');
        this.cache.set(cacheKey, combined);
        return combined;
      }
    }

    // 5. Final fallback: return original text safely without breaking UI
    this.cache.set(cacheKey, text);
    return text;
  }
}

export const translationService = new TranslationService();
