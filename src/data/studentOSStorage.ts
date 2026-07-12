import type {
  Chapter,
  Exam,
  ExamSeries,
  ExamSubjectScope,
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
    version: 4,
    subjects: [],
    chapters: [],
    homework: [],
    examSeries: [],
    exams: [],
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
    const version2Data = migrateStudentOSDataVersion1(parsedData)
    const version3Data = migrateStudentOSDataVersion2(version2Data)

    return {
      isSuccess: true,
      data: migrateStudentOSDataVersion3(version3Data),
    }
  }

  if (isStudentOSDataVersion2(parsedData)) {
    return {
      isSuccess: true,
      data: migrateStudentOSDataVersion3(
        migrateStudentOSDataVersion2(parsedData),
      ),
    }
  }

  if (isStudentOSDataVersion3(parsedData)) {
    return {
      isSuccess: true,
      data: migrateStudentOSDataVersion3(parsedData),
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
    parsedData.version !== 2 &&
    parsedData.version !== 3 &&
    parsedData.version !== 4
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
    value.version === 4 &&
    Array.isArray(value.subjects) &&
    value.subjects.every(isSubject) &&
    Array.isArray(value.chapters) &&
    value.chapters.every(isChapter) &&
    Array.isArray(value.homework) &&
    value.homework.every(isHomework) &&
    Array.isArray(value.examSeries) &&
    value.examSeries.every(isExamSeries) &&
    Array.isArray(value.exams) &&
    value.exams.every(isExam)
  )
}

type StudentOSDataVersion1 = {
  version: 1
  subjects: Subject[]
  chapters: Chapter[]
}

type StudentOSDataVersion2 = {
  version: 2
  subjects: Subject[]
  chapters: Chapter[]
  homework: Homework[]
}

type ExamSubjectScopeVersion3 = {
  subjectId: string
  chapterIds: string[] | null
}

type ExamVersion3 = {
  id: string
  seriesId: string | null
  title: string
  examDate: string
  subjectScopes: ExamSubjectScopeVersion3[]
  createdAt: string
  updatedAt: string
}

type StudentOSDataVersion3 = {
  version: 3
  subjects: Subject[]
  chapters: Chapter[]
  homework: Homework[]
  examSeries: ExamSeries[]
  exams: ExamVersion3[]
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
): StudentOSDataVersion2 {
  return {
    version: 2,
    subjects: [...data.subjects],
    chapters: [...data.chapters],
    homework: [],
  }
}

function isStudentOSDataVersion2(
  value: unknown,
): value is StudentOSDataVersion2 {
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

function migrateStudentOSDataVersion2(
  data: StudentOSDataVersion2,
): StudentOSDataVersion3 {
  return {
    version: 3,
    subjects: [...data.subjects],
    chapters: [...data.chapters],
    homework: [...data.homework],
    examSeries: [],
    exams: [],
  }
}

function isStudentOSDataVersion3(
  value: unknown,
): value is StudentOSDataVersion3 {
  return (
    isRecord(value) &&
    value.version === 3 &&
    Array.isArray(value.subjects) &&
    value.subjects.every(isSubject) &&
    Array.isArray(value.chapters) &&
    value.chapters.every(isChapter) &&
    Array.isArray(value.homework) &&
    value.homework.every(isHomework) &&
    Array.isArray(value.examSeries) &&
    value.examSeries.every(isExamSeries) &&
    Array.isArray(value.exams) &&
    value.exams.every(isExamVersion3)
  )
}

function migrateStudentOSDataVersion3(
  data: StudentOSDataVersion3,
): StudentOSData {
  return {
    version: 4,
    subjects: [...data.subjects],
    chapters: [...data.chapters],
    homework: [...data.homework],
    examSeries: [...data.examSeries],
    exams: data.exams.map((exam) => ({
      ...exam,
      subjectScopes: exam.subjectScopes.map((scope) => ({
        subjectId: scope.subjectId,
        scopeType: scope.chapterIds === null ? 'entire' : 'specific',
        chapterIds:
          scope.chapterIds === null
            ? data.chapters
                .filter((chapter) => chapter.subjectId === scope.subjectId)
                .map((chapter) => chapter.id)
            : [...scope.chapterIds],
      })),
    })),
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

function isExamSeries(value: unknown): value is ExamSeries {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.title) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  )
}

function isExam(value: unknown): value is Exam {
  return (
    isRecord(value) &&
    isString(value.id) &&
    (isString(value.seriesId) || value.seriesId === null) &&
    isString(value.title) &&
    isString(value.examDate) &&
    Array.isArray(value.subjectScopes) &&
    value.subjectScopes.length > 0 &&
    value.subjectScopes.every(isExamSubjectScope) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  )
}

function isExamVersion3(value: unknown): value is ExamVersion3 {
  return (
    isRecord(value) &&
    isString(value.id) &&
    (isString(value.seriesId) || value.seriesId === null) &&
    isString(value.title) &&
    isString(value.examDate) &&
    Array.isArray(value.subjectScopes) &&
    value.subjectScopes.length > 0 &&
    value.subjectScopes.every(isExamSubjectScopeVersion3) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  )
}

function isExamSubjectScope(value: unknown): value is ExamSubjectScope {
  return (
    isRecord(value) &&
    isString(value.subjectId) &&
    (value.scopeType === 'entire' || value.scopeType === 'specific') &&
    Array.isArray(value.chapterIds) &&
    value.chapterIds.every(isString) &&
    (value.scopeType === 'entire' || value.chapterIds.length > 0)
  )
}

function isExamSubjectScopeVersion3(
  value: unknown,
): value is ExamSubjectScopeVersion3 {
  return (
    isRecord(value) &&
    isString(value.subjectId) &&
    (value.chapterIds === null ||
      (Array.isArray(value.chapterIds) &&
        value.chapterIds.length > 0 &&
        value.chapterIds.every(isString)))
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}
