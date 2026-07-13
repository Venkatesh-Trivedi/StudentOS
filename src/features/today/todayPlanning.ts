import type {
  Exam,
  ExamSubjectScope,
  Homework,
  Resource,
  RevisionTask,
  StudentOSData,
} from '../../types/studentOS'

export const TODAY_HOMEWORK_WINDOW_DAYS = 7
export const TODAY_EXAM_WINDOW_DAYS = 14
export const TODAY_REVISION_WINDOW_DAYS = 7

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

export type TodayResourceSummary = {
  id: string
  subjectId: string
  chapterId: string | null
  type: 'link' | 'note'
  title: string
  url: string | null
  content: string | null
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
  resources: TodayResourceSummary[]
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
  resources: TodayResourceSummary[]
  reason: string
  priorityScore: number
}

export type TodayScheduledRevisionPlanItem = {
  type: 'revision'
  revisionKind: 'scheduled'
  sourceItemId: string
  taskId: string
  title: string
  scheduledDate: string
  subject: TodaySubjectSummary
  chapter: TodayChapterSummary
  resources: TodayResourceSummary[]
  reason: string
  priorityScore: number
}

export type TodayConfidenceRevisionPlanItem = {
  type: 'revision'
  revisionKind: 'recommendation'
  sourceItemId: string
  taskId: null
  title: string
  scheduledDate: null
  subject: TodaySubjectSummary
  chapter: TodayChapterSummary
  resources: TodayResourceSummary[]
  reason: string
  priorityScore: number
}

export type TodayRevisionPlanItem =
  | TodayScheduledRevisionPlanItem
  | TodayConfidenceRevisionPlanItem

export type TodayPlanItem =
  | TodayHomeworkPlanItem
  | TodayExamPlanItem
  | TodayRevisionPlanItem

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
  const chaptersById = new Map(
    data.chapters.map((chapter) => [chapter.id, chapter]),
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
      createHomeworkPlanItem(
        homework,
        dayDifference,
        subjectNames,
        chapterNames,
        data.resources,
      ),
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
        data.resources,
      ),
    )
  }

  const representedRevisionChapterIds = new Set<string>()
  const chaptersWithUpcomingRevisionTasks = new Set<string>()

  for (const revisionTask of data.revisionTasks) {
    if (revisionTask.isCompleted) {
      continue
    }

    const dayDifference = getDayDifference(
      revisionTask.scheduledDate,
      todayDayNumber,
    )

    if (
      dayDifference !== null &&
      dayDifference >= 0 &&
      dayDifference <= TODAY_REVISION_WINDOW_DAYS
    ) {
      chaptersWithUpcomingRevisionTasks.add(revisionTask.chapterId)
    }

    if (
      dayDifference === null ||
      dayDifference > TODAY_REVISION_WINDOW_DAYS
    ) {
      continue
    }

    const chapter = chaptersById.get(revisionTask.chapterId)

    if (!chapter) {
      continue
    }

    items.push(
      createScheduledRevisionPlanItem(
        revisionTask,
        dayDifference,
        chapter,
        subjectNames,
        data.resources,
      ),
    )
    representedRevisionChapterIds.add(revisionTask.chapterId)
  }

  const confidenceByChapterId = new Map(
    data.chapterConfidences.map((confidence) => [
      confidence.chapterId,
      confidence,
    ]),
  )
  let recommendationCount = 0

  for (const chapter of data.chapters) {
    if (recommendationCount >= 2) {
      break
    }

    if (
      confidenceByChapterId.get(chapter.id)?.level !== 'low' ||
      chaptersWithUpcomingRevisionTasks.has(chapter.id) ||
      representedRevisionChapterIds.has(chapter.id)
    ) {
      continue
    }

    items.push(
      createConfidenceRevisionPlanItem(
        chapter,
        subjectNames,
        data.resources,
      ),
    )
    representedRevisionChapterIds.add(chapter.id)
    recommendationCount += 1
  }

  return {
    today,
    items: sortTodayPlanItems(items),
  }
}

function createScheduledRevisionPlanItem(
  revisionTask: RevisionTask,
  dayDifference: number,
  chapter: { id: string; subjectId: string; name: string },
  subjectNames: ReadonlyMap<string, string>,
  resources: readonly Resource[],
): TodayScheduledRevisionPlanItem {
  return {
    type: 'revision',
    revisionKind: 'scheduled',
    sourceItemId: revisionTask.id,
    taskId: revisionTask.id,
    title: chapter.name,
    scheduledDate: revisionTask.scheduledDate,
    subject: createSubjectSummary(chapter.subjectId, subjectNames),
    chapter: {
      id: chapter.id,
      name: chapter.name,
    },
    resources: selectChapterResources(resources, chapter.id, chapter.subjectId),
    reason: getRevisionReason(dayDifference),
    priorityScore: getRevisionPriorityScore(dayDifference),
  }
}

function createConfidenceRevisionPlanItem(
  chapter: { id: string; subjectId: string; name: string },
  subjectNames: ReadonlyMap<string, string>,
  resources: readonly Resource[],
): TodayConfidenceRevisionPlanItem {
  return {
    type: 'revision',
    revisionKind: 'recommendation',
    sourceItemId: chapter.id,
    taskId: null,
    title: chapter.name,
    scheduledDate: null,
    subject: createSubjectSummary(chapter.subjectId, subjectNames),
    chapter: {
      id: chapter.id,
      name: chapter.name,
    },
    resources: selectChapterResources(resources, chapter.id, chapter.subjectId),
    reason: 'Low confidence — worth revising',
    priorityScore: 12,
  }
}

