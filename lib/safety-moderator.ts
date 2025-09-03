/**
 * SafetyModerator - Comprehensive content safety validation for family-friendly experience
 * 
 * This module enforces content safety policies including child protection standards,
 * violence gating mechanisms, inappropriate content detection, and age-appropriate filtering.
 */

export interface SafetyValidationResult {
  isValid: boolean
  violations: SafetyViolation[]
  warnings: SafetyWarning[]
  ageAppropriate: boolean
  requiresParentalGuidance: boolean
  blockedContent: string[]
}

export interface SafetyViolation {
  type: ViolationType
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  location?: string
  suggestedAction: string
}

export interface SafetyWarning {
  type: WarningType
  description: string
  recommendation: string
}

export type ViolationType = 
  | 'inappropriate_language'
  | 'violent_content'
  | 'sexual_content'
  | 'scary_content'
  | 'personal_information'
  | 'contact_information'
  | 'external_links'
  | 'age_inappropriate'
  | 'discrimination'
  | 'bullying'

export type WarningType = 
  | 'complex_concept'
  | 'parental_guidance_recommended'
  | 'cultural_sensitivity'
  | 'emotional_impact'
  | 'discussion_starter'

export interface ContentContext {
  ageRating: 'all' | 'children' | 'youth' | 'adult'
  contentType: 'story' | 'quiz' | 'prayer' | 'image' | 'audio' | 'video'
  userAge?: number
  parentalControls: boolean
  moderationLevel: 'strict' | 'moderate' | 'relaxed'
}

// Content blocklist organized by category
const CONTENT_BLOCKLIST = {
  profanity: [
    // Basic profanity (would include comprehensive list in real implementation)
    'damn', 'hell' // (when used as profanity, not biblical reference)
  ],
  violence: [
    'kill', 'murder', 'blood', 'gore', 'weapon', 'fight', 'war',
    'sword', 'battle', 'death', 'die', 'dead' // Context-dependent
  ],
  inappropriate: [
    'sexy', 'naked', 'breast', 'sexual', 'erotic', 'porn'
  ],
  scary: [
    'demon', 'devil', 'satan', 'evil spirit', 'ghost', 'monster',
    'nightmare', 'terror', 'horror', 'scary'
  ],
  personal: [
    'phone number', 'address', 'email', 'social security',
    'credit card', 'password', 'meet me', 'my location'
  ]
}

// Age-appropriate content guidelines
const AGE_CONTENT_GUIDELINES = {
  'all': {
    maxComplexityLevel: 1,
    allowedTopics: ['love', 'kindness', 'sharing', 'family', 'friendship'],
    restrictedConcepts: ['death', 'violence', 'complex theology']
  },
  'children': {
    maxComplexityLevel: 2,
    allowedTopics: ['bible stories', 'prayer', 'obedience', 'forgiveness', 'helping others'],
    restrictedConcepts: ['hell', 'judgment', 'persecution', 'martyrdom']
  },
  'youth': {
    maxComplexityLevel: 4,
    allowedTopics: ['identity', 'purpose', 'relationships', 'faith challenges', 'discipleship'],
    restrictedConcepts: ['graphic violence', 'detailed suffering']
  },
  'adult': {
    maxComplexityLevel: 5,
    allowedTopics: ['all biblical topics', 'apologetics', 'theology', 'church history'],
    restrictedConcepts: ['gratuitous violence']
  }
}

// Violence gating system - determines what level of conflict/violence is appropriate
const VIOLENCE_GATING = {
  'all': {
    maxViolenceLevel: 0, // No violence
    allowedConflictTypes: ['disagreement', 'misunderstanding']
  },
  'children': {
    maxViolenceLevel: 1, // Implied conflict only
    allowedConflictTypes: ['conflict resolution', 'standing up for right', 'overcoming fear']
  },
  'youth': {
    maxViolenceLevel: 2, // Historical/biblical violence in context
    allowedConflictTypes: ['biblical battles', 'persecution', 'martyrdom']
  },
  'adult': {
    maxViolenceLevel: 3, // Full biblical context with appropriate framing
    allowedConflictTypes: ['war', 'execution', 'detailed persecution']
  }
}

