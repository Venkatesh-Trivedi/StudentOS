import type {
  Chapter,
  Resource,
  ResourceType,
  Subject,
} from '../../types/studentOS'

export const RESOURCE_TITLE_MAX_LENGTH = 100
export const RESOURCE_URL_MAX_LENGTH = 2048
export const RESOURCE_CONTENT_MAX_LENGTH = 5000

export type ResourceValidationInput = {
  subjectId: string
  chapterId: string | null
  type: ResourceType
  title: string
  url: string | null
  content: string | null
}

export type ResourceValidationResult =
  | {
      isValid: true
      subjectId: string
      chapterId: string | null
      type: ResourceType
      normalizedTitle: string
      url: string | null
      content: string | null
    }
  | {
      isValid: false
      error: string
    }

export type ResourceTitleValidationResult =
  | {
      isValid: true
      normalizedTitle: string
    }
  | {
      isValid: false
      error: string
    }

export function normalizeResourceTitle(title: string): string {
  return title.trim().replace(/\s+/g, ' ')
}

export function normalizeResourceContent(content: string): string {
  return content.trim()
}

export function normalizeResourceUrl(url: string): string {
  const trimmedUrl = url.trim()
  const hasUrlScheme = /^[a-z][a-z\d+.-]*:/i.test(trimmedUrl)

  return hasUrlScheme ? trimmedUrl : `https://${trimmedUrl}`
}

export function validateResourceTitle(
  title: string,
  subjectId: string,
  chapterId: string | null,
  existingResources: Resource[],
): ResourceTitleValidationResult {
  const normalizedTitle = normalizeResourceTitle(title)

  if (normalizedTitle.length === 0) {
    return {
      isValid: false,
      error: 'Resource title is required',
    }
  }

  if (normalizedTitle.length > RESOURCE_TITLE_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Resource title must be ${RESOURCE_TITLE_MAX_LENGTH} characters or fewer`,
    }
  }

  const titleForComparison = normalizedTitle.toLowerCase()
  const duplicateExists = existingResources.some(
    (resource) =>
      resource.subjectId === subjectId &&
      resource.chapterId === chapterId &&
      normalizeResourceTitle(resource.title).toLowerCase() ===
        titleForComparison,
  )

  if (duplicateExists) {
    return {
      isValid: false,
      error: 'A resource with this title already exists in this location',
    }
  }

  return {
    isValid: true,
    normalizedTitle,
  }
}

export function validateResource(
  input: ResourceValidationInput,
  existingSubjects: Subject[],
  existingChapters: Chapter[],
  existingResources: Resource[],
): ResourceValidationResult {
  if (input.subjectId.trim().length === 0) {
    return {
      isValid: false,
      error: 'Subject is required',
    }
  }

  const subjectExists = existingSubjects.some(
    (subject) => subject.id === input.subjectId,
  )

  if (!subjectExists) {
    return {
      isValid: false,
      error: 'Subject does not exist',
    }
  }

  if (input.chapterId !== null) {
    const chapter = existingChapters.find(
      (existingChapter) => existingChapter.id === input.chapterId,
    )

    if (chapter === undefined) {
      return {
        isValid: false,
        error: 'Chapter does not exist',
      }
    }

    if (chapter.subjectId !== input.subjectId) {
      return {
        isValid: false,
        error: 'Chapter does not belong to the selected subject',
      }
    }
  }

  const titleValidation = validateResourceTitle(
    input.title,
    input.subjectId,
    input.chapterId,
    existingResources,
  )

  if (!titleValidation.isValid) {
    return titleValidation
  }

  if (input.type === 'link') {
    if (input.content !== null) {
      return {
        isValid: false,
        error: 'Link resources cannot include note content',
      }
    }

    const urlValidation = validateResourceUrl(input.url)

    if (!urlValidation.isValid) {
      return urlValidation
    }

    return {
      isValid: true,
      subjectId: input.subjectId,
      chapterId: input.chapterId,
      type: input.type,
      normalizedTitle: titleValidation.normalizedTitle,
      url: urlValidation.normalizedUrl,
      content: null,
    }
  }

  if (input.type === 'note') {
    if (input.url !== null) {
      return {
        isValid: false,
        error: 'Note resources cannot include a URL',
      }
    }

    const contentValidation = validateResourceNoteContent(input.content)

    if (!contentValidation.isValid) {
      return contentValidation
    }

    return {
      isValid: true,
      subjectId: input.subjectId,
      chapterId: input.chapterId,
      type: input.type,
      normalizedTitle: titleValidation.normalizedTitle,
      url: null,
      content: contentValidation.normalizedContent,
    }
  }

  return {
    isValid: false,
    error: 'Resource type is invalid',
  }
}

type ResourceUrlValidationResult =
  | {
      isValid: true
      normalizedUrl: string
    }
  | {
      isValid: false
      error: string
    }

function validateResourceUrl(url: string | null): ResourceUrlValidationResult {
  const trimmedUrl = url?.trim() ?? ''

  if (trimmedUrl.length === 0) {
    return {
      isValid: false,
      error: 'Resource URL is required',
    }
  }

  const normalizedUrl = normalizeResourceUrl(trimmedUrl)

  if (normalizedUrl.length > RESOURCE_URL_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Resource URL must be ${RESOURCE_URL_MAX_LENGTH} characters or fewer`,
    }
  }

  let parsedUrl: URL

  try {
    parsedUrl = new URL(normalizedUrl)
  } catch {
    return {
      isValid: false,
      error: 'Enter a valid website address.',
    }
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return {
      isValid: false,
      error: 'Enter a valid website address.',
    }
  }

  return {
    isValid: true,
    normalizedUrl,
  }
}

type ResourceContentValidationResult =
  | {
      isValid: true
      normalizedContent: string
    }
  | {
      isValid: false
      error: string
    }

function validateResourceNoteContent(
  content: string | null,
): ResourceContentValidationResult {
  const normalizedContent = normalizeResourceContent(content ?? '')

  if (normalizedContent.length === 0) {
    return {
      isValid: false,
      error: 'Note content is required',
    }
  }

  if (normalizedContent.length > RESOURCE_CONTENT_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Note content must be ${RESOURCE_CONTENT_MAX_LENGTH} characters or fewer`,
    }
  }

  return {
    isValid: true,
    normalizedContent,
  }
}
