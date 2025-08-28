/**
 * Unit tests for TheologyGuard - Scripture citation validation and theological accuracy
 * 
 * Tests theological content validation, scripture attribution accuracy,
 * and age-appropriate doctrinal content filtering.
 */

import { describe, it, expect } from 'vitest';
import { TheologyGuard, type ScriptureReference, type ContentValidationContext } from '../../../lib/theology-guard';
import { mockStories } from '../../fixtures/stories';

describe('TheologyGuard', () => {

  describe('Scripture Citation Validation', () => {
    it('should validate correct ESV scripture citations', () => {
      const reference: ScriptureReference = {
        book: 'Genesis',
        chapter: 6,
        verses: '9',
        translation: 'ESV'
      };

      const result = TheologyGuard.validateScriptureReference(reference);
      expect(result).toBe(true);
    });

    it('should validate correct KJV scripture citations', () => {
      const reference: ScriptureReference = {
        book: 'John',
        chapter: 3,
        verses: '16',
        translation: 'KJV'
      };

      const result = TheologyGuard.validateScriptureReference(reference);
      expect(result).toBe(true);
    });

    it('should reject citations with incorrect book names', () => {
      const reference: ScriptureReference = {
        book: 'InvalidBook',
        chapter: 1,
        verses: '1',
        translation: 'ESV'
      };

      const result = TheologyGuard.validateScriptureReference(reference);
      expect(result).toBe(false);
    });

    it('should reject citations with invalid chapter numbers', () => {
      const reference: ScriptureReference = {
        book: 'Genesis',
        chapter: 0, // Invalid chapter number
        verses: '1',
        translation: 'ESV'
      };

      const result = TheologyGuard.validateScriptureReference(reference);
      expect(result).toBe(false);
    });

    it('should reject citations with unsupported translations', () => {
      const reference: ScriptureReference = {
        book: 'Genesis',
        chapter: 1,
        verses: '1',
        translation: 'INVALID'
      };

      const result = TheologyGuard.validateScriptureReference(reference);
      expect(result).toBe(false);
    });
  });

  describe('Doctrinal Content Validation', () => {
    it('should approve orthodox Christian doctrine', () => {
      const content = 'Jesus Christ is both fully God and fully man, the second person of the Trinity.';
      const context: ContentValidationContext = {
        ageRating: 'adult',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      };

      const result = TheologyGuard.validateTheologicalContent(content, context);
      expect(result.isValid).toBe(true);
      expect(result.doctrinallySound).toBe(true);
    });

    it('should flag heretical content', () => {
      const content = 'Jesus was just a good teacher, not actually God.';
      const context: ContentValidationContext = {
        ageRating: 'adult',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      };

      const result = TheologyGuard.validateTheologicalContent(content, context);
      expect(result.isValid).toBe(false);
      expect(result.doctrinallySound).toBe(false);
    });

    it('should validate age-appropriate theological complexity', () => {
      const content = 'The hypostatic union refers to the theological doctrine that Jesus Christ has two natures - divine and human - united in one person.';
      const context: ContentValidationContext = {
        ageRating: 'children',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      };

      const result = TheologyGuard.validateTheologicalContent(content, context);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should approve simplified theology for young ages', () => {
      const content = 'Jesus loves all children and wants to be their friend.';
      const context: ContentValidationContext = {
        ageRating: 'children',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      };

      const result = TheologyGuard.validateTheologicalContent(content, context);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Denominational Neutrality Validation', () => {
    it('should validate content for denominational neutrality', () => {
      const content = 'Jesus Christ is the Son of God who died for our sins.';
      const violations = TheologyGuard.validateDenominationalNeutrality(content);
      expect(violations).toHaveLength(0);
    });

    it('should flag denominational superiority claims', () => {
      const content = 'Our denomination is the only true church with correct interpretation.';
      const violations = TheologyGuard.validateDenominationalNeutrality(content);
      expect(violations.length).toBeGreaterThan(0);
    });

    it('should flag controversial denominational practices', () => {
      const content = 'Speaking in tongues is required for all true believers.';
      const violations = TheologyGuard.validateDenominationalNeutrality(content);
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('Comprehensive Content Validation', () => {
    it('should validate complete content with all checks', () => {
      const content = 'God loves everyone and sent His Son Jesus to save us.';
      const context: ContentValidationContext = {
        ageRating: 'children',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      };
      const scriptureRefs: ScriptureReference[] = [{
        book: 'John',
        chapter: 3,
        verses: '16',
        translation: 'ESV'
      }];

      const result = TheologyGuard.validateContent(content, context, scriptureRefs);
      expect(result.isValid).toBe(true);
      expect(result.scriptureAccuracy).toBe(true);
    });

    it('should fail validation with invalid scripture references', () => {
      const content = 'This is a good story about faith.';
      const context: ContentValidationContext = {
        ageRating: 'children',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      };
      const scriptureRefs: ScriptureReference[] = [{
        book: 'InvalidBook',
        chapter: 1,
        verses: '1',
        translation: 'ESV'
      }];

      const result = TheologyGuard.validateContent(content, context, scriptureRefs);
      expect(result.isValid).toBe(false);
      expect(result.scriptureAccuracy).toBe(false);
    });
  });
});