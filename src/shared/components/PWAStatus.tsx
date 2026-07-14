import { useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export type PWAStatusProps = {
  className?: string
}

export function PWAStatus({ className }: PWAStatusProps) {
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  const statusClassName = className
    ? `pwa-status ${className}`
    : 'pwa-status'

  function dismissStatus() {
    setOfflineReady(false)
    setNeedRefresh(false)
    setUpdateError(null)
  }

  async function handleUpdate() {
    setIsUpdating(true)
    setUpdateError(null)

    try {
      await updateServiceWorker(true)
    } catch {
      setIsUpdating(false)
      setUpdateError('StudentOS could not update. Please try again.')
    }
  }

  if (!offlineReady && !needRefresh) {
    return null
  }

  return (
    <section
      aria-label="StudentOS app status"
      className={statusClassName}
    >
      <div
        aria-atomic="true"
        aria-live="polite"
        className="pwa-status-content"
        role="status"
      >
        <p>
          {needRefresh
            ? 'A new StudentOS version is available.'
            : 'StudentOS is ready to use offline.'}
        </p>
        {updateError && <p className="pwa-status-error">{updateError}</p>}
      </div>
      <div className="pwa-status-actions">
        {needRefresh ? (
          <>
            <button
              className="button button-primary button-compact"
              disabled={isUpdating}
              type="button"
              onClick={() => void handleUpdate()}
            >
              {isUpdating ? 'Updating...' : 'Update now'}
            </button>
            <button
              className="button button-secondary button-compact"
              disabled={isUpdating}
              type="button"
              onClick={dismissStatus}
            >
              Later
            </button>
          </>
        ) : (
          <button
            className="button button-secondary button-compact"
            type="button"
            onClick={dismissStatus}
          >
            Dismiss
          </button>
        )}
      </div>
    </section>
  )
}
