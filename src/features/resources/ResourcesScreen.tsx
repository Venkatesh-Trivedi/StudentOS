import { useState, type FormEvent } from 'react'

import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import type {
  Chapter,
  Resource,
  ResourceType,
  Subject,
} from '../../types/studentOS'
import type { ResourceCreationInput } from './resourceService'

export type ResourcesScreenProps = {
  resources: Resource[]
  subjects: Subject[]
  chapters: Chapter[]
  initialSubjectId: string | null
  initialChapterId: string | null
  onBack: () => void
  onCreateResource: (input: ResourceCreationInput) => string | null
  onRenameResource: (resourceId: string, title: string) => string | null
  onDeleteResource: (resourceId: string) => string | null
}

type ResourceGroup = {
  heading: 'Links' | 'Notes'
  items: Resource[]
}

const NOTE_PREVIEW_MAX_LENGTH = 280

function getContextSubjectId(
  initialSubjectId: string | null,
  subjects: Subject[],
): string {
  return initialSubjectId !== null &&
    subjects.some((subject) => subject.id === initialSubjectId)
    ? initialSubjectId
    : ''
}

function getContextChapterId(
  initialChapterId: string | null,
  subjectId: string,
  chapters: Chapter[],
): string {
  return initialChapterId !== null &&
    chapters.some(
      (chapter) =>
        chapter.id === initialChapterId && chapter.subjectId === subjectId,
    )
    ? initialChapterId
    : ''
}

