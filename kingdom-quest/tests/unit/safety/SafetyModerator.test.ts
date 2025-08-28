/**
 * Unit tests for SafetyModerator - Content safety and age-appropriateness validation
 * 
 * Tests violence filtering, inappropriate content detection,
 * and age-tier safety enforcement.
 */

import { describe, it, expect } from 'vitest';
import { SafetyModerator, type ContentContext } from '../../../lib/safety-moderator';
import { mockUsers, mockAgeTiers } from '../../fixtures/users';
import { mockPrayers, mockPrayerModerationRules } from '../../fixtures/prayers';

describe('SafetyModerator', () => {

  describe('Age-Tier Content Filtering', () => {
    it('should filter violent content for toddler age tier', () => {
      const content = 'David fought Goliath with his sword and killed the giant in battle.';
      const context: ContentContext = {
        ageRating: 'all',
        contentType: 'story',
        parentalControls: true,
        moderationLevel: 'strict'
      };

      const result = SafetyModerator.validateContent(content, context);
      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.type === 'violent_content')).toBe(true);
    });

    it('should approve simplified version for toddlers', () => {
      const content = 'David was brave and God helped him. The big man fell down and could not be mean anymore.';
      const context: ContentContext = {
        ageRating: 'all',
        contentType: 'story',
        parentalControls: true,
        moderationLevel: 'strict'
      };

      const result = SafetyModerator.validateContent(content, context);
      expect(result.isValid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should allow age-appropriate biblical conflict for youth', () => {
      const content = 'David defeated Goliath with God\'s help, showing that God protects His people.';
      const context: ContentContext = {
        ageRating: 'youth',
        contentType: 'story',
        parentalControls: false,
        moderationLevel: 'moderate'
      };

      const result = SafetyModerator.validateContent(content, context);
      expect(result.isValid).toBe(true);
      expect(result.ageAppropriate).toBe(true);
    });

    it('should flag graphic violence even for older age tiers', () => {
      const content = 'David cut off Goliath\'s head with the giant\'s own sword, and blood poured everywhere.';
      const context: ContentContext = {
        ageRating: 'children',
        contentType: 'story',
        parentalControls: true,
        moderationLevel: 'moderate'
      };

      const result = SafetyModerator.validateContent(content, context);
      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.type === 'violent_content')).toBe(true);
    });
  });

  describe('Inappropriate Language Detection', () => {
    it('should detect and flag inappropriate language', () => {
      const content = 'I hate my teacher. She is stupid and dumb.';
      const context: ContentContext = {
        ageRating: 'children',
        contentType: 'prayer',
        parentalControls: true,
        moderationLevel: 'strict'
      };

      const result = SafetyModerator.validateContent(content, context);
      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.type === 'inappropriate_language')).toBe(true);
    });

    it('should approve constructive expressions of frustration', () => {
      const content = 'I am feeling frustrated with my teacher. Please help me be patient and respectful.';
      const context: ContentContext = {
        ageRating: 'children',
        contentType: 'prayer',
        parentalControls: true,
        moderationLevel: 'moderate'
      };

      const result = SafetyModerator.validateContent(content, context);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Image Policy Enforcement', () => {
    it('should approve family-friendly biblical imagery', () => {
      const imageUrl = 'noah-ark-animals.jpg';
      const altText = 'Noah welcoming animals onto the ark';
      const context: ContentContext = {
        ageRating: 'children',
        contentType: 'image',
        parentalControls: true,
        moderationLevel: 'moderate'
      };

      const result = SafetyModerator.validateImage(imageUrl, altText, context);
      expect(result.isValid).toBe(true);
    });

    it('should flag violent or disturbing imagery descriptions', () => {
      const imageUrl = 'battle-scene.jpg';
      const altText = 'Graphic battle scene with weapons and blood';
      const context: ContentContext = {
        ageRating: 'all',
        contentType: 'image',
        parentalControls: true,
        moderationLevel: 'strict'
      };

      const result = SafetyModerator.validateImage(imageUrl, altText, context);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Audio Content Validation', () => {
    it('should validate audio content via transcript', () => {
      const transcript = 'Welcome to our Bible story about Noah and the ark.';
      const context: ContentContext = {
        ageRating: 'children',
        contentType: 'audio',
        parentalControls: true,
        moderationLevel: 'moderate'
      };

      const result = SafetyModerator.validateAudio(transcript, context);
      expect(result.isValid).toBe(true);
    });

    it('should flag inappropriate audio content via transcript', () => {
      const transcript = 'This story contains graphic violence and scary monsters.';
      const context: ContentContext = {
        ageRating: 'all',
        contentType: 'audio',
        parentalControls: true,
        moderationLevel: 'strict'
      };

      const result = SafetyModerator.validateAudio(transcript, context);
      expect(result.isValid).toBe(false);
    });
  });
});