export class SafetyModerator {
  /**
   * Primary content safety validation
   */
  static validateContent(content: string, context: ContentContext): SafetyValidationResult {
    const result: SafetyValidationResult = {
      isValid: true,
      violations: [],
      warnings: [],
      ageAppropriate: true,
      requiresParentalGuidance: false,
      blockedContent: []
    }

    try {
      // Run all validation checks
      const languageViolations = this.checkInappropriateLanguage(content, context)
      const violenceViolations = this.checkViolentContent(content, context)
      const inappropriateViolations = this.checkInappropriateContent(content, context)
      const personalInfoViolations = this.checkPersonalInformation(content, context)
      const ageViolations = this.checkAgeAppropriateness(content, context)
      const scaryViolations = this.checkScaryContent(content, context)

      // Combine all violations
      result.violations = [
        ...languageViolations,
        ...violenceViolations,
        ...inappropriateViolations,
        ...personalInfoViolations,
        ...ageViolations,
        ...scaryViolations
      ]

      // Generate warnings
      result.warnings = this.generateContentWarnings(content, context)

      // Determine overall validity
      const criticalViolations = result.violations.filter(v => v.severity === 'critical')
      const highViolations = result.violations.filter(v => v.severity === 'high')
      
      result.isValid = criticalViolations.length === 0 && 
                      (context.moderationLevel === 'relaxed' || highViolations.length === 0)
      
      result.ageAppropriate = !result.violations.some(v => v.type === 'age_inappropriate')
      result.requiresParentalGuidance = result.violations.some(v => v.severity === 'medium' || v.severity === 'high')

      return result
    } catch (error) {
      return {
        isValid: false,
        violations: [{
          type: 'inappropriate_language',
          severity: 'critical',
          description: 'Content validation error occurred',
          suggestedAction: 'Manual review required'
        }],
        warnings: [],
        ageAppropriate: false,
        requiresParentalGuidance: true,
        blockedContent: []
      }
    }
  }

  /**
   * Check for inappropriate language
   */
  private static checkInappropriateLanguage(
    content: string,
    context: ContentContext
  ): SafetyViolation[] {
    const violations: SafetyViolation[] = []
    const contentLower = content.toLowerCase()

    // Check profanity blocklist
    for (const word of CONTENT_BLOCKLIST.profanity) {
      if (contentLower.includes(word)) {
        // Context check - "hell" might be appropriate in biblical context
        if (word === 'hell' && this.isBiblicalContext(content, word)) {
          continue
        }

        violations.push({
          type: 'inappropriate_language',
          severity: context.ageRating === 'all' ? 'critical' : 'high',
          description: `Contains inappropriate language: "${word}"`,
          suggestedAction: 'Remove or replace with family-friendly alternative'
        })
      }
    }

    return violations
  }

  /**
   * Check for violent content with age-appropriate gating
   */
  private static checkViolentContent(
    content: string,
    context: ContentContext
  ): SafetyViolation[] {
    const violations: SafetyViolation[] = []
    const contentLower = content.toLowerCase()
    const gating = VIOLENCE_GATING[context.ageRating]

    for (const violentTerm of CONTENT_BLOCKLIST.violence) {
      if (contentLower.includes(violentTerm)) {
        // Determine severity based on age rating and context
        const violenceLevel = this.assessViolenceLevel(content, violentTerm)
        
        if (violenceLevel > gating.maxViolenceLevel) {
          violations.push({
            type: 'violent_content',
            severity: this.getViolenceSeverity(violenceLevel, context.ageRating),
            description: `Contains violent content inappropriate for ${context.ageRating}: "${violentTerm}"`,
            suggestedAction: violenceLevel <= gating.maxViolenceLevel + 1 ? 
              'Add appropriate context and age warning' : 'Remove or significantly modify content'
          })
        }
      }
    }

    return violations
  }

