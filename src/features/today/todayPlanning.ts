import type {
  Exam,
  ExamSubjectScope,
  Homework,
  StudentOSData,
} from '../../types/studentOS'

export const TODAY_HOMEWORK_WINDOW_DAYS = 7
export const TODAY_EXAM_WINDOW_DAYS = 14

export type TodaySubjectSummary = {
  id: string
  name: string
}

export type TodayChapterSummary = {
  id: string
  name: string
}

export type TodayExamSeriesSummary = {
  id: string
  title: string
}

export type TodayExamScopeSummary = {
  subject: TodaySubjectSummary
  scopeType: 'entire' | 'specific'
  chapterIds: string[]
  chapters: TodayChapterSummary[]
  syllabusSummary: string
  snapshotMatchesCurrentSubject: boolean
  isFrozenSnapshot: boolean
}

export type TodayHomeworkPlanItem = {
  type: 'homework'
  sourceItemId: string
  title: string
  dueDate: string
  subject: TodaySubjectSummary
  chapter: TodayChapterSummary | null
  reason: string
  priorityScore: number
}

export type TodayExamPlanItem = {
  type: 'exam'
  sourceItemId: string
  title: string
  examDate: string
  series: TodayExamSeriesSummary | null
  subjectScopes: TodayExamScopeSummary[]
  reason: string
  priorityScore: number
}

export type TodayPlanItem = TodayHomeworkPlanItem | TodayExamPlanItem

export type TodayPlan = {
  today: string
  items: TodayPlanItem[]
}

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function createTodayPlan(
  data: StudentOSData,
  currentDate: Date,
): TodayPlan {
  const today = getLocalDateKey(currentDate)
  const todayDayNumber = getCalendarDayNumber(today)

  if (todayDayNumber === null) {
    return {
      today,
      items: [],
    }
  }

  const subjectNames = new Map(
    data.subjects.map((subject) => [subject.id, subject.name]),
  )
  const chapterNames = new Map(
    data.chapters.map((chapter) => [chapter.id, chapter.name]),
  )
  const chapterIdsBySubject = createChapterIdsBySubject(data)
  const seriesById = new Map(
    data.examSeries.map((series) => [series.id, series]),
  )
  const items: TodayPlanItem[] = []

  for (const homework of data.homework) {
    const dayDifference = getDayDifference(homework.dueDate, todayDayNumber)

    if (
      homework.isCompleted ||
      dayDifference === null ||
      dayDifference > TODAY_HOMEWORK_WINDOW_DAYS
    ) {
      continue
    }

    items.push(
      createHomeworkPlanItem(homework, dayDifference, subjectNames, chapterNames),
    )
  }

  for (const exam of data.exams) {
    const dayDifference = getDayDifference(exam.examDate, todayDayNumber)

    if (
      dayDifference === null ||
      dayDifference < 0 ||
      dayDifference > TODAY_EXAM_WINDOW_DAYS
    ) {
      continue
    }

    items.push(
      createExamPlanItem(
        exam,
        dayDifference,
        subjectNames,
        chapterNames,
        chapterIdsBySubject,
        seriesById,
      ),
    )
  }

  return {
    today,
    items: sortTodayPlanItems(items),
  }
}

function createHomeworkPlanItem(
  homework: Homework,
  dayDifference: number,
  subjectNames: ReadonlyMap<string, string>,
  chapterNames: ReadonlyMap<string, string>,
): TodayHomeworkPlanItem {
  return {
    type: 'homework',
    sourceItemId: homework.id,
    title: homework.title,
    dueDate: homework.dueDate,
    subject: createSubjectSummary(homework.subjectId, subjectNames),
    chapter: homework.chapterId
      ? {
          id: homework.chapterId,
          name: chapterNames.get(homework.chapterId) ?? 'Unknown chapter',
        }
      : null,
    reason: getHomeworkReason(dayDifference),
    priorityScore: getHomeworkPriorityScore(dayDifference),
  }
}

function createExamPlanItem(
  exam: Exam,
  dayDifference: number,
  subjectNames: ReadonlyMap<string, string>,
  chapterNames: ReadonlyMap<string, string>,
  chapterIdsBySubject: ReadonlyMap<string, ReadonlySet<string>>,
  seriesById: ReadonlyMap<string, { id: string; title: string }>,
): TodayExamPlanItem {
  const series = exam.seriesId ? seriesById.get(exam.seriesId) : undefined

  return {
    type: 'exam',
    sourceItemId: exam.id,
    title: exam.title,
    examDate: exam.examDate,
    series: series
      ? {
          id: series.id,
          title: series.title,
        }
      : null,
    subjectScopes: exam.subjectScopes.map((scope) =>
      createExamScopeSummary(
        scope,
        subjectNames,
        chapterNames,
        chapterIdsBySubject,
      ),
    ),
    reason: getExamReason(dayDifference),
    priorityScore: getExamPriorityScore(dayDifference),
  }
}

