import { useRef, useState, type FormEvent } from 'react'

import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import type {
  Chapter,
  Exam,
  ExamSeries,
  ExamSubjectScope,
  Subject,
} from '../../types/studentOS'
import type { ExamCreationInput } from './examService'

export type ExamsScreenProps = {
  exams: Exam[]
  examSeries: ExamSeries[]
  subjects: Subject[]
  chapters: Chapter[]
  onCreateExam: (input: ExamCreationInput) => string | null
  onDeleteExam: (examId: string) => string | null
  onCreateExamSeries: (title: string) => string | null
  onRenameExamSeries: (seriesId: string, title: string) => string | null
  onDeleteExamSeries: (seriesId: string) => string | null
}

type ExamGroup = {
  heading: string
  items: Exam[]
}

type ExamGroupsProps = {
  exams: Exam[]
  idPrefix: string
  headingLevel?: 'h2' | 'h3'
  today: string
  subjects: Subject[]
  chapters: Chapter[]
  examSeries: ExamSeries[]
  onRequestDelete: (exam: Exam) => void
}

type ScopeMode = 'entire' | 'specific'

type SubjectScopeDraft = {
  key: number
  subjectId: string
  mode: ScopeMode
  chapterIds: string[]
}

type ExamCreationFormProps = {
  initialSeriesId: string | null
  subjects: Subject[]
  chapters: Chapter[]
  examSeries: ExamSeries[]
  onCancel: () => void
  onCreateExam: (input: ExamCreationInput) => string | null
  onCreated: () => void
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getCalendarDayNumber(dateKey: string): number {
  const [year, month, day] = dateKey.split('-').map(Number)
  const calendarDate = new Date(0)

  calendarDate.setUTCHours(0, 0, 0, 0)
  calendarDate.setUTCFullYear(year, month - 1, day)

  return calendarDate.getTime() / 86_400_000
}

function formatExamDate(examDate: string): string {
  const [year, month, day] = examDate.split('-').map(Number)
  const localDate = new Date()

  localDate.setHours(0, 0, 0, 0)
  localDate.setFullYear(year, month - 1, day)

  return localDate.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatCountdown(examDate: string, today: string): string {
  const dayDifference =
    getCalendarDayNumber(examDate) - getCalendarDayNumber(today)

  if (dayDifference === 0) {
    return 'Today'
  }

  if (dayDifference === 1) {
    return 'Tomorrow'
  }

  if (dayDifference > 1) {
    return `In ${dayDifference} days`
  }

  const daysAgo = Math.abs(dayDifference)

  return `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`
}

function groupExams(exams: Exam[], today: string): ExamGroup[] {
  const nearestFirst = (first: Exam, second: Exam) =>
    first.examDate.localeCompare(second.examDate) ||
    first.createdAt.localeCompare(second.createdAt)
  const mostRecentFirst = (first: Exam, second: Exam) =>
    second.examDate.localeCompare(first.examDate) ||
    second.createdAt.localeCompare(first.createdAt)

  return [
    {
      heading: 'Today',
      items: exams
        .filter((exam) => exam.examDate === today)
        .toSorted(nearestFirst),
    },
    {
      heading: 'Upcoming',
      items: exams
        .filter((exam) => exam.examDate > today)
        .toSorted(nearestFirst),
    },
    {
      heading: 'Past exams',
      items: exams
        .filter((exam) => exam.examDate < today)
        .toSorted(mostRecentFirst),
    },
  ]
}

function ExamGroups({
  exams,
  idPrefix,
  headingLevel = 'h3',
  today,
  subjects,
  chapters,
  examSeries,
  onRequestDelete,
}: ExamGroupsProps) {
  const GroupHeading = headingLevel
  const subjectNames = new Map(subjects.map((subject) => [subject.id, subject.name]))
  const chapterNames = new Map(chapters.map((chapter) => [chapter.id, chapter.name]))
  const seriesNames = new Map(
    examSeries.map((series) => [series.id, series.title]),
  )

  return (
    <div className="exam-groups">
      {groupExams(exams, today).map((group) =>
        group.items.length > 0 ? (
          <section
            className="exam-group"
            key={group.heading}
            aria-labelledby={`${idPrefix}-${group.heading
              .toLowerCase()
              .replace(' ', '-')}`}
          >
            <div className="exam-group-heading">
              <GroupHeading
                id={`${idPrefix}-${group.heading
                  .toLowerCase()
                  .replace(' ', '-')}`}
              >
                {group.heading}
              </GroupHeading>
              <span>
                {group.items.length}{' '}
                {group.items.length === 1 ? 'exam' : 'exams'}
              </span>
            </div>

            <ul className="exam-list">
              {group.items.map((exam) => {
                const seriesName = exam.seriesId
                  ? seriesNames.get(exam.seriesId)
                  : null

                return (
                  <li className="exam-card" key={exam.id}>
                    <div className="exam-card-heading">
                      <div>
                        <h4>{exam.title}</h4>
                        {seriesName ? (
                          <p className="exam-card-series">{seriesName}</p>
                        ) : null}
                      </div>
                      <button
                        aria-label={`Delete exam ${exam.title}`}
                        className="button button-danger button-compact"
                        type="button"
                        onClick={() => onRequestDelete(exam)}
                      >
                        Delete
                      </button>
                    </div>

                    <p className="exam-card-date">
                      <time dateTime={exam.examDate}>
                        {formatExamDate(exam.examDate)}
                      </time>
                      <span aria-hidden="true">&middot;</span>
                      <span>{formatCountdown(exam.examDate, today)}</span>
                    </p>

                    <ul className="exam-scope-summary">
                      {exam.subjectScopes.map((scope) => {
                        const currentChapterIds = new Set(
                          chapters
                            .filter(
                              (chapter) =>
                                chapter.subjectId === scope.subjectId,
                            )
                            .map((chapter) => chapter.id),
                        )
                        const snapshotMatchesCurrentSubject =
                          scope.scopeType === 'entire' &&
                          scope.chapterIds.length === currentChapterIds.size &&
                          scope.chapterIds.every((chapterId) =>
                            currentChapterIds.has(chapterId),
                          )
                        const savedChapterNames = scope.chapterIds
                          .map(
                            (chapterId) =>
                              chapterNames.get(chapterId) ?? 'Unknown chapter',
                          )
                          .join(', ')
                        const chapterSummary = snapshotMatchesCurrentSubject
                            ? 'Entire subject'
                            : scope.scopeType === 'entire'
                            ? savedChapterNames
                              ? savedChapterNames
                              : 'Saved syllabus: no chapters'
                            : savedChapterNames

                        return (
                          <li key={scope.subjectId}>
                            <strong>
                              {subjectNames.get(scope.subjectId) ??
                                'Unknown subject'}
                              {scope.scopeType === 'entire' &&
                              !snapshotMatchesCurrentSubject ? (
                                <span className="exam-original-syllabus-badge">
                                  Original syllabus
                                </span>
                              ) : null}
                            </strong>
                            <span>{chapterSummary || 'No chapters selected'}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null,
      )}
    </div>
  )
}

function createEmptyScopeDraft(key: number): SubjectScopeDraft {
  return {
    key,
    subjectId: '',
    mode: 'entire',
    chapterIds: [],
  }
}

function ExamCreationForm({
  initialSeriesId,
  subjects,
  chapters,
  examSeries,
  onCancel,
  onCreateExam,
  onCreated,
}: ExamCreationFormProps) {
  const nextScopeKey = useRef(1)
  const [title, setTitle] = useState('')
  const [examDate, setExamDate] = useState('')
  const [seriesId, setSeriesId] = useState(initialSeriesId ?? '')
  const [scopeDrafts, setScopeDrafts] = useState<SubjectScopeDraft[]>([
    createEmptyScopeDraft(0),
  ])
  const [formError, setFormError] = useState<string | null>(null)
  const today = getLocalDateKey(new Date())

  function updateScope(
    scopeKey: number,
    update: (scope: SubjectScopeDraft) => SubjectScopeDraft,
  ) {
    setScopeDrafts((currentScopes) =>
      currentScopes.map((scope) =>
        scope.key === scopeKey ? update(scope) : scope,
      ),
    )
    setFormError(null)
  }

  function addScope() {
    const newScopeKey = nextScopeKey.current

    nextScopeKey.current += 1
    setScopeDrafts((currentScopes) => [
      ...currentScopes,
      createEmptyScopeDraft(newScopeKey),
    ])
    setFormError(null)
  }

  function removeScope(scopeKey: number) {
    setScopeDrafts((currentScopes) =>
      currentScopes.length === 1
        ? currentScopes
        : currentScopes.filter((scope) => scope.key !== scopeKey),
    )
    setFormError(null)
  }

  function toggleChapter(scopeKey: number, chapterId: string) {
    updateScope(scopeKey, (scope) => ({
      ...scope,
      chapterIds: scope.chapterIds.includes(chapterId)
        ? scope.chapterIds.filter((currentId) => currentId !== chapterId)
        : [...scope.chapterIds, chapterId],
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const subjectScopes: ExamSubjectScope[] = scopeDrafts.map((scope) => ({
      subjectId: scope.subjectId,
      scopeType: scope.mode,
      chapterIds:
        scope.mode === 'entire'
          ? chapters
              .filter((chapter) => chapter.subjectId === scope.subjectId)
              .map((chapter) => chapter.id)
          : [...scope.chapterIds],
    }))
    const creationError = onCreateExam({
      title,
      examDate,
      seriesId: seriesId || null,
      subjectScopes,
    })

    if (creationError) {
      setFormError(creationError)
      return
    }

    onCreated()
  }

  return (
    <form className="inline-form exam-form" onSubmit={handleSubmit}>
      <div className="exam-form-grid">
        <div className="exam-form-field exam-title-field">
          <label htmlFor="exam-title">Title</label>
          <input
            aria-describedby={formError ? 'exam-form-error' : undefined}
            autoFocus
            id="exam-title"
            maxLength={120}
            placeholder="For example, JEE Mock Test 4"
            type="text"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value)
              setFormError(null)
            }}
          />
        </div>

        <div className="exam-form-field">
          <label htmlFor="exam-date">Exam date</label>
          <input
            aria-describedby={formError ? 'exam-form-error' : undefined}
            id="exam-date"
            min={today}
            type="date"
            value={examDate}
            onChange={(event) => {
              setExamDate(event.target.value)
              setFormError(null)
            }}
          />
        </div>

        <div className="exam-form-field">
          <label htmlFor="exam-series">Exam series (optional)</label>
          <select
            aria-describedby={formError ? 'exam-form-error' : undefined}
            id="exam-series"
            value={seriesId}
            onChange={(event) => {
              setSeriesId(event.target.value)
              setFormError(null)
            }}
          >
            <option value="">Standalone exam</option>
            {examSeries.map((series) => (
              <option key={series.id} value={series.id}>
                {series.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="exam-scopes" aria-labelledby="exam-scopes-heading">
        <div className="exam-scopes-heading">
          <div>
            <h3 id="exam-scopes-heading">Subjects and syllabus</h3>
            <p>Add every subject covered by this exam.</p>
          </div>
          <button
            className="button button-secondary button-compact"
            disabled={
              subjects.length === 0 || scopeDrafts.length >= subjects.length
            }
            type="button"
            onClick={addScope}
          >
            Add another subject
          </button>
        </div>

        <div className="exam-scope-sections">
          {scopeDrafts.map((scope, scopeIndex) => {
            const availableChapters = chapters.filter(
              (chapter) => chapter.subjectId === scope.subjectId,
            )

            return (
              <fieldset className="exam-scope-section" key={scope.key}>
                <legend>Subject {scopeIndex + 1}</legend>

                <div className="exam-scope-section-heading">
                  <label htmlFor={`exam-scope-subject-${scope.key}`}>
                    Subject
                  </label>
                  <button
                    aria-label={`Remove subject ${scopeIndex + 1}`}
                    className="button button-secondary button-compact"
                    disabled={scopeDrafts.length === 1}
                    type="button"
                    onClick={() => removeScope(scope.key)}
                  >
                    Remove
                  </button>
                </div>

                <select
                  aria-describedby={formError ? 'exam-form-error' : undefined}
                  id={`exam-scope-subject-${scope.key}`}
                  value={scope.subjectId}
                  onChange={(event) =>
                    updateScope(scope.key, (currentScope) => ({
                      ...currentScope,
                      subjectId: event.target.value,
                      chapterIds: [],
                    }))
                  }
                >
                  <option value="">Choose a subject</option>
                  {subjects.map((subject) => {
                    const isSelectedElsewhere = scopeDrafts.some(
                      (otherScope) =>
                        otherScope.key !== scope.key &&
                        otherScope.subjectId === subject.id,
                    )

                    return (
                      <option
                        disabled={isSelectedElsewhere}
                        key={subject.id}
                        value={subject.id}
                      >
                        {subject.name}
                      </option>
                    )
                  })}
                </select>

                <fieldset className="exam-syllabus-choice">
                  <legend>Syllabus</legend>
                  <label>
                    <input
                      checked={scope.mode === 'entire'}
                      name={`exam-syllabus-${scope.key}`}
                      type="radio"
                      value="entire"
                      onChange={() =>
                        updateScope(scope.key, (currentScope) => ({
                          ...currentScope,
                          mode: 'entire',
                          chapterIds: [],
                        }))
                      }
                    />
                    Entire subject
                  </label>
                  <label>
                    <input
                      checked={scope.mode === 'specific'}
                      name={`exam-syllabus-${scope.key}`}
                      type="radio"
                      value="specific"
                      onChange={() =>
                        updateScope(scope.key, (currentScope) => ({
                          ...currentScope,
                          mode: 'specific',
                        }))
                      }
                    />
                    Specific chapters
                  </label>
                </fieldset>

                {scope.mode === 'specific' ? (
                  <div className="exam-chapter-choices">
                    <p>Choose chapters</p>
                    {!scope.subjectId ? (
                      <p className="exam-scope-hint">
                        Choose a subject to see its chapters.
                      </p>
                    ) : availableChapters.length === 0 ? (
                      <p className="exam-scope-hint">
                        This subject has no chapters yet.
                      </p>
                    ) : (
                      <div className="exam-chapter-checkboxes">
                        {availableChapters.map((chapter) => (
                          <label key={chapter.id}>
                            <input
                              checked={scope.chapterIds.includes(chapter.id)}
                              type="checkbox"
                              onChange={() =>
                                toggleChapter(scope.key, chapter.id)
                              }
                            />
                            {chapter.name}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </fieldset>
            )
          })}
        </div>
      </div>

      {formError ? (
        <p className="form-error" id="exam-form-error" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="form-actions exam-form-actions">
        <button className="button button-primary" type="submit">
          Save exam
        </button>
        <button
          className="button button-secondary"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export function ExamsScreen({
  exams,
  examSeries,
  subjects,
  chapters,
  onCreateExam,
  onDeleteExam,
  onCreateExamSeries,
  onRenameExamSeries,
  onDeleteExamSeries,
}: ExamsScreenProps) {
  const [activeSeriesId, setActiveSeriesId] = useState<string | null>(null)
  const [isExamFormOpen, setIsExamFormOpen] = useState(false)
  const [examFormSeriesId, setExamFormSeriesId] = useState<string | null>(null)
  const [isSeriesFormOpen, setIsSeriesFormOpen] = useState(false)
  const [seriesTitle, setSeriesTitle] = useState('')
  const [seriesFormError, setSeriesFormError] = useState<string | null>(null)
  const [renamingSeriesId, setRenamingSeriesId] = useState<string | null>(null)
  const [renameTitle, setRenameTitle] = useState('')
  const [renameError, setRenameError] = useState<string | null>(null)
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null)
  const [seriesToDelete, setSeriesToDelete] = useState<ExamSeries | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const today = getLocalDateKey(new Date())
  const activeSeries = activeSeriesId
    ? examSeries.find((series) => series.id === activeSeriesId) ?? null
    : null
  const activeSeriesExams = activeSeries
    ? exams.filter((exam) => exam.seriesId === activeSeries.id)
    : []
  const standaloneExams = exams.filter((exam) => exam.seriesId === null)

  function closeTransientForms() {
    setIsExamFormOpen(false)
    setIsSeriesFormOpen(false)
    setSeriesTitle('')
    setSeriesFormError(null)
    setRenamingSeriesId(null)
    setRenameTitle('')
    setRenameError(null)
  }

  function openExamForm(preselectedSeriesId: string | null) {
    setExamFormSeriesId(preselectedSeriesId)
    setIsExamFormOpen(true)
    setIsSeriesFormOpen(false)
    setSeriesFormError(null)
    setRenamingSeriesId(null)
    setRenameError(null)
    setActionError(null)
  }

  function openSeriesForm() {
    setIsSeriesFormOpen(true)
    setIsExamFormOpen(false)
    setRenamingSeriesId(null)
    setRenameError(null)
    setActionError(null)
  }

  function handleCreateSeries(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const creationError = onCreateExamSeries(seriesTitle)

    if (creationError) {
      setSeriesFormError(creationError)
      return
    }

    setSeriesTitle('')
    setSeriesFormError(null)
    setActionError(null)
    setIsSeriesFormOpen(false)
  }

  function beginRenameSeries(series: ExamSeries) {
    setRenamingSeriesId(series.id)
    setRenameTitle(series.title)
    setRenameError(null)
    setIsSeriesFormOpen(false)
    setIsExamFormOpen(false)
    setActionError(null)
  }

  function handleRenameSeries(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!renamingSeriesId) {
      return
    }

    const renamingError = onRenameExamSeries(renamingSeriesId, renameTitle)

    if (renamingError) {
      setRenameError(renamingError)
      return
    }

    setRenamingSeriesId(null)
    setRenameTitle('')
    setRenameError(null)
    setActionError(null)
  }

  function openSeries(series: ExamSeries) {
    closeTransientForms()
    setActiveSeriesId(series.id)
    setActionError(null)
  }

  function handleConfirmDeleteExam() {
    if (!examToDelete) {
      return
    }

    setActionError(onDeleteExam(examToDelete.id))
    setExamToDelete(null)
  }

  function handleConfirmDeleteSeries() {
    if (!seriesToDelete) {
      return
    }

    const deletionError = onDeleteExamSeries(seriesToDelete.id)

    setActionError(deletionError)

    if (!deletionError && activeSeriesId === seriesToDelete.id) {
      setActiveSeriesId(null)
    }

    setSeriesToDelete(null)
  }

  const examForm = isExamFormOpen ? (
    <ExamCreationForm
      key={examFormSeriesId ?? 'standalone'}
      chapters={chapters}
      examSeries={examSeries}
      initialSeriesId={examFormSeriesId}
      subjects={subjects}
      onCancel={() => setIsExamFormOpen(false)}
      onCreateExam={onCreateExam}
      onCreated={() => {
        setActionError(null)
        setIsExamFormOpen(false)
      }}
    />
  ) : null

  return (
    <section className="screen exams-screen" aria-labelledby="exams-heading">
      {activeSeries ? (
        <>
          <button
            className="back-button"
            type="button"
            onClick={() => {
              closeTransientForms()
              setActiveSeriesId(null)
              setActionError(null)
            }}
          >
            &larr; Back to exams
          </button>

          <header className="screen-heading exam-series-detail-heading">
            <p className="eyebrow">Exam series</p>
            <div className="section-heading-row">
              <div>
                <h1 id="exams-heading">{activeSeries.title}</h1>
                <p>
                  {activeSeriesExams.length}{' '}
                  {activeSeriesExams.length === 1 ? 'exam' : 'exams'} in this
                  series
                </p>
              </div>
              {!isExamFormOpen ? (
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => openExamForm(activeSeries.id)}
                >
                  Add exam
                </button>
              ) : null}
            </div>
          </header>

          {examForm}

          {activeSeriesExams.length === 0 ? (
            <div className="empty-state exam-empty-state">
              <h2>No exams in this series</h2>
              <p>Add the first subject exam when you are ready.</p>
            </div>
          ) : (
            <ExamGroups
              chapters={chapters}
              examSeries={examSeries}
              exams={activeSeriesExams}
              headingLevel="h2"
              idPrefix={`exam-series-${activeSeries.id}`}
              subjects={subjects}
              today={today}
              onRequestDelete={setExamToDelete}
            />
          )}
        </>
      ) : (
        <>
          <header className="screen-heading">
            <p className="eyebrow">Know what is coming next</p>
            <div className="section-heading-row">
              <div>
                <h1 id="exams-heading">Exams</h1>
                <p>Plan school exams and multi-subject mock tests.</p>
              </div>
              <div className="exam-screen-actions">
                {!isExamFormOpen ? (
                  <button
                    className="button button-primary"
                    type="button"
                    onClick={() => openExamForm(null)}
                  >
                    Add exam
                  </button>
                ) : null}
                {!isSeriesFormOpen ? (
                  <button
                    className="button button-secondary"
                    type="button"
                    onClick={openSeriesForm}
                  >
                    New series
                  </button>
                ) : null}
              </div>
            </div>
          </header>

          {examForm}

          {isSeriesFormOpen ? (
            <form
              className="inline-form exam-series-form"
              onSubmit={handleCreateSeries}
            >
              <label htmlFor="exam-series-title">Series title</label>
              <input
                aria-describedby={
                  seriesFormError ? 'exam-series-form-error' : undefined
                }
                autoFocus
                id="exam-series-title"
                maxLength={100}
                placeholder="For example, Mid-Terms 2026"
                type="text"
                value={seriesTitle}
                onChange={(event) => {
                  setSeriesTitle(event.target.value)
                  setSeriesFormError(null)
                }}
              />
              {seriesFormError ? (
                <p
                  className="form-error"
                  id="exam-series-form-error"
                  role="alert"
                >
                  {seriesFormError}
                </p>
              ) : null}
              <div className="form-actions">
                <button className="button button-primary" type="submit">
                  Save series
                </button>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => {
                    setSeriesTitle('')
                    setSeriesFormError(null)
                    setIsSeriesFormOpen(false)
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          {examSeries.length === 0 && exams.length === 0 ? (
            <div className="empty-state exam-empty-state">
              <h2>No exams or series yet</h2>
              <p>Add an exam or group school exams into a series.</p>
            </div>
          ) : (
            <div className="exams-overview">
              <section
                className="exam-series-section"
                aria-labelledby="exam-series-heading"
              >
                <div className="exam-section-heading">
                  <div>
                    <h2 id="exam-series-heading">Exam Series</h2>
                    <p>Keep related school exams together.</p>
                  </div>
                </div>

                {examSeries.length === 0 ? (
                  <div className="empty-state exam-section-empty-state">
                    <h3>No exam series</h3>
                    <p>Create a series for exams that belong together.</p>
                  </div>
                ) : (
                  <ul className="exam-series-list">
                    {examSeries.map((series) => {
                      const seriesExams = exams.filter(
                        (exam) => exam.seriesId === series.id,
                      )
                      const upcomingExams = seriesExams
                        .filter((exam) => exam.examDate > today)
                        .toSorted((first, second) =>
                          first.examDate.localeCompare(second.examDate),
                        )
                      const nearestUpcomingExam = upcomingExams[0]

                      return (
                        <li className="exam-series-card" key={series.id}>
                          {renamingSeriesId === series.id ? (
                            <form
                              className="row-edit-form exam-series-rename-form"
                              onSubmit={handleRenameSeries}
                            >
                              <label htmlFor={`exam-series-rename-${series.id}`}>
                                New name for {series.title}
                              </label>
                              <input
                                aria-describedby={
                                  renameError
                                    ? `exam-series-rename-error-${series.id}`
                                    : undefined
                                }
                                autoFocus
                                className="row-edit-input"
                                id={`exam-series-rename-${series.id}`}
                                maxLength={100}
                                type="text"
                                value={renameTitle}
                                onChange={(event) => {
                                  setRenameTitle(event.target.value)
                                  setRenameError(null)
                                }}
                              />
                              <div className="row-actions">
                                <button
                                  aria-label={`Save exam series ${series.title}`}
                                  className="button button-primary button-compact"
                                  type="submit"
                                >
                                  Save
                                </button>
                                <button
                                  aria-label={`Cancel renaming exam series ${series.title}`}
                                  className="button button-secondary button-compact"
                                  type="button"
                                  onClick={() => {
                                    setRenamingSeriesId(null)
                                    setRenameTitle('')
                                    setRenameError(null)
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                              {renameError ? (
                                <p
                                  className="form-error"
                                  id={`exam-series-rename-error-${series.id}`}
                                  role="alert"
                                >
                                  {renameError}
                                </p>
                              ) : null}
                            </form>
                          ) : (
                            <>
                              <div className="exam-series-card-content">
                                <h3>{series.title}</h3>
                                <p className="exam-series-metrics">
                                  <span>
                                    {seriesExams.length}{' '}
                                    {seriesExams.length === 1 ? 'exam' : 'exams'}
                                  </span>
                                  <span aria-hidden="true">&middot;</span>
                                  <span>
                                    {upcomingExams.length} upcoming
                                  </span>
                                </p>
                                {nearestUpcomingExam ? (
                                  <p className="exam-series-next-date">
                                    Next:{' '}
                                    <time dateTime={nearestUpcomingExam.examDate}>
                                      {formatExamDate(
                                        nearestUpcomingExam.examDate,
                                      )}
                                    </time>
                                  </p>
                                ) : (
                                  <p className="exam-series-next-date">
                                    No upcoming exams
                                  </p>
                                )}
                              </div>
                              <div className="row-actions exam-series-actions">
                                <button
                                  aria-label={`Open exam series ${series.title}`}
                                  className="button button-primary button-compact"
                                  type="button"
                                  onClick={() => openSeries(series)}
                                >
                                  Open
                                </button>
                                <button
                                  aria-label={`Rename exam series ${series.title}`}
                                  className="button button-secondary button-compact"
                                  type="button"
                                  onClick={() => beginRenameSeries(series)}
                                >
                                  Rename
                                </button>
                                <button
                                  aria-label={`Delete exam series ${series.title}`}
                                  className="button button-danger button-compact"
                                  type="button"
                                  onClick={() => setSeriesToDelete(series)}
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>

              <section
                className="standalone-exams-section"
                aria-labelledby="standalone-exams-heading"
              >
                <div className="exam-section-heading">
                  <div>
                    <h2 id="standalone-exams-heading">Standalone Exams</h2>
                    <p>Mocks and exams that are not part of a series.</p>
                  </div>
                </div>

                {standaloneExams.length === 0 ? (
                  <div className="empty-state exam-section-empty-state">
                    <h3>No standalone exams</h3>
                    <p>Add a mock test or another independent exam.</p>
                  </div>
                ) : (
                  <ExamGroups
                    chapters={chapters}
                    examSeries={examSeries}
                    exams={standaloneExams}
                    idPrefix="standalone-exams"
                    subjects={subjects}
                    today={today}
                    onRequestDelete={setExamToDelete}
                  />
                )}
              </section>
            </div>
          )}
        </>
      )}

      {actionError ? (
        <p className="action-error" role="alert">
          {actionError}
        </p>
      ) : null}

      <ConfirmDialog
        isOpen={examToDelete !== null}
        message={examToDelete ? `Delete ${examToDelete.title}?` : ''}
        title="Delete exam?"
        onCancel={() => setExamToDelete(null)}
        onConfirm={handleConfirmDeleteExam}
      />

      <ConfirmDialog
        isOpen={seriesToDelete !== null}
        message={
          seriesToDelete
            ? `Delete ${seriesToDelete.title}? Its exams will remain as standalone exams.`
            : ''
        }
        title="Delete exam series?"
        onCancel={() => setSeriesToDelete(null)}
        onConfirm={handleConfirmDeleteSeries}
      />
    </section>
  )
}
