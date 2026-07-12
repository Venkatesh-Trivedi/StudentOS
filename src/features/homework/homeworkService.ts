import type { Homework, StudentOSData } from '../../types/studentOS'
import {
  validateHomework,
  type HomeworkValidationInput,
} from './homeworkValidation'

export type HomeworkCreationInput = HomeworkValidationInput

export type HomeworkCreationResult =
  | {
      isCreated: true
      homework: Homework
    }
  | {
      isCreated: false
      error: string
    }

export type HomeworkCompletionToggleResult =
  | {
      isToggled: true
      data: StudentOSData
    }
  | {
      isToggled: false
      error: string
    }

export type HomeworkDeletionResult =
  | {
      isDeleted: true
      data: StudentOSData
    }
  | {
      isDeleted: false
      error: string
    }

export function createHomework(
  input: HomeworkCreationInput,
  data: StudentOSData,
): HomeworkCreationResult {
  const validation = validateHomework(
    input,
    data.subjects,
    data.chapters,
  )

  if (!validation.isValid) {
    return {
      isCreated: false,
      error: validation.error,
    }
  }

  const timestamp = new Date().toISOString()

  return {
    isCreated: true,
    homework: {
      id: crypto.randomUUID(),
      subjectId: validation.subjectId,
      chapterId: validation.chapterId,
      title: validation.normalizedTitle,
      dueDate: validation.dueDate,
      isCompleted: false,
      completedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  }
}

export function toggleHomeworkCompletion(
  homeworkId: string,
  data: StudentOSData,
): HomeworkCompletionToggleResult {
  const homeworkToToggle = data.homework.find(
    (homework) => homework.id === homeworkId,
  )

  if (homeworkToToggle === undefined) {
    return {
      isToggled: false,
      error: 'Homework does not exist',
    }
  }

  const timestamp = new Date().toISOString()
  const isCompleted = !homeworkToToggle.isCompleted

  return {
    isToggled: true,
    data: {
      ...data,
      homework: data.homework.map((homework) => {
        if (homework.id !== homeworkId) {
          return homework
        }

        return {
          ...homework,
          isCompleted,
          completedAt: isCompleted ? timestamp : null,
          updatedAt: timestamp,
        }
      }),
    },
  }
}

export function deleteHomework(
  homeworkId: string,
  data: StudentOSData,
): HomeworkDeletionResult {
  const homeworkExists = data.homework.some(
    (homework) => homework.id === homeworkId,
  )

  if (!homeworkExists) {
    return {
      isDeleted: false,
      error: 'Homework does not exist',
    }
  }

  return {
    isDeleted: true,
    data: {
      ...data,
      homework: data.homework.filter((homework) => homework.id !== homeworkId),
    },
  }
}
