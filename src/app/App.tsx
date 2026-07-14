import { useState } from 'react'

import {
  createEmptyStudentOSData,
  loadStudentOSData,
  saveStudentOSData,
} from '../data/studentOSStorage'
import { DataBackupScreen } from '../features/backup/DataBackupScreen'
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
import { RevisionScreen } from '../features/revision/RevisionScreen'
import {
  clearChapterConfidence,
  createRevisionTask,
  deleteRevisionTask,
  setChapterConfidence,
  toggleRevisionTaskCompletion,
} from '../features/revision/revisionService'
import { ResourcesScreen } from '../features/resources/ResourcesScreen'
import {
  createResource,
  deleteResource,
  renameResource,
  type ResourceCreationInput,
} from '../features/resources/resourceService'
import {
  createSubject,
  deleteSubject,
  renameSubject,
} from '../features/subjects/subjectService'
import { SubjectsScreen } from '../features/subjects/SubjectsScreen'
import { TodayScreen } from '../features/today/TodayScreen'
import { PWAStatus } from '../shared/components/PWAStatus'
import type { ConfidenceLevel, StudentOSData } from '../types/studentOS'

type AppStartupState = {
  data: StudentOSData
  storageError: string | null
  canPersist: boolean
}

type MainAppView = 'today' | 'subjects' | 'homework' | 'exams'

type AppView = MainAppView | 'revision' | 'resources' | 'backup'

type RevisionReturnState = {
  view: MainAppView
  selectedSubjectId: string | null
}

type ResourcesReturnState = {
  view: Exclude<AppView, 'resources'>
  selectedSubjectId: string | null
}

type ResourcesContext = {
  subjectId: string | null
  chapterId: string | null
}