function getLinkHostname(url: string): string | null {
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

function getNotePreview(content: string): string {
  if (content.length <= NOTE_PREVIEW_MAX_LENGTH) {
    return content
  }

  return `${content.slice(0, NOTE_PREVIEW_MAX_LENGTH).trimEnd()}...`
}

export function ResourcesScreen({
  resources,
  subjects,
  chapters,
  initialSubjectId,
  initialChapterId,
  onBack,
  onCreateResource,
  onRenameResource,
  onDeleteResource,
}: ResourcesScreenProps) {
  const contextSubjectId = getContextSubjectId(initialSubjectId, subjects)
  const contextChapterId = getContextChapterId(
    initialChapterId,
    contextSubjectId,
    chapters,
  )
  const [filterSubjectId, setFilterSubjectId] = useState(contextSubjectId)
  const [filterChapterId, setFilterChapterId] = useState(contextChapterId)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [resourceType, setResourceType] = useState<ResourceType>('link')
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState(contextSubjectId)
  const [chapterId, setChapterId] = useState(contextChapterId)
  const [url, setUrl] = useState('')
  const [content, setContent] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [resourceBeingRenamed, setResourceBeingRenamed] =
    useState<Resource | null>(null)
  const [renameTitle, setRenameTitle] = useState('')
  const [renameError, setRenameError] = useState<string | null>(null)
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(
    null,
  )

  const subjectNames = new Map(
    subjects.map((subject) => [subject.id, subject.name]),
  )
  const chapterNames = new Map(
    chapters.map((chapter) => [chapter.id, chapter.name]),
  )
  const filterChapters = chapters.filter(
    (chapter) => chapter.subjectId === filterSubjectId,
  )
  const formChapters = chapters.filter(
    (chapter) => chapter.subjectId === subjectId,
  )
  const filteredResources = resources.filter(
    (resource) =>
      (!filterSubjectId || resource.subjectId === filterSubjectId) &&
      (!filterChapterId || resource.chapterId === filterChapterId),
  )
  const groups: ResourceGroup[] = [
    {
      heading: 'Links',
      items: filteredResources.filter((resource) => resource.type === 'link'),
    },
    {
      heading: 'Notes',
      items: filteredResources.filter((resource) => resource.type === 'note'),
    },
  ]

  function resetForm() {
    setResourceType('link')
    setTitle('')
    setSubjectId(contextSubjectId)
    setChapterId(contextChapterId)
    setUrl('')
    setContent('')
    setFormError(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const input: ResourceCreationInput = {
      subjectId,
      chapterId: chapterId || null,
      type: resourceType,
      title,
      url: resourceType === 'link' ? url : null,
      content: resourceType === 'note' ? content : null,
    }
    const creationError = onCreateResource(input)

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

  function startRenaming(resource: Resource) {
    setResourceBeingRenamed(resource)
    setRenameTitle(resource.title)
    setRenameError(null)
    setActionError(null)
  }

  function cancelRenaming() {
    setResourceBeingRenamed(null)
    setRenameTitle('')
    setRenameError(null)
  }

  function handleRenameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!resourceBeingRenamed) {
      return
    }

    const error = onRenameResource(resourceBeingRenamed.id, renameTitle)

    if (error) {
      setRenameError(error)
      return
    }

    cancelRenaming()
    setActionError(null)
  }

  function handleConfirmDelete() {
    if (!resourceToDelete) {
      return
    }

    setActionError(onDeleteResource(resourceToDelete.id))
    setResourceToDelete(null)
  }

  return (
    <section
      className="screen resources-screen"
      aria-labelledby="resources-heading"
    >
      <button className="back-button" type="button" onClick={onBack}>
        <span aria-hidden="true">&larr;</span> Back
      </button>

      <header className="screen-heading">
        <p className="eyebrow">Keep useful study material close</p>
        <div className="section-heading-row">
          <div>
            <h1 id="resources-heading">Resources</h1>
            <p>Save trusted links and quick notes for when you need them.</p>
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
              Add resource
            </button>
          ) : null}
        </div>
      </header>

      {isFormOpen ? (
        <form className="inline-form resource-form" onSubmit={handleSubmit}>
          <fieldset className="resource-type-fieldset">
            <legend>Resource type</legend>
            <div className="resource-type-options">
              <label>
                <input
                  checked={resourceType === 'link'}
                  name="resource-type"
                  type="radio"
                  value="link"
                  onChange={() => {
                    setResourceType('link')
                    setContent('')
                    setFormError(null)
                  }}
                />
                Link
              </label>
              <label>
                <input
                  checked={resourceType === 'note'}
                  name="resource-type"
                  type="radio"
                  value="note"
                  onChange={() => {
                    setResourceType('note')
                    setUrl('')
                    setFormError(null)
                  }}
                />
                Note
              </label>
            </div>
          </fieldset>

          <div className="resource-form-grid">
            <div className="resource-form-field resource-title-field">
              <label htmlFor="resource-title">Title</label>
              <input
                aria-describedby={formError ? 'resource-form-error' : undefined}
                autoFocus
                id="resource-title"
                maxLength={100}
                placeholder="For example, Algebra formula sheet"
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value)
                  setFormError(null)
                }}
              />
            </div>

            <div className="resource-form-field">
              <label htmlFor="resource-subject">Subject</label>
              <select
                aria-describedby={formError ? 'resource-form-error' : undefined}
                id="resource-subject"
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

            <div className="resource-form-field">
              <label htmlFor="resource-chapter">Chapter (optional)</label>
              <select
                disabled={!subjectId || formChapters.length === 0}
                id="resource-chapter"
                value={chapterId}
                onChange={(event) => {
                  setChapterId(event.target.value)
                  setFormError(null)
                }}
              >
                <option value="">
                  {subjectId && formChapters.length === 0
                    ? 'No chapters available'
                    : 'Subject-wide'}
                </option>
                {formChapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.name}
                  </option>
                ))}
              </select>
            </div>

            {resourceType === 'link' ? (
              <div className="resource-form-field resource-value-field">
                <label htmlFor="resource-url">URL</label>
                <input
                  aria-describedby={
                    formError ? 'resource-form-error' : undefined
                  }
                  autoCapitalize="none"
                  autoCorrect="off"
                  id="resource-url"
                  inputMode="url"
                  maxLength={2048}
                  placeholder="example.com or https://example.com"
                  spellCheck={false}
                  type="text"
                  value={url}
                  onChange={(event) => {
                    setUrl(event.target.value)
                    setFormError(null)
                  }}
                />
              </div>
            ) : (
              <div className="resource-form-field resource-value-field">
                <label htmlFor="resource-content">Note</label>
                <textarea
                  aria-describedby={
                    formError ? 'resource-form-error' : undefined
                  }
                  id="resource-content"
                  maxLength={5000}
                  placeholder="Write a short study note..."
                  rows={6}
                  value={content}
                  onChange={(event) => {
                    setContent(event.target.value)
                    setFormError(null)
                  }}
                />
              </div>
            )}
          </div>

          {formError ? (
            <p className="form-error" id="resource-form-error" role="alert">
              {formError}
            </p>
          ) : null}

          <div className="form-actions resource-form-actions">
            <button className="button button-primary" type="submit">
              Save resource
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

      <section className="resource-filters" aria-labelledby="resource-filters-heading">
        <div className="resource-filter-heading">
          <h2 id="resource-filters-heading">Filter resources</h2>
          {(filterSubjectId || filterChapterId) && (
            <button
              className="button button-secondary button-compact"
              type="button"
              onClick={() => {
                setFilterSubjectId('')
                setFilterChapterId('')
              }}
            >
              Show all
            </button>
          )}
        </div>
        <div className="resource-filter-fields">
          <div className="resource-filter-field">
            <label htmlFor="resource-filter-subject">Subject</label>
            <select
              id="resource-filter-subject"
              value={filterSubjectId}
              onChange={(event) => {
                setFilterSubjectId(event.target.value)
                setFilterChapterId('')
                cancelRenaming()
              }}
            >
              <option value="">All subjects</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          <div className="resource-filter-field">
            <label htmlFor="resource-filter-chapter">Chapter</label>
            <select
              disabled={!filterSubjectId || filterChapters.length === 0}
              id="resource-filter-chapter"
              value={filterChapterId}
              onChange={(event) => {
                setFilterChapterId(event.target.value)
                cancelRenaming()
              }}
            >
              <option value="">
                {filterSubjectId && filterChapters.length === 0
                  ? 'No chapters available'
                  : 'All chapters'}
              </option>
              {filterChapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {filteredResources.length === 0 ? (
        <div className="empty-state resources-empty-state">
          <h2>No resources here yet</h2>
          <p>
            {resources.length === 0
              ? 'Add a useful link or note when you find material worth keeping.'
              : 'Try another filter or add material for this part of your studies.'}
          </p>
        </div>
      ) : (
        <div className="resource-groups">
          {groups.map((group) =>
            group.items.length > 0 ? (
              <section
                className="resource-group"
                key={group.heading}
                aria-labelledby={`resource-group-${group.heading.toLowerCase()}`}
              >
                <div className="resource-group-heading">
                  <h2 id={`resource-group-${group.heading.toLowerCase()}`}>
                    {group.heading}
                  </h2>
                  <span>
                    {group.items.length}{' '}
                    {group.items.length === 1 ? 'resource' : 'resources'}
                  </span>
                </div>

                <ul className="resource-list">
                  {group.items.map((resource) => {
                    const chapterName = resource.chapterId
                      ? chapterNames.get(resource.chapterId)
                      : null
                    const hostname = resource.url
                      ? getLinkHostname(resource.url)
                      : null
                    const isBeingRenamed =
                      resourceBeingRenamed?.id === resource.id

                    return (
                      <li className="resource-card" key={resource.id}>
                        <div className="resource-card-content">
                          {isBeingRenamed ? (
                            <form
                              className="resource-rename-form"
                              onSubmit={handleRenameSubmit}
                            >
                              <label htmlFor={`resource-rename-${resource.id}`}>
                                Resource title
                              </label>
                              <input
                                aria-describedby={
                                  renameError
                                    ? `resource-rename-error-${resource.id}`
                                    : undefined
                                }
                                autoFocus
                                id={`resource-rename-${resource.id}`}
                                maxLength={100}
                                type="text"
                                value={renameTitle}
                                onChange={(event) => {
                                  setRenameTitle(event.target.value)
                                  setRenameError(null)
                                }}
                              />
                              {renameError ? (
                                <p
                                  className="form-error"
                                  id={`resource-rename-error-${resource.id}`}
                                  role="alert"
                                >
                                  {renameError}
                                </p>
                              ) : null}
                              <div className="form-actions resource-rename-actions">
                                <button
                                  className="button button-primary button-compact"
                                  type="submit"
                                >
                                  Save
                                </button>
                                <button
                                  className="button button-secondary button-compact"
                                  type="button"
                                  onClick={cancelRenaming}
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="resource-title-row">
                                <h3>{resource.title}</h3>
                                <span className="resource-type-label">
                                  {resource.type === 'link' ? 'Link' : 'Note'}
                                </span>
                              </div>
                              <p className="resource-card-meta">
                                <span>
                                  {subjectNames.get(resource.subjectId) ??
                                    'Unknown subject'}
                                </span>
                                <span aria-hidden="true">&middot;</span>
                                <span>{chapterName ?? 'Subject-wide'}</span>
                              </p>
                              {resource.type === 'link' && resource.url ? (
                                <div className="resource-link-details">
                                  {hostname ? (
                                    <span className="resource-hostname">
                                      {hostname}
                                    </span>
                                  ) : null}
                                  <a
                                    aria-label={`Open ${resource.title}${
                                      hostname ? ` on ${hostname}` : ''
                                    } in a new tab`}
                                    className="button button-secondary button-compact"
                                    href={resource.url}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                  >
                                    Open link
                                  </a>
                                </div>
                              ) : null}
                              {resource.type === 'note' && resource.content ? (
                                <div className="resource-note-content">
                                  <p className="resource-note-preview">
                                    {getNotePreview(resource.content)}
                                  </p>
                                  {resource.content.length >
                                  NOTE_PREVIEW_MAX_LENGTH ? (
                                    <details>
                                      <summary>Read full note</summary>
                                      <p className="resource-note-full">
                                        {resource.content}
                                      </p>
                                    </details>
                                  ) : null}
                                </div>
                              ) : null}
                            </>
                          )}
                        </div>

                        {!isBeingRenamed ? (
                          <div className="resource-card-actions">
                            <button
                              aria-label={`Rename ${resource.title}`}
                              className="button button-secondary button-compact"
                              type="button"
                              onClick={() => startRenaming(resource)}
                            >
                              Rename
                            </button>
                            <button
                              aria-label={`Delete ${resource.title}`}
                              className="button button-danger button-compact"
                              type="button"
                              onClick={() => setResourceToDelete(resource)}
                            >
                              Delete
                            </button>
                          </div>
                        ) : null}
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
        isOpen={resourceToDelete !== null}
        message={resourceToDelete ? `Delete ${resourceToDelete.title}?` : ''}
        title="Delete resource?"
        onCancel={() => setResourceToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  )
}
