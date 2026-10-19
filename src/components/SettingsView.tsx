import { useState, useEffect } from 'react'
import { ChevronLeft, X, Check, AlertCircle, Loader2 } from 'lucide-react'
import { verifySimbriefUser, type VerificationResult } from '../services/simbrief'
import { useDragScroll } from '../hooks/useDragScroll'

interface SettingsViewProps {
  isOpen: boolean
  onClose: () => void
  simbriefId: string
  onSaveSimbriefId: (id: string) => void
}

export function SettingsView({
  isOpen,
  onClose,
  simbriefId,
  onSaveSimbriefId,
}: SettingsViewProps) {
  const [inputValue, setInputValue] = useState(simbriefId)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verification, setVerification] = useState<VerificationResult | null>(null)
  const scrollRef = useDragScroll<HTMLDivElement>()

  useEffect(() => {
    setInputValue(simbriefId)
    setVerification(null)
  }, [simbriefId, isOpen])

  if (!isOpen) {
    return null
  }

  const handleVerify = async (candidateValue?: string) => {
    const target = candidateValue !== undefined ? candidateValue : inputValue
    const trimmed = target.trim()

    if (!trimmed) {
      setVerification(null)
      onSaveSimbriefId('')
      return
    }

    setIsVerifying(true)
    const result = await verifySimbriefUser(trimmed)
    setIsVerifying(false)
    setVerification(result)

    if (result.isValid) {
      onSaveSimbriefId(trimmed)
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setInputValue(value)
    setVerification(null)
  }

  const handleClear = () => {
    setInputValue('')
    setVerification(null)
    onSaveSimbriefId('')
  }

  const handleDone = () => {
    if (inputValue.trim() && (!verification || !verification.isValid)) {
      handleVerify(inputValue).then(() => {
        onClose()
      })
      return
    }
    onClose()
  }

  return (
    <div className="settings-sheet-overlay">
      <div className="settings-sheet-container">
        <header className="settings-nav-bar">
          <button
            type="button"
            className="settings-nav-back"
            onClick={onClose}
          >
            <ChevronLeft size={20} />
            <span>Dispatch</span>
          </button>
          <span className="settings-nav-title">Settings</span>
          <button
            type="button"
            className="settings-nav-done"
            onClick={handleDone}
          >
            Done
          </button>
        </header>

        <div className="settings-scroll-content" ref={scrollRef}>
          <div className="inset-grouped-section">
            <span className="section-header-label">SimBrief Account</span>
            <div className={`inset-grouped-card ${verification && !verification.isValid ? 'card-has-error' : ''}`}>
              <div className="settings-row">
                <span className="settings-row-label">Pilot ID / User</span>
                <div className="settings-input-group">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleVerify()
                      }
                    }}
                    placeholder="e.g. 123456 or captain"
                    className="settings-text-field"
                    autoFocus
                  />
                  {inputValue.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="settings-field-clear"
                      aria-label="Clear text"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div className="settings-action-row">
                <button
                  type="button"
                  className="settings-verify-button"
                  onClick={() => handleVerify()}
                  disabled={isVerifying || !inputValue.trim()}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 size={14} className="spin-icon" />
                      <span>Verifying with SimBrief...</span>
                    </>
                  ) : (
                    <span>Check Account</span>
                  )}
                </button>
              </div>
            </div>

            {verification && !verification.isValid && (
              <div className="settings-inline-error">
                <AlertCircle size={14} />
                <span>{verification.message}</span>
              </div>
            )}

            {verification && verification.isValid && (
              <div className="settings-inline-success">
                <Check size={14} />
                <span>{verification.message}</span>
              </div>
            )}

            {!verification && (
              <p className="section-footer-note">
                Enter your numerical Pilot ID or SimBrief username. Tap Check Account to verify against the Navigraph SimBrief servers.
              </p>
            )}
          </div>

          <div className="inset-grouped-section">
            <span className="section-header-label">Connection</span>
            <div className="inset-grouped-card">
              <div className="settings-row">
                <span className="settings-row-label">SimBrief API</span>
                <span className="settings-row-value">Online</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Active Pilot</span>
                <span className="settings-row-value font-mono">
                  {simbriefId || 'None'}
                </span>
              </div>
            </div>
          </div>

          <div className="inset-grouped-section">
            <span className="section-header-label">About</span>
            <div className="inset-grouped-card">
              <div className="settings-row">
                <span className="settings-row-label">Application</span>
                <span className="settings-row-value">Elevatex EFB</span>
              </div>
              <div className="settings-row">
                <span className="settings-row-label">Version</span>
                <span className="settings-row-value">1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
