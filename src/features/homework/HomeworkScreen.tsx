import { useState, type FormEvent } from 'react'

import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import type { Chapter, Homework, Subject } from '../../types/studentOS'
import type { HomeworkCreationInput } from './homeworkService'

export type HomeworkScreenProps = {
  homework: Homework[]
  subjects: Subject[]
  chapters: Chapter[]
  onCreateHomework: (input: HomeworkCreationInput) => string | null
  onToggleHomework: (homeworkId: string) => string | null
  onDeleteHomework: (homeworkId: string) => string | null
}

type HomeworkGroup = {
  heading: string
  items: Homework[]
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDueDate(dueDate: string): string {
  const [year, month, day] = dueDate.split('-').map(Number)
  const localDate = new Date()

  localDate.setHours(0, 0, 0, 0)
  localDate.setFullYear(year, month - 1, day)

  return localDate.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function HomeworkScreen({
  homework,
  subjects,
  chapters,
  onCreateHomework,
  onToggleHomework,
  onDeleteHomework,
}: HomeworkScreenProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [chapterId, setChapterId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [homeworkToDelete, setHomeworkToDelete] = useState<Homework | null>(null)

  const availableChapters = chapters.filter(
    (chapter) => chapter.subjectId === subjectId,
  )
  const subjectNames = new Map(subjects.map((subject) => [subject.id, subject.name]))
  const chapterNames = new Map(chapters.map((chapter) => [chapter.id, chapter.name]))
  const today = getLocalDateKey(new Date())
  const pendingHomework = homework
    .filter((item) => !item.isCompleted)
    .toSorted(
      (first, second) =>
        first.dueDate.localeCompare(second.dueDate) ||
        first.createdAt.localeCompare(second.createdAt),
    )
  const completedHomework = homework
    .filter((item) => item.isCompleted)
    .toSorted((first, second) => {
      const firstCompletedAt = first.completedAt ?? first.updatedAt
      const secondCompletedAt = second.completedAt ?? second.updatedAt

      return (
        secondCompletedAt.localeCompare(firstCompletedAt) ||
        first.dueDate.localeCompare(second.dueDate)
      )
    })
  const groups: HomeworkGroup[] = [
    {
      heading: 'Overdue',
      items: pendingHomework.filter((item) => item.dueDate < today),
    },
    {
      heading: 'Due today',
      items: pendingHomework.filter((item) => item.dueDate === today),
    },
    {
      heading: 'Upcoming',
      items: pendingHomework.filter((item) => item.dueDate > today),
    },
    {
      heading: 'Completed',
      items: completedHomework,
    },
  ]

  function resetForm() {
    setTitle('')
    setSubjectId('')
    setChapterId('')
    setDueDate('')
    setFormError(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const creationError = onCreateHomework({
      title,
      subjectId,
      chapterId: chapterId || null,
      dueDate,
    })

    if (creationError) {
      setFormError(creationError)
      return
    }

    resetForm()
    setActionError(null)
    setIsFormOpen(false)
  }

  function handleCancelForm() {
    resetForm()
    setIsFormOpen(false)
  }

  function handleToggleHomework(homeworkId: string) {
    setActionError(onToggleHomework(homeworkId))
  }

  function handleConfirmDeleteHomework() {
    if (!homeworkToDelete) {
      return
    }

    setActionError(onDeleteHomework(homeworkToDelete.id))
    setHomeworkToDelete(null)
  }

  return (
    <section className="screen homework-screen" aria-labelledby="homework-heading">
      <header className="screen-heading">
        <p className="eyebrow">Keep every deadline in view</p>
        <div className="section-heading-row">
          <div>
            <h1 id="homework-heading">Homework</h1>
            <p>Plan what is due and check off what you finish.</p>
          </div>
          {!isFormOpen ? (
            <button
              className="button button-primary"
              type="button"
              onClick={() => {
                setActionError(null)
                setIsFormOpen(true)
              }}
            >
              Add homework
            </button>
          ) : null}
        </div>
      </header>

      {isFormOpen ? (
        <form className="inline-form homework-form" onSubmit={handleSubmit}>
          <div className="homework-form-grid">
            <div className="homework-form-field homework-title-field">
              <label htmlFor="homework-title">Title</label>
              <input
                aria-describedby={formError ? 'homework-form-error' : undefined}
                autoFocus
                id="homework-title"
                maxLength={120}
                placeholder="For example, Finish algebra questions"
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value)
                  setFormError(null)
                }}
              />
            </div>

            <div className="homework-form-field">
              <label htmlFor="homework-subject">Subject</label>
              <select
                aria-describedby={formError ? 'homework-form-error' : undefined}
                id="homework-subject"
                value={subjectId}
                onChange={(event) => {
                  setSubjectId(event.target.value)
                  setChapterId('')
                  setFormError(null)
                }}
              >
                <option value="">Choose a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="homework-form-field">
              <label htmlFor="homework-chapter">Chapter (optional)</label>
              <select
                disabled={!subjectId || availableChapters.length === 0}
                id="homework-chapter"
                value={chapterId}
                onChange={(event) => {
                  setChapterId(event.target.value)
                  setFormError(null)
                }}
              >
                <option value="">
                  {subjectId && availableChapters.length === 0
                    ? 'No chapters available'
                    : 'No chapter'}
                </option>
                {availableChapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="homework-form-field">
              <label htmlFor="homework-due-date">Due date</label>
              <input
                aria-describedby={formError ? 'homework-form-error' : undefined}
                id="homework-due-date"
                min={today}
                type="date"
                value={dueDate}
                onChange={(event) => {
                  setDueDate(event.target.value)
                  setFormError(null)
                }}
              />
            </div>
          </div>

          {formError ? (
            <p className="form-error" id="homework-form-error" role="alert">
              {formError}
            </p>
          ) : null}

          <div className="form-actions homework-form-actions">
            <button className="button button-primary" type="submit">
              Save homework
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={handleCancelForm}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {homework.length === 0 ? (
        <div className="empty-state homework-empty-state">
          <h2>No homework yet</h2>
          <p>Add an assignment to start planning your deadlines.</p>
        </div>
      ) : (
        <div className="homework-groups">
          {groups.map((group) =>
            group.items.length > 0 ? (
              <section
                className="homework-group"
                key={group.heading}
                aria-labelledby={`homework-group-${group.heading
                  .toLowerCase()
                  .replace(' ', '-')}`}
              >
                <div className="homework-group-heading">
                  <h2
                    id={`homework-group-${group.heading
                      .toLowerCase()
                      .replace(' ', '-')}`}
                  >
                    {group.heading}
                  </h2>
                  <span>
                    {group.items.length}{' '}
                    {group.items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <ul className="homework-list">
                  {group.items.map((item) => {
                    const chapterName = item.chapterId
                      ? chapterNames.get(item.chapterId)
                      : null

                    return (
                      <li
                        className={`homework-item${
                          item.isCompleted ? ' homework-item-completed' : ''
                        }`}
                        key={item.id}
                      >
                        <label className="homework-completion">
                          <input
                            aria-label={
                              item.isCompleted
                                ? `Mark ${item.title} incomplete`
                                : `Mark ${item.title} complete`
                            }
                            checked={item.isCompleted}
                            type="checkbox"
                            onChange={() => handleToggleHomework(item.id)}
                          />
                        </label>

                        <div className="homework-item-content">
                          <h3 className="homework-item-title">{item.title}</h3>
                          <p className="homework-item-meta">
                            <span>
                              {subjectNames.get(item.subjectId) ?? 'Unknown subject'}
                            </span>
                            {chapterName ? (
                              <>
                                <span aria-hidden="true">&middot;</span>
                                <span>{chapterName}</span>
                              </>
                            ) : null}
                          </p>
                          <p className="homework-item-due">
                            Due {formatDueDate(item.dueDate)}
                          </p>
                        </div>

                        <div className="homework-item-actions">
                          <button
                            aria-label={`Delete ${item.title}`}
                            className="button button-danger"
                            type="button"
                            onClick={() => setHomeworkToDelete(item)}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ) : null,
          )}
        </div>
      )}

      {actionError ? (
        <p className="action-error" role="alert">
          {actionError}
        </p>
      ) : null}

      <ConfirmDialog
        isOpen={homeworkToDelete !== null}
        message={homeworkToDelete ? `Delete ${homeworkToDelete.title}?` : ''}
        title="Delete homework?"
        onCancel={() => setHomeworkToDelete(null)}
        onConfirm={handleConfirmDeleteHomework}
      />
    </section>
  )
}
