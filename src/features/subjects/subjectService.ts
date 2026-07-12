import type { StudentOSData, Subject } from '../../types/studentOS'
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

  const timestamp = new Date().toISOString()

  return {
    isCreated: true,
    subject: {
      id: crypto.randomUUID(),
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

  return {
    isDeleted: true,
    data: {
      ...data,
      subjects: data.subjects.filter((subject) => subject.id !== subjectId),
      chapters: data.chapters.filter((chapter) => chapter.subjectId !== subjectId),
    },
  }
}
