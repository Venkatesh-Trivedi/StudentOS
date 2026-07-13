import type { StudentOSData, Subject } from '../../types/studentOS'
import { createId } from '../../shared/utils/createId'
import { validateSubjectName } from './subjectValidation'

export type SubjectCreationResult =
  | {
      isCreated: true
      subject: Subject
    }
  | {
      isCreated: false
      error: string
    }

export type SubjectDeletionResult =
  | {
      isDeleted: true
      data: StudentOSData
    }
  | {
      isDeleted: false
      error: string
    }

export type SubjectRenameResult =
  | {
      isRenamed: true
      data: StudentOSData
    }
  | {
      isRenamed: false
      error: string
    }

export function createSubject(
  name: string,
  existingSubjects: Subject[],
): SubjectCreationResult {
  const validation = validateSubjectName(name, existingSubjects)

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
    subject: {
      id,
      name: validation.normalizedName,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  }
}

export function deleteSubject(
  subjectId: string,
  data: StudentOSData,
): SubjectDeletionResult {
  const subjectExists = data.subjects.some((subject) => subject.id === subjectId)

  if (!subjectExists) {
    return {
      isDeleted: false,
      error: 'Subject does not exist',
    }
  }

  const chapterIdsToDelete = new Set(
    data.chapters
      .filter((chapter) => chapter.subjectId === subjectId)
      .map((chapter) => chapter.id),
  )
  const exams = data.exams.flatMap((exam) => {
    const subjectScopes = exam.subjectScopes.filter(
      (scope) => scope.subjectId !== subjectId,
    )

    if (subjectScopes.length === 0) {
      return []
    }

    if (subjectScopes.length === exam.subjectScopes.length) {
      return [exam]
    }

    return [
      {
        ...exam,
        subjectScopes,
      },
    ]
  })

  return {
    isDeleted: true,
    data: {
      ...data,
      subjects: data.subjects.filter((subject) => subject.id !== subjectId),
      chapters: data.chapters.filter((chapter) => chapter.subjectId !== subjectId),
      homework: data.homework.filter(
        (homework) => homework.subjectId !== subjectId,
      ),
      exams,
      chapterConfidences: data.chapterConfidences.filter(
        (confidence) => !chapterIdsToDelete.has(confidence.chapterId),
      ),
      revisionTasks: data.revisionTasks.filter(
        (revisionTask) => !chapterIdsToDelete.has(revisionTask.chapterId),
      ),
      resources: data.resources.filter(
        (resource) => resource.subjectId !== subjectId,
      ),
    },
  }
}

export function renameSubject(
  subjectId: string,
  name: string,
  data: StudentOSData,
): SubjectRenameResult {
  const subjectToRename = data.subjects.find(
    (subject) => subject.id === subjectId,
  )

  if (subjectToRename === undefined) {
    return {
      isRenamed: false,
      error: 'Subject does not exist',
    }
  }

  const otherSubjects = data.subjects.filter(
    (subject) => subject.id !== subjectId,
  )
  const validation = validateSubjectName(name, otherSubjects)

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
      subjects: data.subjects.map((subject) => {
        if (subject.id !== subjectId) {
          return subject
        }

        return {
          ...subject,
          name: validation.normalizedName,
          updatedAt: timestamp,
        }
      }),
    },
  }
}
