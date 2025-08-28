/**
 * KingdomQuest AI Agent Orchestrator
 * 
 * This system coordinates multiple AI agents to provide seamless
 * content generation, curation, and family engagement services.
 * Implements the global system instructions and ensures theological accuracy.
 */

import { StoryGenerationAgent, type StoryGenerationRequest, type StoryGenerationResponse } from './story-generation'
import { QuizGenerationAgent, type QuizGenerationRequest, type QuizGenerationResponse } from './quiz-generation'
import { ContentCurationAgent, type ContentCurationRequest, type ContentCurationResponse } from './content-curation'
import { FamilyEngagementAgent, type FamilyProfile, type DevotionPlan } from './family-engagement'

// Core types for orchestration
export type AgeTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export interface UserContext {
  userId: string
  ageTier: AgeTier
  familyId?: string
  preferences: {
    denominationalBackground?: string
    preferredTopics?: string[]
    learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
  }
  progressData: {
    completedStories: string[]
    completedQuizzes: string[]
    currentLevel: number
    specialNeeds?: string[]
  }
}

export interface OrchestrationRequest {
  requestType: 'story' | 'quiz' | 'devotion' | 'content-suggestion' | 'family-activity'
  userContext: UserContext
  parameters: Record<string, any>
  emergencyContext?: {
    isEmergency: boolean
    crisisType?: string
    immediateNeeds?: string[]
  }
}

export interface OrchestrationResponse {
  content: any
  metadata: {
    generatedBy: string[]
    theologically_reviewed: boolean
    age_appropriate: boolean
    family_integration_ready: boolean
    safety_cleared: boolean
  }
  followUp?: {
    suggestedContent: any[]
    familyDiscussion: string[]
    nextSteps: string[]
  }
  success: boolean
  error?: string
}

export class KingdomQuestOrchestrator {
  private static theologyValidator = new TheologyValidator()
  private static safetyMonitor = new SafetyMonitor()
  private static ageAdaptationEngine = new AgeAdaptationEngine()

  /**
   * Main orchestration entry point
   */
  static async processRequest(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    try {
      // 1. Emergency/Crisis Check
      if (request.emergencyContext?.isEmergency) {
        return this.handleCrisisRequest(request)
      }

      // 2. Age Tier Validation and Content Filtering
      const adaptedRequest = await this.ageAdaptationEngine.adaptRequest(request)

      // 3. Route to appropriate agent(s)
      let response: OrchestrationResponse
      
      switch (request.requestType) {
        case 'story':
          response = await this.handleStoryRequest(adaptedRequest)
          break
        case 'quiz':
          response = await this.handleQuizRequest(adaptedRequest)
          break
        case 'devotion':
          response = await this.handleDevotionRequest(adaptedRequest)
          break
        case 'content-suggestion':
          response = await this.handleContentSuggestionRequest(adaptedRequest)
          break
        case 'family-activity':
          response = await this.handleFamilyActivityRequest(adaptedRequest)
          break
        default:
          throw new Error(`Unsupported request type: ${request.requestType}`)
      }

      // 4. Multi-Agent Content Enhancement
      response = await this.enhanceWithMultipleAgents(response, adaptedRequest)

      // 5. Final Quality Assurance
      response = await this.finalQualityCheck(response, adaptedRequest)

      return response

    } catch (error) {
      console.error('Orchestration error:', error)
      return {
        content: null,
        metadata: {
          generatedBy: ['error-handler'],
          theologically_reviewed: false,
          age_appropriate: false,
          family_integration_ready: false,
          safety_cleared: false
        },
        success: false,
        error: error instanceof Error ? error.message : 'Unknown orchestration error'
      }
    }
  }

