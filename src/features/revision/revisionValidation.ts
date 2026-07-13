import type { Chapter, RevisionTask } from '../../types/studentOS'

export type RevisionTaskValidationResult =
  | {
      isValid: true
      chapterId: string
      scheduledDate: string
    }
  | {
      isValid: false
      error: string
    }

export function validateRevisionTask(
  chapterId: string,
  scheduledDate: string,
  existingChapters: Chapter[],
  existingRevisionTasks: RevisionTask[],
): RevisionTaskValidationResult {
  const chapterExists = existingChapters.some(
    (chapter) => chapter.id === chapterId,
  )

  if (!chapterExists) {
    return {
      isValid: false,
      error: 'Chapter does not exist',
    }
  }

  if (!isValidCalendarDate(scheduledDate)) {
    return {
      isValid: false,
      error: 'Revision date must be a valid date in YYYY-MM-DD format',
    }
  }

  if (scheduledDate < getLocalDateKey(new Date())) {
    return {
      isValid: false,
      error: 'Revision date cannot be in the past.',
    }
  }

  const duplicateExists = existingRevisionTasks.some(
    (revisionTask) =>
      revisionTask.chapterId === chapterId &&
      revisionTask.scheduledDate === scheduledDate &&
      !revisionTask.isCompleted,
  )

  if (duplicateExists) {
    return {
      isValid: false,
      error: 'An incomplete revision is already scheduled for this chapter on this date',
    }
  }

  return {
    isValid: true,
    chapterId,
    scheduledDate,
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
