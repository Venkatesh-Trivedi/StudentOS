import { useState, type FormEvent } from 'react'

import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import type {
  Chapter,
  ChapterConfidence,
  ConfidenceLevel,
  Resource,
  Subject,
} from '../../types/studentOS'

const CONFIDENCE_LEVELS: ConfidenceLevel[] = ['low', 'medium', 'high']

const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export type ChapterScreenProps = {
  subject: Subject
  chapters: Chapter[]
  chapterConfidences: ChapterConfidence[]
  resources: Resource[]
  onBack: () => void
  onCreateChapter: (name: string, subjectId: string) => string | null
  onRenameChapter: (chapterId: string, name: string) => string | null
  onDeleteChapter: (chapterId: string) => string | null
  onSetChapterConfidence: (
    chapterId: string,
    level: ConfidenceLevel,
  ) => string | null
  onClearChapterConfidence: (chapterId: string) => string | null
  onScheduleRevision: (
    chapterId: string,
    scheduledDate: string,
  ) => string | null
  onViewRevisionPlan: () => void
  onViewResources: (subjectId: string, chapterId: string | null) => void
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function ChapterScreen({
  subject,
  chapters,
  chapterConfidences,
  resources,
  onBack,
  onCreateChapter,
  onRenameChapter,
  onDeleteChapter,
  onSetChapterConfidence,
  onClearChapterConfidence,
  onScheduleRevision,
  onViewRevisionPlan,
  onViewResources,
}: ChapterScreenProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [chapterBeingRenamed, setChapterBeingRenamed] = useState<string | null>(
    null,
  )
  const [renamedChapterName, setRenamedChapterName] = useState('')
  const [renameError, setRenameError] = useState<string | null>(null)
  const [chapterBeingScheduled, setChapterBeingScheduled] = useState<
    string | null
  >(null)
  const [revisionDate, setRevisionDate] = useState('')
  const [revisionError, setRevisionError] = useState<string | null>(null)
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null)
  const confidenceByChapterId = new Map(
    chapterConfidences.map((confidence) => [
      confidence.chapterId,
      confidence,
    ]),
  )
  const today = getLocalDateKey(new Date())
  const chapterCountLabel = `${chapters.length} ${
    chapters.length === 1 ? 'chapter' : 'chapters'
  }`

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const creationError = onCreateChapter(name, subject.id)

    if (creationError) {
      setError(creationError)
      return
    }

    setName('')
    setError(null)
    setActionError(null)
    setIsFormOpen(false)
  }

  function handleConfirmDeleteChapter() {
    if (!chapterToDelete) {
      return
    }

    setActionError(onDeleteChapter(chapterToDelete.id))
    setChapterToDelete(null)
  }

  function startRenamingChapter(chapter: Chapter) {
    setChapterBeingScheduled(null)
    setRevisionDate('')
    setRevisionError(null)
    setChapterBeingRenamed(chapter.id)
    setRenamedChapterName(chapter.name)
    setRenameError(null)
    setActionError(null)
  }

  function cancelRenamingChapter() {
    setChapterBeingRenamed(null)
    setRenamedChapterName('')
    setRenameError(null)
  }

  function handleRenameChapter(
    event: FormEvent<HTMLFormElement>,
    chapterId: string,
  ) {
    event.preventDefault()

    const renameChapterError = onRenameChapter(chapterId, renamedChapterName)

    if (renameChapterError) {
      setRenameError(renameChapterError)
      return
    }

    setActionError(null)
    cancelRenamingChapter()
  }

  function handleSetConfidence(
    chapterId: string,
    level: ConfidenceLevel,
  ) {
    setActionError(onSetChapterConfidence(chapterId, level))
  }

  function handleClearConfidence(chapterId: string) {
    setActionError(onClearChapterConfidence(chapterId))
  }

  function startSchedulingRevision(chapterId: string) {
    cancelRenamingChapter()
    setChapterBeingScheduled(chapterId)
    setRevisionDate('')
    setRevisionError(null)
    setActionError(null)
  }

  function cancelSchedulingRevision() {
    setChapterBeingScheduled(null)
    setRevisionDate('')
    setRevisionError(null)
  }

  function handleScheduleRevision(
    event: FormEvent<HTMLFormElement>,
    chapterId: string,
  ) {
    event.preventDefault()

    const schedulingError = onScheduleRevision(chapterId, revisionDate)

    if (schedulingError) {
      setRevisionError(schedulingError)
      return
    }

    setActionError(null)
    cancelSchedulingRevision()
  }

  return (
    <section className="screen chapter-screen" aria-labelledby="chapters-heading">
      <button className="back-button" type="button" onClick={onBack}>
        <span aria-hidden="true">&larr;</span> Back to subjects
      </button>

      <header className="screen-heading chapter-heading">
        <p className="eyebrow">Subject</p>
        <h1 id="chapters-heading">{subject.name}</h1>
        <div className="section-heading-row">
          <div>
            <h2>{chapterCountLabel}</h2>
            <p>Keep the topics you need to cover in one place.</p>
          </div>
          <div className="chapter-screen-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={() => onViewResources(subject.id, null)}
            >
              Resources
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={onViewRevisionPlan}
            >
              View revision plan
            </button>
            {!isFormOpen ? (
              <button
                className="button button-primary"
                type="button"
                onClick={() => setIsFormOpen(true)}
              >
                Add chapter
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {isFormOpen ? (
        <form className="inline-form" onSubmit={handleSubmit}>
          <label htmlFor="chapter-name">Chapter name</label>
          <div className="form-actions">
            <input
              aria-describedby={error ? 'chapter-name-error' : undefined}
              autoFocus
              id="chapter-name"
              maxLength={100}
              onChange={(event) => {
                setName(event.target.value)
                setError(null)
              }}
              placeholder="For example, Algebra basics"
              type="text"
              value={name}
            />
            <button className="button button-primary" type="submit">
              Save chapter
            </button>
          </div>
          {error ? (
            <p className="form-error" id="chapter-name-error" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      ) : null}

      {chapters.length === 0 ? (
        <div className="empty-state">
          <h3>No chapters yet</h3>
          <p>Add the first chapter you want to study in {subject.name}.</p>
        </div>
      ) : (
        <ol className="chapter-list">
          {chapters.map((chapter) => {
            const confidence = confidenceByChapterId.get(chapter.id)
            const resourceCount = resources.filter(
              (resource) => resource.chapterId === chapter.id,
            ).length
            const confidenceLabel = confidence
              ? CONFIDENCE_LABELS[confidence.level]
              : 'Not set'

            return (
              <li className="chapter-item" key={chapter.id}>
                {chapterBeingRenamed === chapter.id ? (
                  <form
                    aria-label={`Rename ${chapter.name}`}
                    className="row-edit-form chapter-rename-form"
                    onSubmit={(event) =>
                      handleRenameChapter(event, chapter.id)
                    }
                  >
                    <label htmlFor={`rename-chapter-${chapter.id}`}>
                      Chapter name
                    </label>
                    <input
                      aria-describedby={
                        renameError
                          ? `rename-chapter-${chapter.id}-error`
                          : undefined
                      }
                      autoFocus
                      className="row-edit-input"
                      id={`rename-chapter-${chapter.id}`}
                      maxLength={100}
                      onChange={(event) => {
                        setRenamedChapterName(event.target.value)
                        setRenameError(null)
                      }}
                      type="text"
                      value={renamedChapterName}
                    />
                    <div className="row-actions">
                      <button
                        className="button button-primary button-compact"
                        type="submit"
                      >
                        Save
                      </button>
                      <button
                        className="button button-secondary button-compact"
                        type="button"
                        onClick={cancelRenamingChapter}
                      >
                        Cancel
                      </button>
                    </div>
                    {renameError ? (
                      <p
                        className="form-error"
                        id={`rename-chapter-${chapter.id}-error`}
                        role="alert"
                      >
                        {renameError}
                      </p>
                    ) : null}
                  </form>
                ) : (
                  <>
                    <div className="chapter-item-content">
                      <span className="chapter-name">{chapter.name}</span>
                      <p
                        className={`chapter-confidence-summary chapter-confidence-${
                          confidence?.level ?? 'unset'
                        }`}
                      >
                        Confidence: <strong>{confidenceLabel}</strong>
                      </p>
                      <p className="chapter-resource-count">
                        {resourceCount}{' '}
                        {resourceCount === 1 ? 'resource' : 'resources'}
                      </p>
                    </div>

                    <div className="row-actions chapter-item-actions">
                      <button
                        aria-label={`View resources for ${chapter.name}`}
                        className="button button-secondary button-compact"
                        type="button"
                        onClick={() =>
                          onViewResources(subject.id, chapter.id)
                        }
                      >
                        Resources
                      </button>
                      <button
                        aria-label={`Schedule revision for ${chapter.name}`}
                        className="button button-secondary button-compact"
                        type="button"
                        onClick={() => startSchedulingRevision(chapter.id)}
                      >
                        Schedule revision
                      </button>
                      <button
                        aria-label={`Rename ${chapter.name}`}
                        className="button button-secondary button-compact"
                        type="button"
                        onClick={() => startRenamingChapter(chapter)}
                      >
                        Rename
                      </button>
                      <button
                        aria-label={`Delete ${chapter.name}`}
                        className="button button-danger button-compact"
                        type="button"
                        onClick={() => setChapterToDelete(chapter)}
                      >
                        Delete
                      </button>
                    </div>

                    <fieldset className="chapter-confidence-controls">
                      <legend>Set confidence for {chapter.name}</legend>
                      <div className="chapter-confidence-options">
                        {CONFIDENCE_LEVELS.map((level) => (
                          <button
                            aria-pressed={confidence?.level === level}
                            className={`confidence-option confidence-option-${level}`}
                            key={level}
                            type="button"
                            onClick={() =>
                              handleSetConfidence(chapter.id, level)
                            }
                          >
                            {CONFIDENCE_LABELS[level]}
                          </button>
                        ))}
                        {confidence ? (
                          <button
                            className="button button-secondary button-compact confidence-clear"
                            type="button"
                            onClick={() => handleClearConfidence(chapter.id)}
                          >
                            Clear confidence
                          </button>
                        ) : null}
                      </div>
                    </fieldset>
                  </>
                )}

                {chapterBeingScheduled === chapter.id ? (
                  <form
                    className="chapter-revision-form"
                    onSubmit={(event) =>
                      handleScheduleRevision(event, chapter.id)
                    }
                  >
                    <label htmlFor={`revision-date-${chapter.id}`}>
                      Revision date for {chapter.name}
                    </label>
                    <div className="chapter-revision-form-actions">
                      <input
                        aria-describedby={
                          revisionError
                            ? `revision-date-${chapter.id}-error`
                            : undefined
                        }
                        autoFocus
                        id={`revision-date-${chapter.id}`}
                        min={today}
                        type="date"
                        value={revisionDate}
                        onChange={(event) => {
                          setRevisionDate(event.target.value)
                          setRevisionError(null)
                        }}
                      />
                      <button
                        className="button button-primary button-compact"
                        type="submit"
                      >
                        Schedule
                      </button>
                      <button
                        className="button button-secondary button-compact"
                        type="button"
                        onClick={cancelSchedulingRevision}
                      >
                        Cancel
                      </button>
                    </div>
                    {revisionError ? (
                      <p
                        className="form-error"
                        id={`revision-date-${chapter.id}-error`}
                        role="alert"
                      >
                        {revisionError}
                      </p>
                    ) : null}
                  </form>
                ) : null}
              </li>
            )
          })}
        </ol>
      )}

      {actionError ? (
        <p className="action-error" role="alert">
          {actionError}
        </p>
      ) : null}

      <ConfirmDialog
        isOpen={chapterToDelete !== null}
        message={chapterToDelete ? `Delete ${chapterToDelete.name}?` : ''}
        title="Delete chapter?"
        onCancel={() => setChapterToDelete(null)}
        onConfirm={handleConfirmDeleteChapter}
      />
    </section>
  )
}
