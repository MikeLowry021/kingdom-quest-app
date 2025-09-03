/**
 * Testing utilities and helper functions for KingdomQuest test suite
 */

export class TestUtils {
  /**
   * Create a mock user with specified age tier
   */
  static createMockUser(ageTier: 'toddler' | 'preschool' | 'elementary' | 'teen' | 'adult', overrides = {}) {
    const baseUser = {
      id: `test-user-${ageTier}`,
      ageTier,
      role: ageTier === 'adult' ? 'parent' : 'child',
      preferences: {
        bibleTranslation: 'ESV',
        safetyLevel: ageTier === 'toddler' ? 'maximum' : 'moderate'
      },
      ...overrides
    };

    return baseUser;
  }

  /**
   * Generate mock scripture citation
   */
  static createMockCitation(book: string, chapter: number, verse: number, translation = 'ESV') {
    return {
      book,
      chapter,
      verse,
      translation,
      text: `Mock verse text for ${book} ${chapter}:${verse}`,
      reference: `${book} ${chapter}:${verse}`
    };
  }

  /**
   * Create age-appropriate content for testing
   */
  static createAgeTierContent(ageTier: string, contentType: 'story' | 'quiz' | 'prayer') {
    const complexityLevels = {
      toddler: { words: 50, complexity: 'very-simple' },
      preschool: { words: 100, complexity: 'simple' },
      elementary: { words: 300, complexity: 'moderate' },
      teen: { words: 600, complexity: 'complex' },
      adult: { words: 1000, complexity: 'full' }
    };

    const level = complexityLevels[ageTier as keyof typeof complexityLevels];
    
    return {
      ageTier,
      contentType,
      maxWords: level.words,
      complexity: level.complexity,
      content: `Age-appropriate ${contentType} content for ${ageTier} tier`,
      safetyRating: ageTier === 'toddler' ? 'maximum' : 'moderate'
    };
  }

  /**
   * Mock theology validation response
   */
  static createTheologyValidationResult(isValid = true, errors: string[] = []) {
    return {
      isValid,
      errors,
      doctrinalSoundness: isValid ? 'orthodox' : 'heretical',
      scriptureAccuracy: isValid ? 0.95 : 0.3,
      ageAppropriate: isValid,
      warnings: errors
    };
  }

  /**
   * Mock safety moderation response
   */
  static createSafetyModerationResult(approved = true, reason = '') {
    return {
      approved,
      reason,
      flags: approved ? [] : ['inappropriate_content'],
      moderationType: approved ? 'auto_approved' : 'rejected',
      requiresParentReview: false,
      alternativeSuggestion: approved ? null : 'Consider rephrasing your message'
    };
  }

  /**
   * Generate test data for accessibility testing
   */
  static createAccessibilityTestData() {
    return {
      colorContrast: {
        background: '#ffffff',
        foreground: '#000000',
        ratio: 21,
        wcagLevel: 'AAA'
      },
      ariaLabels: {
        button: 'Submit quiz answer',
        region: 'Story content area',
        status: 'Loading story content'
      },
      keyboardNavigation: {
        focusable: true,
        tabIndex: 0,
        skipLinks: true
      }
    };
  }

  /**
   * Wait for element with retry logic
   */
  static async waitForElement(page: any, selector: string, timeout = 5000) {
    try {
      await page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      console.warn(`Element ${selector} not found within ${timeout}ms`);
      return false;
    }
  }

  /**
   * Simulate user input with realistic delays
   */
  static async typeWithDelay(page: any, selector: string, text: string, delay = 100) {
    const element = page.locator(selector);
    await element.click();
    
    for (const char of text) {
      await element.type(char);
      await page.waitForTimeout(delay);
    }
  }

  /**
   * Check if content meets age-tier requirements
   */
  static validateAgeTierContent(content: string, ageTier: string): boolean {
    const wordCount = content.split(' ').length;
    const maxWords = {
      toddler: 100,
      preschool: 200,
      elementary: 500,
      teen: 1000,
      adult: Infinity
    };

    const limit = maxWords[ageTier as keyof typeof maxWords];
    return wordCount <= limit;
  }

  /**
   * Generate realistic test timing data
   */
  static getTestTiming() {
    return {
      storyReading: Math.random() * 120000 + 60000, // 1-3 minutes
      quizCompletion: Math.random() * 180000 + 120000, // 2-5 minutes
      navigationDelay: Math.random() * 2000 + 500, // 0.5-2.5 seconds
      typingSpeed: Math.random() * 100 + 50 // 50-150ms per character
    };
  }
}

/**
 * Custom Jest matchers for KingdomQuest testing
 */
export const customMatchers = {
  toBeTheologicallySound(received: any) {
    const pass = received.doctrinalSoundness === 'orthodox';
    return {
      message: () => `Expected content to be theologically sound but was ${received.doctrinalSoundness}`,
      pass
    };
  },

  toBeAgeAppropriate(received: any, ageTier: string) {
    const content = received.content || received.text;
    const pass = TestUtils.validateAgeTierContent(content, ageTier);
    return {
      message: () => `Expected content to be appropriate for ${ageTier} age tier`,
      pass
    };
  },

  toHaveValidScripture(received: any) {
    const citation = received.scripture || received.citation;
    const pass = citation && citation.book && citation.chapter && citation.verse && citation.translation;
    return {
      message: () => `Expected valid scripture citation`,
      pass
    };
  }
};

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeTheologicallySound(): R;
      toBeAgeAppropriate(ageTier: string): R;
      toHaveValidScripture(): R;
    }
  }
}