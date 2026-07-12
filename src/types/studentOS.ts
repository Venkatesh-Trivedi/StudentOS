export type Subject = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export type Chapter = {
  id: string
  subjectId: string
  name: string
  createdAt: string
  updatedAt: string
}

export type Homework = {
  id: string
  subjectId: string
  chapterId: string | null
  title: string
  dueDate: string
  isCompleted: boolean
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export type ExamSubjectScope = {
  subjectId: string
  scopeType: 'entire' | 'specific'
  chapterIds: string[]
}

export type ExamSeries = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export type Exam = {
  id: string
  seriesId: string | null
  title: string
  examDate: string
  subjectScopes: ExamSubjectScope[]
  createdAt: string
  updatedAt: string
}

export type StudentOSData = {
  version: 4
  subjects: Subject[]
  chapters: Chapter[]
  homework: Homework[]
  examSeries: ExamSeries[]
  exams: Exam[]
}
