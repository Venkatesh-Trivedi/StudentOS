import type { Chapter, Subject } from '../../types/studentOS'
import { validateChapterName } from './chapterValidation'

export type ChapterCreationResult =
  | {
      isCreated: true
      chapter: Chapter
    }
  | {
      isCreated: false
      error: string
    }

export function createChapter(
  name: string,
  subjectId: string,
  existingSubjects: Subject[],
  existingChapters: Chapter[],
): ChapterCreationResult {
  if (subjectId.trim().length === 0) {
    return {
      isCreated: false,
      error: 'Subject ID is required',
    }
  }

  const subjectExists = existingSubjects.some(
    (subject) => subject.id === subjectId,
  )

  if (!subjectExists) {
    return {
      isCreated: false,
      error: 'Subject does not exist',
    }
  }

  const validation = validateChapterName(name, subjectId, existingChapters)

  if (!validation.isValid) {
    return {
      isCreated: false,
      error: validation.error,
    }
  }

  const timestamp = new Date().toISOString()

  return {
    isCreated: true,
    chapter: {
      id: crypto.randomUUID(),
      subjectId,
      name: validation.normalizedName,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  }
}
