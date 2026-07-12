import { useState } from 'react'

import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import type { Chapter, Subject } from '../../types/studentOS'

type ChapterScreenProps = {
  subject: Subject
  chapters: Chapter[]
  onBack: () => void
  onCreateChapter: (name: string, subjectId: string) => string | null
  onRenameChapter: (chapterId: string, name: string) => string | null
  onDeleteChapter: (chapterId: string) => string | null
}

export function ChapterScreen({
  subject,
  chapters,
  onBack,
  onCreateChapter,
  onRenameChapter,
  onDeleteChapter,
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
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null)
  const chapterCountLabel = `${chapters.length} ${
    chapters.length === 1 ? 'chapter' : 'chapters'
  }`

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const creationError = onCreateChapter(name, subject.id)

    if (creationError) {
      setError(creationError)
      return
    }

    setName('')
    setError(null)
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
    setChapterBeingRenamed(chapter.id)
    setRenamedChapterName(chapter.name)
    setRenameError(null)
  }

  function cancelRenamingChapter() {
    setChapterBeingRenamed(null)
    setRenamedChapterName('')
    setRenameError(null)
  }

  function handleRenameChapter(
    event: React.FormEvent<HTMLFormElement>,
    chapterId: string,
  ) {
    event.preventDefault()

    const renameChapterError = onRenameChapter(chapterId, renamedChapterName)

    if (renameChapterError) {
      setRenameError(renameChapterError)
      return
    }

    cancelRenamingChapter()
  }

  return (
    <section className="screen" aria-labelledby="chapters-heading">
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
          {chapters.map((chapter) => (
            <li key={chapter.id}>
              {chapterBeingRenamed === chapter.id ? (
                <form
                  aria-label={`Rename ${chapter.name}`}
                  className="row-edit-form"
                  onSubmit={(event) => handleRenameChapter(event, chapter.id)}
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
                  <span>{chapter.name}</span>
                  <div className="row-actions">
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
                </>
              )}
            </li>
          ))}
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
