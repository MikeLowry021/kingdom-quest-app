import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getDifficultyLabel, getDifficultyColor } from "@/lib/utils"
import { Quiz } from "@/lib/supabase"
import Link from "next/link"
import { HelpCircle, Clock, Target } from "lucide-react"

interface QuizCardProps {
  quiz: Quiz
  questionCount?: number
  showStartButton?: boolean
}

export function QuizCard({ quiz, questionCount = 0, showStartButton = true }: QuizCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
              {quiz.title}
            </CardTitle>
            <CardDescription>
              {quiz.description}
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className={getDifficultyColor(quiz.difficulty)}
          >
            {getDifficultyLabel(quiz.difficulty)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <HelpCircle className="h-3 w-3" />
            <span>{questionCount} questions</span>
          </div>
          
          {quiz.time_limit > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{Math.floor(quiz.time_limit / 60)} min</span>
            </div>
          )}
          
          {quiz.passing_score > 0 && (
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span>{quiz.passing_score} to pass</span>
            </div>
          )}
        </div>
      </CardContent>
      
      {showStartButton && (
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={`/quiz/${quiz.id}`}>
              Take Quiz
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}