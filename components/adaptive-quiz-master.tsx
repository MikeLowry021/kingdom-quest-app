'use client'

import { useState, useEffect } from 'react'
import { useAgeMode } from '@/lib/use-age-mode'
import { supabase, Quiz, QuizQuestion, QuizOption } from '@/lib/supabase'
import { getDefaultDifficulty, isChildTier } from '@/lib/age-modes'
import { AdaptiveButton, AdaptiveCard, AdaptiveText } from '@/components/ui/adaptive-ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Clock, CheckCircle, XCircle, Brain, Trophy, Target } from 'lucide-react'

interface AdaptiveQuizMasterProps {
  storyId?: string
  category?: string
  onComplete?: (results: QuizResults) => void
}

interface QuizResults {
  score: number
  totalQuestions: number
  percentage: number
  difficulty: string
  timeTaken: number
  adjustedDifficulty?: string
  difficultyChanged?: boolean
}

interface QuizState {
  quiz: Quiz | null
  questions: (QuizQuestion & { options: QuizOption[] })[]
  currentQuestionIndex: number
  answers: Record<string, string>
  timeStarted: number
  isCompleted: boolean
  results: QuizResults | null
  loading: boolean
  error: string | null
}

export function AdaptiveQuizMaster({ storyId, category = 'general', onComplete }: AdaptiveQuizMasterProps) {
  const { ageTier, performance, settings, updateQuizPerformance, trackEvent } = useAgeMode()
  const [state, setState] = useState<QuizState>({
    quiz: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: {},
    timeStarted: 0,
    isCompleted: false,
    results: null,
    loading: true,
    error: null
  })

  // Determine appropriate difficulty level
  const getTargetDifficulty = () => {
    if (performance?.difficulty_level) {
      return performance.difficulty_level
    }
    return getDefaultDifficulty(ageTier)
  }

  // Load quiz based on difficulty and age appropriateness
  const loadQuiz = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const targetDifficulty = getTargetDifficulty()
      
      // Build query for appropriate quiz
      let query = supabase
        .from('quizzes')
        .select('*')
        .eq('difficulty', targetDifficulty)
      
      if (storyId) {
        query = query.eq('story_id', storyId)
      }
      
      const { data: quizzes, error: quizError } = await query.limit(1).maybeSingle()
      
      if (quizError) throw quizError
      if (!quizzes) {
        throw new Error('No suitable quiz found for your current level')
      }

      // Load questions for the quiz
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select(`
          *,
          quiz_options:quiz_options(*)
        `)
        .eq('quiz_id', quizzes.id)
        .order('created_at')
      
      if (questionsError) throw questionsError
      
      const questionsWithOptions = questions?.map(q => ({
        ...q,
        options: q.quiz_options || []
      })) || []

      setState(prev => ({
        ...prev,
        quiz: quizzes,
        questions: questionsWithOptions,
        timeStarted: Date.now(),
        loading: false
      }))

      // Track quiz start
      await trackEvent('quiz_started', 'quiz', {
        quiz_id: quizzes.id,
        difficulty: targetDifficulty,
        story_id: storyId,
        category,
        question_count: questionsWithOptions.length
      })
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load quiz',
        loading: false
      }))
    }
  }

  useEffect(() => {
    loadQuiz()
  }, [storyId, category])

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answerId
      }
    }))

    // Track answer selection
    trackEvent('quiz_answer_selected', 'quiz', {
      question_id: questionId,
      answer_id: answerId,
      quiz_id: state.quiz?.id
    })
  }

  const handleNextQuestion = () => {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }))
    } else {
      completeQuiz()
    }
  }

  const handlePreviousQuestion = () => {
    if (state.currentQuestionIndex > 0) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }))
    }
  }

  const completeQuiz = async () => {
    if (!state.quiz) return

    try {
      // Calculate score
      let correctAnswers = 0
      const totalQuestions = state.questions.length
      
      state.questions.forEach(question => {
        const selectedAnswerId = state.answers[question.id]
        const correctOption = question.options.find(opt => opt.is_correct)
        if (selectedAnswerId === correctOption?.id) {
          correctAnswers++
        }
      })

      const percentage = Math.round((correctAnswers / totalQuestions) * 100)
      const timeTaken = Math.round((Date.now() - state.timeStarted) / 1000)
      
      const results: QuizResults = {
        score: correctAnswers,
        totalQuestions,
        percentage,
        difficulty: state.quiz.difficulty || 'beginner',
        timeTaken
      }

      // Update performance and get difficulty adjustment
      const performanceUpdate = await updateQuizPerformance(
        state.quiz.id,
        percentage,
        category
      )

      results.adjustedDifficulty = performanceUpdate.currentDifficulty
      results.difficultyChanged = performanceUpdate.difficultyChanged

      setState(prev => ({
        ...prev,
        isCompleted: true,
        results
      }))

      // Track quiz completion
      await trackEvent('quiz_completed', 'quiz', {
        quiz_id: state.quiz.id,
        score: correctAnswers,
        total_questions: totalQuestions,
        percentage,
        time_taken: timeTaken,
        difficulty_changed: performanceUpdate.difficultyChanged,
        new_difficulty: performanceUpdate.currentDifficulty
      })

      if (onComplete) {
        onComplete(results)
      }
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to complete quiz. Please try again.'
      }))
    }
  }

  if (state.loading) {
    return (
      <AdaptiveCard className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kingdom-blue-600 mx-auto mb-4"></div>
        <AdaptiveText>Loading your personalized quiz...</AdaptiveText>
      </AdaptiveCard>
    )
  }

  if (state.error) {
    return (
      <AdaptiveCard className="text-center py-12">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <AdaptiveText variant="heading">Quiz Error</AdaptiveText>
        <AdaptiveText className="text-red-600 mt-2">{state.error}</AdaptiveText>
        <AdaptiveButton onClick={loadQuiz} className="mt-4">
          Try Again
        </AdaptiveButton>
      </AdaptiveCard>
    )
  }

  if (state.isCompleted && state.results) {
    return (
      <AdaptiveCard className="text-center py-8">
        <Trophy className="h-16 w-16 text-gold-500 mx-auto mb-6" />
        <AdaptiveText variant="title" className="mb-4">
          Quiz Complete!
        </AdaptiveText>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <AdaptiveText variant="heading">{state.results.score}</AdaptiveText>
              <AdaptiveText variant="caption">Correct Answers</AdaptiveText>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <AdaptiveText variant="heading">{state.results.percentage}%</AdaptiveText>
              <AdaptiveText variant="caption">Score</AdaptiveText>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <AdaptiveText variant="heading">{Math.floor(state.results.timeTaken / 60)}:{(state.results.timeTaken % 60).toString().padStart(2, '0')}</AdaptiveText>
              <AdaptiveText variant="caption">Time Taken</AdaptiveText>
            </div>
          </div>

          {state.results.difficultyChanged && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <Brain className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <AdaptiveText variant="heading" className="text-yellow-800">
                Difficulty Adjusted!
              </AdaptiveText>
              <AdaptiveText className="text-yellow-700 mt-2">
                Your next quiz will be at <strong>{state.results.adjustedDifficulty}</strong> level
                {isChildTier(ageTier) && ' to help you learn and grow!'}
              </AdaptiveText>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <AdaptiveButton onClick={loadQuiz}>
              Try Another Quiz
            </AdaptiveButton>
            {onComplete && (
              <AdaptiveButton variant="secondary" onClick={() => window.history.back()}>
                Back to Story
              </AdaptiveButton>
            )}
          </div>
        </div>
      </AdaptiveCard>
    )
  }

  if (!state.quiz || state.questions.length === 0) {
    return (
      <AdaptiveCard className="text-center py-12">
        <AdaptiveText variant="heading">No Quiz Available</AdaptiveText>
        <AdaptiveText className="mt-2">There's no quiz available for this content yet.</AdaptiveText>
      </AdaptiveCard>
    )
  }

  const currentQuestion = state.questions[state.currentQuestionIndex]
  const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100
  const selectedAnswer = state.answers[currentQuestion.id]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <AdaptiveCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <AdaptiveText variant="heading">{state.quiz.title}</AdaptiveText>
            <AdaptiveText variant="caption">
              Difficulty: {state.quiz.difficulty?.toUpperCase()} • Question {state.currentQuestionIndex + 1} of {state.questions.length}
            </AdaptiveText>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-kingdom-blue-600" />
              <AdaptiveText variant="caption">Adaptive Learning</AdaptiveText>
            </div>
          </div>
        </div>
        
        <Progress value={progress} className="w-full" />
      </AdaptiveCard>

      {/* Current Question */}
      <AdaptiveCard>
        <div className="space-y-6">
          <AdaptiveText variant="heading">
            {currentQuestion.question_text}
          </AdaptiveText>
          
          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <AdaptiveButton
                key={option.id}
                variant={selectedAnswer === option.id ? 'primary' : 'secondary'}
                className={`w-full text-left justify-start p-4 ${
                  selectedAnswer === option.id ? 'ring-2 ring-kingdom-blue-500' : ''
                }`}
                onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                audioLabel={`Option: ${option.option_text}`}
              >
                <span className="flex items-center space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-semibold">
                    {String.fromCharCode(65 + currentQuestion.options.indexOf(option))}
                  </span>
                  <span>{option.option_text}</span>
                </span>
              </AdaptiveButton>
            ))}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between items-center pt-6">
            <AdaptiveButton
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={state.currentQuestionIndex === 0}
            >
              Previous
            </AdaptiveButton>
            
            <AdaptiveButton
              onClick={handleNextQuestion}
              disabled={!selectedAnswer}
              audioLabel={state.currentQuestionIndex === state.questions.length - 1 ? 'Complete Quiz' : 'Next Question'}
            >
              {state.currentQuestionIndex === state.questions.length - 1 ? 'Complete Quiz' : 'Next Question'}
            </AdaptiveButton>
          </div>
        </div>
      </AdaptiveCard>
    </div>
  )
}