import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatBibleReference, getAgeGroupLabel, formatDuration } from "@/lib/utils"
import { FamilyAltar } from "@/lib/supabase"
import Link from "next/link"
import { Users, Clock, BookOpen } from "lucide-react"

interface FamilyAltarCardProps {
  familyAltar: FamilyAltar
  showJoinButton?: boolean
}

export function FamilyAltarCard({ familyAltar, showJoinButton = true }: FamilyAltarCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="space-y-1">
          <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
            {familyAltar.title}
          </CardTitle>
          <CardDescription>
            {formatBibleReference(
              familyAltar.bible_book,
              familyAltar.bible_chapter,
              familyAltar.bible_verses,
              familyAltar.bible_translation
            )}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {familyAltar.summary}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{getAgeGroupLabel(familyAltar.age_rating)}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(familyAltar.duration)}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>Devotion</span>
          </div>
        </div>
        
        {familyAltar.tags && familyAltar.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {familyAltar.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      {showJoinButton && (
        <div className="p-6 pt-0">
          <Button asChild className="w-full">
            <Link href={`/altar?id=${familyAltar.id}`}>
              Join Family Altar
            </Link>
          </Button>
        </div>
      )}
    </Card>
  )
}