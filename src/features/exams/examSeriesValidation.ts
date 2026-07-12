import type { ExamSeries } from '../../types/studentOS'

export const EXAM_SERIES_TITLE_MAX_LENGTH = 100

export type ExamSeriesTitleValidationResult =
  | {
      isValid: true
      normalizedTitle: string
    }
  | {
      isValid: false
      error: string
    }

export function normalizeExamSeriesTitle(title: string): string {
  return title.trim().replace(/\s+/g, ' ')
}

export function validateExamSeriesTitle(
  title: string,
  existingExamSeries: ExamSeries[],
): ExamSeriesTitleValidationResult {
  const normalizedTitle = normalizeExamSeriesTitle(title)

  if (normalizedTitle.length === 0) {
    return {
      isValid: false,
      error: 'Exam series title is required',
    }
  }

  if (normalizedTitle.length > EXAM_SERIES_TITLE_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Exam series title must be ${EXAM_SERIES_TITLE_MAX_LENGTH} characters or fewer`,
    }
  }

  const normalizedTitleForComparison = normalizedTitle.toLowerCase()
  const hasDuplicate = existingExamSeries.some((series) => {
    return (
      normalizeExamSeriesTitle(series.title).toLowerCase() ===
      normalizedTitleForComparison
    )
  })

  if (hasDuplicate) {
    return {
      isValid: false,
      error: 'An exam series with this title already exists',
    }
  }

  return {
    isValid: true,
    normalizedTitle,
  }
}
