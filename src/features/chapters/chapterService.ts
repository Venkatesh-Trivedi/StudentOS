import type { Chapter, StudentOSData, Subject } from '../../types/studentOS'
import { createId } from '../../shared/utils/createId'
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

  let id: string

  try {
    id = createId()
  } catch {
    return {
      isCreated: false,
      error: 'Unable to create a unique ID',
    }
  }

  const timestamp = new Date().toISOString()

  return {
    isCreated: true,
    chapter: {
      id,
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

  const exams = data.exams.flatMap((exam) => {
    let isExamAffected = false
    const subjectScopes = exam.subjectScopes.flatMap((scope) => {
      if (!scope.chapterIds.includes(chapterId)) {
        return [scope]
      }

      isExamAffected = true
      const chapterIds = scope.chapterIds.filter((id) => id !== chapterId)

      if (chapterIds.length === 0) {
        return []
      }

      return [
        {
          ...scope,
          chapterIds,
        },
      ]
    })

    if (!isExamAffected) {
      return [exam]
    }

    if (subjectScopes.length === 0) {
      return []
    }

    return [
      {
        ...exam,
        subjectScopes,
      },
    ]
  })

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
      exams,
      chapterConfidences: data.chapterConfidences.filter(
        (confidence) => confidence.chapterId !== chapterId,
      ),
      revisionTasks: data.revisionTasks.filter(
        (revisionTask) => revisionTask.chapterId !== chapterId,
      ),
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
