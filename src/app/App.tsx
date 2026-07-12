import { useState } from 'react'

import {
  createEmptyStudentOSData,
  loadStudentOSData,
  saveStudentOSData,
} from '../data/studentOSStorage'
import { ChapterScreen } from '../features/chapters/ChapterScreen'
import {
  createChapter,
  deleteChapter,
  renameChapter,
} from '../features/chapters/chapterService'
import { ExamsScreen } from '../features/exams/ExamsScreen'
import {
  createExam,
  deleteExam,
  type ExamCreationInput,
} from '../features/exams/examService'
import {
  createExamSeries,
  deleteExamSeries,
  renameExamSeries,
} from '../features/exams/examSeriesService'
import { HomeworkScreen } from '../features/homework/HomeworkScreen'
import {
  createHomework,
  deleteHomework,
  toggleHomeworkCompletion,
  type HomeworkCreationInput,
} from '../features/homework/homeworkService'
import {
  createSubject,
  deleteSubject,
  renameSubject,
} from '../features/subjects/subjectService'
import { SubjectsScreen } from '../features/subjects/SubjectsScreen'
import type { StudentOSData } from '../types/studentOS'

type AppStartupState = {
  data: StudentOSData
  storageError: string | null
  canPersist: boolean
}

type AppView = 'subjects' | 'homework' | 'exams'

function App() {
  const [startupState] = useState<AppStartupState>(loadAppStartupState)
  const [data, setData] = useState<StudentOSData>(startupState.data)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  )
  const [activeView, setActiveView] = useState<AppView>('subjects')
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

  function handleDeleteSubject(subjectId: string): string | null {
    const deletion = deleteSubject(subjectId, data)

    if (!deletion.isDeleted) {
      return deletion.error
    }

    return persistData(deletion.data)
  }

  function handleDeleteChapter(chapterId: string): string | null {
    const deletion = deleteChapter(chapterId, data)

    if (!deletion.isDeleted) {
      return deletion.error
    }

    return persistData(deletion.data)
  }

  function handleRenameSubject(subjectId: string, name: string): string | null {
    const renaming = renameSubject(subjectId, name, data)

    if (!renaming.isRenamed) {
      return renaming.error
    }

    return persistData(renaming.data)
  }

  function handleRenameChapter(chapterId: string, name: string): string | null {
    const renaming = renameChapter(chapterId, name, data)

    if (!renaming.isRenamed) {
      return renaming.error
    }

    return persistData(renaming.data)
  }

  function handleCreateHomework(input: HomeworkCreationInput): string | null {
    const creation = createHomework(input, data)

    if (!creation.isCreated) {
      return creation.error
    }

    const nextData: StudentOSData = {
      ...data,
      homework: [...data.homework, creation.homework],
    }

    return persistData(nextData)
  }

  function handleToggleHomework(homeworkId: string): string | null {
    const toggling = toggleHomeworkCompletion(homeworkId, data)

    if (!toggling.isToggled) {
      return toggling.error
    }

    return persistData(toggling.data)
  }

  function handleDeleteHomework(homeworkId: string): string | null {
    const deletion = deleteHomework(homeworkId, data)

    if (!deletion.isDeleted) {
      return deletion.error
    }

    return persistData(deletion.data)
  }

  function handleCreateExamSeries(title: string): string | null {
    const creation = createExamSeries(title, data)

    if (!creation.isCreated) {
      return creation.error
    }

    const nextData: StudentOSData = {
      ...data,
      examSeries: [...data.examSeries, creation.examSeries],
    }

    return persistData(nextData)
  }

  function handleRenameExamSeries(
    seriesId: string,
    title: string,
  ): string | null {
    const renaming = renameExamSeries(seriesId, title, data)

    if (!renaming.isRenamed) {
      return renaming.error
    }

    return persistData(renaming.data)
  }

  function handleDeleteExamSeries(seriesId: string): string | null {
    const deletion = deleteExamSeries(seriesId, data)

    if (!deletion.isDeleted) {
      return deletion.error
    }

    return persistData(deletion.data)
  }

  function handleCreateExam(input: ExamCreationInput): string | null {
    const creation = createExam(input, data)

    if (!creation.isCreated) {
      return creation.error
    }

    const nextData: StudentOSData = {
      ...data,
      exams: [...data.exams, creation.exam],
    }

    return persistData(nextData)
  }

  function handleDeleteExam(examId: string): string | null {
    const deletion = deleteExam(examId, data)

    if (!deletion.isDeleted) {
      return deletion.error
    }

    return persistData(deletion.data)
  }

  function handleNavigate(view: AppView) {
    setActiveView(view)
    setSelectedSubjectId(null)
  }

  function persistData(nextData: StudentOSData): string | null {
    if (!startupState.canPersist) {
      const error =
        startupState.storageError ?? 'StudentOS data could not be loaded safely'

      setStorageError(error)
      return error
    }

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
      <nav className="app-navigation" aria-label="Primary navigation">
        <button
          aria-current={activeView === 'subjects' ? 'page' : undefined}
          className="app-navigation-link"
          type="button"
          onClick={() => handleNavigate('subjects')}
        >
          Subjects
        </button>
        <button
          aria-current={activeView === 'homework' ? 'page' : undefined}
          className="app-navigation-link"
          type="button"
          onClick={() => handleNavigate('homework')}
        >
          Homework
        </button>
        <button
          aria-current={activeView === 'exams' ? 'page' : undefined}
          className="app-navigation-link"
          type="button"
          onClick={() => handleNavigate('exams')}
        >
          Exams
        </button>
      </nav>

      {storageError ? (
        <div className="storage-alert" role="alert">
          <strong>Storage needs attention</strong>
          <p>{storageError}</p>
        </div>
      ) : null}

      {activeView === 'exams' ? (
        <ExamsScreen
          chapters={data.chapters}
          exams={data.exams}
          examSeries={data.examSeries}
          subjects={data.subjects}
          onCreateExam={handleCreateExam}
          onCreateExamSeries={handleCreateExamSeries}
          onDeleteExam={handleDeleteExam}
          onDeleteExamSeries={handleDeleteExamSeries}
          onRenameExamSeries={handleRenameExamSeries}
        />
      ) : activeView === 'homework' ? (
        <HomeworkScreen
          chapters={data.chapters}
          homework={data.homework}
          subjects={data.subjects}
          onCreateHomework={handleCreateHomework}
          onDeleteHomework={handleDeleteHomework}
          onToggleHomework={handleToggleHomework}
        />
      ) : selectedSubject ? (
        <ChapterScreen
          subject={selectedSubject}
          chapters={data.chapters.filter(
            (chapter) => chapter.subjectId === selectedSubject.id,
          )}
          onBack={() => setSelectedSubjectId(null)}
          onCreateChapter={handleCreateChapter}
          onDeleteChapter={handleDeleteChapter}
          onRenameChapter={handleRenameChapter}
        />
      ) : (
        <SubjectsScreen
          chapters={data.chapters}
          subjects={data.subjects}
          onSelectSubject={setSelectedSubjectId}
          onCreateSubject={handleCreateSubject}
          onDeleteSubject={handleDeleteSubject}
          onRenameSubject={handleRenameSubject}
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
      canPersist: true,
    }
  }

  return {
    data: createEmptyStudentOSData(),
    storageError: `${loadResult.error}. Existing stored data has been left unchanged.`,
    canPersist: false,
  }
}

export default App
