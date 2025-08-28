#!/usr/bin/env node
/**
 * Master Content Pipeline Script
 * 
 * Orchestrates all content generation, import, and validation processes
 * for the KingdomQuest platform in the correct sequence.
 */

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

// Configuration
const config = {
  logDirectory: path.join(__dirname, '../logs'),
  environment: process.env.NODE_ENV || 'development',
  steps: [
    {
      name: 'Database Seeding',
      script: 'database-seeding.js',
      description: 'Populate database with initial content and test data',
      enabled: true,
      dependencies: []
    },
    {
      name: 'Content Import Pipeline',
      script: 'content-import-pipeline.js',
      description: 'Import biblical stories, passages, and related content',
      enabled: true,
      dependencies: ['Database Seeding']
    },
    {
      name: 'Quiz Generation Pipeline',
      script: 'quiz-generation-pipeline.js',
      description: 'Generate quizzes from Bible passages and stories',
      enabled: true,
      dependencies: ['Content Import Pipeline']
    },
    {
      name: 'Family Altar Automation',
      script: 'family-altar-automation.js',
      description: 'Generate family devotional content and activities',
      enabled: true,
      dependencies: ['Content Import Pipeline']
    },
    {
      name: 'Content Validation & QA',
      script: 'content-validation-qa.js',
      description: 'Validate all content for theological accuracy and quality',
      enabled: true,
      dependencies: ['Quiz Generation Pipeline', 'Family Altar Automation']
    }
  ]
}

class MasterContentPipeline {
  constructor() {
    this.executionStats = {
      totalSteps: 0,
      completedSteps: 0,
      failedSteps: 0,
      skippedSteps: 0,
      startTime: null,
      endTime: null,
      stepResults: new Map()
    }
  }

  /**
   * Main pipeline execution
   */
  async run(options = {}) {
    console.log('🚀 Starting KingdomQuest Master Content Pipeline...')
    console.log(`Environment: ${config.environment}`)
    
    try {
      this.executionStats.startTime = new Date()
      
      // 1. Validate environment and setup
      await this.validateEnvironment()
      
      // 2. Prepare execution plan
      const executionPlan = this.createExecutionPlan(options)
      console.log(`📋 Execution plan created with ${executionPlan.length} steps`)
      
      // 3. Execute steps in order
      await this.executeSteps(executionPlan)
      
      // 4. Generate final report
      this.executionStats.endTime = new Date()
      await this.generateFinalReport()
      
      console.log('✅ Master content pipeline completed successfully!')
      
    } catch (error) {
      console.error('❌ Master content pipeline failed:', error.message)
      this.executionStats.endTime = new Date()
      await this.generateErrorReport(error)
      process.exit(1)
    }
  }

