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

export type StudentOSData = {
  version: 2
  subjects: Subject[]
  chapters: Chapter[]
  homework: Homework[]
}
