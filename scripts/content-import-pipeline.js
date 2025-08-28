#!/usr/bin/env node
/**
 * Content Import Pipeline
 * 
 * Automated script for importing biblical stories, passages, and related content
 * into the KingdomQuest database with proper validation and categorization.
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Configuration
const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  contentDirectory: path.join(__dirname, '../content/import'),
  batchSize: 50,
  retryAttempts: 3
}

class ContentImportPipeline {
  constructor() {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey)
    this.importStats = {
      processed: 0,
      successful: 0,
      failed: 0,
      warnings: []
    }
  }

  /**
   * Main import execution
   */
  async run() {
    console.log('🚀 Starting KingdomQuest Content Import Pipeline...')
    
    try {
      // 1. Validate environment and database connection
      await this.validateEnvironment()
      
      // 2. Discover content files
      const contentFiles = await this.discoverContentFiles()
      console.log(`📁 Found ${contentFiles.length} content files to process`)
      
      // 3. Process content in batches
      await this.processContentBatches(contentFiles)
      
      // 4. Generate summary report
      this.generateSummaryReport()
      
      console.log('✅ Content import pipeline completed successfully!')
      
    } catch (error) {
      console.error('❌ Content import pipeline failed:', error.message)
      process.exit(1)
    }
  }

  /**
   * Validate environment and database connectivity
   */
  async validateEnvironment() {
    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    }

    // Test database connection
    const { data, error } = await this.supabase.from('profiles').select('id').limit(1)
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`)
    }

    console.log('✅ Environment validated successfully')
  }

  /**
   * Discover content files for import
   */
  async discoverContentFiles() {
    const contentFiles = []
    
    if (!fs.existsSync(config.contentDirectory)) {
      fs.mkdirSync(config.contentDirectory, { recursive: true })
      console.log(`📁 Created content directory: ${config.contentDirectory}`)
    }

    const supportedFormats = ['.json', '.yaml', '.yml', '.md', '.csv']
    const files = fs.readdirSync(config.contentDirectory)
    
    for (const file of files) {
      const filePath = path.join(config.contentDirectory, file)
      const ext = path.extname(file).toLowerCase()
      
      if (supportedFormats.includes(ext)) {
        contentFiles.push({
          path: filePath,
          name: file,
          type: this.determineContentType(file),
          format: ext.slice(1)
        })
      }
    }

    return contentFiles
  }

  /**
   * Process content files in batches
   */
  async processContentBatches(contentFiles) {
    const batches = this.createBatches(contentFiles, config.batchSize)
    
    for (let i = 0; i < batches.length; i++) {
      console.log(`📦 Processing batch ${i + 1}/${batches.length}`)
      await this.processBatch(batches[i])
    }
  }

  /**
   * Process individual batch of content files
   */
  async processBatch(batch) {
    const promises = batch.map(file => this.processContentFile(file))
    const results = await Promise.allSettled(promises)
    
    results.forEach((result, index) => {
      this.importStats.processed++
      
      if (result.status === 'fulfilled') {
        this.importStats.successful++
        console.log(`✅ Imported: ${batch[index].name}`)
      } else {
        this.importStats.failed++
        console.error(`❌ Failed to import ${batch[index].name}:`, result.reason.message)
        this.importStats.warnings.push({
          file: batch[index].name,
          error: result.reason.message
        })
      }
    })
  }

  /**
   * Process individual content file
   */
  async processContentFile(fileInfo) {
    const content = await this.readContentFile(fileInfo)
    const validatedContent = await this.validateContent(content, fileInfo)
    const processedContent = await this.processContent(validatedContent, fileInfo)
    
    switch (fileInfo.type) {
      case 'stories':
        return await this.importStories(processedContent)
      
      case 'quizzes':
        return await this.importQuizzes(processedContent)
      
      case 'family_altars':
        return await this.importFamilyAltars(processedContent)
      
      case 'bible_passages':
        return await this.importBiblePassages(processedContent)
      
      case 'prayers':
        return await this.importPrayers(processedContent)
      
      default:
        throw new Error(`Unsupported content type: ${fileInfo.type}`)
    }
  }

  /**
   * Read content file based on format
   */
  async readContentFile(fileInfo) {
    const rawContent = fs.readFileSync(fileInfo.path, 'utf8')
    
    switch (fileInfo.format) {
      case 'json':
        return JSON.parse(rawContent)
      
      case 'yaml':
      case 'yml':
        const yaml = require('js-yaml')
        return yaml.load(rawContent)
      
      case 'md':
        return this.parseMarkdownContent(rawContent)
      
      case 'csv':
        return this.parseCSVContent(rawContent)
      
      default:
        throw new Error(`Unsupported format: ${fileInfo.format}`)
    }
  }

  /**
   * Validate content structure and quality
   */
  async validateContent(content, fileInfo) {
    // Basic structure validation
    if (!content || (Array.isArray(content) && content.length === 0)) {
      throw new Error('Content is empty or invalid')
    }

    // Content-specific validation
    switch (fileInfo.type) {
      case 'stories':
        return this.validateStories(content)
      
      case 'quizzes':
        return this.validateQuizzes(content)
      
      case 'family_altars':
        return this.validateFamilyAltars(content)
      
      case 'bible_passages':
        return this.validateBiblePassages(content)
      
      case 'prayers':
        return this.validatePrayers(content)
      
      default:
        return content
    }
  }

  /**
   * Import stories into database
   */
  async importStories(stories) {
    const storiesToInsert = Array.isArray(stories) ? stories : [stories]
    
    for (const story of storiesToInsert) {
      // Insert main story record
      const { data: storyData, error: storyError } = await this.supabase
        .from('stories')
        .insert({
          title: story.title,
          description: story.description,
          bible_reference: story.bibleReference,
          age_rating: story.ageRating || 'all',
          difficulty: story.difficulty || 'beginner',
          themes: story.themes || [],
          status: 'published',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (storyError) throw storyError

      // Insert story scenes
      if (story.scenes && story.scenes.length > 0) {
        const scenesToInsert = story.scenes.map((scene, index) => ({
          story_id: storyData.id,
          title: scene.title,
          content: scene.content,
          scene_order: index + 1,
          interactions: scene.interactions || [],
          media_urls: scene.mediaUrls || []
        }))

        const { error: scenesError } = await this.supabase
          .from('scenes')
          .insert(scenesToInsert)

        if (scenesError) throw scenesError
      }
    }

    return { imported: storiesToInsert.length }
  }

  /**
   * Import quizzes into database
   */
  async importQuizzes(quizzes) {
    const quizzesToInsert = Array.isArray(quizzes) ? quizzes : [quizzes]
    
    for (const quiz of quizzesToInsert) {
      // Insert main quiz record
      const { data: quizData, error: quizError } = await this.supabase
        .from('quizzes')
        .insert({
          title: quiz.title,
          description: quiz.description,
          bible_reference: quiz.bibleReference,
          difficulty: quiz.difficulty || 'beginner',
          time_limit: quiz.timeLimit,
          passing_score: quiz.passingScore || 70,
          status: 'published',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (quizError) throw quizError

      // Insert quiz questions
      if (quiz.questions && quiz.questions.length > 0) {
        const questionsToInsert = quiz.questions.map((question, index) => ({
          quiz_id: quizData.id,
          question_text: question.text,
          question_type: question.type,
          question_order: index + 1,
          points: question.points || 1,
          bible_reference: question.bibleReference,
          explanation: question.explanation
        }))

        const { data: questionsData, error: questionsError } = await this.supabase
          .from('quiz_questions')
          .insert(questionsToInsert)
          .select()

        if (questionsError) throw questionsError

        // Insert quiz options
        for (let qIndex = 0; qIndex < quiz.questions.length; qIndex++) {
          const question = quiz.questions[qIndex]
          const questionData = questionsData[qIndex]

          if (question.options && question.options.length > 0) {
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
        }
      }
    }

    return { imported: quizzesToInsert.length }
  }

  /**
   * Import family altar devotions
   */
  async importFamilyAltars(devotions) {
    const devotionsToInsert = Array.isArray(devotions) ? devotions : [devotions]
    
    for (const devotion of devotionsToInsert) {
      const { data: altarData, error: altarError } = await this.supabase
        .from('family_altars')
        .insert({
          title: devotion.title,
          description: devotion.description,
          bible_reference: devotion.bibleReference,
          duration_minutes: devotion.duration || 15,
          age_groups: devotion.ageGroups || ['all'],
          themes: devotion.themes || [],
          content: devotion.content,
          discussion_questions: devotion.discussionQuestions || [],
          activities: devotion.activities || [],
          prayer_suggestions: devotion.prayerSuggestions || [],
          status: 'published',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (altarError) throw altarError
    }

    return { imported: devotionsToInsert.length }
  }

  /**
   * Import Bible passages
   */
  async importBiblePassages(passages) {
    // Implementation for Bible passage import
    return { imported: 0 }
  }

  /**
   * Import prayers
   */
  async importPrayers(prayers) {
    // Implementation for prayer import  
    return { imported: 0 }
  }

  // Helper methods

  determineContentType(filename) {
    const name = filename.toLowerCase()
    if (name.includes('story') || name.includes('stories')) return 'stories'
    if (name.includes('quiz') || name.includes('quizzes')) return 'quizzes'
    if (name.includes('altar') || name.includes('devotion')) return 'family_altars'
    if (name.includes('bible') || name.includes('passage')) return 'bible_passages'
    if (name.includes('prayer') || name.includes('prayers')) return 'prayers'
    return 'unknown'
  }

  createBatches(array, batchSize) {
    const batches = []
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize))
    }
    return batches
  }

  parseMarkdownContent(content) {
    // Basic markdown parsing for content extraction
    const lines = content.split('\n')
    const result = { title: '', content: '', metadata: {} }
    
    // Extract front matter if exists
    if (lines[0] === '---') {
      const endIndex = lines.findIndex((line, index) => index > 0 && line === '---')
      if (endIndex > 0) {
        const frontMatter = lines.slice(1, endIndex).join('\n')
        try {
          result.metadata = require('js-yaml').load(frontMatter)
        } catch (e) {
          // Ignore yaml parsing errors
        }
        result.content = lines.slice(endIndex + 1).join('\n')
      }
    } else {
      result.content = content
    }
    
    // Extract title from first h1
    const titleMatch = result.content.match(/^#\s+(.+)$/m)
    if (titleMatch) {
      result.title = titleMatch[1]
    }
    
    return result
  }

  parseCSVContent(content) {
    const lines = content.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []
    
    const headers = lines[0].split(',').map(h => h.trim())
    const rows = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      rows.push(row)
    }
    
    return rows
  }

  // Validation methods
  validateStories(stories) {
    const storiesToValidate = Array.isArray(stories) ? stories : [stories]
    
    storiesToValidate.forEach(story => {
      if (!story.title) throw new Error('Story must have a title')
      if (!story.bibleReference) throw new Error('Story must have a Bible reference')
      if (story.scenes && !Array.isArray(story.scenes)) throw new Error('Scenes must be an array')
    })
    
    return stories
  }

  validateQuizzes(quizzes) {
    const quizzesToValidate = Array.isArray(quizzes) ? quizzes : [quizzes]
    
    quizzesToValidate.forEach(quiz => {
      if (!quiz.title) throw new Error('Quiz must have a title')
      if (!quiz.questions || !Array.isArray(quiz.questions)) throw new Error('Quiz must have questions array')
      if (quiz.questions.length === 0) throw new Error('Quiz must have at least one question')
    })
    
    return quizzes
  }

  validateFamilyAltars(altars) {
    const altarsToValidate = Array.isArray(altars) ? altars : [altars]
    
    altarsToValidate.forEach(altar => {
      if (!altar.title) throw new Error('Family altar must have a title')
      if (!altar.bibleReference) throw new Error('Family altar must have a Bible reference')
    })
    
    return altars
  }

  validateBiblePassages(passages) {
    // Implementation for Bible passage validation
    return passages
  }

  validatePrayers(prayers) {
    // Implementation for prayer validation
    return prayers
  }

  processContent(content, fileInfo) {
    // Apply any necessary transformations
    return content
  }

  generateSummaryReport() {
    console.log('\n📊 IMPORT SUMMARY REPORT')
    console.log('========================')
    console.log(`Total files processed: ${this.importStats.processed}`)
    console.log(`Successfully imported: ${this.importStats.successful}`)
    console.log(`Failed imports: ${this.importStats.failed}`)
    
    if (this.importStats.warnings.length > 0) {
      console.log('\n⚠️  Warnings:')
      this.importStats.warnings.forEach(warning => {
        console.log(`  - ${warning.file}: ${warning.error}`)
      })
    }
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.importStats,
      summary: `Processed ${this.importStats.processed} files, ${this.importStats.successful} successful, ${this.importStats.failed} failed`
    }
    
    const reportPath = path.join(__dirname, '../logs/import-report.json')
    fs.mkdirSync(path.dirname(reportPath), { recursive: true })
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`)
  }
}

// CLI execution
if (require.main === module) {
  const pipeline = new ContentImportPipeline()
  pipeline.run().catch(error => {
    console.error('Pipeline execution failed:', error)
    process.exit(1)
  })
}

module.exports = ContentImportPipeline