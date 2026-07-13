import type {
  ConfidenceLevel,
  RevisionTask,
  StudentOSData,
} from '../../types/studentOS'
import { createId } from '../../shared/utils/createId'
import { validateRevisionTask } from './revisionValidation'

export type ChapterConfidenceSetResult =
  | {
      isSet: true
      data: StudentOSData
    }
  | {
      isSet: false
      error: string
    }

export type ChapterConfidenceClearResult =
  | {
      isCleared: true
      data: StudentOSData
    }
  | {
      isCleared: false
      error: string
    }

export type RevisionTaskCreationResult =
  | {
      isCreated: true
      revisionTask: RevisionTask
    }
  | {
      isCreated: false
      error: string
    }

export type RevisionTaskCompletionToggleResult =
  | {
      isToggled: true
      data: StudentOSData
    }
  | {
      isToggled: false
      error: string
    }

export type RevisionTaskDeletionResult =
  | {
      isDeleted: true
      data: StudentOSData
    }
  | {
      isDeleted: false
      error: string
    }

export function setChapterConfidence(
  chapterId: string,
  level: ConfidenceLevel,
  data: StudentOSData,
): ChapterConfidenceSetResult {
  const chapterExists = data.chapters.some(
    (chapter) => chapter.id === chapterId,
  )

  if (!chapterExists) {
    return {
      isSet: false,
      error: 'Chapter does not exist',
    }
  }

  if (!isConfidenceLevel(level)) {
    return {
      isSet: false,
      error: 'Confidence level is invalid',
    }
  }

  const timestamp = new Date().toISOString()
  const existingConfidenceIndex = data.chapterConfidences.findIndex(
    (confidence) => confidence.chapterId === chapterId,
  )
  const chapterConfidence = {
    chapterId,
    level,
    updatedAt: timestamp,
  }

  return {
    isSet: true,
    data: {
      ...data,
      chapterConfidences: existingConfidenceIndex >= 0
        ? data.chapterConfidences.flatMap((confidence, index) => {
            if (confidence.chapterId !== chapterId) {
              return [confidence]
            }

            return index === existingConfidenceIndex
              ? [chapterConfidence]
              : []
          })
        : [...data.chapterConfidences, chapterConfidence],
    },
  }
}

export function clearChapterConfidence(
  chapterId: string,
  data: StudentOSData,
): ChapterConfidenceClearResult {
  const chapterExists = data.chapters.some(
    (chapter) => chapter.id === chapterId,
  )

  if (!chapterExists) {
    return {
      isCleared: false,
      error: 'Chapter does not exist',
    }
  }

  const confidenceExists = data.chapterConfidences.some(
    (confidence) => confidence.chapterId === chapterId,
  )

  if (!confidenceExists) {
    return {
      isCleared: false,
      error: 'Chapter confidence is not set',
    }
  }

  return {
    isCleared: true,
    data: {
      ...data,
      chapterConfidences: data.chapterConfidences.filter(
        (confidence) => confidence.chapterId !== chapterId,
      ),
    },
  }
}

export function createRevisionTask(
  chapterId: string,
  scheduledDate: string,
  data: StudentOSData,
): RevisionTaskCreationResult {
  const validation = validateRevisionTask(
    chapterId,
    scheduledDate,
    data.chapters,
    data.revisionTasks,
  )

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
    revisionTask: {
      id,
      chapterId: validation.chapterId,
      scheduledDate: validation.scheduledDate,
      isCompleted: false,
      completedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  }
}

export function toggleRevisionTaskCompletion(
  revisionTaskId: string,
  data: StudentOSData,
): RevisionTaskCompletionToggleResult {
  const revisionTaskToToggle = data.revisionTasks.find(
    (revisionTask) => revisionTask.id === revisionTaskId,
  )

  if (revisionTaskToToggle === undefined) {
    return {
      isToggled: false,
      error: 'Revision task does not exist',
    }
  }

  const timestamp = new Date().toISOString()
  const isCompleted = !revisionTaskToToggle.isCompleted

  return {
    isToggled: true,
    data: {
      ...data,
      revisionTasks: data.revisionTasks.map((revisionTask) => {
        if (revisionTask.id !== revisionTaskId) {
          return revisionTask
        }

        return {
          ...revisionTask,
          isCompleted,
          completedAt: isCompleted ? timestamp : null,
          updatedAt: timestamp,
        }
      }),
    },
  }
}

export function deleteRevisionTask(
  revisionTaskId: string,
  data: StudentOSData,
): RevisionTaskDeletionResult {
  const revisionTaskExists = data.revisionTasks.some(
    (revisionTask) => revisionTask.id === revisionTaskId,
  )

  if (!revisionTaskExists) {
    return {
      isDeleted: false,
      error: 'Revision task does not exist',
    }
  }

  return {
    isDeleted: true,
    data: {
      ...data,
      revisionTasks: data.revisionTasks.filter(
        (revisionTask) => revisionTask.id !== revisionTaskId,
      ),
    },
  }
}

function isConfidenceLevel(value: string): value is ConfidenceLevel {
  return value === 'low' || value === 'medium' || value === 'high'
}
