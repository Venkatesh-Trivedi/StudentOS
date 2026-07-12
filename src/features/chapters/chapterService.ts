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

export type ChapterRenameResult =
  | {
      isRenamed: true
      data: StudentOSData
    }
  | {
      isRenamed: false
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
      homework: data.homework.map((homework) => {
        if (homework.chapterId !== chapterId) {
          return homework
        }

        return {
          ...homework,
          chapterId: null,
        }
      }),
    },
  }
}

export function renameChapter(
  chapterId: string,
  name: string,
  data: StudentOSData,
): ChapterRenameResult {
  const chapterToRename = data.chapters.find(
    (chapter) => chapter.id === chapterId,
  )

  if (chapterToRename === undefined) {
    return {
      isRenamed: false,
      error: 'Chapter does not exist',
    }
  }

  const otherChapters = data.chapters.filter(
    (chapter) => chapter.id !== chapterId,
  )
  const validation = validateChapterName(
    name,
    chapterToRename.subjectId,
    otherChapters,
  )

  if (!validation.isValid) {
    return {
      isRenamed: false,
      error: validation.error,
    }
  }

  const timestamp = new Date().toISOString()

  return {
    isRenamed: true,
    data: {
      ...data,
      chapters: data.chapters.map((chapter) => {
        if (chapter.id !== chapterId) {
          return chapter
        }

        return {
          ...chapter,
          name: validation.normalizedName,
          updatedAt: timestamp,
        }
      }),
    },
  }
}
