import { describe, it, expect, beforeEach } from 'vitest'
import { TheologyGuard, type ScriptureReference, type ContentValidationContext } from '@/lib/theology-guard'

describe('TheologyGuard', () => {
  describe('validateScriptureReference', () => {
    it('should validate correct NIV scripture references', () => {
      const validReference: ScriptureReference = {
        book: 'John',
        chapter: 3,
        verses: '16',
        translation: 'NIV'
      }
      
      expect(TheologyGuard.validateScriptureReference(validReference)).toBe(true)
    })

    it('should validate multiple verse ranges', () => {
      const validReference: ScriptureReference = {
        book: 'Matthew',
        chapter: 5,
        verses: '3-12',
        translation: 'ESV'
      }
      
      expect(TheologyGuard.validateScriptureReference(validReference)).toBe(true)
    })

    it('should validate comma-separated verses', () => {
      const validReference: ScriptureReference = {
        book: 'Romans',
        chapter: 8,
        verses: '1,28,38-39',
        translation: 'ESV'
      }
      
      expect(TheologyGuard.validateScriptureReference(validReference)).toBe(true)
    })

    it('should reject invalid translation codes', () => {
      const invalidReference: ScriptureReference = {
        book: 'John',
        chapter: 3,
        verses: '16',
        translation: 'INVALID'
      }
      
      expect(TheologyGuard.validateScriptureReference(invalidReference)).toBe(false)
    })

    it('should reject non-existent book names', () => {
      const invalidReference: ScriptureReference = {
        book: 'NonexistentBook',
        chapter: 1,
        verses: '1',
        translation: 'NIV'
      }
      
      expect(TheologyGuard.validateScriptureReference(invalidReference)).toBe(false)
    })

    it('should reject invalid chapter numbers', () => {
      const invalidReference: ScriptureReference = {
        book: 'John',
        chapter: 0,
        verses: '1',
        translation: 'NIV'
      }
      
      expect(TheologyGuard.validateScriptureReference(invalidReference)).toBe(false)
    })

    it('should reject malformed verse ranges', () => {
      const invalidReference: ScriptureReference = {
        book: 'John',
        chapter: 3,
        verses: 'abc-def',
        translation: 'NIV'
      }
      
      expect(TheologyGuard.validateScriptureReference(invalidReference)).toBe(false)
    })

    it('should validate all approved translations', () => {
      const approvedTranslations = ['NIV', 'ESV', 'NLT', 'KJV', 'NASB', 'CSB']
      
      approvedTranslations.forEach(translation => {
        const reference: ScriptureReference = {
          book: 'Psalms',
          chapter: 23,
          verses: '1',
          translation
        }
        
        expect(TheologyGuard.validateScriptureReference(reference)).toBe(true)
      })
    })
  })

  describe('validateTheologicalContent', () => {
    let context: ContentValidationContext
    
    beforeEach(() => {
      context = {
        ageRating: 'all',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      }
    })

    it('should pass valid biblical content', () => {
      const content = 'Jesus loves us and died for our sins. Through faith in Him, we have eternal life.'
      
      const result = TheologyGuard.validateTheologicalContent(content, context)
      
      expect(result.isValid).toBe(true)
      expect(result.violations).toHaveLength(0)
      expect(result.scriptureAccuracy).toBe(true)
      expect(result.doctrinallySound).toBe(true)
    })

    it('should detect works-based salvation heresy', () => {
      const content = 'You must work your way to heaven through good deeds and works-based salvation.'
      
      const result = TheologyGuard.validateTheologicalContent(content, context)
      
      expect(result.isValid).toBe(false)
      expect(result.doctrinallySound).toBe(false)
      expect(result.violations).toContainEqual(
        expect.stringContaining('works-based salvation')
      )
    })

    it('should detect universalism heresy', () => {
      const content = 'Everyone goes to heaven regardless of faith, because universalism teaches all paths lead to God.'
      
      const result = TheologyGuard.validateTheologicalContent(content, context)
      
      expect(result.isValid).toBe(false)
      expect(result.doctrinallySound).toBe(false)
      expect(result.violations).toContainEqual(
        expect.stringContaining('universalism')
      )
    })

    it('should detect prosperity gospel heresy', () => {
      const content = 'God wants you to be rich and healthy. The prosperity gospel guarantees wealth if you have enough faith.'
      
      const result = TheologyGuard.validateTheologicalContent(content, context)
      
      expect(result.isValid).toBe(false)
      expect(result.violations).toContainEqual(
        expect.stringContaining('prosperity gospel')
      )
    })

    it('should detect denial of trinity', () => {
      const content = 'Jesus is not God, there is no Trinity. The denial of trinity is the correct teaching.'
      
      const result = TheologyGuard.validateTheologicalContent(content, context)
      
      expect(result.isValid).toBe(false)
      expect(result.violations).toContainEqual(
        expect.stringContaining('denial of trinity')
      )
    })

    it('should validate scripture references when provided', () => {
      const content = 'God so loved the world that He gave His only Son.'
      const scriptureRefs: ScriptureReference[] = [{
        book: 'John',
        chapter: 3,
        verses: '16',
        translation: 'NIV'
      }]
      
      const result = TheologyGuard.validateTheologicalContent(content, context, scriptureRefs)
      
      expect(result.isValid).toBe(true)
      expect(result.scriptureAccuracy).toBe(true)
    })

    it('should detect invalid scripture references', () => {
      const content = 'This teaches us about God\'s love.'
      const scriptureRefs: ScriptureReference[] = [{
        book: 'InvalidBook',
        chapter: 999,
        verses: 'abc',
        translation: 'INVALID'
      }]
      
      const result = TheologyGuard.validateTheologicalContent(content, context, scriptureRefs)
      
      expect(result.isValid).toBe(false)
      expect(result.scriptureAccuracy).toBe(false)
      expect(result.violations).toContainEqual(
        expect.stringContaining('Invalid scripture reference')
      )
    })

    it('should validate salvation content requires Christ reference', () => {
      const content = 'You can have eternal life and salvation through faith.'
      
      const result = TheologyGuard.validateTheologicalContent(content, context)
      
      expect(result.violations).toContainEqual(
        expect.stringContaining('lacks clear reference to Christ')
      )
    })

    it('should pass salvation content with Christ reference', () => {
      const content = 'You can have eternal life and salvation through faith in Jesus Christ our Lord.'
      
      const result = TheologyGuard.validateTheologicalContent(content, context)
      
      expect(result.violations).not.toContainEqual(
        expect.stringContaining('lacks clear reference to Christ')
      )
    })
  })

  describe('validateAgeAppropriateTheology', () => {
    it('should warn about complex terms for children', () => {
      const content = 'God\'s predestination and sanctification through propitiation teaches us about justification.'
      const context: ContentValidationContext = {
        ageRating: 'children',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      }
      
      const result = TheologyGuard.validateTheologicalContent(content, context)
      
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings.some(w => w.includes('predestination'))).toBe(true)
      expect(result.warnings.some(w => w.includes('sanctification'))).toBe(true)
      expect(result.warnings.some(w => w.includes('propitiation'))).toBe(true)
    })

    it('should warn about scary concepts for children', () => {
      const content = 'God will send the wicked to hell and damnation on judgment day.'
      const context: ContentValidationContext = {
        ageRating: 'children',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      }
      
      const result = TheologyGuard.validateTheologicalContent(content, context)
      
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings.some(w => w.includes('hell'))).toBe(true)
      expect(result.warnings.some(w => w.includes('judgment day'))).toBe(true)
    })

    it('should allow complex theology for adult content', () => {
      const content = 'The doctrine of predestination and sanctification through propitiation demonstrates God\'s sovereignty.'
      const context: ContentValidationContext = {
        ageRating: 'adult',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      }
      
      const result = TheologyGuard.validateTheologicalContent(content, context)
      
      expect(result.warnings.filter(w => w.includes('Complex theological term')).length).toBe(0)
    })
  })

  describe('validateDenominationalNeutrality', () => {
    it('should detect denominational exclusivity claims', () => {
      const content = 'Our denomination is the only true church with the only correct interpretation.'
      
      const violations = TheologyGuard.validateDenominationalNeutrality(content)
      
      expect(violations.length).toBeGreaterThan(0)
      expect(violations).toContainEqual(
        expect.stringContaining('denominational exclusivity')
      )
    })

    it('should detect controversial denominational practices', () => {
      const content = 'Speaking in tongues is required for salvation, and infant baptism is the only valid form.'
      
      const violations = TheologyGuard.validateDenominationalNeutrality(content)
      
      expect(violations.length).toBeGreaterThan(0)
      expect(violations.some(v => v.includes('speaking in tongues'))).toBe(true)
      expect(violations.some(v => v.includes('infant baptism'))).toBe(true)
    })

    it('should allow neutral denominational references', () => {
      const content = 'Christians across many denominations believe in the Trinity and salvation by faith.'
      
      const violations = TheologyGuard.validateDenominationalNeutrality(content)
      
      expect(violations).toHaveLength(0)
    })

    it('should flag papal authority claims', () => {
      const content = 'The papal authority is supreme over all Christian churches.'
      
      const violations = TheologyGuard.validateDenominationalNeutrality(content)
      
      expect(violations).toContainEqual(
        expect.stringContaining('papal authority')
      )
    })

    it('should flag sola scriptura as divisive', () => {
      const content = 'Sola scriptura is the only valid source of Christian authority.'
      
      const violations = TheologyGuard.validateDenominationalNeutrality(content)
      
      expect(violations).toContainEqual(
        expect.stringContaining('sola scriptura')
      )
    })
  })

  describe('comprehensive content validation', () => {
    it('should combine all validation checks', () => {
      const content = 'Our denomination is the only true church. Through works-based salvation and universalism, everyone reaches heaven.'
      const context: ContentValidationContext = {
        ageRating: 'all',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      }
      
      const result = TheologyGuard.validateContent(content, context)
      
      expect(result.isValid).toBe(false)
      expect(result.violations.length).toBeGreaterThan(2)
      expect(result.violations.some(v => v.includes('denominational exclusivity'))).toBe(true)
      expect(result.violations.some(v => v.includes('works-based salvation'))).toBe(true)
      expect(result.violations.some(v => v.includes('universalism'))).toBe(true)
    })

    it('should pass comprehensive valid content', () => {
      const content = 'God loves all people. Through faith in Jesus Christ, we receive salvation by grace, not by our works. Christians from many backgrounds unite in this truth.'
      const context: ContentValidationContext = {
        ageRating: 'all',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      }
      const scriptureRefs: ScriptureReference[] = [{
        book: 'Ephesians',
        chapter: 2,
        verses: '8-9',
        translation: 'NIV'
      }]
      
      const result = TheologyGuard.validateContent(content, context, scriptureRefs)
      
      expect(result.isValid).toBe(true)
      expect(result.violations).toHaveLength(0)
      expect(result.scriptureAccuracy).toBe(true)
      expect(result.doctrinallySound).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should handle malformed input gracefully', () => {
      const result = TheologyGuard.validateTheologicalContent(
        null as any, 
        null as any
      )
      
      expect(result.isValid).toBe(false)
      expect(result.violations).toContainEqual('Validation error occurred')
    })

    it('should handle empty content', () => {
      const context: ContentValidationContext = {
        ageRating: 'all',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      }
      
      const result = TheologyGuard.validateTheologicalContent('', context)
      
      expect(result.isValid).toBe(true)
      expect(result.violations).toHaveLength(0)
    })

    it('should handle scripture reference validation errors', () => {
      const invalidReference = {
        book: null,
        chapter: 'invalid',
        verses: undefined,
        translation: 123
      } as any
      
      expect(TheologyGuard.validateScriptureReference(invalidReference)).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle case-insensitive heresy detection', () => {
      const content = 'WORKS-BASED SALVATION and UNIVERSALISM are correct doctrines.'
      const context: ContentValidationContext = {
        ageRating: 'all',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      }
      
      const result = TheologyGuard.validateTheologicalContent(content, context)
      
      expect(result.isValid).toBe(false)
      expect(result.violations.length).toBeGreaterThan(0)
    })

    it('should handle mixed valid and invalid content', () => {
      const content = 'Jesus loves us and wants us to have eternal life. However, works-based salvation is the way.'
      const context: ContentValidationContext = {
        ageRating: 'all',
        contentType: 'story',
        denominationalScope: 'ecumenical'
      }
      
      const result = TheologyGuard.validateTheologicalContent(content, context)
      
      expect(result.isValid).toBe(false)
      expect(result.violations.some(v => v.includes('works-based salvation'))).toBe(true)
    })
  })
})