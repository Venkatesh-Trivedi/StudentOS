import type { Chapter, StudentOSData, Subject } from '../../types/studentOS'
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

export type ChapterDeletionResult =
  | {
      isDeleted: true
      data: StudentOSData
    }
  | {
      isDeleted: false
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

export function deleteChapter(
  chapterId: string,
  data: StudentOSData,
): ChapterDeletionResult {
  const chapterExists = data.chapters.some((chapter) => chapter.id === chapterId)

  if (!chapterExists) {
    return {
      isDeleted: false,
      error: 'Chapter does not exist',
    }
  }

  return {
    isDeleted: true,
    data: {
      ...data,
      chapters: data.chapters.filter((chapter) => chapter.id !== chapterId),
    },
  }
}
