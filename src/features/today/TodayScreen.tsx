import { useState } from 'react'

import type { StudentOSData } from '../../types/studentOS'
import {
  createTodayPlan,
  type TodayExamPlanItem,
  type TodayPlanItem,
  type TodayRevisionPlanItem,
} from './todayPlanning'

export type TodayScreenProps = {
  data: StudentOSData
  onToggleHomework: (homeworkId: string) => string | null
  onToggleRevisionTask: (revisionTaskId: string) => string | null
  onViewChapter: (subjectId: string) => void
  onViewExams: () => void
  onViewRevisionPlan: () => void
}

type TodayPlanListProps = {
  items: TodayPlanItem[]
  isStartHere?: boolean
  onToggleHomework: (homeworkId: string) => void
  onToggleRevisionTask: (revisionTaskId: string) => void
  onViewChapter: (subjectId: string) => void
  onViewExams: () => void
}

function formatLocalDate(dateKey: string): string {
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

function formatTodayDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    year: 'numeric',
  })
}

function TodayPlanList({
  items,
  isStartHere = false,
  onToggleHomework,
  onToggleRevisionTask,
  onViewChapter,
  onViewExams,
}: TodayPlanListProps) {
  return (
    <ul className="today-plan-list">
      {items.map((item) => (
        <li key={`${item.type}-${item.sourceItemId}`}>
          <TodayPlanItemCard
            isStartHere={isStartHere}
            item={item}
            onToggleHomework={onToggleHomework}
            onToggleRevisionTask={onToggleRevisionTask}
            onViewChapter={onViewChapter}
            onViewExams={onViewExams}
          />
        </li>
      ))}
    </ul>
  )
}

type TodayPlanItemCardProps = {
  item: TodayPlanItem
  isStartHere: boolean
  onToggleHomework: (homeworkId: string) => void
  onToggleRevisionTask: (revisionTaskId: string) => void
  onViewChapter: (subjectId: string) => void
  onViewExams: () => void
}

function TodayPlanItemCard({
  item,
  isStartHere,
  onToggleHomework,
  onToggleRevisionTask,
  onViewChapter,
  onViewExams,
}: TodayPlanItemCardProps) {
  const className = `today-plan-item${isStartHere ? ' today-plan-item-featured' : ''}`

  if (item.type === 'homework') {
    return (
      <article className={className}>
        <div className="today-plan-item-heading">
          <div>
            <p className="today-item-type">Homework</p>
            <h3 className="today-item-title">{item.title}</h3>
          </div>
          <label className="today-homework-completion">
            <input
              aria-label={`Mark ${item.title} complete`}
              checked={false}
              type="checkbox"
              onChange={() => onToggleHomework(item.sourceItemId)}
            />
          </label>
        </div>

        <p className="today-item-meta">
          <span>{item.subject.name}</span>
          {item.chapter ? (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{item.chapter.name}</span>
            </>
          ) : null}
        </p>
        <p className="today-item-reason">{item.reason}</p>
        <p className="today-item-date">
          Due{' '}
          <time dateTime={item.dueDate}>
            {formatLocalDate(item.dueDate)}
          </time>
        </p>
      </article>
    )
  }

  if (item.type === 'exam') {
    return (
      <TodayExamPlanItemCard
        className={className}
        item={item}
        onViewExams={onViewExams}
      />
    )
  }

  return (
    <TodayRevisionPlanItemCard
      className={className}
      item={item}
      onToggleRevisionTask={onToggleRevisionTask}
      onViewChapter={onViewChapter}
    />
  )
}

type TodayExamPlanItemCardProps = {
  className: string
  item: TodayExamPlanItem
  onViewExams: () => void
}

