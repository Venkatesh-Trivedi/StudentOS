import { useState } from 'react'

import type { Chapter, Subject } from '../../types/studentOS'

type ChapterScreenProps = {
  subject: Subject
  chapters: Chapter[]
  onBack: () => void
  onCreateChapter: (name: string, subjectId: string) => string | null
}

export function ChapterScreen({
  subject,
  chapters,
  onBack,
  onCreateChapter,
}: ChapterScreenProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
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

  return (
    <section className="screen" aria-labelledby="chapters-heading">
      <button className="back-button" type="button" onClick={onBack}>
        <span aria-hidden="true">←</span> Back to subjects
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
              <span>{chapter.name}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