function createHomeworkPlanItem(
  homework: Homework,
  dayDifference: number,
  subjectNames: ReadonlyMap<string, string>,
  chapterNames: ReadonlyMap<string, string>,
  resources: readonly Resource[],
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
    resources: selectHomeworkResources(resources, homework),
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
  resources: readonly Resource[],
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
    resources: selectExamResources(resources, exam.subjectScopes),
    reason: getExamReason(dayDifference),
    priorityScore: getExamPriorityScore(dayDifference),
  }
}

function selectHomeworkResources(
  resources: readonly Resource[],
  homework: Homework,
): TodayResourceSummary[] {
  if (!homework.chapterId) {
    return []
  }

  const chapterResources = selectResources(
    resources,
    (resource) =>
      resource.subjectId === homework.subjectId &&
      resource.chapterId === homework.chapterId,
    2,
  )

  if (chapterResources.length > 0) {
    return chapterResources
  }

  return selectResources(
    resources,
    (resource) =>
      resource.subjectId === homework.subjectId && resource.chapterId === null,
    2,
  )
}

function selectChapterResources(
  resources: readonly Resource[],
  chapterId: string,
  subjectId: string,
): TodayResourceSummary[] {
  return selectResources(
    resources,
    (resource) =>
      resource.subjectId === subjectId && resource.chapterId === chapterId,
    2,
  )
}

function selectExamResources(
  resources: readonly Resource[],
  subjectScopes: readonly ExamSubjectScope[],
): TodayResourceSummary[] {
  const subjectIds = new Set<string>()
  const savedChapterIdsBySubject = new Map<string, Set<string>>()

  for (const scope of subjectScopes) {
    subjectIds.add(scope.subjectId)

    const savedChapterIds = savedChapterIdsBySubject.get(scope.subjectId)

    if (savedChapterIds) {
      for (const chapterId of scope.chapterIds) {
        savedChapterIds.add(chapterId)
      }
    } else {
      savedChapterIdsBySubject.set(
        scope.subjectId,
        new Set(scope.chapterIds),
      )
    }
  }

  const selectedResources: TodayResourceSummary[] = []
  const selectedResourceIds = new Set<string>()

  addExamResources(
    resources,
    (resource) =>
      resource.chapterId !== null &&
      (savedChapterIdsBySubject
        .get(resource.subjectId)
        ?.has(resource.chapterId) ?? false),
    selectedResources,
    selectedResourceIds,
  )
  addExamResources(
    resources,
    (resource) =>
      resource.chapterId === null && subjectIds.has(resource.subjectId),
    selectedResources,
    selectedResourceIds,
  )

  return selectedResources
}

function addExamResources(
  resources: readonly Resource[],
  isRelevant: (resource: Resource) => boolean,
  selectedResources: TodayResourceSummary[],
  selectedResourceIds: Set<string>,
): void {
  for (const resource of resources) {
    if (selectedResources.length >= 3) {
      return
    }

    if (!isRelevant(resource) || selectedResourceIds.has(resource.id)) {
      continue
    }

    selectedResources.push(createResourceSummary(resource))
    selectedResourceIds.add(resource.id)
  }
}

function selectResources(
  resources: readonly Resource[],
  isRelevant: (resource: Resource) => boolean,
  limit: number,
): TodayResourceSummary[] {
  const selectedResources: TodayResourceSummary[] = []
  const selectedResourceIds = new Set<string>()

  for (const resource of resources) {
    if (selectedResources.length >= limit) {
      break
    }

    if (!isRelevant(resource) || selectedResourceIds.has(resource.id)) {
      continue
    }

    selectedResources.push(createResourceSummary(resource))
    selectedResourceIds.add(resource.id)
  }

  return selectedResources
}

function createResourceSummary(resource: Resource): TodayResourceSummary {
  return {
    id: resource.id,
    subjectId: resource.subjectId,
    chapterId: resource.chapterId,
    type: resource.type,
    title: resource.title,
    url: resource.url,
    content: resource.content,
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

function getRevisionReason(dayDifference: number): string {
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

function getHomeworkPriorityScore(dayDifference: number): number {
  if (dayDifference < 0) {
    return 1
  }

  if (dayDifference === 0) {
    return 3
  }

  if (dayDifference === 1) {
    return 6
  }

  if (dayDifference <= 3) {
    return 9
  }

  return 11
}

function getExamPriorityScore(dayDifference: number): number {
  if (dayDifference === 0) {
    return 0
  }

  if (dayDifference === 1) {
    return 5
  }

  if (dayDifference <= 3) {
    return 8
  }

  return 11
}

function getRevisionPriorityScore(dayDifference: number): number {
  if (dayDifference < 0) {
    return 2
  }

  if (dayDifference === 0) {
    return 4
  }

  if (dayDifference === 1) {
    return 7
  }

  if (dayDifference <= 3) {
    return 10
  }

  return 11
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

      const typeDifference =
        getPlanItemTypeOrder(first.item) - getPlanItemTypeOrder(second.item)

      if (typeDifference !== 0) {
        return typeDifference
      }

      return first.index - second.index
    })
    .map(({ item }) => item)
}

function getPlanItemDate(item: TodayPlanItem): string {
  if (item.type === 'homework') {
    return item.dueDate
  }

  if (item.type === 'exam') {
    return item.examDate
  }

  return item.scheduledDate ?? '9999-12-31'
}

function getPlanItemTypeOrder(item: TodayPlanItem): number {
  if (item.type === 'homework') {
    return 0
  }

  if (item.type === 'exam') {
    return 1
  }

  return 2
}