  /**
   * Check for inappropriate sexual or suggestive content
   */
  private static checkInappropriateContent(
    content: string,
    context: ContentContext
  ): SafetyViolation[] {
    const violations: SafetyViolation[] = []
    const contentLower = content.toLowerCase()

    for (const inappropriateTerm of CONTENT_BLOCKLIST.inappropriate) {
      if (contentLower.includes(inappropriateTerm)) {
        violations.push({
          type: 'sexual_content',
          severity: 'critical',
          description: `Contains inappropriate sexual content: "${inappropriateTerm}"`,
          suggestedAction: 'Remove immediately - not appropriate for family platform'
        })
      }
    }

    return violations
  }

  /**
   * Check for scary or frightening content
   */
  private static checkScaryContent(
    content: string,
    context: ContentContext
  ): SafetyViolation[] {
    const violations: SafetyViolation[] = []
    const contentLower = content.toLowerCase()

    // Only check for scary content for all ages and children
    if (context.ageRating === 'all' || context.ageRating === 'children') {
      for (const scaryTerm of CONTENT_BLOCKLIST.scary) {
        if (contentLower.includes(scaryTerm)) {
          // Biblical context check
          if (this.isBiblicalContext(content, scaryTerm)) {
            // Even biblical scary content needs age-appropriate handling
            violations.push({
              type: 'scary_content',
              severity: context.ageRating === 'all' ? 'high' : 'medium',
              description: `Contains potentially scary biblical content: "${scaryTerm}"`,
              suggestedAction: 'Frame in age-appropriate way with emphasis on God\'s protection'
            })
          } else {
            violations.push({
              type: 'scary_content',
              severity: 'critical',
              description: `Contains scary content inappropriate for ${context.ageRating}: "${scaryTerm}"`,
              suggestedAction: 'Remove or replace with age-appropriate alternative'
            })
          }
        }
      }
    }

    return violations
  }

  /**
   * Check for personal information disclosure
   */
  private static checkPersonalInformation(
    content: string,
    context: ContentContext
  ): SafetyViolation[] {
    const violations: SafetyViolation[] = []
    const contentLower = content.toLowerCase()

    for (const personalTerm of CONTENT_BLOCKLIST.personal) {
      if (contentLower.includes(personalTerm)) {
        violations.push({
          type: 'personal_information',
          severity: 'critical',
          description: `Contains personal information request: "${personalTerm}"`,
          suggestedAction: 'Remove immediately - violates child protection policies'
        })
      }
    }

    // Check for email patterns
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    if (emailPattern.test(content)) {
      violations.push({
        type: 'contact_information',
        severity: 'critical',
        description: 'Contains email address',
        suggestedAction: 'Remove email address immediately'
      })
    }

    // Check for phone number patterns
    const phonePattern = /\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}/
    if (phonePattern.test(content)) {
      violations.push({
        type: 'contact_information',
        severity: 'critical',
        description: 'Contains phone number',
        suggestedAction: 'Remove phone number immediately'
      })
    }