  /**
   * Validate environment and prerequisites
   */
  async validateEnvironment() {
    console.log('🔍 Validating pipeline environment...')
    
    // Check required environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`)
      }
    }

    // Ensure log directory exists
    fs.mkdirSync(config.logDirectory, { recursive: true })

    // Check that all script files exist
    for (const step of config.steps) {
      const scriptPath = path.join(__dirname, step.script)
      if (!fs.existsSync(scriptPath)) {
        throw new Error(`Script file not found: ${step.script}`)
      }
    }

    console.log('✅ Environment validation completed')
  }

  /**
   * Create execution plan based on dependencies and options
   */
  createExecutionPlan(options) {
    const plan = []
    const completed = new Set()
    const enabledSteps = config.steps.filter(step => 
      step.enabled && (!options.steps || options.steps.includes(step.name))
    )

    // Simple dependency resolution (topological sort would be better for complex dependencies)
    const addStepToPlan = (step) => {
      if (completed.has(step.name)) {
        return
      }

      // Add dependencies first
      for (const depName of step.dependencies) {
        const depStep = enabledSteps.find(s => s.name === depName)
        if (depStep && !completed.has(depName)) {
          addStepToPlan(depStep)
        }
      }

      plan.push(step)
      completed.add(step.name)
    }

    enabledSteps.forEach(step => addStepToPlan(step))
    
    this.executionStats.totalSteps = plan.length
    return plan
  }

  /**
   * Execute steps in the planned order
   */
  async executeSteps(executionPlan) {
    console.log('⚡ Starting step execution...')
    
    for (let i = 0; i < executionPlan.length; i++) {
      const step = executionPlan[i]
      console.log(`\n📍 Step ${i + 1}/${executionPlan.length}: ${step.name}`)
      console.log(`   ${step.description}`)
      
      const stepResult = await this.executeStep(step)
      this.executionStats.stepResults.set(step.name, stepResult)
      
      if (stepResult.success) {
        this.executionStats.completedSteps++
        console.log(`✅ Completed: ${step.name}`)
      } else {
        this.executionStats.failedSteps++
        console.error(`❌ Failed: ${step.name}`)
        
        if (stepResult.critical) {
          throw new Error(`Critical step failed: ${step.name} - ${stepResult.error}`)
        } else {
          console.warn(`⚠️ Non-critical step failed, continuing pipeline...`)
        }
      }
    }
  }

  /**
   * Execute individual pipeline step
   */
  async executeStep(step) {
    const stepStartTime = new Date()
    
    return new Promise((resolve) => {
      const scriptPath = path.join(__dirname, step.script)
      const logPath = path.join(config.logDirectory, `${step.name.replace(/\s+/g, '-').toLowerCase()}.log`)
      
      console.log(`   📜 Executing: ${step.script}`)
      console.log(`   📝 Logs: ${logPath}`)
      
      // Create log stream
      const logStream = fs.createWriteStream(logPath, { flags: 'w' })
      
      // Spawn child process
      const childProcess = spawn('node', [scriptPath, config.environment], {
        cwd: path.dirname(scriptPath),
        env: { ...process.env },
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stdout = ''
      let stderr = ''

      // Capture output
      childProcess.stdout.on('data', (data) => {
        const text = data.toString()
        stdout += text
        logStream.write(`[STDOUT] ${text}`)
        // Optionally show real-time output
        if (process.env.VERBOSE === 'true') {
          process.stdout.write(text)
        }
      })

      childProcess.stderr.on('data', (data) => {
        const text = data.toString()
        stderr += text
        logStream.write(`[STDERR] ${text}`)
        if (process.env.VERBOSE === 'true') {
          process.stderr.write(text)
        }
      })

      childProcess.on('close', (code) => {
        const stepEndTime = new Date()
        const duration = stepEndTime - stepStartTime

        logStream.end()

        const result = {
          success: code === 0,
          exitCode: code,
          duration,
          stdout: stdout.substring(0, 5000), // Limit stored output
          stderr: stderr.substring(0, 1000),
          logFile: logPath,
          critical: step.critical !== false // Default to critical unless explicitly set to false
        }

        if (code !== 0) {
          result.error = `Process exited with code ${code}`
        }

        resolve(result)
      })

      childProcess.on('error', (error) => {
        logStream.end()
        resolve({
          success: false,
          error: error.message,
          duration: new Date() - stepStartTime,
          logFile: logPath,
          critical: step.critical !== false
        })
      })

      // Set timeout for long-running processes
      const timeout = step.timeout || 30 * 60 * 1000 // 30 minutes default
      setTimeout(() => {
        if (!childProcess.killed) {
          childProcess.kill()
          resolve({
            success: false,
            error: 'Process timeout',
            duration: timeout,
            logFile: logPath,
            critical: step.critical !== false
          })
        }
      }, timeout)
    })
  }

  /**
   * Generate comprehensive final report
   */
  async generateFinalReport() {
    console.log('📊 Generating final pipeline report...')
    
    const totalDuration = this.executionStats.endTime - this.executionStats.startTime
    
    const report = {
      timestamp: new Date().toISOString(),
      environment: config.environment,
      execution: {
        totalSteps: this.executionStats.totalSteps,
        completedSteps: this.executionStats.completedSteps,
        failedSteps: this.executionStats.failedSteps,
        skippedSteps: this.executionStats.skippedSteps,
        successRate: Math.round((this.executionStats.completedSteps / this.executionStats.totalSteps) * 100),
        totalDuration: Math.round(totalDuration / 1000), // seconds
        startTime: this.executionStats.startTime.toISOString(),
        endTime: this.executionStats.endTime.toISOString()
      },
      steps: {},
      summary: this.generateExecutionSummary(),
      recommendations: this.generateRecommendations()
    }

    // Add step details
    for (const [stepName, stepResult] of this.executionStats.stepResults) {
      report.steps[stepName] = {
        success: stepResult.success,
        duration: Math.round(stepResult.duration / 1000), // seconds
        exitCode: stepResult.exitCode,
        logFile: stepResult.logFile,
        error: stepResult.error || null
      }
    }

    // Save report
    const reportPath = path.join(config.logDirectory, 'master-pipeline-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    // Generate human-readable summary
    const summaryPath = path.join(config.logDirectory, 'pipeline-summary.md')
    await this.generateMarkdownSummary(report, summaryPath)

    console.log(`📄 Final report saved to: ${reportPath}`)
    console.log(`📝 Summary report saved to: ${summaryPath}`)
    
    this.printExecutionSummary(report)
  }

  /**
   * Generate error report when pipeline fails
   */
  async generateErrorReport(error) {
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      environment: config.environment,
      execution: {
        completedSteps: this.executionStats.completedSteps,
        totalSteps: this.executionStats.totalSteps,
        duration: Math.round((this.executionStats.endTime - this.executionStats.startTime) / 1000)
      },
      stepResults: Object.fromEntries(this.executionStats.stepResults)
    }

    const errorReportPath = path.join(config.logDirectory, 'pipeline-error-report.json')
    fs.writeFileSync(errorReportPath, JSON.stringify(errorReport, null, 2))
    
    console.log(`📄 Error report saved to: ${errorReportPath}`)
  }

  /**
   * Generate execution summary
   */
  generateExecutionSummary() {
    const successful = []
    const failed = []
    const warnings = []

    for (const [stepName, stepResult] of this.executionStats.stepResults) {
      if (stepResult.success) {
        successful.push(stepName)
      } else {
        failed.push(stepName)
        if (!stepResult.critical) {
          warnings.push(`${stepName} failed but was non-critical`)
        }
      }
    }

    return {
      successful,
      failed,
      warnings,
      overallStatus: failed.length === 0 ? 'SUCCESS' : 
                    warnings.length > 0 ? 'SUCCESS_WITH_WARNINGS' : 'FAILED'
    }
  }

  /**
   * Generate recommendations based on execution results
   */
  generateRecommendations() {
    const recommendations = []
    
    if (this.executionStats.failedSteps > 0) {
      recommendations.push('Review failed step logs and address underlying issues before next run')
    }
    
    if (this.executionStats.completedSteps / this.executionStats.totalSteps < 1.0) {
      recommendations.push('Consider making failed steps non-critical if they are not essential for operation')
    }
    
    // Check execution times for performance recommendations
    for (const [stepName, stepResult] of this.executionStats.stepResults) {
      if (stepResult.duration > 15 * 60 * 1000) { // 15 minutes
        recommendations.push(`Consider optimizing ${stepName} - execution time was ${Math.round(stepResult.duration / 60000)} minutes`)
      }
    }
    
    return recommendations
  }

  /**
   * Generate markdown summary report
   */
  async generateMarkdownSummary(report, summaryPath) {
    const markdown = `# KingdomQuest Content Pipeline Execution Report

**Generated:** ${report.timestamp}  
**Environment:** ${report.environment}  
**Overall Status:** ${report.summary.overallStatus}

## Execution Summary

- **Total Steps:** ${report.execution.totalSteps}
- **Completed:** ${report.execution.completedSteps}
- **Failed:** ${report.execution.failedSteps}
- **Success Rate:** ${report.execution.successRate}%
- **Total Duration:** ${report.execution.totalDuration} seconds

## Step Results

${Object.entries(report.steps).map(([stepName, stepResult]) => `
### ${stepName}
- **Status:** ${stepResult.success ? '✅ SUCCESS' : '❌ FAILED'}
- **Duration:** ${stepResult.duration} seconds
- **Log File:** \`${stepResult.logFile}\`
${stepResult.error ? `- **Error:** ${stepResult.error}` : ''}
`).join('')}

## Successful Steps
${report.summary.successful.map(step => `- ${step}`).join('\n')}

${report.summary.failed.length > 0 ? `## Failed Steps
${report.summary.failed.map(step => `- ${step}`).join('\n')}` : ''}

${report.summary.warnings.length > 0 ? `## Warnings
${report.summary.warnings.map(warning => `- ${warning}`).join('\n')}` : ''}

${report.recommendations.length > 0 ? `## Recommendations
${report.recommendations.map(rec => `- ${rec}`).join('\n')}` : ''}

## Next Steps

${report.summary.overallStatus === 'SUCCESS' ? 
  '✅ All pipeline steps completed successfully. The KingdomQuest content is ready for use.' :
  '⚠️ Some steps failed. Review the logs and address issues before the next run.'
}
`

    fs.writeFileSync(summaryPath, markdown)
  }

  /**
   * Print execution summary to console
   */
  printExecutionSummary(report) {
    console.log('\n📊 MASTER PIPELINE EXECUTION SUMMARY')
    console.log('=====================================')
    console.log(`Overall Status: ${report.summary.overallStatus}`)
    console.log(`Success Rate: ${report.execution.successRate}%`)
    console.log(`Total Duration: ${Math.round(report.execution.totalDuration / 60)} minutes`)
    console.log(`Steps Completed: ${report.execution.completedSteps}/${report.execution.totalSteps}`)
    
    if (report.summary.successful.length > 0) {
      console.log('\n✅ Successful Steps:')
      report.summary.successful.forEach(step => console.log(`  - ${step}`))
    }
    
    if (report.summary.failed.length > 0) {
      console.log('\n❌ Failed Steps:')
      report.summary.failed.forEach(step => console.log(`  - ${step}`))
    }
    
    if (report.summary.warnings.length > 0) {
      console.log('\n⚠️ Warnings:')
      report.summary.warnings.forEach(warning => console.log(`  - ${warning}`))
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:')
      report.recommendations.forEach(rec => console.log(`  - ${rec}`))
    }
  }
}

// CLI execution
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2)
  const options = {}

  // Parse --steps option
  const stepsIndex = args.indexOf('--steps')
  if (stepsIndex !== -1 && stepsIndex + 1 < args.length) {
    options.steps = args[stepsIndex + 1].split(',').map(s => s.trim())
  }

  // Parse --environment option
  const envIndex = args.indexOf('--environment')
  if (envIndex !== -1 && envIndex + 1 < args.length) {
    config.environment = args[envIndex + 1]
  }

  console.log(`🚀 KingdomQuest Master Content Pipeline`)
  console.log(`Environment: ${config.environment}`)
  
  if (options.steps) {
    console.log(`Selected steps: ${options.steps.join(', ')}`)
  }

  const pipeline = new MasterContentPipeline()
  pipeline.run(options).catch(error => {
    console.error('Master pipeline execution failed:', error)
    process.exit(1)
  })
}

module.exports = MasterContentPipeline