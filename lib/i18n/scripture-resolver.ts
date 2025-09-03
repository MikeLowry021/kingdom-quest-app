/**
 * Scripture Locale Resolver for KingdomQuest
 * Manages Bible translations and scripture retrieval based on user locale
 */

import { Locale } from './index';
import { supabase } from '../supabase';

// Bible translation mappings by locale
export const bibleTranslations = {
  en: {
    primary: 'WEB', // World English Bible (public domain)
    secondary: 'KJV', // King James Version
    name: 'World English Bible',
    language: 'English',
    copyright: 'Public Domain',
    direction: 'ltr' as const
  },
  af: {
    primary: 'AFR1933', // Afrikaans 1933 translation
    secondary: 'AFR1953', // Afrikaans 1953 translation
    name: 'Afrikaans Bybel 1933',
    language: 'Afrikaans',
    copyright: 'Public Domain',
    direction: 'ltr' as const
  },
  es: {
    primary: 'RVA', // Reina-Valera Antigua (public domain)
    secondary: 'RVR1960', // Reina-Valera Revisada 1960
    name: 'Reina-Valera Antigua',
    language: 'Español',
    copyright: 'Public Domain',
    direction: 'ltr' as const
  }
} as const;

// Scripture reference interface
export interface ScriptureReference {
  book: string;
  chapter: number;
  verse?: number;
  endVerse?: number;
  translation?: string;
}

// Scripture passage interface
export interface ScripturePassage {
  reference: ScriptureReference;
  text: string;
  translation: string;
  language: string;
  copyright?: string;
  direction: 'ltr' | 'rtl';
}

// Error types for scripture resolution
export class ScriptureError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ScriptureError';
  }
}

export class ScriptureNotFoundError extends ScriptureError {
  constructor(reference: string, translation: string) {
    super(`Scripture not found: ${reference} in ${translation}`, 'SCRIPTURE_NOT_FOUND');
  }
}

export class TranslationNotAvailableError extends ScriptureError {
  constructor(translation: string, locale: string) {
    super(`Translation ${translation} not available for locale ${locale}`, 'TRANSLATION_NOT_AVAILABLE');
  }
}

/**
 * Scripture Locale Resolver class
 */
export class ScriptureLocaleResolver {
  private defaultLocale: Locale = 'en';

  constructor(defaultLocale: Locale = 'en') {
    this.defaultLocale = defaultLocale;
  }

  /**
   * Get the preferred Bible translation for a locale
   */
  getPreferredTranslation(locale: Locale): typeof bibleTranslations[Locale] {
    return bibleTranslations[locale] || bibleTranslations[this.defaultLocale];
  }

  /**
   * Get all available translations for a locale
   */
  getAvailableTranslations(locale: Locale): string[] {
    const translation = this.getPreferredTranslation(locale);
    return [translation.primary, translation.secondary].filter(Boolean);
  }

