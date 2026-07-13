import { validateAndMigrateStudentOSData } from './studentOSStorage'
import type { StudentOSData } from '../types/studentOS'

export const MAX_BACKUP_FILE_SIZE_BYTES = 5 * 1024 * 1024

export type StudentOSBackup = {
  format: 'studentos-backup'
  exportedAt: string
  data: StudentOSData
}

export type StudentOSBackupExportResult =
  | {
      isSuccess: true
      filename: string
      exportedAt: string
    }
  | {
      isSuccess: false
      error: string
    }

export type StudentOSBackupImportResult =
  | {
      isSuccess: true
      data: StudentOSData
      exportedAt: string | null
    }
  | {
      isSuccess: false
      error: string
    }

export function downloadStudentOSBackup(
  data: StudentOSData,
  currentDate: Date = new Date(),
): StudentOSBackupExportResult {
  const validationResult = validateAndMigrateStudentOSData(data)

  if (!validationResult.isSuccess) {
    return {
      isSuccess: false,
      error: 'Unable to create a backup from invalid StudentOS data.',
    }
  }

  let objectUrl: string | null = null
  let downloadLink: HTMLAnchorElement | null = null

  try {
    const exportedAt = currentDate.toISOString()
    const filename = `studentos-backup-${formatLocalDate(currentDate)}.json`
    const backup: StudentOSBackup = {
      format: 'studentos-backup',
      exportedAt,
      data: validationResult.data,
    }
    const backupJson = JSON.stringify(backup, null, 2)
    const backupBlob = new Blob([backupJson], {
      type: 'application/json',
    })

    objectUrl = URL.createObjectURL(backupBlob)
    downloadLink = document.createElement('a')
    downloadLink.href = objectUrl
    downloadLink.download = filename
    downloadLink.hidden = true
    document.body.append(downloadLink)
    downloadLink.click()

    return {
      isSuccess: true,
      filename,
      exportedAt,
    }
  } catch {
    return {
      isSuccess: false,
      error: 'Unable to download the StudentOS backup.',
    }
  } finally {
    downloadLink?.remove()

    if (objectUrl !== null) {
      URL.revokeObjectURL(objectUrl)
    }
  }
}

export async function parseStudentOSBackupFile(
  file: File,
): Promise<StudentOSBackupImportResult> {
  if (file.size > MAX_BACKUP_FILE_SIZE_BYTES) {
    return {
      isSuccess: false,
      error: 'Backup files must be 5 MB or smaller.',
    }
  }

  let fileContents: string

  try {
    fileContents = await file.text()
  } catch {
    return {
      isSuccess: false,
      error: 'Unable to read the selected backup file.',
    }
  }

  let parsedValue: unknown

  try {
    parsedValue = JSON.parse(fileContents)
  } catch {
    return {
      isSuccess: false,
      error: 'The selected file is not valid JSON.',
    }
  }

  const backupValueResult = getBackupValue(parsedValue)

  if (!backupValueResult.isSuccess) {
    return backupValueResult
  }

  const validationResult = validateAndMigrateStudentOSData(
    backupValueResult.data,
  )

  if (!validationResult.isSuccess) {
    return {
      isSuccess: false,
      error:
        validationResult.error === 'unsupported-version'
          ? 'The backup uses an unsupported StudentOS data version.'
          : 'The selected file does not contain valid StudentOS data.',
    }
  }

  return {
    isSuccess: true,
    data: validationResult.data,
    exportedAt: backupValueResult.exportedAt,
  }
}

type BackupValueResult =
  | {
      isSuccess: true
      data: unknown
      exportedAt: string | null
    }
  | {
      isSuccess: false
      error: string
    }

function getBackupValue(value: unknown): BackupValueResult {
  if (!isRecord(value) || !Object.hasOwn(value, 'format')) {
    return {
      isSuccess: true,
      data: value,
      exportedAt: null,
    }
  }

  if (value.format !== 'studentos-backup') {
    return {
      isSuccess: false,
      error: 'The selected file is not a StudentOS backup.',
    }
  }

  if (
    !isValidExportedAt(value.exportedAt) ||
    !Object.hasOwn(value, 'data')
  ) {
    return {
      isSuccess: false,
      error: 'The StudentOS backup has an invalid structure.',
    }
  }

  return {
    isSuccess: true,
    data: value.data,
    exportedAt: value.exportedAt,
  }
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isValidExportedAt(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false
  }

  const date = new Date(value)

  return !Number.isNaN(date.getTime())
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
