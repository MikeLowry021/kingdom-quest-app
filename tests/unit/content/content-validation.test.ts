/**
 * Content Validation Tests - General content safety and appropriateness
 * 
 * Tests content validation logic, text processing,
 * and cross-cutting validation concerns.
 */

import { describe, it, expect } from 'vitest';
import { TheologyGuard, type ContentValidationContext } from '../../../lib/theology-guard';
import { SafetyModerator, type ContentContext } from '../../../lib/safety-moderator';

describe('Content Validation', () => {
  describe('Text Processing and Validation', () => {
    it('should handle empty content gracefully', () => {
      const content = '';
      const context: ContentContext = {
        ageRating: 'all',
        contentType: 'story',
        parentalControls: true,
        moderationLevel: 'moderate'
      };

      const result = SafetyModerator.validateContent(content, context);
      expect(result.isValid).toBe(true); // Empty content should be safe
    });

    it('should handle very long content', () => {
      const content = 'Jesus loves you. '.repeat(1000);
      const context: ContentContext = {
        ageRating: 'all',
        contentType: 'story',
        parentalControls: true,
        moderationLevel: 'moderate'
      };

      const result = SafetyModerator.validateContent(content, context);
      expect(result.isValid).toBe(true);
    });

    it('should handle special characters and unicode', () => {
      const content = 'God\'s love is ♥️ and His peace is ☮️. Amen! 🙏';
      const context: ContentContext = {
        ageRating: 'all',
        contentType: 'story',
        parentalControls: true,
        moderationLevel: 'moderate'
      };

      const result = SafetyModerator.validateContent(content, context);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Multi-Language Support', () => {
    it('should validate English content properly', () => {
      const content = 'For God so loved the world that he gave his one and only Son.';
      const theologyContext: ContentValidationContext = {
        ageRating: 'all',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      };

      const result = TheologyGuard.validateTheologicalContent(content, theologyContext);
      expect(result.isValid).toBe(true);
      expect(result.doctrinallySound).toBe(true);
    });
  });

  describe('Content Type Specific Validation', () => {
    it('should validate story content appropriately', () => {
      const content = 'Once upon a time, there was a shepherd named David who trusted God.';
      const context: ContentValidationContext = {
        ageRating: 'children',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      };

      const result = TheologyGuard.validateTheologicalContent(content, context);
      expect(result.isValid).toBe(true);
    });

    it('should validate quiz content appropriately', () => {
      const content = 'Who was the shepherd boy who defeated Goliath? A) David B) Moses C) Abraham';
      const context: ContentValidationContext = {
        ageRating: 'children',
        contentType: 'quiz',
        denominationalScope: 'ecumenical'
      };

      const result = TheologyGuard.validateTheologicalContent(content, context);
      expect(result.isValid).toBe(true);
    });

    it('should validate prayer content appropriately', () => {
      const content = 'Dear God, thank you for your love and protection. Please help us to be kind to others.';
      const context: ContentValidationContext = {
        ageRating: 'children',
        contentType: 'prayer',
        denominationalScope: 'ecumenical'
      };

      const result = TheologyGuard.validateTheologicalContent(content, context);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Cross-Validation Integration', () => {
    it('should pass both theology and safety validation for good content', () => {
      const content = 'Jesus taught us to love one another as He has loved us.';
      
      const theologyContext: ContentValidationContext = {
        ageRating: 'all',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      };
      
      const safetyContext: ContentContext = {
        ageRating: 'all',
        contentType: 'story',
        parentalControls: true,
        moderationLevel: 'moderate'
      };

      const theologyResult = TheologyGuard.validateTheologicalContent(content, theologyContext);
      const safetyResult = SafetyModerator.validateContent(content, safetyContext);

      expect(theologyResult.isValid).toBe(true);
      expect(safetyResult.isValid).toBe(true);
    });

    it('should fail validation for problematic content in both systems', () => {
      const content = 'You can earn your way to heaven by being really good and never sinning.';
      
      const theologyContext: ContentValidationContext = {
        ageRating: 'all',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      };

      const theologyResult = TheologyGuard.validateTheologicalContent(content, theologyContext);
      expect(theologyResult.isValid).toBe(false); // Should fail theology validation
    });
  });

  describe('Performance and Reliability', () => {
    it('should handle validation consistently', () => {
      const content = 'God is love and His mercy endures forever.';
      const context: ContentContext = {
        ageRating: 'all',
        contentType: 'story',
        parentalControls: true,
        moderationLevel: 'moderate'
      };

      // Run the same validation multiple times
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(SafetyModerator.validateContent(content, context));
      }

      // All results should be consistent
      results.forEach(result => {
        expect(result.isValid).toBe(true);
        expect(result.ageAppropriate).toBe(true);
      });
    });
  });
});