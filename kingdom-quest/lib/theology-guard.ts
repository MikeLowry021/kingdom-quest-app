/**
 * TheologyGuard - Validates theological content for biblical accuracy and doctrinal soundness
 * 
 * This module ensures all content aligns with the theology guardrails defined in the policies.
 * It validates scripture citations, translation attributions, and doctrinal accuracy.
 */

export interface ScriptureReference {
  book: string
  chapter: number
  verses?: string
  translation: string
}

export interface TheologyValidationResult {
  isValid: boolean
  violations: string[]
  warnings: string[]
  scriptureAccuracy: boolean
  translationCorrect: boolean
  doctrinallySound: boolean
}

export interface ContentValidationContext {
  ageRating: 'all' | 'children' | 'youth' | 'adult'
  contentType: 'story' | 'quiz' | 'prayer' | 'devotion'
  denominationalScope: 'ecumenical' | 'protestant' | 'specific'
}

// Approved Bible translations with their validation patterns
const APPROVED_TRANSLATIONS = {
  NIV: 'New International Version',
  ESV: 'English Standard Version',
  NLT: 'New Living Translation',
  KJV: 'King James Version',
  NASB: 'New American Standard Bible',
  CSB: 'Christian Standard Bible'
} as const

// Core theological doctrines that must be upheld
const CORE_DOCTRINES = {
  TRINITY: 'Trinity',
  SALVATION_BY_FAITH: 'Salvation by Faith Alone',
  SCRIPTURE_AUTHORITY: 'Biblical Authority',
  CHRIST_DEITY: 'Deity of Christ',
  RESURRECTION: 'Resurrection of Christ'
} as const

// Prohibited theological concepts
const THEOLOGICAL_VIOLATIONS = [
  'works-based salvation',
  'universalism',
  'prosperity gospel',
  'replacement theology',
  'denial of trinity',
  'christ mythology',
  'multiple paths to god'
]

// Age-appropriate theological concepts
const AGE_APPROPRIATE_CONCEPTS = {
  children: [
    'God\'s love',
    'Jesus as friend',
    'prayer',
    'Bible stories',
    'kindness',
    'obedience',
    'forgiveness'
  ],
  youth: [
    'personal relationship with Christ',
    'discipleship',
    'faith challenges',
    'identity in Christ',
    'biblical worldview',
    'peer pressure',
    'calling and purpose'
  ],
  adult: [
    'systematic theology',
    'apologetics',
    'church history',
    'ministry leadership',
    'complex ethical issues',
    'doctrinal distinctions'
  ]
}