function createExamScopeSummary(
  scope: ExamSubjectScope,
  subjectNames: ReadonlyMap<string, string>,
  chapterNames: ReadonlyMap<string, string>,
  chapterIdsBySubject: ReadonlyMap<string, ReadonlySet<string>>,
): TodayExamScopeSummary {
  const currentChapterIds = chapterIdsBySubject.get(scope.subjectId)
  const snapshotMatchesCurrentSubject =
    scope.scopeType === 'entire' &&
    scope.chapterIds.length === (currentChapterIds?.size ?? 0) &&
    scope.chapterIds.every((chapterId) => currentChapterIds?.has(chapterId))
  const chapters = scope.chapterIds.map((chapterId) => ({
    id: chapterId,
    name: chapterNames.get(chapterId) ?? 'Unknown chapter',
  }))
  const savedChapterNames = chapters.map((chapter) => chapter.name).join(', ')

  return {
    subject: createSubjectSummary(scope.subjectId, subjectNames),
    scopeType: scope.scopeType,
    chapterIds: [...scope.chapterIds],
    chapters,
    syllabusSummary: snapshotMatchesCurrentSubject
      ? 'Entire subject'
      : savedChapterNames ||
        (scope.scopeType === 'entire'
          ? 'No saved chapters'
          : 'No chapters selected'),
    snapshotMatchesCurrentSubject,
    isFrozenSnapshot:
      scope.scopeType === 'entire' && !snapshotMatchesCurrentSubject,
  }
}

function createSubjectSummary(
  subjectId: string,
  subjectNames: ReadonlyMap<string, string>,
): TodaySubjectSummary {
  return {
    id: subjectId,
    name: subjectNames.get(subjectId) ?? 'Unknown subject',
  }
}

function createChapterIdsBySubject(
  data: StudentOSData,
): Map<string, ReadonlySet<string>> {
  const chapterIdsBySubject = new Map<string, Set<string>>()

  for (const chapter of data.chapters) {
    const subjectChapterIds = chapterIdsBySubject.get(chapter.subjectId)

    if (subjectChapterIds) {
      subjectChapterIds.add(chapter.id)
    } else {
      chapterIdsBySubject.set(chapter.subjectId, new Set([chapter.id]))
    }
  }

  return chapterIdsBySubject
}

function getHomeworkReason(dayDifference: number): string {
  if (dayDifference < 0) {
    const overdueDays = Math.abs(dayDifference)

    return `Overdue by ${overdueDays} ${overdueDays === 1 ? 'day' : 'days'}`
  }

  if (dayDifference === 0) {
    return 'Due today'
  }

  if (dayDifference === 1) {
    return 'Due tomorrow'
  }

  return `Due in ${dayDifference} days`
}

function getExamReason(dayDifference: number): string {
  if (dayDifference === 0) {
    return 'Exam today'
  }

  if (dayDifference === 1) {
    return 'Exam tomorrow'
  }

  return `Exam in ${dayDifference} days`
}

function getHomeworkPriorityScore(dayDifference: number): number {
  if (dayDifference < 0) {
    return 0
  }

  if (dayDifference === 0) {
    return 1
  }

  if (dayDifference === 1) {
    return 3
  }

  if (dayDifference <= 3) {
    return 5
  }

  return 6
}

function getExamPriorityScore(dayDifference: number): number {
  if (dayDifference === 0) {
    return 0
  }

  if (dayDifference === 1) {
    return 2
  }

  if (dayDifference <= 3) {
    return 4
  }

  return 6
}

function getDayDifference(
  dateKey: string,
  todayDayNumber: number,
): number | null {
  const dayNumber = getCalendarDayNumber(dateKey)

  return dayNumber === null ? null : dayNumber - todayDayNumber
}

function getCalendarDayNumber(dateKey: string): number | null {
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey)

  if (!dateParts) {
    return null
  }

  const year = Number(dateParts[1])
  const month = Number(dateParts[2])
  const day = Number(dateParts[3])
  const calendarDate = new Date(0)

  calendarDate.setUTCHours(0, 0, 0, 0)
  calendarDate.setUTCFullYear(year, month - 1, day)

  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    return null
  }

  return calendarDate.getTime() / 86_400_000
}

function sortTodayPlanItems(items: TodayPlanItem[]): TodayPlanItem[] {
  return items
    .map((item, index) => ({ item, index }))
    .toSorted((first, second) => {
      const priorityDifference =
        first.item.priorityScore - second.item.priorityScore

      if (priorityDifference !== 0) {
        return priorityDifference
      }

      const dateDifference = getPlanItemDate(first.item).localeCompare(
        getPlanItemDate(second.item),
      )

      if (dateDifference !== 0) {
        return dateDifference
      }

      if (first.item.type !== second.item.type) {
        return first.item.type === 'homework' ? -1 : 1
      }

      return first.index - second.index
    })
    .map(({ item }) => item)
}

function getPlanItemDate(item: TodayPlanItem): string {
  return item.type === 'homework' ? item.dueDate : item.examDate
}