  /**
   * Parse a scripture reference string into components
   */
  parseReference(referenceString: string): ScriptureReference {
    // Common reference patterns:
    // "John 3:16"
    // "Genesis 1:1-3"
    // "Romans 8"
    // "1 Corinthians 13:4-8"
    
    const match = referenceString.match(/^(\d?\s?\w+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/i);
    
    if (!match) {
      throw new ScriptureError(`Invalid reference format: ${referenceString}`, 'INVALID_REFERENCE');
    }

    const [, book, chapter, verse, endVerse] = match;

    return {
      book: book.trim(),
      chapter: parseInt(chapter, 10),
      verse: verse ? parseInt(verse, 10) : undefined,
      endVerse: endVerse ? parseInt(endVerse, 10) : undefined
    };
  }

  /**
   * Format a scripture reference for display
   */
  formatReference(reference: ScriptureReference, locale: Locale = this.defaultLocale): string {
    const { book, chapter, verse, endVerse } = reference;
    
    let formatted = `${book} ${chapter}`;
    
    if (verse) {
      formatted += `:${verse}`;
      if (endVerse && endVerse !== verse) {
        formatted += `-${endVerse}`;
      }
    }
    
    return formatted;
  }

  /**
   * Get scripture passage from Supabase based on locale
   */
  async getScripture(
    referenceString: string, 
    locale: Locale = this.defaultLocale,
    preferredTranslation?: string
  ): Promise<ScripturePassage> {
    try {
      const reference = this.parseReference(referenceString);
      const translationConfig = this.getPreferredTranslation(locale);
      const translation = preferredTranslation || translationConfig.primary;
      
      // Build the query for Supabase
      const query = supabase
        .from('scriptures')
        .select('*')
        .eq('book', reference.book)
        .eq('chapter', reference.chapter)
        .eq('translation', translation);
      
      // Add verse filtering if specified
      if (reference.verse) {
        query.gte('verse', reference.verse);
        if (reference.endVerse) {
          query.lte('verse', reference.endVerse);
        } else {
          query.eq('verse', reference.verse);
        }
      }
      
      const { data, error } = await query.order('verse', { ascending: true });
      
      if (error) {
        console.error('Supabase error:', error);
        throw new ScriptureError(`Database error: ${error.message}`, 'DATABASE_ERROR');
      }
      
      if (!data || data.length === 0) {
        // Try fallback to default locale and translation
        if (locale !== this.defaultLocale || translation !== translationConfig.primary) {
          return this.getScripture(referenceString, this.defaultLocale);
        }
        
        throw new ScriptureNotFoundError(referenceString, translation);
      }
      
      // Combine verses into a single text
      const text = data
        .map(row => row.text)
        .join(' ');
      
      return {
        reference: {
          ...reference,
          translation
        },
        text,
        translation,
        language: translationConfig.language,
        copyright: translationConfig.copyright,
        direction: translationConfig.direction
      };
      
    } catch (error) {
      if (error instanceof ScriptureError) {
        throw error;
      }
      
      console.error('Unexpected error in getScripture:', error);
      throw new ScriptureError(
        `Unexpected error retrieving scripture: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'UNEXPECTED_ERROR'
      );
    }
  }

  /**
   * Get multiple scripture passages at once
   */
  async getMultipleScriptures(
    references: string[],
    locale: Locale = this.defaultLocale,
    preferredTranslation?: string
  ): Promise<ScripturePassage[]> {
    const promises = references.map(ref => 
      this.getScripture(ref, locale, preferredTranslation)
        .catch(error => {
          console.warn(`Failed to load scripture ${ref}:`, error);
          return null;
        })
    );
    
    const results = await Promise.all(promises);
    return results.filter((passage): passage is ScripturePassage => passage !== null);
  }

  /**
   * Search for scriptures containing specific text
   */
  async searchScriptures(
    searchText: string,
    locale: Locale = this.defaultLocale,
    limit: number = 10
  ): Promise<ScripturePassage[]> {
    try {
      const translationConfig = this.getPreferredTranslation(locale);
      const translation = translationConfig.primary;
      
      const { data, error } = await supabase
        .from('scriptures')
        .select('*')
        .eq('translation', translation)
        .ilike('text', `%${searchText}%`)
        .limit(limit)
        .order('book', { ascending: true })
        .order('chapter', { ascending: true })
        .order('verse', { ascending: true });
      
      if (error) {
        throw new ScriptureError(`Search error: ${error.message}`, 'SEARCH_ERROR');
      }
      
      if (!data) {
        return [];
      }
      
      return data.map(row => ({
        reference: {
          book: row.book,
          chapter: row.chapter,
          verse: row.verse,
          translation
        },
        text: row.text,
        translation,
        language: translationConfig.language,
        copyright: translationConfig.copyright,
        direction: translationConfig.direction
      }));
      
    } catch (error) {
      if (error instanceof ScriptureError) {
        throw error;
      }
      
      console.error('Unexpected error in searchScriptures:', error);
      return [];
    }
  }

  /**
   * Get verse of the day for a specific locale
   */
  async getVerseOfTheDay(locale: Locale = this.defaultLocale): Promise<ScripturePassage | null> {
    try {
      const translationConfig = this.getPreferredTranslation(locale);
      const translation = translationConfig.primary;
      
      // Get a featured verse (you might want to implement a more sophisticated algorithm)
      const { data, error } = await supabase
        .from('featured_verses')
        .select('reference, scripture_text')
        .eq('translation', translation)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();
      
      if (error || !data) {
        // Fallback to a default verse if no featured verse for today
        return this.getScripture('John 3:16', locale);
      }
      
      const reference = this.parseReference(data.reference);
      
      return {
        reference: {
          ...reference,
          translation
        },
        text: data.scripture_text,
        translation,
        language: translationConfig.language,
        copyright: translationConfig.copyright,
        direction: translationConfig.direction
      };
      
    } catch (error) {
      console.error('Error getting verse of the day:', error);
      return null;
    }
  }

  /**
   * Get reading plan for a specific date and locale
   */
  async getReadingPlan(
    date: Date,
    locale: Locale = this.defaultLocale,
    planName: string = 'one-year'
  ): Promise<ScripturePassage[]> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('reading_plans')
        .select('references')
        .eq('plan_name', planName)
        .eq('date', dateStr)
        .single();
      
      if (error || !data || !data.references) {
        return [];
      }
      
      const references = Array.isArray(data.references) ? data.references : [data.references];
      return this.getMultipleScriptures(references, locale);
      
    } catch (error) {
      console.error('Error getting reading plan:', error);
      return [];
    }
  }
}

// Export a default instance
export const scriptureResolver = new ScriptureLocaleResolver();

// Utility functions for common operations
export const getScripture = (reference: string, locale: Locale = 'en') => 
  scriptureResolver.getScripture(reference, locale);

export const searchScriptures = (text: string, locale: Locale = 'en', limit = 10) => 
  scriptureResolver.searchScriptures(text, locale, limit);

export const getVerseOfTheDay = (locale: Locale = 'en') => 
  scriptureResolver.getVerseOfTheDay(locale);

export const getReadingPlan = (date: Date, locale: Locale = 'en') => 
  scriptureResolver.getReadingPlan(date, locale);