function App() {
  const [startupState] = useState<AppStartupState>(loadAppStartupState)
  const [data, setData] = useState<StudentOSData>(startupState.data)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null,
  )
  const [activeView, setActiveView] = useState<AppView>('today')
  const [revisionReturnState, setRevisionReturnState] =
    useState<RevisionReturnState | null>(null)
  const [resourcesReturnState, setResourcesReturnState] =
    useState<ResourcesReturnState | null>(null)
  const [resourcesContext, setResourcesContext] = useState<ResourcesContext>({
    subjectId: null,
    chapterId: null,
  })
  const [storageError, setStorageError] = useState<string | null>(
    startupState.storageError,
  )
  const [canPersist, setCanPersist] = useState(startupState.canPersist)

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

  function handleSetChapterConfidence(
    chapterId: string,
    level: ConfidenceLevel,
  ): string | null {
    const result = setChapterConfidence(chapterId, level, data)

    if (!result.isSet) {
      return result.error
    }

    return persistData(result.data)
  }

  function handleClearChapterConfidence(chapterId: string): string | null {
    const result = clearChapterConfidence(chapterId, data)

    if (!result.isCleared) {
      return result.error
    }

    return persistData(result.data)
  }

  function handleCreateRevisionTask(
    chapterId: string,
    scheduledDate: string,
  ): string | null {
    const creation = createRevisionTask(chapterId, scheduledDate, data)

    if (!creation.isCreated) {
      return creation.error
    }

    const nextData: StudentOSData = {
      ...data,
      revisionTasks: [...data.revisionTasks, creation.revisionTask],
    }

    return persistData(nextData)
  }

  function handleToggleRevisionTask(revisionTaskId: string): string | null {
    const toggling = toggleRevisionTaskCompletion(revisionTaskId, data)

    if (!toggling.isToggled) {
      return toggling.error
    }

    return persistData(toggling.data)
  }

  function handleDeleteRevisionTask(revisionTaskId: string): string | null {
    const deletion = deleteRevisionTask(revisionTaskId, data)

    if (!deletion.isDeleted) {
      return deletion.error
    }

    return persistData(deletion.data)
  }

  function handleCreateResource(input: ResourceCreationInput): string | null {
    const creation = createResource(input, data)

    if (!creation.isCreated) {
      return creation.error
    }

    const nextData: StudentOSData = {
      ...data,
      resources: [...data.resources, creation.resource],
    }

    return persistData(nextData)
  }

  function handleRenameResource(
    resourceId: string,
    title: string,
  ): string | null {
    const renaming = renameResource(resourceId, title, data)

    if (!renaming.isRenamed) {
      return renaming.error
    }

    return persistData(renaming.data)
  }

  function handleDeleteResource(resourceId: string): string | null {
    const deletion = deleteResource(resourceId, data)

    if (!deletion.isDeleted) {
      return deletion.error
    }

    return persistData(deletion.data)
  }

  function handleImportData(importedData: StudentOSData): string | null {
    return persistData(importedData, true)
  }

  function handleNavigate(view: MainAppView) {
    setActiveView(view)
    setSelectedSubjectId(null)
    setRevisionReturnState(null)
    setResourcesReturnState(null)
    setResourcesContext({ subjectId: null, chapterId: null })
  }

  function handleOpenRevisionPlan() {
    if (
      activeView === 'revision' ||
      activeView === 'resources' ||
      activeView === 'backup'
    ) {
      return
    }

    setRevisionReturnState({
      view: activeView,
      selectedSubjectId,
    })
    setActiveView('revision')
  }

  function handleBackFromRevisionPlan() {
    setActiveView(revisionReturnState?.view ?? 'today')
    setSelectedSubjectId(revisionReturnState?.selectedSubjectId ?? null)
    setRevisionReturnState(null)
  }

  function handleOpenResources(
    subjectId: string | null,
    chapterId: string | null,
  ) {
    if (activeView === 'resources') {
      setResourcesContext({ subjectId, chapterId })
      return
    }

    setResourcesReturnState({
      view: activeView,
      selectedSubjectId,
    })
    setResourcesContext({ subjectId, chapterId })
    setActiveView('resources')
  }

  function handleBackFromResources() {
    setActiveView(resourcesReturnState?.view ?? 'today')
    setSelectedSubjectId(resourcesReturnState?.selectedSubjectId ?? null)
    setResourcesReturnState(null)
    setResourcesContext({ subjectId: null, chapterId: null })
  }

  function handleOpenDataBackup() {
    setActiveView('backup')
    setSelectedSubjectId(null)
    setRevisionReturnState(null)
    setResourcesReturnState(null)
    setResourcesContext({ subjectId: null, chapterId: null })
  }

  function handleViewChapter(subjectId: string) {
    setActiveView('subjects')
    setSelectedSubjectId(subjectId)
    setRevisionReturnState(null)
    setResourcesReturnState(null)
    setResourcesContext({ subjectId: null, chapterId: null })
  }

  function persistData(
    nextData: StudentOSData,
    allowStorageRecovery = false,
  ): string | null {
    if (!canPersist && !allowStorageRecovery) {
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
    setCanPersist(true)

    return null
  }

  return (
    <main className="app-shell">
      <nav className="app-navigation" aria-label="Primary navigation">
        <button
          aria-current={activeView === 'today' ? 'page' : undefined}
          className="app-navigation-link"
          type="button"
          onClick={() => handleNavigate('today')}
        >
          Today
        </button>
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

      <PWAStatus />

      {storageError ? (
        <div className="storage-alert" role="alert">
          <strong>Storage needs attention</strong>
          <p>{storageError}</p>
        </div>
      ) : null}

      {activeView === 'backup' ? (
        <DataBackupScreen
          data={data}
          onBack={() => handleNavigate('today')}
          onImportData={handleImportData}
        />
      ) : activeView === 'resources' ? (
        <ResourcesScreen
          key={`${resourcesContext.subjectId ?? 'all'}:${
            resourcesContext.chapterId ?? 'all'
          }`}
          chapters={data.chapters}
          initialChapterId={resourcesContext.chapterId}
          initialSubjectId={resourcesContext.subjectId}
          resources={data.resources}
          subjects={data.subjects}
          onBack={handleBackFromResources}
          onCreateResource={handleCreateResource}
          onDeleteResource={handleDeleteResource}
          onRenameResource={handleRenameResource}
        />
      ) : activeView === 'revision' ? (
        <RevisionScreen
          chapters={data.chapters}
          resources={data.resources}
          revisionTasks={data.revisionTasks}
          subjects={data.subjects}
          onBack={handleBackFromRevisionPlan}
          onDeleteRevisionTask={handleDeleteRevisionTask}
          onToggleRevisionTask={handleToggleRevisionTask}
          onViewResources={handleOpenResources}
        />
      ) : activeView === 'today' ? (
        <TodayScreen
          data={data}
          onToggleHomework={handleToggleHomework}
          onToggleRevisionTask={handleToggleRevisionTask}
          onViewDataBackup={handleOpenDataBackup}
          onViewChapter={handleViewChapter}
          onViewExams={() => handleNavigate('exams')}
          onViewResources={handleOpenResources}
          onViewRevisionPlan={handleOpenRevisionPlan}
        />
      ) : activeView === 'exams' ? (
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
          chapterConfidences={data.chapterConfidences}
          resources={data.resources}
          onBack={() => setSelectedSubjectId(null)}
          onClearChapterConfidence={handleClearChapterConfidence}
          onCreateChapter={handleCreateChapter}
          onDeleteChapter={handleDeleteChapter}
          onRenameChapter={handleRenameChapter}
          onScheduleRevision={handleCreateRevisionTask}
          onSetChapterConfidence={handleSetChapterConfidence}
          onViewResources={handleOpenResources}
          onViewRevisionPlan={handleOpenRevisionPlan}
        />
      ) : (
        <SubjectsScreen
          chapters={data.chapters}
          subjects={data.subjects}
          onSelectSubject={setSelectedSubjectId}
          onCreateSubject={handleCreateSubject}
          onDeleteSubject={handleDeleteSubject}
          onRenameSubject={handleRenameSubject}
          onViewResources={(subjectId) =>
            handleOpenResources(subjectId, null)
          }
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
