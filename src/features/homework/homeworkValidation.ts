import type { Chapter, Subject } from '../../types/studentOS'

export const HOMEWORK_TITLE_MAX_LENGTH = 120

export type HomeworkValidationInput = {
  title: string
  subjectId: string
  chapterId: string | null
  dueDate: string
}

export type HomeworkValidationResult =
  | {
      isValid: true
      normalizedTitle: string
      subjectId: string
      chapterId: string | null
      dueDate: string
    }
  | {
      isValid: false
      error: string
    }

export function normalizeHomeworkTitle(title: string): string {
  return title.trim().replace(/\s+/g, ' ')
}

export function validateHomework(
  input: HomeworkValidationInput,
  existingSubjects: Subject[],
  existingChapters: Chapter[],
): HomeworkValidationResult {
  const normalizedTitle = normalizeHomeworkTitle(input.title)

  if (normalizedTitle.length === 0) {
    return {
      isValid: false,
      error: 'Homework title is required',
    }
  }

  if (normalizedTitle.length > HOMEWORK_TITLE_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Homework title must be ${HOMEWORK_TITLE_MAX_LENGTH} characters or fewer`,
    }
  }

  if (input.subjectId.trim().length === 0) {
    return {
      isValid: false,
      error: 'Subject is required',
    }
  }

  const subjectExists = existingSubjects.some(
    (subject) => subject.id === input.subjectId,
  )

  if (!subjectExists) {
    return {
      isValid: false,
      error: 'Subject does not exist',
    }
  }

  if (input.chapterId !== null) {
    const chapter = existingChapters.find(
      (existingChapter) => existingChapter.id === input.chapterId,
    )

    if (chapter === undefined) {
      return {
        isValid: false,
        error: 'Chapter does not exist',
      }
    }

    if (chapter.subjectId !== input.subjectId) {
      return {
        isValid: false,
        error: 'Chapter does not belong to the selected subject',
      }
    }
  }

  if (!isValidCalendarDate(input.dueDate)) {
    return {
      isValid: false,
      error: 'Due date must be a valid date in YYYY-MM-DD format',
    }
  }

  if (input.dueDate < getLocalDateKey(new Date())) {
    return {
      isValid: false,
      error: 'Due date cannot be in the past.',
    }
  }

  return {
    isValid: true,
    normalizedTitle,
    subjectId: input.subjectId,
    chapterId: input.chapterId,
    dueDate: input.dueDate,
  }
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

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
