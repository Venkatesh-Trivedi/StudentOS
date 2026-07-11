import type { Subject } from '../../types/studentOS'

export const SUBJECT_NAME_MAX_LENGTH = 60

export function normalizeSubjectName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

export type SubjectNameValidationResult =
  | {
      isValid: true
      normalizedName: string
    }
  | {
      isValid: false
      error: string
    }

export function validateSubjectName(
  name: string,
  existingSubjects: Subject[],
): SubjectNameValidationResult {
  const normalizedName = normalizeSubjectName(name)

  if (normalizedName.length === 0) {
    return {
      isValid: false,
      error: 'Subject name is required',
    }
  }

  if (normalizedName.length > SUBJECT_NAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Subject name must be ${SUBJECT_NAME_MAX_LENGTH} characters or fewer`,
    }
  }

  const normalizedNameForComparison = normalizedName.toLowerCase()
  const hasDuplicate = existingSubjects.some((subject) => {
    return (
      normalizeSubjectName(subject.name).toLowerCase() ===
      normalizedNameForComparison
    )
  })

  if (hasDuplicate) {
    return {
      isValid: false,
      error: 'A subject with this name already exists',
    }
  }

  return {
    isValid: true,
    normalizedName,
  }
}