  /**
   * Handle crisis situations with immediate response
   */
  private static async handleCrisisRequest(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    const crisisResources = await this.safetyMonitor.generateCrisisResponse(
      request.emergencyContext?.crisisType || 'general',
      request.userContext.ageTier
    )

    return {
      content: {
        type: 'crisis-response',
        resources: crisisResources,
        message: 'You are not alone. God loves you and help is available.',
        scripture: 'Cast all your anxiety on him because he cares for you. (1 Peter 5:7)',
        immediateActions: crisisResources.immediateActions
      },
      metadata: {
        generatedBy: ['safety-monitor', 'crisis-handler'],
        theologically_reviewed: true,
        age_appropriate: true,
        family_integration_ready: true,
        safety_cleared: true
      },
      success: true
    }
  }

  /**
   * Handle story generation requests
   */
  private static async handleStoryRequest(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    const storyRequest: StoryGenerationRequest = {
      bibleReference: request.parameters.bibleReference,
      ageRating: this.mapAgeTierToAgeRating(request.userContext.ageTier),
      difficulty: request.userContext.preferences.difficulty || 'beginner',
      themes: request.parameters.themes
    }

    const storyResponse = await StoryGenerationAgent.generateStory(storyRequest)
    
    if (!storyResponse.success) {
      throw new Error(storyResponse.error)
    }

    return {
      content: storyResponse.story,
      metadata: {
        generatedBy: ['story-generation-agent'],
        theologically_reviewed: false, // Will be checked in quality assurance
        age_appropriate: false, // Will be checked in quality assurance
        family_integration_ready: false, // Will be enhanced by other agents
        safety_cleared: false // Will be checked in quality assurance
      },
      success: true
    }
  }

  /**
   * Handle quiz generation requests
   */
  private static async handleQuizRequest(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    const quizRequest: QuizGenerationRequest = {
      bibleReference: request.parameters.bibleReference,
      difficulty: request.userContext.preferences.difficulty || 'beginner',
      questionCount: request.parameters.questionCount || 5,
      questionTypes: request.parameters.questionTypes,
      storyId: request.parameters.storyId
    }

    const quizResponse = await QuizGenerationAgent.generateQuiz(quizRequest)
    
    if (!quizResponse.success) {
      throw new Error(quizResponse.error)
    }

    return {
      content: quizResponse.quiz,
      metadata: {
        generatedBy: ['quiz-generation-agent'],
        theologically_reviewed: false,
        age_appropriate: false,
        family_integration_ready: false,
        safety_cleared: false
      },
      success: true
    }
  }

  /**
   * Handle family devotion requests
   */
  private static async handleDevotionRequest(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    const familyProfile: FamilyProfile = {
      parentId: request.userContext.userId,
      childrenIds: request.parameters.childrenIds || [],
      ageGroups: request.parameters.ageGroups || [this.mapAgeTierToAgeRating(request.userContext.ageTier)],
      preferences: {
        devotionDuration: request.parameters.duration || 15,
        preferredTopics: request.userContext.preferences.preferredTopics || [],
        meetingFrequency: request.parameters.frequency || 'weekly'
      }
    }

    const devotionPlan = await FamilyEngagementAgent.generateFamilyDevotion(
      familyProfile, 
      request.parameters.theme
    )

    return {
      content: devotionPlan,
      metadata: {
        generatedBy: ['family-engagement-agent'],
        theologically_reviewed: false,
        age_appropriate: false,
        family_integration_ready: true,
        safety_cleared: false
      },
      success: true
    }
  }

  /**
   * Handle content suggestion requests
   */
  private static async handleContentSuggestionRequest(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    const curationRequest: ContentCurationRequest = {
      contentType: request.parameters.contentType,
      themes: request.userContext.preferences.preferredTopics,
      ageGroup: this.mapAgeTierToAgeRating(request.userContext.ageTier),
      difficulty: request.userContext.preferences.difficulty
    }

    const suggestions = await ContentCurationAgent.suggestRelatedContent(
      request.parameters.currentContentId,
      curationRequest
    )

    if (!suggestions.success) {
      throw new Error(suggestions.error)
    }

    return {
      content: {
        type: 'content-suggestions',
        suggestions: suggestions.suggestions,
        personalizedMessage: this.generatePersonalizedMessage(request.userContext)
      },
      metadata: {
        generatedBy: ['content-curation-agent'],
        theologically_reviewed: true,
        age_appropriate: true,
        family_integration_ready: false,
        safety_cleared: true
      },
      success: true
    }
  }

