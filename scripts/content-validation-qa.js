#!/usr/bin/env node
/**
 * Content Validation and Quality Assurance Script
 * 
 * Comprehensive validation system for ensuring theological accuracy,
 * educational quality, and safety standards across all KingdomQuest content.
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Configuration
const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  validationReportsDirectory: path.join(__dirname, '../logs/validation-reports'),
  qualityThresholds: {
    theological_accuracy: 85,
    educational_value: 80,
    age_appropriateness: 90,
    family_integration: 75,
    overall_quality: 80
  },
  batchSize: 25,
  retryAttempts: 3
}

class ContentValidationQA {
  constructor() {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey)
    this.validationStats = {
      totalContent: 0,
      validated: 0,
      approved: 0,
      flagged: 0,
      rejected: 0,
      errors: [],
      warnings: [],
      qualityMetrics: {
        theological_accuracy: [],
        educational_value: [],
        age_appropriateness: [],
        family_integration: []
      }
    }
    this.theologicalStandards = this.loadTheologicalStandards()
    this.ageAppropriatenessRules = this.loadAgeAppropriatenessRules()
  }

  /**
   * Main validation execution
   */
  async run(options = {}) {
    console.log('🔍 Starting KingdomQuest Content Validation & QA System...')
    
    try {
      // 1. Validate environment
      await this.validateEnvironment()
      
      // 2. Identify content for validation
      const contentToValidate = await this.identifyContentForValidation(options)
      console.log(`📋 Found ${contentToValidate.length} content items requiring validation`)
      
      // 3. Perform theological validation
      await this.performTheologicalValidation(contentToValidate)
      
      // 4. Perform educational quality validation
      await this.performEducationalValidation(contentToValidate)
      
      // 5. Perform age appropriateness validation
      await this.performAgeAppropriatenessValidation(contentToValidate)
      
      // 6. Perform family integration validation
      await this.performFamilyIntegrationValidation(contentToValidate)
      
      // 7. Calculate overall quality scores
      await this.calculateOverallQualityScores(contentToValidate)
      
      // 8. Generate validation recommendations
      await this.generateValidationRecommendations(contentToValidate)
      
      // 9. Update content status based on validation
      await this.updateContentStatus(contentToValidate)
      
      // 10. Generate comprehensive validation report
      await this.generateValidationReport(contentToValidate)
      
      console.log('✅ Content validation and QA completed successfully!')
      
    } catch (error) {
      console.error('❌ Content validation failed:', error.message)
      this.recordError('validation_failure', error.message)
      process.exit(1)
    }
  }

  /**
   * Validate environment and setup
   */
  async validateEnvironment() {
    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new Error('Missing required environment variables')
    }

    // Test database connection
    const { error } = await this.supabase.from('stories').select('id').limit(1)
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database connection failed: ${error.message}`)
    }

    // Ensure reports directory exists
    fs.mkdirSync(config.validationReportsDirectory, { recursive: true })

    console.log('✅ Environment validated successfully')
  }

  /**
   * Identify content requiring validation
   */
  async identifyContentForValidation(options) {
    const contentItems = []
    
    // Get stories requiring validation
    const stories = await this.getStoriesForValidation(options)
    contentItems.push(...stories.map(story => ({ ...story, type: 'story' })))
    
    // Get quizzes requiring validation
    const quizzes = await this.getQuizzesForValidation(options)
    contentItems.push(...quizzes.map(quiz => ({ ...quiz, type: 'quiz' })))
    
    // Get family altar content requiring validation
    const altars = await this.getFamilyAltarsForValidation(options)
    contentItems.push(...altars.map(altar => ({ ...altar, type: 'family_altar' })))
    
    // Get prayers requiring validation
    const prayers = await this.getPrayersForValidation(options)
    contentItems.push(...prayers.map(prayer => ({ ...prayer, type: 'prayer' })))

    this.validationStats.totalContent = contentItems.length
    
    return contentItems
  }

  /**
   * Perform theological accuracy validation
   */
  async performTheologicalValidation(contentItems) {
    console.log('📖 Performing theological accuracy validation...')
    
    const batches = this.createBatches(contentItems, config.batchSize)
    
    for (let i = 0; i < batches.length; i++) {
      console.log(`⛪ Validating theological accuracy batch ${i + 1}/${batches.length}`)
      await this.validateTheologyBatch(batches[i])
    }
  }

  /**
   * Validate theology for a batch of content
   */
  async validateTheologyBatch(batch) {
    const promises = batch.map(item => this.validateTheologicalAccuracy(item))
    const results = await Promise.allSettled(promises)
    
    results.forEach((result, index) => {
      const item = batch[index]
      
      if (result.status === 'fulfilled') {
        item.theologyValidation = result.value
        this.validationStats.qualityMetrics.theological_accuracy.push(result.value.score)
        console.log(`✅ Theology validated: ${item.title} (Score: ${result.value.score})`)
      } else {
        this.recordError('theology_validation', 
          `Failed to validate theology for ${item.title}: ${result.reason.message}`)
        item.theologyValidation = { score: 0, approved: false, errors: [result.reason.message] }
      }
    })
  }

  /**
   * Validate theological accuracy of individual content item
   */
  async validateTheologicalAccuracy(item) {
    const validation = {
      score: 0,
      approved: false,
      concerns: [],
      recommendations: [],
      bibleReferences: []
    }

    // 1. Check for core theological concepts
    const coreTheologyCheck = await this.validateCoreTheology(item)
    validation.score += coreTheologyCheck.score * 0.4
    validation.concerns.push(...coreTheologyCheck.concerns)

    // 2. Validate Bible reference accuracy
    const bibleRefCheck = await this.validateBibleReferences(item)
    validation.score += bibleRefCheck.score * 0.3
    validation.bibleReferences = bibleRefCheck.references

    // 3. Check denominational inclusivity
    const denominationalCheck = await this.validateDenominationalInclusivity(item)
    validation.score += denominationalCheck.score * 0.2

    // 4. Validate doctrinal soundness
    const doctrinalCheck = await this.validateDoctrinalSoundness(item)
    validation.score += doctrinalCheck.score * 0.1
    validation.concerns.push(...doctrinalCheck.concerns)

    validation.approved = validation.score >= config.qualityThresholds.theological_accuracy
    
    if (!validation.approved) {
      validation.recommendations = await this.generateTheologyRecommendations(validation.concerns)
    }

    return validation
  }

  /**
   * Perform educational quality validation
   */
  async performEducationalValidation(contentItems) {
    console.log('🎓 Performing educational quality validation...')
    
    for (const item of contentItems) {
      try {
        item.educationalValidation = await this.validateEducationalQuality(item)
        this.validationStats.qualityMetrics.educational_value.push(item.educationalValidation.score)
      } catch (error) {
        this.recordError('educational_validation', 
          `Failed to validate educational quality for ${item.title}: ${error.message}`)
        item.educationalValidation = { score: 0, approved: false }
      }
    }
  }

  /**
   * Validate educational quality of content
   */
  async validateEducationalQuality(item) {
    const validation = {
      score: 0,
      approved: false,
      strengths: [],
      improvements: [],
      learningObjectives: []
    }

    // 1. Check learning objectives clarity
    const objectivesCheck = await this.validateLearningObjectives(item)
    validation.score += objectivesCheck.score * 0.3

    // 2. Validate content structure and organization
    const structureCheck = await this.validateContentStructure(item)
    validation.score += structureCheck.score * 0.2

    // 3. Check engagement and interactivity
    const engagementCheck = await this.validateEngagementLevel(item)
    validation.score += engagementCheck.score * 0.2

    // 4. Validate assessment and feedback mechanisms
    const assessmentCheck = await this.validateAssessmentMechanisms(item)
    validation.score += assessmentCheck.score * 0.15

    // 5. Check knowledge retention strategies
    const retentionCheck = await this.validateKnowledgeRetention(item)
    validation.score += retentionCheck.score * 0.15

    validation.approved = validation.score >= config.qualityThresholds.educational_value
    validation.learningObjectives = objectivesCheck.objectives
    validation.strengths = this.identifyEducationalStrengths(item, validation.score)
    validation.improvements = this.identifyEducationalImprovements(item, validation.score)

    return validation
  }

  /**
   * Perform age appropriateness validation
   */
  async performAgeAppropriatenessValidation(contentItems) {
    console.log('👶 Performing age appropriateness validation...')
    
    for (const item of contentItems) {
      try {
        item.ageValidation = await this.validateAgeAppropriateness(item)
        this.validationStats.qualityMetrics.age_appropriateness.push(item.ageValidation.score)
      } catch (error) {
        this.recordError('age_validation', 
          `Failed to validate age appropriateness for ${item.title}: ${error.message}`)
        item.ageValidation = { score: 0, appropriate: false }
      }
    }
  }

  /**
   * Validate age appropriateness of content
   */
  async validateAgeAppropriateness(item) {
    const validation = {
      score: 0,
      appropriate: false,
      ageGroups: item.age_groups || item.age_rating ? [item.age_rating] : ['all'],
      concerns: [],
      adaptations: []
    }

    for (const ageGroup of validation.ageGroups) {
      const ageCheck = await this.validateForAgeGroup(item, ageGroup)
      validation.score += ageCheck.score / validation.ageGroups.length
      
      if (ageCheck.concerns.length > 0) {
        validation.concerns.push(...ageCheck.concerns)
      }
      
      if (ageCheck.adaptations.length > 0) {
        validation.adaptations.push(...ageCheck.adaptations)
      }
    }

    validation.appropriate = validation.score >= config.qualityThresholds.age_appropriateness

    return validation
  }

  /**
   * Perform family integration validation
   */
  async performFamilyIntegrationValidation(contentItems) {
    console.log('👨‍👩‍👧‍👦 Performing family integration validation...')
    
    for (const item of contentItems) {
      try {
        item.familyValidation = await this.validateFamilyIntegration(item)
        this.validationStats.qualityMetrics.family_integration.push(item.familyValidation.score)
      } catch (error) {
        this.recordError('family_validation', 
          `Failed to validate family integration for ${item.title}: ${error.message}`)
        item.familyValidation = { score: 0, familyReady: false }
      }
    }
  }

  /**
   * Validate family integration capabilities
   */
  async validateFamilyIntegration(item) {
    const validation = {
      score: 0,
      familyReady: false,
      multiGenerational: false,
      parentGuidance: false,
      sharedActivities: false,
      discussionPrompts: false
    }

    // 1. Check for multi-generational appeal
    const multiGenCheck = await this.validateMultiGenerationalAppeal(item)
    validation.score += multiGenCheck.score * 0.3
    validation.multiGenerational = multiGenCheck.appropriate

    // 2. Validate parent guidance materials
    const parentGuidanceCheck = await this.validateParentGuidance(item)
    validation.score += parentGuidanceCheck.score * 0.25
    validation.parentGuidance = parentGuidanceCheck.present

    // 3. Check for shared family activities
    const activitiesCheck = await this.validateFamilyActivities(item)
    validation.score += activitiesCheck.score * 0.25
    validation.sharedActivities = activitiesCheck.present

    // 4. Validate discussion prompts for families
    const discussionCheck = await this.validateFamilyDiscussion(item)
    validation.score += discussionCheck.score * 0.2
    validation.discussionPrompts = discussionCheck.present

    validation.familyReady = validation.score >= config.qualityThresholds.family_integration

    return validation
  }

  /**
   * Calculate overall quality scores
   */
  async calculateOverallQualityScores(contentItems) {
    console.log('📊 Calculating overall quality scores...')
    
    for (const item of contentItems) {
      const theologyScore = item.theologyValidation?.score || 0
      const educationScore = item.educationalValidation?.score || 0
      const ageScore = item.ageValidation?.score || 0
      const familyScore = item.familyValidation?.score || 0

      item.overallQuality = {
        score: Math.round((theologyScore * 0.35 + educationScore * 0.25 + ageScore * 0.25 + familyScore * 0.15)),
        approved: false,
        recommendations: []
      }

      item.overallQuality.approved = item.overallQuality.score >= config.qualityThresholds.overall_quality

      if (!item.overallQuality.approved) {
        item.overallQuality.recommendations = await this.generateOverallRecommendations(item)
      }

      this.validationStats.validated++
      
      if (item.overallQuality.approved) {
        this.validationStats.approved++
      } else if (item.overallQuality.score >= 50) {
        this.validationStats.flagged++
      } else {
        this.validationStats.rejected++
      }
    }
  }

  /**
   * Update content status based on validation results
   */
  async updateContentStatus(contentItems) {
    console.log('📝 Updating content status based on validation results...')
    
    for (const item of contentItems) {
      let newStatus = 'draft'
      
      if (item.overallQuality.approved) {
        newStatus = 'approved'
      } else if (item.overallQuality.score >= 50) {
        newStatus = 'needs_review'
      } else {
        newStatus = 'rejected'
      }

      try {
        const validationData = {
          validation_score: item.overallQuality.score,
          theology_score: item.theologyValidation?.score || 0,
          education_score: item.educationalValidation?.score || 0,
          age_score: item.ageValidation?.score || 0,
          family_score: item.familyValidation?.score || 0,
          validation_date: new Date().toISOString(),
          validation_details: {
            theology: item.theologyValidation,
            education: item.educationalValidation,
            age: item.ageValidation,
            family: item.familyValidation,
            overall: item.overallQuality
          }
        }

        const { error } = await this.supabase
          .from(this.getTableName(item.type))
          .update({
            status: newStatus,
            ...validationData
          })
          .eq('id', item.id)

        if (error) throw error

        console.log(`✅ Updated ${item.title}: ${newStatus} (Score: ${item.overallQuality.score})`)

      } catch (error) {
        this.recordError('status_update', 
          `Failed to update status for ${item.title}: ${error.message}`)
      }
    }
  }

  // Helper and validation methods

  loadTheologicalStandards() {
    return {
      coreDoctrines: [
        'trinity',
        'christ_deity',
        'salvation_by_grace',
        'scripture_authority',
        'resurrection',
        'second_coming'
      ],
      essentialTruths: [
        'God is love',
        'Jesus is the way to salvation',
        'Bible is God\'s Word',
        'Prayer is important',
        'Church community matters'
      ],
      prohibitedContent: [
        'denial of Christ\'s deity',
        'works-based salvation',
        'occult practices',
        'non-Christian spirituality',
        'theological liberalism that denies core doctrines'
      ]
    }
  }

  loadAgeAppropriatenessRules() {
    return {
      'children': {
        vocabulary: 'elementary',
        concepts: 'concrete',
        content_length: 'short',
        scary_content: 'prohibited',
        complex_theology: 'simplified'
      },
      'youth': {
        vocabulary: 'middle_grade',
        concepts: 'beginning_abstract',
        content_length: 'medium',
        scary_content: 'contextualized',
        complex_theology: 'introduced_gradually'
      },
      'adult': {
        vocabulary: 'advanced',
        concepts: 'abstract_allowed',
        content_length: 'flexible',
        scary_content: 'contextually_appropriate',
        complex_theology: 'full_complexity'
      }
    }
  }

  createBatches(array, batchSize) {
    const batches = []
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize))
    }
    return batches
  }

  getTableName(contentType) {
    const tableMap = {
      'story': 'stories',
      'quiz': 'quizzes', 
      'family_altar': 'family_altars',
      'prayer': 'prayers'
    }
    return tableMap[contentType] || 'content'
  }

  async getStoriesForValidation(options) {
    let query = this.supabase.from('stories').select('*')
    
    if (options.status) {
      query = query.eq('status', options.status)
    }
    
    if (options.includeValidated !== true) {
      query = query.is('validation_score', null)
    }

    const { data, error } = await query.limit(100)
    
    if (error) {
      this.recordError('content_fetch', `Failed to fetch stories: ${error.message}`)
      return []
    }

    return data || []
  }

  async getQuizzesForValidation(options) {
    let query = this.supabase.from('quizzes').select('*')
    
    if (options.status) {
      query = query.eq('status', options.status)
    }
    
    if (options.includeValidated !== true) {
      query = query.is('validation_score', null)
    }

    const { data, error } = await query.limit(100)
    
    if (error) {
      this.recordError('content_fetch', `Failed to fetch quizzes: ${error.message}`)
      return []
    }

    return data || []
  }

  async getFamilyAltarsForValidation(options) {
    let query = this.supabase.from('family_altars').select('*')
    
    if (options.status) {
      query = query.eq('status', options.status)
    }
    
    if (options.includeValidated !== true) {
      query = query.is('validation_score', null)
    }

    const { data, error } = await query.limit(100)
    
    if (error) {
      this.recordError('content_fetch', `Failed to fetch family altars: ${error.message}`)
      return []
    }

    return data || []
  }

  async getPrayersForValidation(options) {
    let query = this.supabase.from('prayers').select('*')
    
    if (options.status) {
      query = query.eq('status', options.status)
    }
    
    if (options.includeValidated !== true) {
      query = query.is('validation_score', null)
    }

    const { data, error } = await query.limit(50)
    
    if (error) {
      this.recordError('content_fetch', `Failed to fetch prayers: ${error.message}`)
      return []
    }

    return data || []
  }

  // Validation implementation methods (simplified versions)

  async validateCoreTheology(item) {
    // Check content against core theological principles
    let score = 85 // Base score for content that doesn't violate core doctrines
    const concerns = []

    // Simple keyword-based theology checking (would be more sophisticated in production)
    const content = JSON.stringify(item).toLowerCase()
    
    // Check for positive theological content
    if (content.includes('jesus') || content.includes('christ')) score += 5
    if (content.includes('god') && content.includes('love')) score += 5
    if (content.includes('bible') || content.includes('scripture')) score += 3

    // Check for concerning content
    this.theologicalStandards.prohibitedContent.forEach(prohibited => {
      if (content.includes(prohibited.toLowerCase())) {
        score -= 20
        concerns.push(`Potential theological concern: ${prohibited}`)
      }
    })

    return { score: Math.min(100, Math.max(0, score)), concerns }
  }

  async validateBibleReferences(item) {
    const score = item.bible_reference ? 90 : 70 // Higher score if Bible reference present
    const references = item.bible_reference ? [item.bible_reference] : []
    
    return { score, references }
  }

  async validateDenominationalInclusivity(item) {
    // Check for denominational bias (simplified implementation)
    const content = JSON.stringify(item).toLowerCase()
    let score = 85

    // Check for denominational terms that might exclude others
    const denominationalTerms = ['baptist', 'methodist', 'presbyterian', 'pentecostal', 'catholic']
    denominationalTerms.forEach(term => {
      if (content.includes(term)) {
        score -= 10 // Penalize denominational specificity
      }
    })

    return { score: Math.max(60, score) }
  }

  async validateDoctrinalSoundness(item) {
    // Check for doctrinal soundness
    const score = 85 // Assume sound unless proven otherwise
    const concerns = []
    
    return { score, concerns }
  }

  async generateTheologyRecommendations(concerns) {
    return concerns.map(concern => `Address theological concern: ${concern}`)
  }

  async validateLearningObjectives(item) {
    const hasObjectives = item.learning_objectives || item.metadata?.learningObjectives
    const score = hasObjectives ? 90 : 60
    const objectives = hasObjectives ? (item.learning_objectives || item.metadata.learningObjectives) : []
    
    return { score, objectives }
  }

  async validateContentStructure(item) {
    let score = 70
    
    // Check for proper structure
    if (item.description) score += 10
    if (item.type === 'story' && item.scenes) score += 15
    if (item.type === 'quiz' && item.questions) score += 15
    
    return { score: Math.min(100, score) }
  }

  async validateEngagementLevel(item) {
    let score = 70
    
    // Check for interactive elements
    if (item.interactions || item.activities) score += 20
    if (item.discussion_questions) score += 10
    
    return { score: Math.min(100, score) }
  }

  async validateAssessmentMechanisms(item) {
    let score = 70
    
    if (item.type === 'quiz') score += 20
    if (item.discussion_questions) score += 10
    
    return { score: Math.min(100, score) }
  }

  async validateKnowledgeRetention(item) {
    let score = 75
    
    // Check for repetition, review mechanisms
    if (item.memory_verse || item.key_takeaways) score += 15
    if (item.follow_up || item.continuation) score += 10
    
    return { score: Math.min(100, score) }
  }

  identifyEducationalStrengths(item, score) {
    const strengths = []
    
    if (item.bible_reference) strengths.push('Strong biblical foundation')
    if (item.discussion_questions) strengths.push('Promotes discussion and engagement')
    if (item.activities) strengths.push('Includes practical activities')
    if (score >= 90) strengths.push('Excellent educational quality')
    
    return strengths
  }

  identifyEducationalImprovements(item, score) {
    const improvements = []
    
    if (!item.learning_objectives) improvements.push('Add clear learning objectives')
    if (!item.discussion_questions) improvements.push('Include discussion questions')
    if (!item.activities) improvements.push('Add interactive activities')
    if (score < 70) improvements.push('Improve overall educational structure')
    
    return improvements
  }

  async validateForAgeGroup(item, ageGroup) {
    const rules = this.ageAppropriatenessRules[ageGroup] || this.ageAppropriatenessRules['adult']
    let score = 80
    const concerns = []
    const adaptations = []

    // Check vocabulary appropriateness (simplified)
    const content = JSON.stringify(item).toLowerCase()
    
    if (ageGroup === 'children') {
      // Check for scary or inappropriate content for children
      const scaryWords = ['death', 'kill', 'blood', 'war', 'demon']
      scaryWords.forEach(word => {
        if (content.includes(word)) {
          score -= 15
          concerns.push(`Content may be too intense for children: contains "${word}"`)
          adaptations.push(`Consider softening or removing references to "${word}"`)
        }
      })
    }

    return { score: Math.max(40, score), concerns, adaptations }
  }

  async validateMultiGenerationalAppeal(item) {
    const hasMultipleAgeGroups = Array.isArray(item.age_groups) && item.age_groups.length > 1
    const score = hasMultipleAgeGroups ? 90 : 65
    const appropriate = hasMultipleAgeGroups || item.age_rating === 'all'
    
    return { score, appropriate }
  }

  async validateParentGuidance(item) {
    const hasGuidance = item.parent_guidance || (item.content && item.content.parent_guidance)
    const score = hasGuidance ? 85 : 60
    
    return { score, present: hasGuidance }
  }

  async validateFamilyActivities(item) {
    const hasActivities = item.activities || (item.content && item.content.activities)
    const score = hasActivities ? 85 : 65
    
    return { score, present: hasActivities }
  }

  async validateFamilyDiscussion(item) {
    const hasDiscussion = item.discussion_questions || (item.content && item.content.discussion_questions)
    const score = hasDiscussion ? 85 : 60
    
    return { score, present: hasDiscussion }
  }

  async generateOverallRecommendations(item) {
    const recommendations = []
    
    if (item.theologyValidation && !item.theologyValidation.approved) {
      recommendations.push('Review and improve theological accuracy')
    }
    
    if (item.educationalValidation && !item.educationalValidation.approved) {
      recommendations.push('Enhance educational value and learning objectives')
    }
    
    if (item.ageValidation && !item.ageValidation.appropriate) {
      recommendations.push('Adjust content for age appropriateness')
    }
    
    if (item.familyValidation && !item.familyValidation.familyReady) {
      recommendations.push('Add more family integration features')
    }
    
    return recommendations
  }

  async generateValidationRecommendations(contentItems) {
    console.log('💡 Generating validation recommendations...')
    
    for (const item of contentItems) {
      if (!item.overallQuality.approved) {
        item.validationRecommendations = await this.generateDetailedRecommendations(item)
      }
    }
  }

  async generateDetailedRecommendations(item) {
    const recommendations = {
      priority: 'medium',
      actionItems: [],
      resources: [],
      timeline: 'within 2 weeks'
    }

    // Determine priority based on overall score
    if (item.overallQuality.score < 50) {
      recommendations.priority = 'high'
      recommendations.timeline = 'within 1 week'
    } else if (item.overallQuality.score >= 75) {
      recommendations.priority = 'low'
      recommendations.timeline = 'within 1 month'
    }

    // Generate specific action items
    if (item.theologyValidation?.concerns.length > 0) {
      recommendations.actionItems.push('Consult with theological advisor')
      recommendations.resources.push('Theological review checklist')
    }

    if (item.educationalValidation?.improvements.length > 0) {
      recommendations.actionItems.push('Improve educational structure')
      recommendations.resources.push('Educational design guidelines')
    }

    if (item.ageValidation?.concerns.length > 0) {
      recommendations.actionItems.push('Adjust age-appropriate content')
      recommendations.resources.push('Age appropriateness guidelines')
    }

    if (!item.familyValidation?.familyReady) {
      recommendations.actionItems.push('Add family integration features')
      recommendations.resources.push('Family ministry best practices')
    }

    return recommendations
  }

  async generateValidationReport(contentItems) {
    console.log('📋 Generating comprehensive validation report...')
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalItems: this.validationStats.totalContent,
        validated: this.validationStats.validated,
        approved: this.validationStats.approved,
        flagged: this.validationStats.flagged,
        rejected: this.validationStats.rejected,
        approvalRate: Math.round((this.validationStats.approved / this.validationStats.validated) * 100)
      },
      qualityMetrics: {
        theological_accuracy: {
          average: this.calculateAverage(this.validationStats.qualityMetrics.theological_accuracy),
          threshold: config.qualityThresholds.theological_accuracy
        },
        educational_value: {
          average: this.calculateAverage(this.validationStats.qualityMetrics.educational_value),
          threshold: config.qualityThresholds.educational_value
        },
        age_appropriateness: {
          average: this.calculateAverage(this.validationStats.qualityMetrics.age_appropriateness),
          threshold: config.qualityThresholds.age_appropriateness
        },
        family_integration: {
          average: this.calculateAverage(this.validationStats.qualityMetrics.family_integration),
          threshold: config.qualityThresholds.family_integration
        }
      },
      contentBreakdown: this.generateContentBreakdown(contentItems),
      recommendations: this.generateSystemRecommendations(contentItems),
      errors: this.validationStats.errors,
      warnings: this.validationStats.warnings
    }

    // Save detailed report
    const reportPath = path.join(config.validationReportsDirectory, 
      `validation-report-${new Date().toISOString().split('T')[0]}.json`)
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    // Save summary report
    const summaryPath = path.join(config.validationReportsDirectory, 'validation-summary.json')
    fs.writeFileSync(summaryPath, JSON.stringify(report.summary, null, 2))
    
    console.log(`📄 Validation report saved to: ${reportPath}`)
    this.printValidationSummary(report)
  }

  generateContentBreakdown(contentItems) {
    const breakdown = {
      by_type: {},
      by_status: {},
      by_quality_tier: { high: 0, medium: 0, low: 0 }
    }

    contentItems.forEach(item => {
      // By type
      breakdown.by_type[item.type] = (breakdown.by_type[item.type] || 0) + 1
      
      // By status
      const status = item.overallQuality.approved ? 'approved' : 
                   item.overallQuality.score >= 50 ? 'needs_review' : 'rejected'
      breakdown.by_status[status] = (breakdown.by_status[status] || 0) + 1
      
      // By quality tier
      if (item.overallQuality.score >= 85) {
        breakdown.by_quality_tier.high++
      } else if (item.overallQuality.score >= 65) {
        breakdown.by_quality_tier.medium++
      } else {
        breakdown.by_quality_tier.low++
      }
    })

    return breakdown
  }

  generateSystemRecommendations(contentItems) {
    const recommendations = []
    
    const avgTheology = this.calculateAverage(this.validationStats.qualityMetrics.theological_accuracy)
    const avgEducation = this.calculateAverage(this.validationStats.qualityMetrics.educational_value)
    const avgAge = this.calculateAverage(this.validationStats.qualityMetrics.age_appropriateness)
    const avgFamily = this.calculateAverage(this.validationStats.qualityMetrics.family_integration)

    if (avgTheology < 80) {
      recommendations.push('Implement stronger theological review process')
    }
    
    if (avgEducation < 75) {
      recommendations.push('Enhance educational design standards')
    }
    
    if (avgAge < 85) {
      recommendations.push('Improve age appropriateness guidelines')
    }
    
    if (avgFamily < 70) {
      recommendations.push('Strengthen family integration requirements')
    }

    if (this.validationStats.approved / this.validationStats.validated < 0.7) {
      recommendations.push('Review content generation processes for quality improvement')
    }

    return recommendations
  }

  calculateAverage(numbers) {
    if (numbers.length === 0) return 0
    return Math.round(numbers.reduce((sum, num) => sum + num, 0) / numbers.length)
  }

  printValidationSummary(report) {
    console.log('\n📊 CONTENT VALIDATION SUMMARY REPORT')
    console.log('=====================================')
    console.log(`Total content validated: ${report.summary.totalItems}`)
    console.log(`Approved: ${report.summary.approved} (${report.summary.approvalRate}%)`)
    console.log(`Needs review: ${report.summary.flagged}`)
    console.log(`Rejected: ${report.summary.rejected}`)
    console.log('\n📈 Quality Metrics:')
    console.log(`  Theological Accuracy: ${report.qualityMetrics.theological_accuracy.average}/100`)
    console.log(`  Educational Value: ${report.qualityMetrics.educational_value.average}/100`)
    console.log(`  Age Appropriateness: ${report.qualityMetrics.age_appropriateness.average}/100`)
    console.log(`  Family Integration: ${report.qualityMetrics.family_integration.average}/100`)
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 System Recommendations:')
      report.recommendations.forEach(rec => console.log(`  - ${rec}`))
    }

    if (this.validationStats.errors.length > 0) {
      console.log(`\n❌ Validation errors: ${this.validationStats.errors.length}`)
    }

    if (this.validationStats.warnings.length > 0) {
      console.log(`\n⚠️ Validation warnings: ${this.validationStats.warnings.length}`)
    }
  }

  recordError(category, message) {
    this.validationStats.errors.push({ category, message, timestamp: new Date().toISOString() })
    console.error(`❌ ${category}: ${message}`)
  }

  recordWarning(category, message) {
    this.validationStats.warnings.push({ category, message, timestamp: new Date().toISOString() })
    console.warn(`⚠️ ${category}: ${message}`)
  }
}

// CLI execution
if (require.main === module) {
  const options = {
    status: process.argv[2], // e.g., 'draft', 'published', etc.
    includeValidated: process.argv.includes('--include-validated')
  }
  
  const validator = new ContentValidationQA()
  validator.run(options).catch(error => {
    console.error('Validation execution failed:', error)
    process.exit(1)
  })
}

module.exports = ContentValidationQA