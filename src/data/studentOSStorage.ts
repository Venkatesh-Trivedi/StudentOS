import type {
  Chapter,
  Homework,
  StudentOSData,
  Subject,
} from '../types/studentOS'

export const STUDENT_OS_STORAGE_KEY = 'studentos:data'

export type StudentOSStorageReader = {
  getItem(key: string): string | null
}

export type StudentOSStorageWriter = {
  setItem(key: string, value: string): void
}

export type StudentOSDataLoadResult =
  | {
      isSuccess: true
      data: StudentOSData
    }
  | {
      isSuccess: false
      error: string
    }

export type StudentOSDataSaveResult =
  | {
      isSuccess: true
    }
  | {
      isSuccess: false
      error: string
    }

export function createEmptyStudentOSData(): StudentOSData {
  return {
    version: 2,
    subjects: [],
    chapters: [],
    homework: [],
  }
}

export function loadStudentOSData(
  storage?: StudentOSStorageReader,
): StudentOSDataLoadResult {
  const storageToUse = storage ?? getDefaultStorage()

  if (storageToUse === null) {
    return {
      isSuccess: false,
      error: 'StudentOS storage is unavailable',
    }
  }

  let storedData: string | null

  try {
    storedData = storageToUse.getItem(STUDENT_OS_STORAGE_KEY)
  } catch {
    return {
      isSuccess: false,
      error: 'Unable to load StudentOS data',
    }
  }

  if (storedData === null) {
    return {
      isSuccess: true,
      data: createEmptyStudentOSData(),
    }
  }

  let parsedData: unknown

  try {
    parsedData = JSON.parse(storedData)
  } catch {
    return {
      isSuccess: false,
      error: 'Stored StudentOS data is not valid JSON',
    }
  }

  if (isStudentOSDataVersion1(parsedData)) {
    return {
      isSuccess: true,
      data: migrateStudentOSDataVersion1(parsedData),
    }
  }

  if (isStudentOSData(parsedData)) {
    return {
      isSuccess: true,
      data: parsedData,
    }
  }

  if (
    isRecord(parsedData) &&
    typeof parsedData.version === 'number' &&
    parsedData.version !== 1 &&
    parsedData.version !== 2
  ) {
    return {
      isSuccess: false,
      error: 'Stored StudentOS data uses an unsupported version',
    }
  }

  return {
    isSuccess: false,
    error: 'Stored StudentOS data has an invalid structure',
  }
}

export function saveStudentOSData(
  data: StudentOSData,
  storage?: StudentOSStorageWriter,
): StudentOSDataSaveResult {
  const storageToUse = storage ?? getDefaultStorage()

  if (storageToUse === null) {
    return {
      isSuccess: false,
      error: 'StudentOS storage is unavailable',
    }
  }

  if (!isStudentOSData(data)) {
    return {
      isSuccess: false,
      error: 'StudentOS data has an invalid structure',
    }
  }

  try {
    storageToUse.setItem(STUDENT_OS_STORAGE_KEY, JSON.stringify(data))
  } catch {
    return {
      isSuccess: false,
      error: 'Unable to save StudentOS data',
    }
  }

  return {
    isSuccess: true,
  }
}

function getDefaultStorage(): Storage | null {
  try {
    return localStorage
  } catch {
    return null
  }
}

function isStudentOSData(value: unknown): value is StudentOSData {
  return (
    isRecord(value) &&
    value.version === 2 &&
    Array.isArray(value.subjects) &&
    value.subjects.every(isSubject) &&
    Array.isArray(value.chapters) &&
    value.chapters.every(isChapter) &&
    Array.isArray(value.homework) &&
    value.homework.every(isHomework)
  )
}

type StudentOSDataVersion1 = {
  version: 1
  subjects: Subject[]
  chapters: Chapter[]
}

function isStudentOSDataVersion1(
  value: unknown,
): value is StudentOSDataVersion1 {
  return (
    isRecord(value) &&
    value.version === 1 &&
    Array.isArray(value.subjects) &&
    value.subjects.every(isSubject) &&
    Array.isArray(value.chapters) &&
    value.chapters.every(isChapter)
  )
}

function migrateStudentOSDataVersion1(
  data: StudentOSDataVersion1,
): StudentOSData {
  return {
    version: 2,
    subjects: [...data.subjects],
    chapters: [...data.chapters],
    homework: [],
  }
}

function isSubject(value: unknown): value is Subject {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  )
}

function isChapter(value: unknown): value is Chapter {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.subjectId) &&
    isString(value.name) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  )
}

function isHomework(value: unknown): value is Homework {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.subjectId) &&
    (isString(value.chapterId) || value.chapterId === null) &&
    isString(value.title) &&
    isString(value.dueDate) &&
    typeof value.isCompleted === 'boolean' &&
    (isString(value.completedAt) || value.completedAt === null) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}
