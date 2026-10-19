import { useEffect, useState } from 'react'
import { Wifi, ArrowRight } from 'lucide-react'
import { SettingsView } from './components/SettingsView'
import './App.css'

const STORAGE_KEY = 'elevatex_simbrief_id'

function App() {
  const [deviceTime, setDeviceTime] = useState<string>('')
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
  const [simbriefId, setSimbriefId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || ''
  })

  useEffect(() => {
    const formatTime = () => {
      const now = new Date()
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      setDeviceTime(`${hours}:${minutes}`)
    }

    formatTime()
    const timer = setInterval(formatTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSaveSimbriefId = (id: string) => {
    setSimbriefId(id)
    if (id) {
      localStorage.setItem(STORAGE_KEY, id)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return (
    <main className="ipad-wrapper">
      <div className="ipad-screen-area">
        <header className="ipados-status-bar">
          <span className="status-time">{deviceTime || '09:41'}</span>
          <div className="status-icons">
            <Wifi size={15} strokeWidth={2.2} />
            <div className="battery-pill">
              <div className="battery-level" />
            </div>
          </div>
        </header>

        <section className="efb-body">
          <div className="nav-large-header">
            <div className="nav-header-row">
              <div className="nav-title-group">
                <p className="nav-eyebrow">Flight Operations</p>
                <h1 className="nav-title">Dispatch</h1>
                <p className="nav-subtitle">Electronic Flight Bag</p>
              </div>

              <button
                type="button"
                className="settings-trigger-button"
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Open Settings"
                title="Settings"
              >
                <img
                  src="/setting_icon.png"
                  alt="Settings"
                  className="settings-trigger-icon"
                />
              </button>
            </div>
          </div>

          <div className="dispatch-main-content">
            <div className="inset-grouped-section">
              <span className="section-header-label">Flight Plan Dispatch</span>

              {simbriefId ? (
                <div className="inset-grouped-card">
                  <div className="settings-row">
                    <span className="settings-row-label">SimBrief Pilot</span>
                    <span className="settings-row-value font-mono">{simbriefId}</span>
                  </div>
                  <div className="settings-row">
                    <span className="settings-row-label">Active OFP</span>
                    <span className="settings-row-value">Ready to Import</span>
                  </div>
                  <div className="settings-action-row">
                    <button
                      type="button"
                      className="dispatch-primary-button"
                    >
                      <span>Fetch Flight Plan</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="inset-grouped-card">
                  <div className="settings-row">
                    <span className="settings-row-label">SimBrief Account</span>
                    <span className="settings-row-value text-muted">Not Configured</span>
                  </div>
                  <div className="settings-action-row">
                    <button
                      type="button"
                      className="dispatch-secondary-button"
                      onClick={() => setIsSettingsOpen(true)}
                    >
                      <span>Configure Account</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              <p className="section-footer-note">
                {simbriefId
                  ? 'SimBrief account linked. Tap Fetch Flight Plan to retrieve route, aircraft, fuel, and weather.'
                  : 'Link your SimBrief account in Settings to retrieve your operational flight plans.'}
              </p>
            </div>
          </div>

          <footer className="efb-footer">
            <span className="efb-version">Version 1.0.0</span>
          </footer>
        </section>

        <SettingsView
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          simbriefId={simbriefId}
          onSaveSimbriefId={handleSaveSimbriefId}
        />
      </div>

      <div className="ipad-overlay-frame" />
    </main>
  )
}

export default App