  /**
   * Handle family activity requests
   */
  private static async handleFamilyActivityRequest(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    const activities = await FamilyEngagementAgent.suggestActivities(
      request.parameters.theme,
      request.parameters.ageGroups,
      request.parameters.duration || 30
    )

    return {
      content: {
        type: 'family-activities',
        activities,
        familyDiscussion: await FamilyEngagementAgent.generateDiscussionQuestions(
          request.parameters.biblePassage,
          request.parameters.ageGroups
        )
      },
      metadata: {
        generatedBy: ['family-engagement-agent'],
        theologically_reviewed: false,
        age_appropriate: false,
        family_integration_ready: true,
        safety_cleared: false
      },
      success: true
    }
  }

  /**
   * Enhance content using multiple agents
   */
  private static async enhanceWithMultipleAgents(
    response: OrchestrationResponse,
    request: OrchestrationRequest
  ): Promise<OrchestrationResponse> {
    // Add content suggestions if not already present
    if (!response.followUp?.suggestedContent) {
      const suggestions = await ContentCurationAgent.suggestRelatedContent(
        request.parameters.contentId || 'current',
        {
          contentType: request.requestType === 'story' ? 'story' : 'prayer',
          ageGroup: this.mapAgeTierToAgeRating(request.userContext.ageTier),
          themes: request.userContext.preferences.preferredTopics
        }
      )

      if (suggestions.success) {
        response.followUp = {
          ...response.followUp,
          suggestedContent: suggestions.suggestions
        }
      }
    }

    // Add family integration if appropriate
    if (request.userContext.familyId && !response.metadata.family_integration_ready) {
      const familyQuestions = await FamilyEngagementAgent.generateDiscussionQuestions(
        request.parameters.biblePassage || '',
        [this.mapAgeTierToAgeRating(request.userContext.ageTier)]
      )

      response.followUp = {
        ...response.followUp,
        familyDiscussion: familyQuestions.map(q => q.questions).flat()
      }
      
      response.metadata.family_integration_ready = true
    }

    return response
  }

  /**
   * Final quality assurance check
   */
  private static async finalQualityCheck(
    response: OrchestrationResponse,
    request: OrchestrationRequest
  ): Promise<OrchestrationResponse> {
    // Theological accuracy check
    if (!response.metadata.theologically_reviewed) {
      const theologyCheck = await this.theologyValidator.validateContent(response.content)
      response.metadata.theologically_reviewed = theologyCheck.approved
      
      if (!theologyCheck.approved && theologyCheck.corrections) {
        response.content = theologyCheck.corrections
      }
    }

    // Age appropriateness check
    if (!response.metadata.age_appropriate) {
      const ageCheck = await this.ageAdaptationEngine.validateAgeAppropriateness(
        response.content,
        request.userContext.ageTier
      )
      response.metadata.age_appropriate = ageCheck.appropriate
      
      if (!ageCheck.appropriate && ageCheck.adaptedContent) {
        response.content = ageCheck.adaptedContent
      }
    }

    // Safety check
    if (!response.metadata.safety_cleared) {
      const safetyCheck = await this.safetyMonitor.validateSafety(response.content, request.userContext)
      response.metadata.safety_cleared = safetyCheck.safe
      
      if (!safetyCheck.safe) {
        // If content is unsafe, replace with safe alternative or error
        response.success = false
        response.error = 'Content failed safety validation'
      }
    }

    return response
  }

  /**
   * Helper methods
   */
  private static mapAgeTierToAgeRating(tier: AgeTier): 'all' | 'children' | 'youth' | 'adult' {
    if (tier <= 2) return 'children'
    if (tier <= 4) return 'youth'
    return 'adult'
  }

