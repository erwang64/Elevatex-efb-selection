import { useEffect, useState } from 'react'
import { Wifi } from 'lucide-react'
import './App.css'

function App() {
  const [deviceTime, setDeviceTime] = useState<string>('')

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
            <h1 className="nav-title">Dispatch</h1>
          </div>

          <div className="empty-state-card">
            <h2 className="empty-state-title">Hello World</h2>
          </div>

          <footer className="efb-footer">
            <span className="efb-version">Version 0.1</span>
          </footer>
        </section>
      </div>

      <div className="ipad-overlay-frame" />
    </main>
  )
}

export default App
