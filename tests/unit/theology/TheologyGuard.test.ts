/**
 * Unit tests for TheologyGuard - Scripture citation validation and theological accuracy
 * 
 * Tests theological content validation, scripture attribution accuracy,
 * and age-appropriate doctrinal content filtering.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { TheologyGuard } from '../../../lib/theology/TheologyGuard';
import { mockStories } from '../../fixtures/stories';

describe('TheologyGuard', () => {
  let theologyGuard: TheologyGuard;

  beforeEach(() => {
    theologyGuard = new TheologyGuard();
  });

  describe('Scripture Citation Validation', () => {
    it('should validate correct ESV scripture citations', () => {
      const citation = {
        book: 'Genesis',
        chapter: 6,
        verse: 9,
        translation: 'ESV',
        text: 'Noah was a righteous man, blameless in his generation. Noah walked with God.'
      };

      const result = theologyGuard.validateCitation(citation);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate correct KJV scripture citations', () => {
      const citation = {
        book: 'John',
        chapter: 3,
        verse: 16,
        translation: 'KJV',
        text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.'
      };

      const result = theologyGuard.validateCitation(citation);
      expect(result.isValid).toBe(true);
      expect(result.translation).toBe('KJV');
    });

    it('should reject citations with incorrect book names', () => {
      const citation = {
        book: 'InvalidBook',
        chapter: 1,
        verse: 1,
        translation: 'ESV',
        text: 'Some text'
      };

      const result = theologyGuard.validateCitation(citation);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('invalid_book_name');
    });

    it('should reject citations with invalid chapter numbers', () => {
      const citation = {
        book: 'Genesis',
        chapter: 999, // Genesis only has 50 chapters
        verse: 1,
        translation: 'ESV',
        text: 'Some text'
      };

      const result = theologyGuard.validateCitation(citation);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('invalid_chapter_number');
    });

    it('should reject citations with invalid verse numbers', () => {
      const citation = {
        book: 'Genesis',
        chapter: 1,
        verse: 999, // Genesis 1 only has 31 verses
        translation: 'ESV',
        text: 'Some text'
      };

      const result = theologyGuard.validateCitation(citation);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('invalid_verse_number');
    });

    it('should require translation attribution', () => {
      const citation = {
        book: 'Genesis',
        chapter: 1,
        verse: 1,
        translation: '', // Missing translation
        text: 'In the beginning, God created the heavens and the earth.'
      };

      const result = theologyGuard.validateCitation(citation);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('missing_translation');
    });

    it('should validate translation-specific text accuracy', () => {
      const citation = {
        book: 'John',
        chapter: 3,
        verse: 16,
        translation: 'ESV',
        text: 'For God so loved the world, that he gave his only Son...' // ESV uses "only Son" not "only begotten Son"
      };

      const result = theologyGuard.validateCitation(citation);
      expect(result.isValid).toBe(true);
      expect(result.textAccuracy).toBeGreaterThan(0.9); // High accuracy score
    });
  });

  describe('Doctrinal Content Validation', () => {
    it('should approve orthodox Christian doctrine', () => {
      const content = {
        text: 'Jesus Christ is both fully God and fully man, the second person of the Trinity.',
        topic: 'christology',
        ageTier: 'elementary'
      };

      const result = theologyGuard.validateDoctrine(content);
      expect(result.isValid).toBe(true);
      expect(result.doctrinalSoundness).toBe('orthodox');
    });

    it('should flag heretical content', () => {
      const content = {
        text: 'Jesus was just a good teacher, not actually God.',
        topic: 'christology',
        ageTier: 'elementary'
      };

      const result = theologyGuard.validateDoctrine(content);
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain('denies_deity_of_christ');
      expect(result.doctrinalSoundness).toBe('heretical');
    });

    it('should validate age-appropriate theological complexity', () => {
      const complexContent = {
        text: 'The hypostatic union refers to the theological doctrine that Jesus Christ has two natures - divine and human - united in one person.',
        topic: 'christology',
        ageTier: 'toddler'
      };

      const result = theologyGuard.validateDoctrine(complexContent);
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain('too_complex_for_age_tier');
    });

    it('should approve simplified theology for young ages', () => {
      const simpleContent = {
        text: 'Jesus loves all children and wants to be their friend.',
        topic: 'christology',
        ageTier: 'toddler'
      };

      const result = theologyGuard.validateDoctrine(simpleContent);
      expect(result.isValid).toBe(true);
      expect(result.ageAppropriate).toBe(true);
    });
  });

  describe('Story Content Validation', () => {
    it('should validate complete story theological content', () => {
      const story = mockStories['noah-ark'];
      const result = theologyGuard.validateStoryContent(story);

      expect(result.isValid).toBe(true);
      expect(result.scriptureAccuracy).toBeGreaterThan(0.9);
      expect(result.doctrinalSoundness).toBe('orthodox');
    });

    it('should validate age-tier specific content', () => {
      const story = mockStories['noah-ark'];
      const toddlerResult = theologyGuard.validateAgeTierContent(
        story.ageTiers.toddler,
        'toddler'
      );

      expect(toddlerResult.isValid).toBe(true);
      expect(toddlerResult.ageAppropriate).toBe(true);
      expect(toddlerResult.complexityLevel).toBe('very-simple');
    });

    it('should flag content with incorrect scripture references', () => {
      const invalidStory = {
        ...mockStories['noah-ark'],
        scripture: {
          primary: {
            book: 'Genesis',
            chapters: [99], // Invalid chapter
            translation: 'ESV'
          }
        }
      };

      const result = theologyGuard.validateStoryContent(invalidStory);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('invalid_scripture_reference');
    });
  });

  describe('Content Adaptation Validation', () => {
    it('should ensure theological consistency across age tiers', () => {
      const story = mockStories['david-goliath'];
      const consistencyResult = theologyGuard.validateAgeTierConsistency(story);

      expect(consistencyResult.isConsistent).toBe(true);
      expect(consistencyResult.coreMessagePreserved).toBe(true);
    });

    it('should validate progressive complexity', () => {
      const story = mockStories['noah-ark'];
      const complexityResult = theologyGuard.validateComplexityProgression(story);

      expect(complexityResult.isProgressive).toBe(true);
      expect(complexityResult.appropriateProgression).toBe(true);
    });

    it('should flag inappropriate complexity jumps', () => {
      const problematicStory = {
        ageTiers: {
          toddler: {
            content: ['Simple story'],
            theologyPoints: []
          },
          preschool: {
            content: ['Extremely complex theological concepts about predestination'],
            theologyPoints: ['complex theology']
          }
        }
      };

      const result = theologyGuard.validateComplexityProgression(problematicStory as any);
      expect(result.isProgressive).toBe(false);
      expect(result.warnings).toContain('inappropriate_complexity_jump');
    });
  });

  describe('Translation Validation', () => {
    it('should validate supported translations', () => {
      expect(theologyGuard.isSupportedTranslation('ESV')).toBe(true);
      expect(theologyGuard.isSupportedTranslation('KJV')).toBe(true);
      expect(theologyGuard.isSupportedTranslation('NIV')).toBe(true);
      expect(theologyGuard.isSupportedTranslation('NASB')).toBe(true);
    });

    it('should reject unsupported translations', () => {
      expect(theologyGuard.isSupportedTranslation('INVALID')).toBe(false);
      expect(theologyGuard.isSupportedTranslation('')).toBe(false);
    });

    it('should validate translation-specific theological terms', () => {
      const esvTerms = theologyGuard.getTranslationSpecificTerms('ESV');
      const kjvTerms = theologyGuard.getTranslationSpecificTerms('KJV');

      expect(esvTerms).toContain('only Son'); // ESV uses "only Son"
      expect(kjvTerms).toContain('only begotten Son'); // KJV uses "only begotten Son"
    });
  });
});