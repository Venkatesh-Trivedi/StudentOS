import type {
  Chapter,
  ExamSeries,
  ExamSubjectScope,
  Subject,
} from '../../types/studentOS'

export const EXAM_TITLE_MAX_LENGTH = 120

export type ExamValidationInput = {
  title: string
  examDate: string
  seriesId: string | null
  subjectScopes: ExamSubjectScope[]
}

export type ExamValidationResult =
  | {
      isValid: true
      normalizedTitle: string
      examDate: string
      seriesId: string | null
      subjectScopes: ExamSubjectScope[]
    }
  | {
      isValid: false
      error: string
    }

export function normalizeExamTitle(title: string): string {
  return title.trim().replace(/\s+/g, ' ')
}

export function validateExam(
  input: ExamValidationInput,
  existingSubjects: Subject[],
  existingChapters: Chapter[],
  existingExamSeries: ExamSeries[],
): ExamValidationResult {
  const normalizedTitle = normalizeExamTitle(input.title)

  if (normalizedTitle.length === 0) {
    return {
      isValid: false,
      error: 'Exam title is required',
    }
  }

  if (normalizedTitle.length > EXAM_TITLE_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Exam title must be ${EXAM_TITLE_MAX_LENGTH} characters or fewer`,
    }
  }

  if (!isValidCalendarDate(input.examDate)) {
    return {
      isValid: false,
      error: 'Exam date must be a valid date in YYYY-MM-DD format',
    }
  }

  if (input.examDate < getLocalDateKey(new Date())) {
    return {
      isValid: false,
      error: 'Exam date cannot be in the past.',
    }
  }

  if (
    input.seriesId !== null &&
    !existingExamSeries.some((series) => series.id === input.seriesId)
  ) {
    return {
      isValid: false,
      error: 'Exam series does not exist',
    }
  }

  if (input.subjectScopes.length === 0) {
    return {
      isValid: false,
      error: 'At least one subject is required',
    }
  }

  const selectedSubjectIds = new Set<string>()
  const validatedSubjectScopes: ExamSubjectScope[] = []

  for (const scope of input.subjectScopes) {
    if (selectedSubjectIds.has(scope.subjectId)) {
      return {
        isValid: false,
        error: 'Each subject can only be included once',
      }
    }

    const subjectExists = existingSubjects.some(
      (subject) => subject.id === scope.subjectId,
    )

    if (!subjectExists) {
      return {
        isValid: false,
        error: 'Subject does not exist',
      }
    }

    selectedSubjectIds.add(scope.subjectId)

    if (scope.scopeType !== 'entire' && scope.scopeType !== 'specific') {
      return {
        isValid: false,
        error: 'Subject scope type is invalid',
      }
    }

    if (scope.scopeType === 'entire') {
      validatedSubjectScopes.push({
        subjectId: scope.subjectId,
        scopeType: 'entire',
        chapterIds: existingChapters
          .filter((chapter) => chapter.subjectId === scope.subjectId)
          .map((chapter) => chapter.id),
      })
      continue
    }

    if (scope.chapterIds.length === 0) {
      return {
        isValid: false,
        error: 'Select at least one chapter or choose Entire subject',
      }
    }

    const selectedChapterIds = new Set<string>()

    for (const chapterId of scope.chapterIds) {
      if (selectedChapterIds.has(chapterId)) {
        return {
          isValid: false,
          error: 'Each chapter can only be included once',
        }
      }

      const chapter = existingChapters.find(
        (existingChapter) => existingChapter.id === chapterId,
      )

      if (chapter === undefined) {
        return {
          isValid: false,
          error: 'Chapter does not exist',
        }
      }

      if (chapter.subjectId !== scope.subjectId) {
        return {
          isValid: false,
          error: 'Chapter does not belong to the selected subject',
        }
      }

      selectedChapterIds.add(chapterId)
    }

    validatedSubjectScopes.push({
      subjectId: scope.subjectId,
      scopeType: 'specific',
      chapterIds: [...scope.chapterIds],
    })
  }

  return {
    isValid: true,
    normalizedTitle,
    examDate: input.examDate,
    seriesId: input.seriesId,
    subjectScopes: validatedSubjectScopes,
  }
}

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isValidCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (match === null) {
    return false
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (year === 0 || month < 1 || month > 12 || day < 1) {
    return false
  }

  const daysInMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ]

  return day <= daysInMonth[month - 1]
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}
