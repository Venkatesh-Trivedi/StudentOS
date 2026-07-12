import { useState } from 'react'

import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import type { Chapter, Subject } from '../../types/studentOS'

const SUBJECT_SUGGESTIONS = [
  'Mathematics',
  'Science',
  'English',
  'Social Science',
  'Hindi',
  'Computer',
]

type SubjectsScreenProps = {
  subjects: Subject[]
  chapters: Chapter[]
  onSelectSubject: (subjectId: string) => void
  onCreateSubject: (name: string) => string | null
  onRenameSubject: (subjectId: string, name: string) => string | null
  onDeleteSubject: (subjectId: string) => string | null
}

export function SubjectsScreen({
  subjects,
  chapters,
  onSelectSubject,
  onCreateSubject,
  onRenameSubject,
  onDeleteSubject,
}: SubjectsScreenProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [subjectBeingRenamed, setSubjectBeingRenamed] = useState<string | null>(
    null,
  )
  const [renamedSubjectName, setRenamedSubjectName] = useState('')
  const [renameError, setRenameError] = useState<string | null>(null)
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null)
  const chapterCountToDelete = subjectToDelete
    ? chapters.filter((chapter) => chapter.subjectId === subjectToDelete.id).length
    : 0
  const subjectDeletionMessage = subjectToDelete
    ? `Delete ${subjectToDelete.name}? This will also delete ${chapterCountToDelete} ${
        chapterCountToDelete === 1 ? 'chapter' : 'chapters'
      }.`
    : ''

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const creationError = onCreateSubject(name)

    if (creationError) {
      setError(creationError)
      return
    }

    setName('')
    setError(null)
    setIsFormOpen(false)
  }

  function handleSuggestionClick(suggestion: string) {
    setName(suggestion)
    setError(null)
  }

  function startRenamingSubject(subject: Subject) {
    setSubjectBeingRenamed(subject.id)
    setRenamedSubjectName(subject.name)
    setRenameError(null)
  }

  function cancelRenamingSubject() {
    setSubjectBeingRenamed(null)
    setRenamedSubjectName('')
    setRenameError(null)
  }

  function handleRenameSubject(
    event: React.FormEvent<HTMLFormElement>,
    subjectId: string,
  ) {
    event.preventDefault()

    const renameSubjectError = onRenameSubject(subjectId, renamedSubjectName)

    if (renameSubjectError) {
      setRenameError(renameSubjectError)
      return
    }

    cancelRenamingSubject()
  }

  function handleConfirmDeleteSubject() {
    if (!subjectToDelete) {
      return
    }

    setActionError(onDeleteSubject(subjectToDelete.id))
    setSubjectToDelete(null)
  }

  return (
    <section className="screen" aria-labelledby="subjects-heading">
      <header className="screen-heading">
        <p className="eyebrow">Study planning, made simple</p>
        <h1>StudentOS</h1>
        <div className="section-heading-row">
          <div>
            <h2 id="subjects-heading">Your subjects</h2>
            <p>Start with the subjects you want to organise.</p>
          </div>
          {!isFormOpen ? (
            <button
              className="button button-primary"
              type="button"
              onClick={() => setIsFormOpen(true)}
            >
              Add subject
            </button>
          ) : null}
        </div>
      </header>

      {isFormOpen ? (
        <form className="inline-form" onSubmit={handleSubmit}>
          <label htmlFor="subject-name">Subject name</label>
          <div className="form-actions">
            <input
              aria-describedby={error ? 'subject-name-error' : undefined}
              autoFocus
              id="subject-name"
              maxLength={60}
              onChange={(event) => {
                setName(event.target.value)
                setError(null)
              }}
              placeholder="For example, Mathematics"
              type="text"
              value={name}
            />
            <button className="button button-primary" type="submit">
              Save subject
            </button>
          </div>
          {error ? (
            <p className="form-error" id="subject-name-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="suggestions" aria-label="Quick subject suggestions">
            <span>Quick suggestions</span>
            <div className="suggestion-list">
              {SUBJECT_SUGGESTIONS.map((suggestion) => (
                <button
                  className="suggestion"
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </form>
      ) : null}

      {subjects.length === 0 ? (
        <div className="empty-state">
          <h3>Your study space is ready</h3>
          <p>Add a subject to begin collecting its chapters.</p>
        </div>
      ) : (
        <ul className="subject-list" aria-label="Subjects">
          {subjects.map((subject) => (
            <li className="subject-card" key={subject.id}>
              {subjectBeingRenamed === subject.id ? (
                <form
                  aria-label={`Rename ${subject.name}`}
                  className="row-edit-form"
                  onSubmit={(event) => handleRenameSubject(event, subject.id)}
                >
                  <label htmlFor={`rename-subject-${subject.id}`}>
                    Subject name
                  </label>
                  <input
                    aria-describedby={
                      renameError
                        ? `rename-subject-${subject.id}-error`
                        : undefined
                    }
                    autoFocus
                    className="row-edit-input"
                    id={`rename-subject-${subject.id}`}
                    maxLength={60}
                    onChange={(event) => {
                      setRenamedSubjectName(event.target.value)
                      setRenameError(null)
                    }}
                    type="text"
                    value={renamedSubjectName}
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
                      onClick={cancelRenamingSubject}
                    >
                      Cancel
                    </button>
                  </div>
                  {renameError ? (
                    <p
                      className="form-error"
                      id={`rename-subject-${subject.id}-error`}
                      role="alert"
                    >
                      {renameError}
                    </p>
                  ) : null}
                </form>
              ) : (
                <>
                  <button
                    aria-label={`Open ${subject.name}`}
                    className="subject-open-button"
                    type="button"
                    onClick={() => onSelectSubject(subject.id)}
                  >
                    <span>{subject.name}</span>
                    <span aria-hidden="true">Open</span>
                  </button>
                  <div className="row-actions">
                    <button
                      aria-label={`Rename ${subject.name}`}
                      className="button button-secondary button-compact"
                      type="button"
                      onClick={() => startRenamingSubject(subject)}
                    >
                      Rename
                    </button>
                    <button
                      aria-label={`Delete ${subject.name}`}
                      className="button button-danger button-compact"
                      type="button"
                      onClick={() => setSubjectToDelete(subject)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {actionError ? (
        <p className="action-error" role="alert">
          {actionError}
        </p>
      ) : null}

      <ConfirmDialog
        isOpen={subjectToDelete !== null}
        message={subjectDeletionMessage}
        title="Delete subject?"
        onCancel={() => setSubjectToDelete(null)}
        onConfirm={handleConfirmDeleteSubject}
      />
    </section>
  )
}
