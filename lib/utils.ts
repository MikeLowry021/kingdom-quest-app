import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBibleReference(
  book: string,
  chapter: number,
  verses: string,
  translation: string = 'NIV'
): string {
  return `${book} ${chapter}:${verses} (${translation})`
}

export function getAgeGroupLabel(ageGroup: string | null): string {
  switch (ageGroup) {
    case 'child':
      return 'Children'
    case 'youth':
      return 'Youth'
    case 'adult':
      return 'Adults'
    case 'all':
      return 'All Ages'
    default:
      return 'All Ages'
  }
}

export function getDifficultyLabel(difficulty: string | null): string {
  switch (difficulty) {
    case 'beginner':
      return 'Beginner'
    case 'intermediate':
      return 'Intermediate'
    case 'advanced':
      return 'Advanced'
    default:
      return 'Beginner'
  }
}

export function getDifficultyColor(difficulty: string | null): string {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800'
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800'
    case 'advanced':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function formatDuration(minutes: number | null): string {
  if (!minutes) return 'Flexible'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}