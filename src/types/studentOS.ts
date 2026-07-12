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

export type StudentOSData = {
  version: 1
  subjects: Subject[]
  chapters: Chapter[]
}