    return violations
  }

  /**
   * Check age appropriateness
   */
  private static checkAgeAppropriateness(
    content: string,
    context: ContentContext
  ): SafetyViolation[] {
    const violations: SafetyViolation[] = []
    const guidelines = AGE_CONTENT_GUIDELINES[context.ageRating]
    const contentLower = content.toLowerCase()

    // Check for restricted concepts
    for (const concept of guidelines.restrictedConcepts) {
      if (contentLower.includes(concept)) {
        violations.push({
          type: 'age_inappropriate',
          severity: context.ageRating === 'all' ? 'high' : 'medium',
          description: `Contains concept inappropriate for ${context.ageRating}: "${concept}"`,
          suggestedAction: 'Move to appropriate age category or provide age-appropriate explanation'
        })
      }
    }

    return violations
  }

  /**
   * Generate content warnings for borderline content
   */
  private static generateContentWarnings(
    content: string,
    context: ContentContext
  ): SafetyWarning[] {
    const warnings: SafetyWarning[] = []
    const contentLower = content.toLowerCase()

    // Complex theological concepts for children
    if (context.ageRating === 'children' || context.ageRating === 'all') {
      const complexTerms = ['salvation', 'redemption', 'sanctification', 'trinity']
      for (const term of complexTerms) {
        if (contentLower.includes(term)) {
          warnings.push({
            type: 'complex_concept',
            description: `Contains complex theological concept: "${term}"`,
            recommendation: 'Consider simplifying explanation or providing visual aids'
          })
        }
      }
    }

    // Emotional impact warnings
    const emotionalTerms = ['sad', 'crying', 'afraid', 'worried', 'angry']
    for (const term of emotionalTerms) {
      if (contentLower.includes(term)) {
        warnings.push({
          type: 'emotional_impact',
          description: `Contains emotional content that may require discussion: "${term}"`,
          recommendation: 'Consider including discussion questions or comfort activities'
        })
      }
    }

    return warnings
  }

  /**
   * Helper method to determine if scary/violent term is in biblical context
   */
  private static isBiblicalContext(content: string, term: string): boolean {
    const contextIndicators = [
      'bible', 'scripture', 'jesus', 'god', 'lord', 'christ',
      'testament', 'psalm', 'proverb', 'gospel', 'apostle'
    ]
    
    const contentLower = content.toLowerCase()
    return contextIndicators.some(indicator => contentLower.includes(indicator))
  }

  /**
   * Assess violence level of content
   */
  private static assessViolenceLevel(content: string, term: string): number {
    const contentLower = content.toLowerCase()
    
    // Level 0: No violence
    // Level 1: Implied conflict
    // Level 2: Historical/biblical violence
    // Level 3: Detailed violence
    
    if (term === 'die' || term === 'death') {
      if (contentLower.includes('eternal life') || contentLower.includes('resurrection')) {
        return 1 // Death in context of eternal life
      }
      return 2 // Death mentioned
    }
    
    if (term === 'battle' || term === 'war') {
      return this.isBiblicalContext(content, term) ? 2 : 3
    }
    
    if (term === 'kill' || term === 'murder') {
      return 3 // Always high level
    }
    
    return 1 // Default to low level
  }

  /**
   * Get severity based on violence level and age rating
   */
  private static getViolenceSeverity(
    violenceLevel: number,
    ageRating: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (ageRating === 'all') {
      return violenceLevel > 1 ? 'critical' : 'high'
    }
    if (ageRating === 'children') {
      return violenceLevel > 2 ? 'critical' : 'medium'
    }
    if (ageRating === 'youth') {
      return violenceLevel > 3 ? 'high' : 'low'
    }
    return 'low' // Adult content
  }

  /**
   * Image safety validation
   */
  static validateImage(
    imageUrl: string,
    altText: string,
    context: ContentContext
  ): SafetyValidationResult {
    // This would integrate with image recognition APIs in production
    const result: SafetyValidationResult = {
      isValid: true,
      violations: [],
      warnings: [],
      ageAppropriate: true,
      requiresParentalGuidance: false,
      blockedContent: []
    }

    // Validate alt text for inappropriate content
    const altTextValidation = this.validateContent(altText, {
      ...context,
      contentType: 'image'
    })

    result.violations = altTextValidation.violations
    result.warnings = altTextValidation.warnings
    result.isValid = altTextValidation.isValid
    result.ageAppropriate = altTextValidation.ageAppropriate

    return result
  }

  /**
   * Audio content safety validation
   */
  static validateAudio(
    transcript: string,
    context: ContentContext
  ): SafetyValidationResult {
    // In production, this would include audio processing and speech recognition
    return this.validateContent(transcript, {
      ...context,
      contentType: 'audio'
    })
  }
}