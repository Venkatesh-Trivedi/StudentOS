import { useState } from 'react'

import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import type {
  Chapter,
  Resource,
  RevisionTask,
  Subject,
} from '../../types/studentOS'
import { getLocalDateKey } from './revisionValidation'

export type RevisionScreenProps = {
  revisionTasks: RevisionTask[]
  chapters: Chapter[]
  subjects: Subject[]
  resources: Resource[]
  onBack: () => void
  onToggleRevisionTask: (revisionTaskId: string) => string | null
  onDeleteRevisionTask: (revisionTaskId: string) => string | null
  onViewResources: (subjectId: string, chapterId: string | null) => void
}

type RevisionTaskGroup = {
  heading: string
  items: RevisionTask[]
}

function formatRevisionDate(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  const localDate = new Date()

  localDate.setHours(0, 0, 0, 0)
  localDate.setFullYear(year, month - 1, day)

  return localDate.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
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

function getRevisionStatus(scheduledDate: string, today: string): string {
  const scheduledDay = getCalendarDayNumber(scheduledDate)
  const todayDay = getCalendarDayNumber(today)

  if (scheduledDay === null || todayDay === null) {
    return 'Revision date unavailable'
  }

  const dayDifference = scheduledDay - todayDay

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

function groupRevisionTasks(
  revisionTasks: RevisionTask[],
  today: string,
): RevisionTaskGroup[] {
  const pendingTasks = revisionTasks
    .filter((revisionTask) => !revisionTask.isCompleted)
    .toSorted(
      (first, second) =>
        first.scheduledDate.localeCompare(second.scheduledDate) ||
        first.createdAt.localeCompare(second.createdAt),
    )
  const completedTasks = revisionTasks
    .filter((revisionTask) => revisionTask.isCompleted)
    .toSorted((first, second) => {
      const firstCompletedAt = first.completedAt ?? first.updatedAt
      const secondCompletedAt = second.completedAt ?? second.updatedAt

      return (
        secondCompletedAt.localeCompare(firstCompletedAt) ||
        first.scheduledDate.localeCompare(second.scheduledDate)
      )
    })

  return [
    {
      heading: 'Overdue',
      items: pendingTasks.filter(
        (revisionTask) => revisionTask.scheduledDate < today,
      ),
    },
    {
      heading: 'Due today',
      items: pendingTasks.filter(
        (revisionTask) => revisionTask.scheduledDate === today,
      ),
    },
    {
      heading: 'Upcoming',
      items: pendingTasks.filter(
        (revisionTask) => revisionTask.scheduledDate > today,
      ),
    },
    {
      heading: 'Completed',
      items: completedTasks,
    },
  ]
}

export function RevisionScreen({
  revisionTasks,
  chapters,
  subjects,
  resources,
  onBack,
  onToggleRevisionTask,
  onDeleteRevisionTask,
  onViewResources,
}: RevisionScreenProps) {
  const [actionError, setActionError] = useState<string | null>(null)
  const [revisionTaskToDelete, setRevisionTaskToDelete] =
    useState<RevisionTask | null>(null)
  const today = getLocalDateKey(new Date())
  const chapterById = new Map(
    chapters.map((chapter) => [chapter.id, chapter]),
  )
  const subjectNames = new Map(
    subjects.map((subject) => [subject.id, subject.name]),
  )
  const groups = groupRevisionTasks(revisionTasks, today)
  const taskToDeleteChapter = revisionTaskToDelete
    ? chapterById.get(revisionTaskToDelete.chapterId)
    : undefined

  function handleToggleRevisionTask(revisionTaskId: string) {
    setActionError(onToggleRevisionTask(revisionTaskId))
  }

  function handleConfirmDeleteRevisionTask() {
    if (!revisionTaskToDelete) {
      return
    }

    setActionError(onDeleteRevisionTask(revisionTaskToDelete.id))
    setRevisionTaskToDelete(null)
  }

  return (
    <section
      className="screen revision-screen"
      aria-labelledby="revision-heading"
    >
      <button className="back-button" type="button" onClick={onBack}>
        <span aria-hidden="true">&larr;</span> Back
      </button>

      <header className="screen-heading">
        <p className="eyebrow">Review what needs another look</p>
        <h1 id="revision-heading">Revision plan</h1>
        <p>Keep scheduled revision work together and check it off as you go.</p>
      </header>

      {revisionTasks.length === 0 ? (
        <div className="empty-state revision-empty-state">
          <h2>No revision tasks yet</h2>
          <p>Schedule revision from a chapter when you want to revisit it.</p>
        </div>
      ) : (
        <div className="revision-groups">
          {groups.map((group) =>
            group.items.length > 0 ? (
              <section
                className="revision-group"
                key={group.heading}
                aria-labelledby={`revision-group-${group.heading
                  .toLowerCase()
                  .replace(' ', '-')}`}
              >
                <div className="revision-group-heading">
                  <h2
                    id={`revision-group-${group.heading
                      .toLowerCase()
                      .replace(' ', '-')}`}
                  >
                    {group.heading}
                  </h2>
                  <span>
                    {group.items.length}{' '}
                    {group.items.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>

                <ul className="revision-task-list">
                  {group.items.map((revisionTask) => {
                    const chapter = chapterById.get(revisionTask.chapterId)
                    const chapterName = chapter?.name ?? 'Unknown chapter'
                    const subjectName = chapter
                      ? subjectNames.get(chapter.subjectId) ?? 'Unknown subject'
                      : 'Unknown subject'
                    const hasChapterResources = resources.some(
                      (resource) => resource.chapterId === chapter?.id,
                    )
                    const hasSubjectResources = chapter
                      ? resources.some(
                          (resource) =>
                            resource.subjectId === chapter.subjectId &&
                            resource.chapterId === null,
                        )
                      : false

                    return (
                      <li
                        className={`revision-task-card${
                          revisionTask.isCompleted
                            ? ' revision-task-card-completed'
                            : ''
                        }`}
                        key={revisionTask.id}
                      >
                        <label className="revision-task-completion">
                          <input
                            aria-label={
                              revisionTask.isCompleted
                                ? `Mark revision for ${chapterName} incomplete`
                                : `Mark revision for ${chapterName} complete`
                            }
                            checked={revisionTask.isCompleted}
                            type="checkbox"
                            onChange={() =>
                              handleToggleRevisionTask(revisionTask.id)
                            }
                          />
                        </label>

                        <div className="revision-task-content">
                          <h3>{chapterName}</h3>
                          <p className="revision-task-subject">{subjectName}</p>
                          <p className="revision-task-date">
                            <time dateTime={revisionTask.scheduledDate}>
                              {formatRevisionDate(revisionTask.scheduledDate)}
                            </time>
                          </p>
                          <p className="revision-task-status">
                            {getRevisionStatus(
                              revisionTask.scheduledDate,
                              today,
                            )}
                          </p>
                        </div>

                        <div className="revision-task-actions">
                          {chapter &&
                          (hasChapterResources || hasSubjectResources) ? (
                            <button
                              aria-label={`View resources for ${chapterName}`}
                              className="button button-secondary button-compact"
                              type="button"
                              onClick={() =>
                                onViewResources(
                                  chapter.subjectId,
                                  hasChapterResources ? chapter.id : null,
                                )
                              }
                            >
                              View resources
                            </button>
                          ) : null}
                          <button
                            aria-label={`Delete revision for ${chapterName}`}
                            className="button button-danger button-compact"
                            type="button"
                            onClick={() =>
                              setRevisionTaskToDelete(revisionTask)
                            }
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
        isOpen={revisionTaskToDelete !== null}
        message={
          revisionTaskToDelete
            ? `Delete the revision task for ${
                taskToDeleteChapter?.name ?? 'this chapter'
              }?`
            : ''
        }
        title="Delete revision task?"
        onCancel={() => setRevisionTaskToDelete(null)}
        onConfirm={handleConfirmDeleteRevisionTask}
      />
    </section>
  )
}