export class TheologyGuard {
  /**
   * Validates scripture references for accuracy and proper attribution
   */
  static validateScriptureReference(reference: ScriptureReference): boolean {
    try {
      // Validate translation is approved
      if (!Object.keys(APPROVED_TRANSLATIONS).includes(reference.translation)) {
        return false
      }

      // Validate book name (simplified validation)
      const validBooks = [
        // Old Testament
        'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
        'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
        '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
        'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
        'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
        'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
        'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
        'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
        // New Testament
        'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
        '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
        'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
        '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
        'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
        'Jude', 'Revelation'
      ]

      if (!validBooks.includes(reference.book)) {
        return false
      }

      // Validate chapter number is positive
      if (reference.chapter < 1) {
        return false
      }

      // Validate verse format if provided (e.g., "1-5", "1,3,5", "1")
      if (reference.verses) {
        const versePattern = /^\d+([,-]\d+)*$/
        if (!versePattern.test(reference.verses)) {
          return false
        }
      }

      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Validates content for theological accuracy and doctrinal soundness
   */
  static validateTheologicalContent(
    content: string,
    context: ContentValidationContext,
    scriptureRefs?: ScriptureReference[]
  ): TheologyValidationResult {
    const result: TheologyValidationResult = {
      isValid: true,
      violations: [],
      warnings: [],
      scriptureAccuracy: true,
      translationCorrect: true,
      doctrinallySound: true
    }

    try {
      const contentLower = content.toLowerCase()

      // Check for theological violations
      for (const violation of THEOLOGICAL_VIOLATIONS) {
        if (contentLower.includes(violation)) {
          result.violations.push(`Contains prohibited theological concept: ${violation}`)
          result.doctrinallySound = false
        }
      }

      // Validate scripture references if provided
      if (scriptureRefs) {
        for (const ref of scriptureRefs) {
          if (!this.validateScriptureReference(ref)) {
            result.violations.push(`Invalid scripture reference: ${ref.book} ${ref.chapter}${ref.verses ? ':' + ref.verses : ''}`)
            result.scriptureAccuracy = false
          }
        }
      }

      // Check age-appropriateness
      const ageViolations = this.validateAgeAppropriateTheology(content, context.ageRating)
      result.warnings.push(...ageViolations)

      // Validate gospel clarity for salvation-related content
      if (this.containsSalvationContent(content)) {
        const gospelViolations = this.validateGospelClarity(content)
        result.violations.push(...gospelViolations)
        if (gospelViolations.length > 0) {
          result.doctrinallySound = false
        }
      }

      // Set overall validity
      result.isValid = result.violations.length === 0

      return result
    } catch (error) {
      return {
        isValid: false,
        violations: ['Validation error occurred'],
        warnings: [],
        scriptureAccuracy: false,
        translationCorrect: false,
        doctrinallySound: false
      }
    }
  }

  /**
   * Validates that theological concepts are appropriate for the target age
   */
  private static validateAgeAppropriateTheology(content: string, ageRating: string): string[] {
    const warnings: string[] = []
    const contentLower = content.toLowerCase()

    if (ageRating === 'children') {
      // Complex theological terms inappropriate for children
      const complexTerms = [
        'predestination', 'sanctification', 'justification',
        'propitiation', 'eschatology', 'soteriology'
      ]
      
      for (const term of complexTerms) {
        if (contentLower.includes(term)) {
          warnings.push(`Complex theological term '${term}' may be inappropriate for children`)
        }
      }

      // Scary concepts for young children
      const scaryTerms = ['hell', 'damnation', 'wrath', 'judgment day']
      for (const term of scaryTerms) {
        if (contentLower.includes(term)) {
          warnings.push(`Potentially frightening term '${term}' should be handled carefully for children`)
        }
      }
    }

    return warnings
  }

  /**
   * Checks if content contains salvation-related themes
   */
  private static containsSalvationContent(content: string): boolean {
    const salvationKeywords = [
      'salvation', 'saved', 'eternal life', 'heaven',
      'gospel', 'born again', 'faith', 'believe',
      'redemption', 'forgiveness of sins'
    ]

    const contentLower = content.toLowerCase()
    return salvationKeywords.some(keyword => contentLower.includes(keyword))
  }

  /**
   * Validates that salvation content clearly presents the gospel
   */
  private static validateGospelClarity(content: string): string[] {
    const violations: string[] = []
    const contentLower = content.toLowerCase()

    // Essential gospel elements that should be present or implied
    const gospelElements = {
      sin: ['sin', 'wrong', 'disobey', 'fall short'],
      grace: ['grace', 'gift', 'free', 'undeserved'],
      faith: ['faith', 'believe', 'trust', 'accept'],
      christ: ['jesus', 'christ', 'savior', 'lord']
    }

    // Check for works-based salvation indicators
    const worksBasedTerms = [
      'earn salvation', 'work your way', 'deserve heaven',
      'good enough', 'try harder'
    ]

    for (const term of worksBasedTerms) {
      if (contentLower.includes(term)) {
        violations.push(`Contains works-based salvation implication: '${term}'`)
      }
    }

    // Ensure Christ is central to any salvation message
    if (this.containsSalvationContent(content)) {
      const hasChristReference = gospelElements.christ.some(term => 
        contentLower.includes(term)
      )
      
      if (!hasChristReference) {
        violations.push('Salvation content lacks clear reference to Christ')
      }
    }

    return violations
  }

  /**
   * Validates denominational inclusivity requirements
   */
  static validateDenominationalNeutrality(content: string): string[] {
    const violations: string[] = []
    const contentLower = content.toLowerCase()

    // Denominational superiority claims to avoid
    const exclusivityTerms = [
      'only true church', 'only correct interpretation',
      'our denomination is', 'other churches are wrong'
    ]

    for (const term of exclusivityTerms) {
      if (contentLower.includes(term)) {
        violations.push(`Contains denominational exclusivity: '${term}'`)
      }
    }

    // Controversial practices that should be handled neutrally
    const controversialPractices = [
      'speaking in tongues', 'infant baptism', 'predestination',
      'papal authority', 'sola scriptura'
    ]

    for (const practice of controversialPractices) {
      if (contentLower.includes(practice)) {
        violations.push(`Contains potentially divisive denominational practice: '${practice}'`)
      }
    }

    return violations
  }

  /**
   * Comprehensive content validation that combines all checks
   */
  static validateContent(
    content: string,
    context: ContentValidationContext,
    scriptureRefs?: ScriptureReference[]
  ): TheologyValidationResult {
    const theologyResult = this.validateTheologicalContent(content, context, scriptureRefs)
    const denominationalViolations = this.validateDenominationalNeutrality(content)
    
    return {
      ...theologyResult,
      violations: [...theologyResult.violations, ...denominationalViolations],
      isValid: theologyResult.isValid && denominationalViolations.length === 0
    }
  }
}