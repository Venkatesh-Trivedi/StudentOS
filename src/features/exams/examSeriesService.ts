import type { ExamSeries, StudentOSData } from '../../types/studentOS'
import { createId } from '../../shared/utils/createId'
import { validateExamSeriesTitle } from './examSeriesValidation'

export type ExamSeriesCreationResult =
  | {
      isCreated: true
      examSeries: ExamSeries
    }
  | {
      isCreated: false
      error: string
    }

export type ExamSeriesRenameResult =
  | {
      isRenamed: true
      data: StudentOSData
    }
  | {
      isRenamed: false
      error: string
    }

export type ExamSeriesDeletionResult =
  | {
      isDeleted: true
      data: StudentOSData
    }
  | {
      isDeleted: false
      error: string
    }

export function createExamSeries(
  title: string,
  data: StudentOSData,
): ExamSeriesCreationResult {
  const validation = validateExamSeriesTitle(title, data.examSeries)

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
    examSeries: {
      id,
      title: validation.normalizedTitle,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  }
}

export function renameExamSeries(
  seriesId: string,
  title: string,
  data: StudentOSData,
): ExamSeriesRenameResult {
  const seriesToRename = data.examSeries.find(
    (series) => series.id === seriesId,
  )

  if (seriesToRename === undefined) {
    return {
      isRenamed: false,
      error: 'Exam series does not exist',
    }
  }

  const otherSeries = data.examSeries.filter(
    (series) => series.id !== seriesId,
  )
  const validation = validateExamSeriesTitle(title, otherSeries)

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
      examSeries: data.examSeries.map((series) => {
        if (series.id !== seriesId) {
          return series
        }

        return {
          ...series,
          title: validation.normalizedTitle,
          updatedAt: timestamp,
        }
      }),
    },
  }
}

export function deleteExamSeries(
  seriesId: string,
  data: StudentOSData,
): ExamSeriesDeletionResult {
  const seriesExists = data.examSeries.some(
    (series) => series.id === seriesId,
  )

  if (!seriesExists) {
    return {
      isDeleted: false,
      error: 'Exam series does not exist',
    }
  }

  return {
    isDeleted: true,
    data: {
      ...data,
      examSeries: data.examSeries.filter((series) => series.id !== seriesId),
      exams: data.exams.map((exam) => {
        if (exam.seriesId !== seriesId) {
          return exam
        }

        return {
          ...exam,
          seriesId: null,
        }
      }),
    },
  }
}
