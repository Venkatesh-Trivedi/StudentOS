import type { Chapter } from '../../types/studentOS'

export const CHAPTER_NAME_MAX_LENGTH = 100

export function normalizeChapterName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

export type ChapterNameValidationResult =
  | {
      isValid: true
      normalizedName: string
    }
  | {
      isValid: false
      error: string
    }

export function validateChapterName(
  name: string,
  subjectId: string,
  existingChapters: Chapter[],
): ChapterNameValidationResult {
  const normalizedName = normalizeChapterName(name)

  if (normalizedName.length === 0) {
    return {
      isValid: false,
      error: 'Chapter name is required',
    }
  }

  if (normalizedName.length > CHAPTER_NAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Chapter name must be ${CHAPTER_NAME_MAX_LENGTH} characters or fewer`,
    }
  }

  const normalizedNameForComparison = normalizedName.toLowerCase()
  const hasDuplicate = existingChapters.some((chapter) => {
    return (
      chapter.subjectId === subjectId &&
      normalizeChapterName(chapter.name).toLowerCase() ===
        normalizedNameForComparison
    )
  })

  if (hasDuplicate) {
    return {
      isValid: false,
      error: 'A chapter with this name already exists for this subject',
    }
  }

  return {
    isValid: true,
    normalizedName,
  }
}
