import type { Subject } from '../../types/studentOS'
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