function TodayExamPlanItemCard({
  className,
  item,
  onViewExams,
}: TodayExamPlanItemCardProps) {
  return (
    <article className={className}>
      <div className="today-plan-item-heading">
        <div>
          <p className="today-item-type">Exam</p>
          <h3 className="today-item-title">{item.title}</h3>
          {item.series ? (
            <p className="exam-card-series">{item.series.title}</p>
          ) : null}
        </div>
        <button
          aria-label={`View exams for ${item.title}`}
          className="button button-secondary button-compact"
          type="button"
          onClick={onViewExams}
        >
          View exams
        </button>
      </div>

      <p className="today-item-reason">{item.reason}</p>
      <p className="today-item-date">
        Exam date{' '}
        <time dateTime={item.examDate}>
          {formatLocalDate(item.examDate)}
        </time>
      </p>

      <ul className="exam-scope-summary today-exam-scope-summary">
        {item.subjectScopes.map((scope) => (
          <li key={scope.subject.id}>
            <strong>
              {scope.subject.name}
              {scope.isFrozenSnapshot ? (
                <span className="exam-original-syllabus-badge">
                  Original syllabus
                </span>
              ) : null}
            </strong>
            <span>{scope.syllabusSummary}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

type TodayRevisionPlanItemCardProps = {
  className: string
  item: TodayRevisionPlanItem
  onToggleRevisionTask: (revisionTaskId: string) => void
  onViewChapter: (subjectId: string) => void
}

function TodayRevisionPlanItemCard({
  className,
  item,
  onToggleRevisionTask,
  onViewChapter,
}: TodayRevisionPlanItemCardProps) {
  const isScheduled = item.revisionKind === 'scheduled'

  return (
    <article className={className}>
      <div className="today-plan-item-heading">
        <div>
          <p className="today-item-type">
            {isScheduled ? 'Revision' : 'Suggested revision'}
          </p>
          <h3 className="today-item-title">{item.title}</h3>
        </div>
        {isScheduled ? (
          <label className="today-homework-completion">
            <input
              aria-label={`Mark revision for ${item.chapter.name} complete`}
              checked={false}
              type="checkbox"
              onChange={() => onToggleRevisionTask(item.taskId)}
            />
          </label>
        ) : (
          <button
            aria-label={`View chapter ${item.chapter.name}`}
            className="button button-secondary button-compact"
            type="button"
            onClick={() => onViewChapter(item.subject.id)}
          >
            View chapter
          </button>
        )}
      </div>

      <p className="today-item-meta">
        <span>{item.subject.name}</span>
        <span aria-hidden="true">&middot;</span>
        <span>{item.chapter.name}</span>
      </p>
      <p className="today-item-reason">{item.reason}</p>
      {item.scheduledDate ? (
        <p className="today-item-date">
          Revision date{' '}
          <time dateTime={item.scheduledDate}>
            {formatLocalDate(item.scheduledDate)}
          </time>
        </p>
      ) : null}
    </article>
  )
}

export function TodayScreen({
  data,
  onToggleHomework,
  onToggleRevisionTask,
  onViewChapter,
  onViewExams,
  onViewRevisionPlan,
}: TodayScreenProps) {
  const [actionError, setActionError] = useState<string | null>(null)
  const currentDate = new Date()
  const plan = createTodayPlan(data, currentDate)
  const startHereItem = plan.items[0]
  const nextUpItems = plan.items.slice(1, 5)
  const comingSoonItems = plan.items.slice(5)

  function handleToggleHomework(homeworkId: string) {
    setActionError(onToggleHomework(homeworkId))
  }

  function handleToggleRevisionTask(revisionTaskId: string) {
    setActionError(onToggleRevisionTask(revisionTaskId))
  }

  return (
    <section className="screen today-screen" aria-labelledby="today-heading">
      <header className="screen-heading">
        <p className="eyebrow">Your study plan</p>
        <div className="section-heading-row">
          <div>
            <h1 id="today-heading">Today</h1>
            <time className="today-date" dateTime={plan.today}>
              {formatTodayDate(currentDate)}
            </time>
            <p>Here’s what needs your attention.</p>
          </div>
          <button
            className="button button-secondary"
            type="button"
            onClick={onViewRevisionPlan}
          >
            Revision plan
          </button>
        </div>
      </header>

      {startHereItem ? (
        <div className="today-plan-sections">
          <section
            className="today-plan-section"
            aria-labelledby="today-start-here-heading"
          >
            <div className="today-section-heading">
              <h2 id="today-start-here-heading">Start here</h2>
            </div>
            <TodayPlanList
              isStartHere
              items={[startHereItem]}
              onToggleHomework={handleToggleHomework}
              onToggleRevisionTask={handleToggleRevisionTask}
              onViewChapter={onViewChapter}
              onViewExams={onViewExams}
            />
          </section>

          {nextUpItems.length > 0 ? (
            <section
              className="today-plan-section"
              aria-labelledby="today-next-up-heading"
            >
              <div className="today-section-heading">
                <h2 id="today-next-up-heading">Next up</h2>
              </div>
              <TodayPlanList
                items={nextUpItems}
                onToggleHomework={handleToggleHomework}
                onToggleRevisionTask={handleToggleRevisionTask}
                onViewChapter={onViewChapter}
                onViewExams={onViewExams}
              />
            </section>
          ) : null}

          {comingSoonItems.length > 0 ? (
            <section
              className="today-plan-section"
              aria-labelledby="today-coming-soon-heading"
            >
              <div className="today-section-heading">
                <h2 id="today-coming-soon-heading">Coming soon</h2>
              </div>
              <TodayPlanList
                items={comingSoonItems}
                onToggleHomework={handleToggleHomework}
                onToggleRevisionTask={handleToggleRevisionTask}
                onViewChapter={onViewChapter}
                onViewExams={onViewExams}
              />
            </section>
          ) : null}
        </div>
      ) : (
        <div className="empty-state today-empty-state">
          <h2>Nothing urgent right now.</h2>
          <p>You’re clear for today.</p>
        </div>
      )}

      {actionError ? (
        <p className="action-error" role="alert">
          {actionError}
        </p>
      ) : null}
    </section>
  )
}
