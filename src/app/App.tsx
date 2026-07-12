import { useState } from 'react'

import {
  createEmptyStudentOSData,
  loadStudentOSData,
  saveStudentOSData,
} from '../data/studentOSStorage'
import { ChapterScreen } from '../features/chapters/ChapterScreen'
import { createChapter } from '../features/chapters/chapterService'
import { createSubject } from '../features/subjects/subjectService'
import { SubjectsScreen } from '../features/subjects/SubjectsScreen'
import type { StudentOSData } from '../types/studentOS'

type AppStartupState = {
  data: StudentOSData
  storageError: string | null
}

function App() {
  const [startupState] = useState<AppStartupState>(loadAppStartupState)
  const [data, setData] = useState<StudentOSData>(startupState.data)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  )
  const [storageError, setStorageError] = useState<string | null>(
    startupState.storageError,
  )

  const selectedSubject = data.subjects.find(
    (subject) => subject.id === selectedSubjectId,
  )

  function handleCreateSubject(name: string): string | null {
    const creation = createSubject(name, data.subjects)

    if (!creation.isCreated) {
      return creation.error
    }

    const nextData: StudentOSData = {
      ...data,
      subjects: [...data.subjects, creation.subject],
    }

    return persistData(nextData)
  }

  function handleCreateChapter(name: string, subjectId: string): string | null {
    const creation = createChapter(
      name,
      subjectId,
      data.subjects,
      data.chapters,
    )

    if (!creation.isCreated) {
      return creation.error
    }

    const nextData: StudentOSData = {
      ...data,
      chapters: [...data.chapters, creation.chapter],
    }

    return persistData(nextData)
  }

  function persistData(nextData: StudentOSData): string | null {
    const saveResult = saveStudentOSData(nextData)

    if (!saveResult.isSuccess) {
      setStorageError(saveResult.error)
      return saveResult.error
    }

    setData(nextData)
    setStorageError(null)

    return null
  }

  return (
    <main className="app-shell">
      {storageError ? (
        <div className="storage-alert" role="alert">
          <strong>Storage needs attention</strong>
          <p>{storageError}</p>
        </div>
      ) : null}

      {selectedSubject ? (
        <ChapterScreen
          subject={selectedSubject}
          chapters={data.chapters.filter(
            (chapter) => chapter.subjectId === selectedSubject.id,
          )}
          onBack={() => setSelectedSubjectId(null)}
          onCreateChapter={handleCreateChapter}
        />
      ) : (
        <SubjectsScreen
          subjects={data.subjects}
          onSelectSubject={setSelectedSubjectId}
          onCreateSubject={handleCreateSubject}
        />
      )}
    </main>
  )
}

function loadAppStartupState(): AppStartupState {
  const loadResult = loadStudentOSData()

  if (loadResult.isSuccess) {
    return {
      data: loadResult.data,
      storageError: null,
    }
  }

  return {
    data: createEmptyStudentOSData(),
    storageError: loadResult.error,
  }
}

export default App
