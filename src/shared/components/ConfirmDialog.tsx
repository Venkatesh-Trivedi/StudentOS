import { useEffect, useId, useRef, type KeyboardEvent } from 'react'

export type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const messageId = useId()

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const triggeringElement = document.activeElement
    const focusFrame = window.requestAnimationFrame(() => {
      cancelButtonRef.current?.focus()
    })

    return () => {
      window.cancelAnimationFrame(focusFrame)

      if (triggeringElement instanceof HTMLElement && triggeringElement.isConnected) {
        triggeringElement.focus()
      }
    }
  }, [isOpen])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onCancel()
      return
    }

    if (event.key !== 'Tab') {
      return
    }

    const focusableButtons = [
      cancelButtonRef.current,
      confirmButtonRef.current,
    ].filter((button): button is HTMLButtonElement => button !== null)

    if (focusableButtons.length === 0) {
      return
    }

    const currentIndex = focusableButtons.indexOf(
      document.activeElement as HTMLButtonElement,
    )
    const nextIndex = event.shiftKey
      ? currentIndex <= 0
        ? focusableButtons.length - 1
        : currentIndex - 1
      : currentIndex === focusableButtons.length - 1
        ? 0
        : currentIndex + 1

    event.preventDefault()
    focusableButtons[nextIndex].focus()
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="confirm-dialog-backdrop" onClick={onCancel}>
      <div
        aria-describedby={messageId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="confirm-dialog"
        role="alertdialog"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <h2 id={titleId}>{title}</h2>
        <p id={messageId}>{message}</p>
        <div className="confirm-dialog-actions">
          <button
            className="button button-secondary"
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="button button-danger"
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
