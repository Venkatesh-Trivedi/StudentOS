import type { Exam, StudentOSData } from '../../types/studentOS'
import { createId } from '../../shared/utils/createId'
import {
  validateExam,
  type ExamValidationInput,
} from './examValidation'

export type ExamCreationInput = ExamValidationInput

export type ExamCreationResult =
  | {
      isCreated: true
      exam: Exam
    }
  | {
      isCreated: false
      error: string
    }

export type ExamDeletionResult =
  | {
      isDeleted: true
      data: StudentOSData
    }
  | {
      isDeleted: false
      error: string
    }

export function createExam(
  input: ExamCreationInput,
  data: StudentOSData,
): ExamCreationResult {
  const validation = validateExam(
    input,
    data.subjects,
    data.chapters,
    data.examSeries,
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
    exam: {
      id,
      seriesId: validation.seriesId,
      title: validation.normalizedTitle,
      examDate: validation.examDate,
      subjectScopes: validation.subjectScopes.map((scope) => ({
        subjectId: scope.subjectId,
        scopeType: scope.scopeType,
        chapterIds: [...scope.chapterIds],
      })),
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  }
}

export function deleteExam(
  examId: string,
  data: StudentOSData,
): ExamDeletionResult {
  const examExists = data.exams.some((exam) => exam.id === examId)

  if (!examExists) {
    return {
      isDeleted: false,
      error: 'Exam does not exist',
    }
  }

  return {
    isDeleted: true,
    data: {
      ...data,
      exams: data.exams.filter((exam) => exam.id !== examId),
    },
  }
}
