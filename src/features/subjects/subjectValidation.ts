export const SUBJECT_NAME_MAX_LENGTH = 60

export function normalizeSubjectName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}
