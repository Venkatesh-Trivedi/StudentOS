import type { Resource, StudentOSData } from '../../types/studentOS'
import { createId } from '../../shared/utils/createId'
import {
  validateResource,
  validateResourceTitle,
  type ResourceValidationInput,
} from './resourceValidation'

export type ResourceCreationInput = ResourceValidationInput

export type ResourceCreationResult =
  | {
      isCreated: true
      resource: Resource
    }
  | {
      isCreated: false
      error: string
    }

export type ResourceRenameResult =
  | {
      isRenamed: true
      data: StudentOSData
    }
  | {
      isRenamed: false
      error: string
    }

export type ResourceDeletionResult =
  | {
      isDeleted: true
      data: StudentOSData
    }
  | {
      isDeleted: false
      error: string
    }

export function createResource(
  input: ResourceCreationInput,
  data: StudentOSData,
): ResourceCreationResult {
  const validation = validateResource(
    input,
    data.subjects,
    data.chapters,
    data.resources,
  )

  if (!validation.isValid) {
    return {
      isCreated: false,
      error: validation.error,
    }
  }

  let id: string

  try {
    id = createId()
  } catch {
    return {
      isCreated: false,
      error: 'Unable to create a unique ID',
    }
  }

  const timestamp = new Date().toISOString()

  return {
    isCreated: true,
    resource: {
      id,
      subjectId: validation.subjectId,
      chapterId: validation.chapterId,
      type: validation.type,
      title: validation.normalizedTitle,
      url: validation.url,
      content: validation.content,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  }
}

export function renameResource(
  resourceId: string,
  title: string,
  data: StudentOSData,
): ResourceRenameResult {
  const resourceToRename = data.resources.find(
    (resource) => resource.id === resourceId,
  )

  if (resourceToRename === undefined) {
    return {
      isRenamed: false,
      error: 'Resource does not exist',
    }
  }

  const otherResources = data.resources.filter(
    (resource) => resource.id !== resourceId,
  )
  const validation = validateResourceTitle(
    title,
    resourceToRename.subjectId,
    resourceToRename.chapterId,
    otherResources,
  )

  if (!validation.isValid) {
    return {
      isRenamed: false,
      error: validation.error,
    }
  }

  const timestamp = new Date().toISOString()

  return {
    isRenamed: true,
    data: {
      ...data,
      resources: data.resources.map((resource) => {
        if (resource.id !== resourceId) {
          return resource
        }

        return {
          ...resource,
          title: validation.normalizedTitle,
          updatedAt: timestamp,
        }
      }),
    },
  }
}

export function deleteResource(
  resourceId: string,
  data: StudentOSData,
): ResourceDeletionResult {
  const resourceExists = data.resources.some(
    (resource) => resource.id === resourceId,
  )

  if (!resourceExists) {
    return {
      isDeleted: false,
      error: 'Resource does not exist',
    }
  }

  return {
    isDeleted: true,
    data: {
      ...data,
      resources: data.resources.filter(
        (resource) => resource.id !== resourceId,
      ),
    },
  }
}