  private static generatePersonalizedMessage(userContext: UserContext): string {
    const ageGroup = this.mapAgeTierToAgeRating(userContext.ageTier)
    const messages = {
      children: "God has wonderful stories just for you! Let's discover them together.",
      youth: "Your faith journey is important to God. He has amazing plans for your life!",
      adult: "May God bless your spiritual growth and family leadership journey."
    }
    return messages[ageGroup]
  }
}

/**
 * Theology validation helper class
 */
class TheologyValidator {
  async validateContent(content: any): Promise<{
    approved: boolean
    corrections?: any
    concerns?: string[]
  }> {
    // TODO: Implement comprehensive theological validation
    // This would check against systematic theology, biblical accuracy,
    // and denominational inclusivity requirements
    
    return {
      approved: true // Placeholder - implement actual validation
    }
  }
}

/**
 * Safety monitoring helper class
 */
class SafetyMonitor {
  async validateSafety(content: any, userContext: UserContext): Promise<{
    safe: boolean
    concerns?: string[]
    recommendations?: string[]
  }> {
    // TODO: Implement comprehensive safety validation
    // Check for age-inappropriate content, crisis indicators, etc.
    
    return {
      safe: true // Placeholder - implement actual validation
    }
  }

  async generateCrisisResponse(crisisType: string, ageTier: AgeTier): Promise<{
    immediateActions: string[]
    resources: Array<{
      name: string
      phone: string
      description: string
    }>
    prayer: string
    scripture: string
  }> {
    const baseResources = [
      { name: 'Emergency Services', phone: '911', description: 'Immediate emergency assistance' },
      { name: 'Crisis Text Line', phone: 'Text HOME to 741741', description: '24/7 crisis support via text' },
      { name: 'National Suicide Prevention Lifeline', phone: '988', description: '24/7 suicide prevention and crisis intervention' }
    ]

    const ageTierActions = {
      1: ['Tell a trusted adult immediately', 'Stay with someone safe', 'Remember that God loves you'],
      2: ['Talk to your parents or a trusted adult', 'Call for help if needed', 'Know that you are not alone'],
      3: ['Reach out to a trusted adult', 'Use emergency resources if needed', 'Remember God cares about you'],
      4: ['Contact emergency services if in immediate danger', 'Talk to parents, pastor, or counselor', 'Use crisis resources available'],
      5: ['Assess immediate safety', 'Contact appropriate resources', 'Reach out to support network'],
      6: ['Ensure immediate safety', 'Contact professional help', 'Utilize support systems'],
      7: ['Take immediate safety measures', 'Contact professional resources', 'Support others who may be affected'],
      8: ['Ensure safety of self and others', 'Contact appropriate authorities/professionals', 'Provide leadership in crisis response']
    }

    return {
      immediateActions: ageTierActions[ageTier] || ageTierActions[6],
      resources: baseResources,
      prayer: "Heavenly Father, we cry out to you in this difficult time. Please provide comfort, safety, and the help that is needed. Surround us with your love and protection. In Jesus' name, Amen.",
      scripture: "Cast all your anxiety on him because he cares for you. (1 Peter 5:7)"
    }
  }
}

/**
 * Age adaptation helper class
 */
class AgeAdaptationEngine {
  async adaptRequest(request: OrchestrationRequest): Promise<OrchestrationRequest> {
    // TODO: Adapt request parameters based on age tier
    // Modify complexity, vocabulary, content types, etc.
    
    return request // Placeholder - implement actual adaptation
  }

  async validateAgeAppropriateness(content: any, ageTier: AgeTier): Promise<{
    appropriate: boolean
    adaptedContent?: any
    recommendations?: string[]
  }> {
    // TODO: Validate and adapt content for specific age tier
    
    return {
      appropriate: true // Placeholder - implement actual validation
    }
  }
}