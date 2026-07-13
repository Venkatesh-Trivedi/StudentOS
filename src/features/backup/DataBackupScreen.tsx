import { useRef, useState, type ChangeEvent } from 'react'

import {
  downloadStudentOSBackup,
  parseStudentOSBackupFile,
} from '../../data/studentOSBackup'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import type { StudentOSData } from '../../types/studentOS'

export type DataBackupScreenProps = {
  data: StudentOSData
  onBack: () => void
  onImportData: (data: StudentOSData) => string | null
}

type ImportPreview = {
  data: StudentOSData
  exportedAt: string | null
  fileName: string
}

type BackupFeedback = {
  kind: 'success' | 'error'
  message: string
}

function formatExportDate(exportedAt: string): string {
  const date = new Date(exportedAt)

  if (Number.isNaN(date.getTime())) {
    return exportedAt
  }

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function DataBackupScreen({
  data,
  onBack,
  onImportData,
}: DataBackupScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const parseRequestRef = useRef(0)
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isConfirmingImport, setIsConfirmingImport] = useState(false)
  const [feedback, setFeedback] = useState<BackupFeedback | null>(null)

  function resetFileSelection() {
    parseRequestRef.current += 1
    setImportPreview(null)
    setIsParsing(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleDownload() {
    setFeedback(null)

    const result = downloadStudentOSBackup(data)

    if (!result.isSuccess) {
      setFeedback({ kind: 'error', message: result.error })
      return
    }

    setFeedback({
      kind: 'success',
      message: `Backup downloaded as ${result.filename}.`,
    })
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    const requestId = parseRequestRef.current + 1

    parseRequestRef.current = requestId
    setFeedback(null)
    setImportPreview(null)

    if (!file) {
      setIsParsing(false)
      return
    }

    setIsParsing(true)

    const result = await parseStudentOSBackupFile(file)

    if (parseRequestRef.current !== requestId) {
      return
    }

    setIsParsing(false)

    if (!result.isSuccess) {
      setFeedback({ kind: 'error', message: result.error })

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      return
    }

    setImportPreview({
      data: result.data,
      exportedAt: result.exportedAt,
      fileName: file.name,
    })
  }

  function handleConfirmImport() {
    if (!importPreview) {
      return
    }

    const importError = onImportData(importPreview.data)

    setIsConfirmingImport(false)
    resetFileSelection()

    if (importError) {
      setFeedback({ kind: 'error', message: importError })
      return
    }

    setFeedback({
      kind: 'success',
      message: 'Your StudentOS backup was imported successfully.',
    })
  }

  return (
    <section
      className="screen data-backup-screen"
      aria-labelledby="data-backup-heading"
    >
      <button className="back-button" type="button" onClick={onBack}>
        <span aria-hidden="true">&larr;</span> Back
      </button>

      <header className="screen-heading">
        <p className="eyebrow">Keep a copy of your study plan</p>
        <h1 id="data-backup-heading">Data &amp; backup</h1>
        <p>
          Your StudentOS data is currently stored only in this browser on this
          device. Download a backup if you want a copy you can restore later.
        </p>
      </header>

      <section
        className="data-backup-section"
        aria-labelledby="download-backup-heading"
      >
        <div className="data-backup-section-heading">
          <div>
            <h2 id="download-backup-heading">Download backup</h2>
            <p>
              Save all of your current StudentOS data in one readable JSON
              file. The file stays on your device.
            </p>
          </div>
          <button
            className="button button-primary"
            type="button"
            onClick={handleDownload}
          >
            Download backup
          </button>
        </div>
      </section>

      <section
        className="data-backup-section"
        aria-labelledby="import-backup-heading"
      >
        <div className="data-backup-section-heading">
          <div>
            <h2 id="import-backup-heading">Import backup</h2>
            <p>
              Choose one StudentOS JSON backup to check before replacing your
              current data. Files larger than 5 MB are not accepted.
            </p>
          </div>
        </div>

        <div className="data-backup-file-field">
          <label htmlFor="studentos-backup-file">
            Choose a StudentOS backup file
          </label>
          <input
            accept=".json,application/json"
            aria-describedby="studentos-backup-file-help"
            id="studentos-backup-file"
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
          />
          <p className="field-help" id="studentos-backup-file-help">
            JSON files only, up to 5 MB. Selecting a file does not change your
            current data.
          </p>
        </div>

        {isParsing ? (
          <p className="data-backup-status" role="status">
            Checking backup...
          </p>
        ) : null}

        {importPreview ? (
          <section
            className="import-preview"
            aria-labelledby="import-preview-heading"
          >
            <div className="import-preview-heading">
              <div>
                <h3 id="import-preview-heading">Import preview</h3>
                <p>{importPreview.fileName}</p>
                {importPreview.exportedAt ? (
                  <p>
                    Exported {formatExportDate(importPreview.exportedAt)}
                  </p>
                ) : null}
              </div>
            </div>

            <dl className="import-preview-counts">
              <div>
                <dt>Subjects</dt>
                <dd>{importPreview.data.subjects.length}</dd>
              </div>
              <div>
                <dt>Chapters</dt>
                <dd>{importPreview.data.chapters.length}</dd>
              </div>
              <div>
                <dt>Homework items</dt>
                <dd>{importPreview.data.homework.length}</dd>
              </div>
              <div>
                <dt>Exams</dt>
                <dd>{importPreview.data.exams.length}</dd>
              </div>
              <div>
                <dt>Exam series</dt>
                <dd>{importPreview.data.examSeries.length}</dd>
              </div>
              <div>
                <dt>Revision tasks</dt>
                <dd>{importPreview.data.revisionTasks.length}</dd>
              </div>
              <div>
                <dt>Resources</dt>
                <dd>{importPreview.data.resources.length}</dd>
              </div>
            </dl>

            <p className="import-replacement-warning">
              Importing this backup will replace all data currently stored in
              StudentOS.
            </p>

            <div className="form-actions">
              <button
                className="button button-danger"
                type="button"
                onClick={() => setIsConfirmingImport(true)}
              >
                Import this backup
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => {
                  resetFileSelection()
                  setFeedback(null)
                }}
              >
                Choose another file
              </button>
            </div>
          </section>
        ) : null}
      </section>

      {feedback ? (
        <p
          className={
            feedback.kind === 'error' ? 'action-error' : 'action-success'
          }
          role={feedback.kind === 'error' ? 'alert' : 'status'}
        >
          {feedback.message}
        </p>
      ) : null}

      <ConfirmDialog
        confirmLabel="Import data"
        isOpen={isConfirmingImport}
        message="Importing this backup will replace all data currently stored in StudentOS."
        title="Replace current StudentOS data?"
        onCancel={() => setIsConfirmingImport(false)}
        onConfirm={handleConfirmImport}
      />
    </section>
  )
}
