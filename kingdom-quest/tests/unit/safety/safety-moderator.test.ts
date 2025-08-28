import { describe, it, expect, beforeEach } from 'vitest'
import { SafetyModerator, type ContentContext, type SafetyValidationResult } from '@/lib/safety-moderator'

describe('SafetyModerator', () => {
  describe('validateContent', () => {
    let context: ContentContext
    
    beforeEach(() => {
      context = {
        ageRating: 'all',
        contentType: 'story',
        parentalControls: true,
        moderationLevel: 'strict'
      }
    })

    it('should pass completely safe content', () => {
      const content = 'Jesus loves all children. God is kind and caring. We should love one another.'
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.isValid).toBe(true)
      expect(result.violations).toHaveLength(0)
      expect(result.ageAppropriate).toBe(true)
      expect(result.requiresParentalGuidance).toBe(false)
    })

    it('should detect inappropriate language', () => {
      const content = 'This damn story contains bad language.'
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.isValid).toBe(false)
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          type: 'inappropriate_language',
          severity: 'critical'
        })
      )
    })

    it('should allow biblical use of "hell"', () => {
      const content = 'Jesus spoke about heaven and hell in the Bible. Scripture teaches us about eternal life.'
      
      const result = SafetyModerator.validateContent(content, context)
      
      // Should not flag "hell" when used in biblical context
      const hellViolations = result.violations.filter(v => 
        v.type === 'inappropriate_language' && v.description.includes('hell')
      )
      expect(hellViolations).toHaveLength(0)
    })

    it('should detect non-biblical use of profanity', () => {
      const content = 'Go to hell! That\'s a damn stupid idea.'
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.isValid).toBe(false)
      expect(result.violations.length).toBeGreaterThan(0)
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          type: 'inappropriate_language'
        })
      )
    })

    it('should detect violent content inappropriate for all ages', () => {
      const content = 'The soldier killed his enemy with a sword, causing blood to flow everywhere.'
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.isValid).toBe(false)
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          type: 'violent_content',
          severity: expect.stringMatching(/critical|high/)
        })
      )
    })

    it('should allow age-appropriate biblical violence for youth', () => {
      const youthContext: ContentContext = {
        ...context,
        ageRating: 'youth'
      }
      const content = 'David faced Goliath in battle, trusting in God\'s protection as described in the Bible.'
      
      const result = SafetyModerator.validateContent(content, youthContext)
      
      // Should allow historical biblical violence for youth with appropriate context
      expect(result.isValid).toBe(true)
    })

    it('should detect sexual/inappropriate content', () => {
      const content = 'This story contains sexual content and naked scenes.'
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.isValid).toBe(false)
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          type: 'sexual_content',
          severity: 'critical'
        })
      )
    })

    it('should detect scary content for all ages', () => {
      const content = 'The demons and evil spirits surrounded the terrified children in a nightmare.'
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.isValid).toBe(false)
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          type: 'scary_content'
        })
      )
    })

    it('should handle biblical scary content appropriately', () => {
      const content = 'Jesus cast out demons and evil spirits, showing God\'s power to protect us.'
      
      const result = SafetyModerator.validateContent(content, context)
      
      // Should flag as needing age-appropriate framing but not completely invalid
      expect(result.violations.some(v => v.type === 'scary_content' && v.severity !== 'critical')).toBe(true)
    })

    it('should detect personal information requests', () => {
      const content = 'Please share your phone number and address with us.'
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.isValid).toBe(false)
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          type: 'personal_information',
          severity: 'critical'
        })
      )
    })

    it('should detect email addresses', () => {
      const content = 'Contact us at test@example.com for more information.'
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.isValid).toBe(false)
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          type: 'contact_information',
          severity: 'critical'
        })
      )
    })

    it('should detect phone numbers', () => {
      const content = 'Call us at (555) 123-4567 or 555-123-4567.'
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.isValid).toBe(false)
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          type: 'contact_information',
          severity: 'critical'
        })
      )
    })

    it('should check age appropriateness', () => {
      const content = 'This content discusses death and complex theological concepts.'
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.violations.some(v => v.type === 'age_inappropriate')).toBe(true)
      expect(result.ageAppropriate).toBe(false)
    })
  })

  describe('age-based violence gating', () => {
    it('should allow no violence for "all" ages', () => {
      const content = 'People disagreed and had a misunderstanding, but resolved it peacefully.'
      const context: ContentContext = {
        ageRating: 'all',
        contentType: 'story',
        parentalControls: true,
        moderationLevel: 'strict'
      }
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.isValid).toBe(true)
    })

    it('should allow implied conflict for children', () => {
      const content = 'The brave boy stood up for what was right and overcame his fear.'
      const context: ContentContext = {
        ageRating: 'children',
        contentType: 'story',
        parentalControls: true,
        moderationLevel: 'moderate'
      }
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.isValid).toBe(true)
    })

    it('should allow historical biblical violence for youth', () => {
      const content = 'The biblical account describes the battle where David trusted in God.'
      const context: ContentContext = {
        ageRating: 'youth',
        contentType: 'story',
        parentalControls: true,
        moderationLevel: 'moderate'
      }
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.isValid).toBe(true)
    })

    it('should allow detailed biblical context for adults', () => {
      const content = 'The historical account details the persecution and martyrdom of early Christians.'
      const context: ContentContext = {
        ageRating: 'adult',
        contentType: 'story',
        parentalControls: false,
        moderationLevel: 'relaxed'
      }
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.isValid).toBe(true)
    })

    it('should reject excessive violence even for adults', () => {
      const content = 'Graphic scenes of murder and blood everywhere, detailed killing and gore.'
      const context: ContentContext = {
        ageRating: 'adult',
        contentType: 'story',
        parentalControls: false,
        moderationLevel: 'relaxed'
      }
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.isValid).toBe(false)
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          type: 'violent_content'
        })
      )
    })
  })

  describe('moderation level handling', () => {
    it('should be more permissive with relaxed moderation', () => {
      const content = 'This story mentions death and some difficult topics.'
      const relaxedContext: ContentContext = {
        ageRating: 'youth',
        contentType: 'story',
        parentalControls: false,
        moderationLevel: 'relaxed'
      }
      
      const result = SafetyModerator.validateContent(content, relaxedContext)
      
      // Should be more permissive with relaxed moderation
      expect(result.isValid).toBe(true)
    })

    it('should be strict with strict moderation', () => {
      const content = 'This story mentions death and some difficult topics.'
      const strictContext: ContentContext = {
        ageRating: 'all',
        contentType: 'story',
        parentalControls: true,
        moderationLevel: 'strict'
      }
      
      const result = SafetyModerator.validateContent(content, strictContext)
      
      expect(result.isValid).toBe(false)
    })
  })

  describe('content warnings generation', () => {
    it('should generate warnings for complex theological concepts for children', () => {
      const content = 'This story teaches about salvation, redemption, and the Trinity.'
      const context: ContentContext = {
        ageRating: 'children',
        contentType: 'story',
        parentalControls: true,
        moderationLevel: 'moderate'
      }
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'complex_concept'
        })
      )
    })

    it('should generate emotional impact warnings', () => {
      const content = 'The child was sad and crying because he was afraid and worried.'
      const context: ContentContext = {
        ageRating: 'all',
        contentType: 'story',
        parentalControls: true,
        moderationLevel: 'moderate'
      }
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.warnings.some(w => w.type === 'emotional_impact')).toBe(true)
    })
  })

  describe('validateImage', () => {
    it('should validate safe image alt text', () => {
      const context: ContentContext = {
        ageRating: 'all',
        contentType: 'image',
        parentalControls: true,
        moderationLevel: 'strict'
      }
      
      const result = SafetyModerator.validateImage(
        'https://example.com/jesus-children.jpg',
        'Jesus blessing children with love and kindness',
        context
      )
      
      expect(result.isValid).toBe(true)
      expect(result.violations).toHaveLength(0)
    })

    it('should detect inappropriate image alt text', () => {
      const context: ContentContext = {
        ageRating: 'all',
        contentType: 'image',
        parentalControls: true,
        moderationLevel: 'strict'
      }
      
      const result = SafetyModerator.validateImage(
        'https://example.com/battle.jpg',
        'Violent battle scene with blood and death everywhere',
        context
      )
      
      expect(result.isValid).toBe(false)
      expect(result.violations.length).toBeGreaterThan(0)
    })
  })

  describe('validateAudio', () => {
    it('should validate safe audio transcript', () => {
      const context: ContentContext = {
        ageRating: 'all',
        contentType: 'audio',
        parentalControls: true,
        moderationLevel: 'strict'
      }
      
      const result = SafetyModerator.validateAudio(
        'The Lord is my shepherd, I shall not want.',
        context
      )
      
      expect(result.isValid).toBe(true)
      expect(result.violations).toHaveLength(0)
    })

    it('should detect inappropriate audio content', () => {
      const context: ContentContext = {
        ageRating: 'all',
        contentType: 'audio',
        parentalControls: true,
        moderationLevel: 'strict'
      }
      
      const result = SafetyModerator.validateAudio(
        'This audio contains damn inappropriate language.',
        context
      )
      
      expect(result.isValid).toBe(false)
      expect(result.violations.length).toBeGreaterThan(0)
    })
  })

  describe('error handling', () => {
    it('should handle malformed input gracefully', () => {
      const result = SafetyModerator.validateContent(
        null as any,
        null as any
      )
      
      expect(result.isValid).toBe(false)
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          severity: 'critical',
          description: 'Content validation error occurred'
        })
      )
    })

    it('should handle empty content', () => {
      const context: ContentContext = {
        ageRating: 'all',
        contentType: 'story',
        parentalControls: true,
        moderationLevel: 'strict'
      }
      
      const result = SafetyModerator.validateContent('', context)
      
      expect(result.isValid).toBe(true)
      expect(result.violations).toHaveLength(0)
    })
  })

  describe('edge cases and comprehensive scenarios', () => {
    it('should handle multiple violation types in single content', () => {
      const content = 'This damn story contains violent murder, sexual content, and my phone number is 555-1234.'
      const context: ContentContext = {
        ageRating: 'all',
        contentType: 'story',
        parentalControls: true,
        moderationLevel: 'strict'
      }
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.isValid).toBe(false)
      expect(result.violations.length).toBeGreaterThan(3)
      expect(result.violations.some(v => v.type === 'inappropriate_language')).toBe(true)
      expect(result.violations.some(v => v.type === 'violent_content')).toBe(true)
      expect(result.violations.some(v => v.type === 'sexual_content')).toBe(true)
      expect(result.violations.some(v => v.type === 'contact_information')).toBe(true)
    })

    it('should properly assess content that mixes safe and unsafe elements', () => {
      const content = 'Jesus loves us very much and wants us to be kind. However, damn those who oppose us.'
      const context: ContentContext = {
        ageRating: 'all',
        contentType: 'story',
        parentalControls: true,
        moderationLevel: 'strict'
      }
      
      const result = SafetyModerator.validateContent(content, context)
      
      expect(result.isValid).toBe(false)
      expect(result.violations.some(v => v.type === 'inappropriate_language')).toBe(true)
    })
  })
})