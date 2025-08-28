/**
 * Unit tests for SafetyModerator - Content safety and age-appropriateness validation
 * 
 * Tests violence filtering, inappropriate content detection,
 * and age-tier safety enforcement.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { SafetyModerator } from '../../../lib/safety/SafetyModerator';
import { mockUsers, mockAgeTiers } from '../../fixtures/users';
import { mockPrayers, mockPrayerModerationRules } from '../../fixtures/prayers';

describe('SafetyModerator', () => {
  let safetyModerator: SafetyModerator;

  beforeEach(() => {
    safetyModerator = new SafetyModerator();
  });

  describe('Age-Tier Content Filtering', () => {
    it('should filter violent content for toddler age tier', () => {
      const content = {
        text: 'David fought Goliath with his sword and killed the giant in battle.',
        ageTier: 'toddler',
        contentType: 'story'
      };

      const result = safetyModerator.filterContent(content);
      expect(result.approved).toBe(false);
      expect(result.reason).toBe('violence_inappropriate_for_age');
      expect(result.flags).toContain('violence');
      expect(result.flags).toContain('death');
    });

    it('should approve simplified version for toddlers', () => {
      const content = {
        text: 'David was brave and God helped him. The big man fell down and could not be mean anymore.',
        ageTier: 'toddler',
        contentType: 'story'
      };

      const result = safetyModerator.filterContent(content);
      expect(result.approved).toBe(true);
      expect(result.flags).toHaveLength(0);
    });

    it('should allow age-appropriate biblical conflict for elementary', () => {
      const content = {
        text: 'David defeated Goliath with God\'s help, showing that God protects His people.',
        ageTier: 'elementary',
        contentType: 'story'
      };

      const result = safetyModerator.filterContent(content);
      expect(result.approved).toBe(true);
      expect(result.ageAppropriate).toBe(true);
    });

    it('should flag graphic violence even for older age tiers', () => {
      const content = {
        text: 'David cut off Goliath\'s head with the giant\'s own sword, and blood poured everywhere.',
        ageTier: 'elementary',
        contentType: 'story'
      };

      const result = safetyModerator.filterContent(content);
      expect(result.approved).toBe(false);
      expect(result.reason).toBe('graphic_violence');
      expect(result.flags).toContain('graphic_content');
    });
  });

  describe('Inappropriate Language Detection', () => {
    it('should detect and flag inappropriate language', () => {
      const content = {
        text: 'I hate my teacher. She is stupid and dumb.',
        ageTier: 'elementary',
        contentType: 'prayer'
      };

      const result = safetyModerator.filterContent(content);
      expect(result.approved).toBe(false);
      expect(result.reason).toBe('inappropriate_language');
      expect(result.flags).toContain('hate_speech');
      expect(result.flags).toContain('derogatory_language');
    });

    it('should approve constructive expressions of frustration', () => {
      const content = {
        text: 'I am feeling frustrated with my teacher. Please help me be patient and respectful.',
        ageTier: 'elementary',
        contentType: 'prayer'
      };

      const result = safetyModerator.filterContent(content);
      expect(result.approved).toBe(true);
      expect(result.constructiveAlternative).toBe(true);
    });

    it('should flag harmful wishes', () => {
      const content = {
        text: 'I wish something bad would happen to my sister.',
        ageTier: 'preschool',
        contentType: 'prayer'
      };

      const result = safetyModerator.filterContent(content);
      expect(result.approved).toBe(false);
      expect(result.reason).toBe('harmful_wishes');
      expect(result.flags).toContain('harmful_content');
    });
  });

  describe('Image Policy Enforcement', () => {
    it('should approve family-friendly biblical imagery', () => {
      const imageContent = {
        type: 'image',
        url: 'noah-ark-animals.jpg',
        description: 'Noah welcoming animals onto the ark',
        ageTier: 'preschool',
        tags: ['noah', 'ark', 'animals', 'biblical']
      };

      const result = safetyModerator.validateImage(imageContent);
      expect(result.approved).toBe(true);
      expect(result.familyFriendly).toBe(true);
    });

    it('should flag violent or disturbing imagery', () => {
      const imageContent = {
        type: 'image',
        url: 'battle-scene.jpg',
        description: 'Graphic battle scene with weapons',
        ageTier: 'toddler',
        tags: ['battle', 'weapons', 'violence']
      };

      const result = safetyModerator.validateImage(imageContent);
      expect(result.approved).toBe(false);
      expect(result.reason).toBe('violent_imagery_inappropriate_for_age');
      expect(result.flags).toContain('violence');
    });

    it('should validate copyright attribution', () => {
      const imageContent = {
        type: 'image',
        url: 'bible-story.jpg',
        description: 'Biblical scene illustration',
        ageTier: 'elementary',
        attribution: null // Missing attribution
      };

      const result = safetyModerator.validateImage(imageContent);
      expect(result.warnings).toContain('missing_attribution');
      expect(result.copyrightCompliant).toBe(false);
    });
  });

  describe('Prayer Content Moderation', () => {
    it('should auto-approve appropriate prayers', () => {
      const prayer = mockPrayers['prayer-001']; // School prayer
      const result = safetyModerator.moderatePrayer(prayer);

      expect(result.approved).toBe(true);
      expect(result.moderationType).toBe('auto_approved');
      expect(result.requiresParentReview).toBe(false);
    });

    it('should flag prayers requiring parent review', () => {
      const prayer = mockPrayers['prayer-004']; // Pet death prayer
      const result = safetyModerator.moderatePrayer(prayer);

      expect(result.approved).toBe(false);
      expect(result.moderationType).toBe('requires_parent_review');
      expect(result.reason).toBe('sensitive_topic');
      expect(result.flags).toContain('death_topic');
    });

    it('should reject inappropriate prayers', () => {
      const prayer = mockPrayers['prayer-005']; // Angry prayer
      const result = safetyModerator.moderatePrayer(prayer);

      expect(result.approved).toBe(false);
      expect(result.moderationType).toBe('rejected');
      expect(result.reason).toBe('inappropriate_content');
      expect(result.flags).toContain('inappropriate_language');
      expect(result.alternativeSuggestion).toBeDefined();
    });

    it('should provide constructive alternatives for rejected content', () => {
      const inappropriatePrayer = {
        content: 'God, I hate my brother. He is annoying.',
        authorAge: 7,
        ageTier: 'elementary'
      };

      const result = safetyModerator.moderatePrayer(inappropriatePrayer as any);
      expect(result.approved).toBe(false);
      expect(result.alternativeSuggestion).toContain('frustrated');
      expect(result.alternativeSuggestion).not.toContain('hate');
    });
  });

  describe('Age-Tier Safety Levels', () => {
    it('should enforce maximum safety for toddlers', () => {
      const ageTierSettings = safetyModerator.getAgeTierSettings('toddler');
      
      expect(ageTierSettings.safetyLevel).toBe('maximum');
      expect(ageTierSettings.allowedThemes).toContain('love');
      expect(ageTierSettings.restrictedThemes).toContain('violence');
      expect(ageTierSettings.restrictedThemes).toContain('fear');
    });

    it('should allow more complexity for elementary age', () => {
      const ageTierSettings = safetyModerator.getAgeTierSettings('elementary');
      
      expect(ageTierSettings.safetyLevel).toBe('moderate');
      expect(ageTierSettings.allowedThemes).toContain('light-conflict');
      expect(ageTierSettings.restrictedThemes).toContain('graphic-content');
    });

    it('should validate content complexity by age', () => {
      const complexContent = {
        text: 'Complex theological discussion about predestination',
        ageTier: 'preschool',
        complexityLevel: 'high'
      };

      const result = safetyModerator.validateComplexity(complexContent);
      expect(result.appropriate).toBe(false);
      expect(result.reason).toBe('too_complex_for_age');
    });
  });

  describe('Content Blocklist Validation', () => {
    it('should maintain updated blocklist of inappropriate terms', () => {
      const blocklist = safetyModerator.getContentBlocklist();
      
      expect(blocklist.inappropriateLanguage).toContain('hate');
      expect(blocklist.violentTerms).toContain('kill');
      expect(blocklist.fearContent).toContain('nightmare');
    });

    it('should check content against blocklist', () => {
      const content = {
        text: 'This story contains scary nightmares and killing.',
        ageTier: 'preschool'
      };

      const result = safetyModerator.checkAgainstBlocklist(content);
      expect(result.blocked).toBe(true);
      expect(result.triggers).toContain('nightmare');
      expect(result.triggers).toContain('killing');
    });

    it('should allow appropriate use of biblical terms in context', () => {
      const content = {
        text: 'Jesus died on the cross for our sins and rose again.',
        ageTier: 'elementary',
        context: 'biblical_narrative'
      };

      const result = safetyModerator.checkAgainstBlocklist(content);
      expect(result.blocked).toBe(false);
      expect(result.contextuallyAppropriate).toBe(true);
    });
  });

  describe('Family Sharing Safety', () => {
    it('should validate family sharing permissions', () => {
      const shareRequest = {
        contentId: 'prayer-001',
        fromUserId: 'user-child-001',
        toFamilyId: 'family-001',
        contentType: 'prayer'
      };

      const result = safetyModerator.validateFamilySharing(shareRequest);
      expect(result.allowed).toBe(true);
      expect(result.requiresModeration).toBe(false);
    });

    it('should flag sharing attempts outside family', () => {
      const shareRequest = {
        contentId: 'prayer-001',
        fromUserId: 'user-child-001',
        toUserId: 'external-user-123', // Outside family
        contentType: 'prayer'
      };

      const result = safetyModerator.validateFamilySharing(shareRequest);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('sharing_outside_family_not_allowed');
    });

    it('should require parent approval for sensitive content sharing', () => {
      const shareRequest = {
        contentId: 'prayer-004', // Pet death prayer
        fromUserId: 'user-child-001',
        toFamilyId: 'family-001',
        contentType: 'prayer'
      };

      const result = safetyModerator.validateFamilySharing(shareRequest);
      expect(result.requiresParentApproval).toBe(true);
      expect(result.reason).toBe('sensitive_content');
    });
  });
});