#!/usr/bin/env node
/**
 * Database Seeding Utilities
 * 
 * Comprehensive database seeding script for populating KingdomQuest with
 * initial content, test data, and production-ready biblical resources.
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Configuration
const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  seedDataDirectory: path.join(__dirname, '../content/seed-data'),
  batchSize: 100,
  retryAttempts: 3,
  environments: {
    development: {
      createTestUsers: true,
      includeTestData: true,
      sampleContentSize: 'full'
    },
    staging: {
      createTestUsers: true,
      includeTestData: true,
      sampleContentSize: 'limited'
    },
    production: {
      createTestUsers: false,
      includeTestData: false,
      sampleContentSize: 'essential'
    }
  }
}

class DatabaseSeeder {
  constructor(environment = 'development') {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey)
    this.environment = environment
    this.envConfig = config.environments[environment]
    this.seedingStats = {
      users: 0,
      stories: 0,
      quizzes: 0,
      questions: 0,
      familyAltars: 0,
      prayers: 0,
      bibleData: 0,
      errors: [],
      warnings: []
    }
    this.bibleStructure = this.loadBibleStructure()
  }

  /**
   * Main seeding execution
   */
  async run() {
    console.log(`🌱 Starting KingdomQuest Database Seeding for ${this.environment} environment...`)
    
    try {
      // 1. Validate environment and database
      await this.validateEnvironment()
      
      // 2. Clear existing data if needed
      if (this.environment === 'development') {
        await this.clearExistingData()
      }
      
      // 3. Seed core reference data
      await this.seedCoreReferenceData()
      
      // 4. Seed biblical content
      await this.seedBiblicalContent()
      
      // 5. Seed user accounts and profiles
      if (this.envConfig.createTestUsers) {
        await this.seedUserAccounts()
      }
      
      // 6. Seed educational content
      await this.seedEducationalContent()
      
      // 7. Seed family altar content
      await this.seedFamilyAltarContent()
      
      // 8. Seed interactive content
      await this.seedInteractiveContent()
      
      // 9. Create sample user data and progress
      if (this.envConfig.includeTestData) {
        await this.seedUserProgressData()
      }
      
      // 10. Verify data integrity
      await this.verifyDataIntegrity()
      
      // 11. Generate summary report
      this.generateSeedingReport()
      
      console.log('✅ Database seeding completed successfully!')
      
    } catch (error) {
      console.error('❌ Database seeding failed:', error.message)
      this.recordError('seeding_failure', error.message)
      process.exit(1)
    }
  }

  /**
   * Validate environment and database connection
   */
  async validateEnvironment() {
    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new Error('Missing required environment variables')
    }

    // Test database connection and permissions
    const { error } = await this.supabase.from('profiles').select('id').limit(1)
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database connection failed: ${error.message}`)
    }

    // Ensure seed data directory exists
    fs.mkdirSync(config.seedDataDirectory, { recursive: true })

    console.log(`✅ Environment validated for ${this.environment}`)
  }

  /**
   * Clear existing data for development environment
   */
  async clearExistingData() {
    console.log('🧹 Clearing existing development data...')
    
    const tablesToClear = [
      'quiz_attempts',
      'quiz_options',
      'quiz_questions', 
      'quizzes',
      'scenes',
      'stories',
      'family_altars',
      'prayers',
      'user_progress',
      'profiles'
    ]

    for (const table of tablesToClear) {
      try {
        const { error } = await this.supabase.from(table).delete().neq('id', 'keep-all')
        if (error) {
          console.warn(`Warning: Could not clear ${table}:`, error.message)
        } else {
          console.log(`✅ Cleared ${table}`)
        }
      } catch (error) {
        this.recordWarning('clear_data', `Could not clear ${table}: ${error.message}`)
      }
    }
  }

  /**
   * Seed core reference data
   */
  async seedCoreReferenceData() {
    console.log('📚 Seeding core reference data...')
    
    // Seed age groups
    await this.seedAgeGroups()
    
    // Seed difficulty levels
    await this.seedDifficultyLevels()
    
    // Seed content categories
    await this.seedContentCategories()
    
    // Seed biblical themes
    await this.seedBiblicalThemes()
  }

  /**
   * Seed biblical content and references
   */
  async seedBiblicalContent() {
    console.log('📖 Seeding biblical content...')
    
    // Seed Bible books and structure
    await this.seedBibleBooks()
    
    // Seed key Bible passages
    await this.seedKeyBiblePassages()
    
    // Seed Bible characters
    await this.seedBibleCharacters()
    
    // Seed biblical locations
    await this.seedBiblicalLocations()
  }

  /**
   * Seed user accounts for testing
   */
  async seedUserAccounts() {
    console.log('👥 Seeding test user accounts...')
    
    const testUsers = this.createTestUsers()
    
    for (const user of testUsers) {
      try {
        // Create user profile
        const { data: profile, error: profileError } = await this.supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.fullName,
            age_group: user.ageGroup,
            role: user.role,
            preferences: user.preferences,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (profileError) throw profileError

        this.seedingStats.users++
        console.log(`✅ Created user: ${user.fullName}`)

        // Create family relationships if applicable
        if (user.familyRole && user.familyMembers) {
          await this.createFamilyRelationships(profile.id, user.familyMembers)
        }

      } catch (error) {
        this.recordError('user_creation', `Failed to create user ${user.fullName}: ${error.message}`)
      }
    }
  }

  /**
   * Seed educational content (stories, quizzes)
   */
  async seedEducationalContent() {
    console.log('🎓 Seeding educational content...')
    
    // Seed biblical stories
    await this.seedBiblicalStories()
    
    // Seed quizzes
    await this.seedQuizzes()
  }

  /**
   * Seed family altar and devotional content
   */
  async seedFamilyAltarContent() {
    console.log('🏛️ Seeding family altar content...')
    
    const devotions = this.createFamilyDevotions()
    
    for (const devotion of devotions) {
      try {
        const { data: altarData, error: altarError } = await this.supabase
          .from('family_altars')
          .insert({
            title: devotion.title,
            description: devotion.description,
            bible_reference: devotion.bibleReference,
            duration_minutes: devotion.duration,
            age_groups: devotion.ageGroups,
            themes: devotion.themes,
            content: devotion.content,
            discussion_questions: devotion.discussionQuestions,
            activities: devotion.activities,
            prayer_suggestions: devotion.prayerSuggestions,
            status: 'published',
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (altarError) throw altarError

        this.seedingStats.familyAltars++
        console.log(`✅ Seeded devotion: ${devotion.title}`)

      } catch (error) {
        this.recordError('devotion_seeding', `Failed to seed devotion ${devotion.title}: ${error.message}`)
      }
    }
  }

  /**
   * Seed interactive content and activities
   */
  async seedInteractiveContent() {
    console.log('🎯 Seeding interactive content...')
    
    // Seed prayers
    await this.seedPrayerContent()
    
    // Seed activities
    await this.seedActivityContent()
    
    // Seed media resources
    await this.seedMediaResources()
  }

  /**
   * Seed user progress and engagement data
   */
  async seedUserProgressData() {
    console.log('📊 Seeding user progress data...')
    
    // Get test users
    const { data: users, error: usersError } = await this.supabase
      .from('profiles')
      .select('id, full_name, age_group')

    if (usersError || !users) {
      console.warn('Could not fetch users for progress seeding')
      return
    }

    // Create sample progress data
    for (const user of users) {
      await this.createUserProgressData(user)
    }
  }

  /**
   * Verify data integrity after seeding
   */
  async verifyDataIntegrity() {
    console.log('🔍 Verifying data integrity...')
    
    const verificationChecks = [
      { table: 'profiles', expectedMin: this.envConfig.createTestUsers ? 1 : 0 },
      { table: 'stories', expectedMin: 5 },
      { table: 'quizzes', expectedMin: 3 },
      { table: 'family_altars', expectedMin: 3 },
      { table: 'prayers', expectedMin: 5 }
    ]

    for (const check of verificationChecks) {
      try {
        const { data, error, count } = await this.supabase
          .from(check.table)
          .select('id', { count: 'exact' })

        if (error) throw error

        if (count < check.expectedMin) {
          this.recordWarning('data_integrity', 
            `${check.table} has ${count} records, expected at least ${check.expectedMin}`)
        } else {
          console.log(`✅ ${check.table}: ${count} records`)
        }

      } catch (error) {
        this.recordError('verification', `Could not verify ${check.table}: ${error.message}`)
      }
    }
  }

  // Seeding implementation methods

  async seedAgeGroups() {
    const ageGroups = [
      { name: 'Early Childhood', key: 'early_childhood', min_age: 2, max_age: 5 },
      { name: 'Children', key: 'children', min_age: 6, max_age: 10 },
      { name: 'Preteens', key: 'preteens', min_age: 11, max_age: 13 },
      { name: 'Teens', key: 'teens', min_age: 14, max_age: 18 },
      { name: 'Adults', key: 'adults', min_age: 19, max_age: 999 }
    ]

    for (const group of ageGroups) {
      const { error } = await this.supabase
        .from('age_groups')
        .upsert(group, { onConflict: 'key' })

      if (error) {
        this.recordError('age_groups', `Failed to seed age group ${group.name}: ${error.message}`)
      }
    }
  }

  async seedBiblicalThemes() {
    const themes = [
      {
        name: 'Faith and Trust',
        key: 'faith_and_trust',
        description: 'Learning to trust God in all circumstances',
        color: '#3B82F6'
      },
      {
        name: 'Love and Compassion',
        key: 'love_and_compassion', 
        description: 'Understanding and expressing God\'s love',
        color: '#EF4444'
      },
      {
        name: 'Courage and Strength',
        key: 'courage_and_strength',
        description: 'Finding courage and strength in God',
        color: '#F59E0B'
      },
      {
        name: 'Forgiveness and Grace',
        key: 'forgiveness_and_grace',
        description: 'Experiencing and extending forgiveness',
        color: '#10B981'
      },
      {
        name: 'Wisdom and Understanding',
        key: 'wisdom_and_understanding',
        description: 'Growing in godly wisdom and discernment',
        color: '#8B5CF6'
      }
    ]

    for (const theme of themes) {
      const { error } = await this.supabase
        .from('biblical_themes')
        .upsert(theme, { onConflict: 'key' })

      if (error) {
        this.recordError('themes', `Failed to seed theme ${theme.name}: ${error.message}`)
      }
    }
  }

  async seedBibleBooks() {
    const books = Object.entries(this.bibleStructure).map(([name, info], index) => ({
      name,
      testament: info.testament,
      chapter_count: info.chapters,
      book_order: index + 1,
      abbreviation: info.abbreviation
    }))

    for (const book of books) {
      const { error } = await this.supabase
        .from('bible_books')
        .upsert(book, { onConflict: 'name' })

      if (error) {
        this.recordError('bible_books', `Failed to seed book ${book.name}: ${error.message}`)
      } else {
        this.seedingStats.bibleData++
      }
    }
  }

  async seedBiblicalStories() {
    const stories = this.createBiblicalStories()
    
    for (const story of stories) {
      try {
        // Insert main story
        const { data: storyData, error: storyError } = await this.supabase
          .from('stories')
          .insert({
            title: story.title,
            description: story.description,
            bible_reference: story.bibleReference,
            age_rating: story.ageRating,
            difficulty: story.difficulty,
            themes: story.themes,
            status: 'published',
            created_at: new Date().toISOString(),
            metadata: story.metadata
          })
          .select()
          .single()

        if (storyError) throw storyError

        // Insert story scenes
        if (story.scenes) {
          for (let i = 0; i < story.scenes.length; i++) {
            const scene = story.scenes[i]
            const { error: sceneError } = await this.supabase
              .from('scenes')
              .insert({
                story_id: storyData.id,
                title: scene.title,
                content: scene.content,
                scene_order: i + 1,
                interactions: scene.interactions || [],
                media_urls: scene.mediaUrls || []
              })

            if (sceneError) throw sceneError
          }
        }

        this.seedingStats.stories++
        console.log(`✅ Seeded story: ${story.title}`)

      } catch (error) {
        this.recordError('story_seeding', `Failed to seed story ${story.title}: ${error.message}`)
      }
    }
  }

  async seedQuizzes() {
    const quizzes = this.createQuizzes()
    
    for (const quiz of quizzes) {
      try {
        // Insert main quiz
        const { data: quizData, error: quizError } = await this.supabase
          .from('quizzes')
          .insert({
            title: quiz.title,
            description: quiz.description,
            bible_reference: quiz.bibleReference,
            difficulty: quiz.difficulty,
            time_limit: quiz.timeLimit,
            passing_score: quiz.passingScore,
            status: 'published',
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (quizError) throw quizError

        // Insert questions
        for (let i = 0; i < quiz.questions.length; i++) {
          const question = quiz.questions[i]
          const { data: questionData, error: questionError } = await this.supabase
            .from('quiz_questions')
            .insert({
              quiz_id: quizData.id,
              question_text: question.text,
              question_type: question.type,
              question_order: i + 1,
              points: question.points,
              bible_reference: question.bibleReference,
              explanation: question.explanation
            })
            .select()
            .single()

          if (questionError) throw questionError

          // Insert options
          if (question.options) {
            const optionsToInsert = question.options.map((option, oIndex) => ({
              question_id: questionData.id,
              option_text: option.text,
              is_correct: option.isCorrect,
              option_order: oIndex + 1,
              explanation: option.explanation
            }))

            const { error: optionsError } = await this.supabase
              .from('quiz_options')
              .insert(optionsToInsert)

            if (optionsError) throw optionsError
          }

          this.seedingStats.questions++
        }

        this.seedingStats.quizzes++
        console.log(`✅ Seeded quiz: ${quiz.title}`)

      } catch (error) {
        this.recordError('quiz_seeding', `Failed to seed quiz ${quiz.title}: ${error.message}`)
      }
    }
  }

  async seedPrayerContent() {
    const prayers = this.createPrayerContent()
    
    for (const prayer of prayers) {
      try {
        const { error } = await this.supabase
          .from('prayers')
          .insert({
            title: prayer.title,
            content: prayer.content,
            category: prayer.category,
            age_groups: prayer.ageGroups,
            occasion: prayer.occasion,
            bible_reference: prayer.bibleReference,
            status: 'published',
            created_at: new Date().toISOString()
          })

        if (error) throw error

        this.seedingStats.prayers++
        console.log(`✅ Seeded prayer: ${prayer.title}`)

      } catch (error) {
        this.recordError('prayer_seeding', `Failed to seed prayer ${prayer.title}: ${error.message}`)
      }
    }
  }

  // Data creation methods

  loadBibleStructure() {
    return {
      'Genesis': { testament: 'Old', chapters: 50, abbreviation: 'Gen' },
      'Exodus': { testament: 'Old', chapters: 40, abbreviation: 'Exod' },
      'Leviticus': { testament: 'Old', chapters: 27, abbreviation: 'Lev' },
      'Numbers': { testament: 'Old', chapters: 36, abbreviation: 'Num' },
      'Deuteronomy': { testament: 'Old', chapters: 34, abbreviation: 'Deut' },
      'Joshua': { testament: 'Old', chapters: 24, abbreviation: 'Josh' },
      'Judges': { testament: 'Old', chapters: 21, abbreviation: 'Judg' },
      'Ruth': { testament: 'Old', chapters: 4, abbreviation: 'Ruth' },
      '1 Samuel': { testament: 'Old', chapters: 31, abbreviation: '1 Sam' },
      '2 Samuel': { testament: 'Old', chapters: 24, abbreviation: '2 Sam' },
      '1 Kings': { testament: 'Old', chapters: 22, abbreviation: '1 Kgs' },
      '2 Kings': { testament: 'Old', chapters: 25, abbreviation: '2 Kgs' },
      'Psalm': { testament: 'Old', chapters: 150, abbreviation: 'Ps' },
      'Proverbs': { testament: 'Old', chapters: 31, abbreviation: 'Prov' },
      'Isaiah': { testament: 'Old', chapters: 66, abbreviation: 'Isa' },
      'Jeremiah': { testament: 'Old', chapters: 52, abbreviation: 'Jer' },
      'Daniel': { testament: 'Old', chapters: 12, abbreviation: 'Dan' },
      'Matthew': { testament: 'New', chapters: 28, abbreviation: 'Matt' },
      'Mark': { testament: 'New', chapters: 16, abbreviation: 'Mark' },
      'Luke': { testament: 'New', chapters: 24, abbreviation: 'Luke' },
      'John': { testament: 'New', chapters: 21, abbreviation: 'John' },
      'Acts': { testament: 'New', chapters: 28, abbreviation: 'Acts' },
      'Romans': { testament: 'New', chapters: 16, abbreviation: 'Rom' },
      '1 Corinthians': { testament: 'New', chapters: 16, abbreviation: '1 Cor' },
      '2 Corinthians': { testament: 'New', chapters: 13, abbreviation: '2 Cor' },
      'Galatians': { testament: 'New', chapters: 6, abbreviation: 'Gal' },
      'Ephesians': { testament: 'New', chapters: 6, abbreviation: 'Eph' },
      'Philippians': { testament: 'New', chapters: 4, abbreviation: 'Phil' },
      'Colossians': { testament: 'New', chapters: 4, abbreviation: 'Col' },
      '1 Thessalonians': { testament: 'New', chapters: 5, abbreviation: '1 Thess' },
      '2 Thessalonians': { testament: 'New', chapters: 3, abbreviation: '2 Thess' },
      '1 Timothy': { testament: 'New', chapters: 6, abbreviation: '1 Tim' },
      '2 Timothy': { testament: 'New', chapters: 4, abbreviation: '2 Tim' },
      'Titus': { testament: 'New', chapters: 3, abbreviation: 'Titus' },
      'Hebrews': { testament: 'New', chapters: 13, abbreviation: 'Heb' },
      'James': { testament: 'New', chapters: 5, abbreviation: 'Jas' },
      '1 Peter': { testament: 'New', chapters: 5, abbreviation: '1 Pet' },
      '2 Peter': { testament: 'New', chapters: 3, abbreviation: '2 Pet' },
      '1 John': { testament: 'New', chapters: 5, abbreviation: '1 John' },
      '2 John': { testament: 'New', chapters: 1, abbreviation: '2 John' },
      '3 John': { testament: 'New', chapters: 1, abbreviation: '3 John' },
      'Jude': { testament: 'New', chapters: 1, abbreviation: 'Jude' },
      'Revelation': { testament: 'New', chapters: 22, abbreviation: 'Rev' }
    }
  }

  createTestUsers() {
    return [
      {
        id: 'test-parent-1',
        email: 'parent1@example.com',
        fullName: 'Sarah Johnson',
        ageGroup: 'adults',
        role: 'parent',
        familyRole: 'primary_parent',
        preferences: {
          denominationalBackground: 'evangelical',
          preferredTopics: ['family_ministry', 'children_faith'],
          contentDifficulty: 'intermediate'
        },
        familyMembers: ['test-child-1', 'test-child-2']
      },
      {
        id: 'test-child-1', 
        email: 'child1@example.com',
        fullName: 'Emma Johnson',
        ageGroup: 'children',
        role: 'child',
        familyRole: 'child',
        preferences: {
          preferredTopics: ['bible_stories', 'jesus_stories'],
          contentDifficulty: 'beginner'
        }
      },
      {
        id: 'test-child-2',
        email: 'child2@example.com', 
        fullName: 'Luke Johnson',
        ageGroup: 'preteens',
        role: 'child',
        familyRole: 'child',
        preferences: {
          preferredTopics: ['courage', 'identity'],
          contentDifficulty: 'intermediate'
        }
      },
      {
        id: 'test-youth-1',
        email: 'youth1@example.com',
        fullName: 'Jordan Smith',
        ageGroup: 'teens',
        role: 'youth',
        preferences: {
          preferredTopics: ['purpose', 'relationships', 'faith_challenges'],
          contentDifficulty: 'intermediate'
        }
      }
    ]
  }

  createBiblicalStories() {
    return [
      {
        title: 'David and Goliath',
        description: 'A young shepherd\'s faith defeats a giant warrior',
        bibleReference: { book: '1 Samuel', chapter: 17, verses: '1-50' },
        ageRating: 'children',
        difficulty: 'beginner',
        themes: ['courage_and_strength', 'faith_and_trust'],
        metadata: { estimatedTime: 15, interactiveElements: true },
        scenes: [
          {
            title: 'The Challenge',
            content: 'Goliath challenges the army of Israel, but everyone is afraid.',
            interactions: [
              {
                type: 'reflection',
                prompt: 'How would you feel if you saw a giant like Goliath?'
              }
            ]
          },
          {
            title: 'David\'s Courage',
            content: 'Young David volunteers to fight Goliath with God\'s help.',
            interactions: [
              {
                type: 'choice',
                prompt: 'Why was David brave when everyone else was scared?',
                options: [
                  { text: 'He trusted God', consequence: 'Exactly! David knew God was with him.' },
                  { text: 'He was bigger than Goliath', consequence: 'Actually, David was much smaller, but he trusted God.' }
                ]
              }
            ]
          },
          {
            title: 'Victory Through Faith',
            content: 'With God\'s help, David defeats the giant with just a stone.',
            interactions: [
              {
                type: 'prayer',
                prompt: 'Let\'s thank God for giving us courage like David had.'
              }
            ]
          }
        ]
      },
      {
        title: 'The Good Samaritan',
        description: 'Jesus teaches about loving our neighbors through a powerful story',
        bibleReference: { book: 'Luke', chapter: 10, verses: '25-37' },
        ageRating: 'all',
        difficulty: 'intermediate',
        themes: ['love_and_compassion'],
        metadata: { estimatedTime: 20, interactiveElements: true },
        scenes: [
          {
            title: 'The Question',
            content: 'A man asks Jesus "Who is my neighbor?"',
            interactions: [
              {
                type: 'reflection', 
                prompt: 'Who do you think your neighbors are?'
              }
            ]
          },
          {
            title: 'The Attack',
            content: 'A traveler is attacked by robbers and left hurt on the road.',
            interactions: [
              {
                type: 'reflection',
                prompt: 'What would you do if you saw someone who needed help?'
              }
            ]
          },
          {
            title: 'Unexpected Kindness',
            content: 'A Samaritan helps the injured man, showing true neighborly love.',
            interactions: [
              {
                type: 'application',
                prompt: 'How can you be a good neighbor this week?'
              }
            ]
          }
        ]
      },
      {
        title: 'Daniel in the Lion\'s Den',
        description: 'Daniel\'s faith protects him from hungry lions',
        bibleReference: { book: 'Daniel', chapter: 6, verses: '1-23' },
        ageRating: 'children',
        difficulty: 'intermediate',
        themes: ['faith_and_trust', 'courage_and_strength'],
        metadata: { estimatedTime: 18, interactiveElements: true },
        scenes: [
          {
            title: 'The Trap',
            content: 'Jealous officials trick the king into making a law against prayer.',
            interactions: [
              {
                type: 'reflection',
                prompt: 'Why do you think Daniel kept praying even when it was dangerous?'
              }
            ]
          },
          {
            title: 'Faithful Prayer',
            content: 'Daniel continues to pray to God despite the dangerous law.',
            interactions: [
              {
                type: 'choice',
                prompt: 'What should Daniel do?',
                options: [
                  { text: 'Stop praying to stay safe', consequence: 'Daniel chose to keep trusting God no matter what.' },
                  { text: 'Keep praying to God', consequence: 'Yes! Daniel\'s faith was more important than his safety.' }
                ]
              }
            ]
          },
          {
            title: 'God\'s Protection',
            content: 'God sends an angel to protect Daniel from the lions.',
            interactions: [
              {
                type: 'prayer',
                prompt: 'Thank God for protecting those who trust in Him, just like Daniel.'
              }
            ]
          }
        ]
      }
    ]
  }

  createQuizzes() {
    return [
      {
        title: 'David and Goliath Quiz',
        description: 'Test your knowledge of David\'s victory over the giant',
        bibleReference: { book: '1 Samuel', chapter: 17, verses: '1-50' },
        difficulty: 'beginner',
        timeLimit: 10,
        passingScore: 70,
        questions: [
          {
            text: 'What was Goliath?',
            type: 'multiple-choice',
            points: 2,
            bibleReference: { book: '1 Samuel', chapter: 17, verses: '4' },
            explanation: 'Goliath was a giant Philistine warrior who challenged Israel.',
            options: [
              { text: 'A giant warrior', isCorrect: true, explanation: 'Correct! Goliath was over 9 feet tall.' },
              { text: 'A king', isCorrect: false, explanation: 'No, he was a warrior, not a king.' },
              { text: 'A shepherd', isCorrect: false, explanation: 'No, David was the shepherd.' }
            ]
          },
          {
            text: 'What did David use to defeat Goliath?',
            type: 'multiple-choice',
            points: 2,
            bibleReference: { book: '1 Samuel', chapter: 17, verses: '40' },
            explanation: 'David chose simple weapons and trusted in God\'s power.',
            options: [
              { text: 'A sword', isCorrect: false, explanation: 'David refused the king\'s sword and armor.' },
              { text: 'A sling and stone', isCorrect: true, explanation: 'Yes! David used his shepherd\'s sling and a smooth stone.' },
              { text: 'A spear', isCorrect: false, explanation: 'Goliath had the spear, not David.' }
            ]
          },
          {
            text: 'David was brave because he trusted God.',
            type: 'true-false',
            points: 1,
            bibleReference: { book: '1 Samuel', chapter: 17, verses: '45' },
            explanation: 'David declared that he came in the name of the Lord.',
            options: [
              { text: 'True', isCorrect: true, explanation: 'Correct! David\'s courage came from his faith in God.' },
              { text: 'False', isCorrect: false, explanation: 'David specifically said he came in the name of the Lord.' }
            ]
          }
        ]
      },
      {
        title: 'Good Samaritan Comprehension',
        description: 'Understanding Jesus\' teaching about loving neighbors',
        bibleReference: { book: 'Luke', chapter: 10, verses: '25-37' },
        difficulty: 'intermediate',
        timeLimit: 15,
        passingScore: 75,
        questions: [
          {
            text: 'Who asked Jesus "Who is my neighbor?"',
            type: 'multiple-choice',
            points: 2,
            bibleReference: { book: 'Luke', chapter: 10, verses: '25' },
            explanation: 'A lawyer (expert in the law) asked this question to test Jesus.',
            options: [
              { text: 'A lawyer', isCorrect: true, explanation: 'Correct! An expert in the law asked this question.' },
              { text: 'A priest', isCorrect: false, explanation: 'The priest was in the story, but didn\'t ask the question.' },
              { text: 'A Samaritan', isCorrect: false, explanation: 'The Samaritan was the hero of the story.' }
            ]
          },
          {
            text: 'The Samaritan helped because he felt ________ for the injured man.',
            type: 'fill-in-blank',
            points: 2,
            bibleReference: { book: 'Luke', chapter: 10, verses: '33' },
            explanation: 'The Samaritan was moved with compassion.',
            correctAnswers: ['compassion', 'pity', 'mercy']
          }
        ]
      }
    ]
  }

  createFamilyDevotions() {
    return [
      {
        title: 'Family Faith and Trust',
        description: 'A week-long exploration of trusting God as a family',
        bibleReference: { book: 'Proverbs', chapter: 3, verses: '5-6' },
        duration: 20,
        ageGroups: ['children', 'youth', 'adult'],
        themes: ['faith_and_trust'],
        content: {
          opening: 'Let\'s learn together about trusting God with all our hearts.',
          bibleStudy: 'Proverbs 3:5-6 teaches us to trust in the Lord with all our heart.',
          keyTruth: 'God wants us to trust Him completely, not just our own understanding.'
        },
        discussionQuestions: [
          'What does it mean to trust God with all your heart?',
          'When is it hard to trust God?',
          'How can our family trust God more this week?'
        ],
        activities: [
          {
            title: 'Trust Walk',
            description: 'Take turns guiding each other with eyes closed',
            materials: ['blindfold or closed eyes']
          }
        ],
        prayerSuggestions: [
          'Thank You God for being trustworthy',
          'Help us trust You when things are hard',
          'Show us how to trust You more each day'
        ]
      },
      {
        title: 'God\'s Love for Our Family',
        description: 'Discovering the depth of God\'s love together',
        bibleReference: { book: '1 John', chapter: 4, verses: '7-8' },
        duration: 25,
        ageGroups: ['children', 'youth', 'adult'],
        themes: ['love_and_compassion'],
        content: {
          opening: 'God\'s love is bigger than we can imagine!',
          bibleStudy: '1 John 4:7-8 tells us that God is love.',
          keyTruth: 'Because God is love, we can love others.'
        },
        discussionQuestions: [
          'How do we know that God loves us?',
          'How can we show God\'s love to our family?',
          'What are some ways we can love others like God loves us?'
        ],
        activities: [
          {
            title: 'Love Notes',
            description: 'Write encouraging notes to family members',
            materials: ['paper', 'pens', 'stickers']
          }
        ],
        prayerSuggestions: [
          'Thank You for Your amazing love',
          'Help us love each other better',
          'Show us how to share Your love with others'
        ]
      }
    ]
  }

  createPrayerContent() {
    return [
      {
        title: 'Morning Family Prayer',
        content: 'Dear God, as we start this new day together, help us to love You and love each other. Guide our words and actions. Keep us safe and help us to be a blessing to others. In Jesus\' name, Amen.',
        category: 'daily_prayers',
        ageGroups: ['children', 'youth', 'adult'],
        occasion: 'morning',
        bibleReference: { book: 'Psalm', chapter: 143, verses: '8' }
      },
      {
        title: 'Bedtime Prayer for Children',
        content: 'Dear Jesus, thank You for today. Thank You for my family and all the good things You gave us. Please watch over me tonight and help me have good dreams. Help me to love You more tomorrow. Amen.',
        category: 'bedtime_prayers',
        ageGroups: ['children'],
        occasion: 'bedtime',
        bibleReference: { book: 'Psalm', chapter: 4, verses: '8' }
      },
      {
        title: 'Thanksgiving Prayer',
        content: 'Heavenly Father, we thank You for all Your blessings. Thank You for our food, our home, our family, and Your love. Help us always remember to be grateful and to share with others. In Jesus\' name, Amen.',
        category: 'meal_prayers',
        ageGroups: ['children', 'youth', 'adult'],
        occasion: 'mealtime',
        bibleReference: { book: '1 Thessalonians', chapter: 5, verses: '18' }
      },
      {
        title: 'Prayer for Courage',
        content: 'Lord God, sometimes we face scary or difficult situations. Help us remember that You are always with us. Give us courage like You gave David when he faced Goliath. Help us trust You no matter what. Amen.',
        category: 'situational_prayers',
        ageGroups: ['children', 'youth', 'adult'],
        occasion: 'challenging_times',
        bibleReference: { book: 'Joshua', chapter: 1, verses: '9' }
      },
      {
        title: 'Prayer for Wisdom',
        content: 'Dear God, You promise to give wisdom to those who ask. Please give our family wisdom to make good choices, to treat others with kindness, and to follow Your ways. Help us grow in understanding of Your Word. Amen.',
        category: 'growth_prayers',
        ageGroups: ['youth', 'adult'],
        occasion: 'learning_times',
        bibleReference: { book: 'James', chapter: 1, verses: '5' }
      }
    ]
  }

  // Utility methods

  async createFamilyRelationships(parentId, childrenIds) {
    // Implementation for creating family relationship records
    console.log(`Creating family relationships for ${parentId} with children: ${childrenIds.join(', ')}`)
  }

  async createUserProgressData(user) {
    // Create sample progress data for user
    const sampleProgress = {
      user_id: user.id,
      stories_completed: Math.floor(Math.random() * 5),
      quizzes_completed: Math.floor(Math.random() * 3),
      total_points: Math.floor(Math.random() * 100),
      current_level: 1,
      badges_earned: ['first_story', 'quiz_master'],
      last_activity: new Date().toISOString()
    }

    const { error } = await this.supabase
      .from('user_progress')
      .insert(sampleProgress)

    if (error) {
      this.recordError('progress_seeding', `Failed to create progress for ${user.full_name}: ${error.message}`)
    }
  }

  async seedDifficultyLevels() {
    const difficulties = [
      { level: 'beginner', name: 'Beginner', description: 'Simple concepts and vocabulary' },
      { level: 'intermediate', name: 'Intermediate', description: 'Moderate complexity and depth' },
      { level: 'advanced', name: 'Advanced', description: 'Complex theological concepts' }
    ]

    for (const difficulty of difficulties) {
      const { error } = await this.supabase
        .from('difficulty_levels')
        .upsert(difficulty, { onConflict: 'level' })

      if (error) {
        this.recordError('difficulties', `Failed to seed difficulty ${difficulty.name}: ${error.message}`)
      }
    }
  }

  async seedContentCategories() {
    const categories = [
      { name: 'Bible Stories', key: 'bible_stories' },
      { name: 'Quizzes', key: 'quizzes' },
      { name: 'Family Devotions', key: 'family_devotions' },
      { name: 'Prayers', key: 'prayers' },
      { name: 'Activities', key: 'activities' }
    ]

    for (const category of categories) {
      const { error } = await this.supabase
        .from('content_categories')
        .upsert(category, { onConflict: 'key' })

      if (error) {
        this.recordError('categories', `Failed to seed category ${category.name}: ${error.message}`)
      }
    }
  }

  async seedKeyBiblePassages() {
    // Implementation for seeding important Bible passages
  }

  async seedBibleCharacters() {
    // Implementation for seeding Bible character data
  }

  async seedBiblicalLocations() {
    // Implementation for seeding biblical location data
  }

  async seedActivityContent() {
    // Implementation for seeding activity content
  }

  async seedMediaResources() {
    // Implementation for seeding media resource references
  }

  recordError(category, message) {
    this.seedingStats.errors.push({ category, message, timestamp: new Date().toISOString() })
    console.error(`❌ ${category}: ${message}`)
  }

  recordWarning(category, message) {
    this.seedingStats.warnings.push({ category, message, timestamp: new Date().toISOString() })
    console.warn(`⚠️ ${category}: ${message}`)
  }

  generateSeedingReport() {
    console.log('\n📊 DATABASE SEEDING SUMMARY REPORT')
    console.log('===================================')
    console.log(`Environment: ${this.environment}`)
    console.log(`Users created: ${this.seedingStats.users}`)
    console.log(`Stories seeded: ${this.seedingStats.stories}`)
    console.log(`Quizzes seeded: ${this.seedingStats.quizzes}`)
    console.log(`Questions seeded: ${this.seedingStats.questions}`)
    console.log(`Family altars seeded: ${this.seedingStats.familyAltars}`)
    console.log(`Prayers seeded: ${this.seedingStats.prayers}`)
    console.log(`Bible data entries: ${this.seedingStats.bibleData}`)
    console.log(`Errors: ${this.seedingStats.errors.length}`)
    console.log(`Warnings: ${this.seedingStats.warnings.length}`)
    
    if (this.seedingStats.errors.length > 0) {
      console.log('\n❌ Seeding Errors:')
      this.seedingStats.errors.forEach(error => {
        console.log(`  - ${error.category}: ${error.message}`)
      })
    }
    
    if (this.seedingStats.warnings.length > 0) {
      console.log('\n⚠️ Seeding Warnings:')
      this.seedingStats.warnings.forEach(warning => {
        console.log(`  - ${warning.category}: ${warning.message}`)
      })
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      stats: this.seedingStats,
      summary: `Seeded ${this.seedingStats.stories} stories, ${this.seedingStats.quizzes} quizzes, ${this.seedingStats.familyAltars} devotions`
    }
    
    const reportPath = path.join(__dirname, '../logs/database-seeding-report.json')
    fs.mkdirSync(path.dirname(reportPath), { recursive: true })
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`)
  }
}

// CLI execution
if (require.main === module) {
  const environment = process.argv[2] || 'development'
  
  if (!['development', 'staging', 'production'].includes(environment)) {
    console.error('Invalid environment. Use: development, staging, or production')
    process.exit(1)
  }
  
  const seeder = new DatabaseSeeder(environment)
  seeder.run().catch(error => {
    console.error('Seeding execution failed:', error)
    process.exit(1)
  })
}

module.exports = DatabaseSeeder