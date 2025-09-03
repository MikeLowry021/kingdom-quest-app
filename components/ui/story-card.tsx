import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatBibleReference, getAgeGroupLabel, getDifficultyLabel, getDifficultyColor } from "@/lib/utils"
import { Story } from "@/lib/supabase"
import Link from "next/link"
import { BookOpen, Clock, Users } from "lucide-react"

interface StoryCardProps {
  story: Story
  showStartButton?: boolean
}

export function StoryCard({ story, showStartButton = true }: StoryCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
              {story.title}
            </CardTitle>
            <CardDescription>
              {formatBibleReference(story.bible_book, story.bible_chapter, story.bible_verses, story.bible_translation)}
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className={getDifficultyColor(story.difficulty)}
          >
            {getDifficultyLabel(story.difficulty)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {story.description}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{getAgeGroupLabel(story.age_rating)}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>Story</span>
          </div>
        </div>
        
        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {story.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      {showStartButton && (
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={`/quest/${story.id}`}>
              Start Quest
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}