/**
 * Translation loader and configuration for KingdomQuest i18n
 * This file provides utilities for loading and managing translations
 */

import { locales, defaultLocale, localeNames, getDirectionForLocale } from '../middleware';

export type Locale = typeof locales[number];
export type LocaleMessages = Record<string, any>;

// Translation metadata interface
interface TranslationMetadata {
  language: string;
  locale: string;
  version: string;
  lastUpdated: string;
  completeness: number;
  direction: 'ltr' | 'rtl';
}

// Translation validation interface
interface TranslationValidation {
  missingKeys: string[];
  extraKeys: string[];
  emptyValues: string[];
  isValid: boolean;
}

/**
 * Load translation messages for a specific locale
 * @param locale The locale to load messages for
 * @returns Promise resolving to the translation messages
 */
export async function loadMessages(locale: Locale): Promise<LocaleMessages> {
  try {
    const messages = await import(`./${locale}.json`);
    return messages.default;
  } catch (error) {
    console.warn(`Failed to load messages for locale: ${locale}`, error);
    // Fallback to default locale
    if (locale !== defaultLocale) {
      return loadMessages(defaultLocale);
    }
    throw new Error(`Failed to load messages for default locale: ${defaultLocale}`);
  }
}

/**
 * Get translation metadata for a specific locale
 * @param locale The locale to get metadata for
 * @returns Translation metadata
 */
export async function getTranslationMetadata(locale: Locale): Promise<TranslationMetadata> {
  try {
    const messages = await loadMessages(locale);
    const metadata = messages._metadata || {};
    
    return {
      language: metadata.language || localeNames[locale] || locale,
      locale,
      version: metadata.version || '1.0.0',
      lastUpdated: metadata.lastUpdated || new Date().toISOString().split('T')[0],
      completeness: metadata.completeness || 100,
      direction: getDirectionForLocale(locale)
    };
  } catch (error) {
    console.warn(`Failed to get metadata for locale: ${locale}`, error);
    return {
      language: localeNames[locale] || locale,
      locale,
      version: '1.0.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      completeness: 0,
      direction: getDirectionForLocale(locale)
    };
  }
}

/**
 * Validate translation completeness against base locale
 * @param locale The locale to validate
 * @param baseLocale The base locale to compare against (default: 'en')
 * @returns Validation results
 */
export async function validateTranslation(
  locale: Locale,
  baseLocale: Locale = defaultLocale
): Promise<TranslationValidation> {
  try {
    const [targetMessages, baseMessages] = await Promise.all([
      loadMessages(locale),
      loadMessages(baseLocale)
    ]);
    
    // Extract all keys from both translations (excluding metadata)
    const targetKeys = extractKeys(targetMessages).filter(key => !key.startsWith('_metadata'));
    const baseKeys = extractKeys(baseMessages).filter(key => !key.startsWith('_metadata'));
    
    // Find missing and extra keys
    const missingKeys = baseKeys.filter(key => !targetKeys.includes(key));
    const extraKeys = targetKeys.filter(key => !baseKeys.includes(key));
    
    // Find empty values
    const emptyValues = findEmptyValues(targetMessages);
    
    return {
      missingKeys,
      extraKeys,
      emptyValues,
      isValid: missingKeys.length === 0 && emptyValues.length === 0
    };
  } catch (error) {
    console.error(`Failed to validate translation for locale: ${locale}`, error);
    return {
      missingKeys: [],
      extraKeys: [],
      emptyValues: [],
      isValid: false
    };
  }
}

/**
 * Extract all translation keys from a messages object
 * @param messages The messages object
 * @param prefix Optional prefix for nested keys
 * @returns Array of all translation keys
 */
function extractKeys(messages: LocaleMessages, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const [key, value] of Object.entries(messages)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * Find empty or missing values in translation messages
 * @param messages The messages object
 * @param prefix Optional prefix for nested keys
 * @returns Array of keys with empty values
 */
function findEmptyValues(messages: LocaleMessages, prefix = ''): string[] {
  const emptyKeys: string[] = [];
  
  for (const [key, value] of Object.entries(messages)) {
    if (key.startsWith('_metadata')) continue;
    
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      emptyKeys.push(...findEmptyValues(value, fullKey));
    } else if (!value || (typeof value === 'string' && value.trim() === '')) {
      emptyKeys.push(fullKey);
    }
  }
  
  return emptyKeys;
}

/**
 * Get all supported locales with their display names
 * @returns Array of locale objects
 */
export function getSupportedLocales() {
  return locales.map(locale => ({
    code: locale,
    name: localeNames[locale],
    direction: getDirectionForLocale(locale)
  }));
}

/**
 * Get the best matching locale from user preferences
 * @param acceptLanguage The Accept-Language header value
 * @param availableLocales Available locales (defaults to supported locales)
 * @returns Best matching locale or default locale
 */
export function getBestMatchingLocale(
  acceptLanguage: string | null,
  availableLocales: readonly string[] = locales
): Locale {
  if (!acceptLanguage) {
    return defaultLocale;
  }
  
  // Parse Accept-Language header
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, q = '1'] = lang.trim().split(';q=');
      return { code: code.toLowerCase(), quality: parseFloat(q) };
    })
    .sort((a, b) => b.quality - a.quality);
  
  // Find best match
  for (const { code } of languages) {
    // Exact match
    if (availableLocales.includes(code)) {
      return code as Locale;
    }
    
    // Language match (e.g., 'en' for 'en-US')
    const langCode = code.split('-')[0];
    const match = availableLocales.find(locale => locale.startsWith(langCode));
    if (match) {
      return match as Locale;
    }
  }
  
  return defaultLocale;
}