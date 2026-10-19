import { ArrowRight, RotateCw } from 'lucide-react'
import type { SimbriefOfp } from '../services/simbrief'

interface FlightPlanViewProps {
  ofp: SimbriefOfp
  onRefresh: () => void
  isRefreshing: boolean
}

export function FlightPlanView({
  ofp,
  onRefresh,
  isRefreshing,
}: FlightPlanViewProps) {
  return (
    <div className="ofp-container">
      <div className="ofp-header-card">
        <div className="ofp-flight-tag">
          <span className="ofp-flight-number">{ofp.flightNumber}</span>
          <span className="ofp-aircraft-pill">
            {ofp.aircraft.name} • {ofp.aircraft.registration}
          </span>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="ofp-refresh-btn"
          disabled={isRefreshing}
          aria-label="Refresh flight plan"
          title="Refresh OFP"
        >
          <RotateCw size={15} className={isRefreshing ? 'spin-icon' : ''} />
        </button>
      </div>

      <div className="ofp-airports-card">
        <div className="airport-col airport-origin">
          <span className="airport-icao">{ofp.origin.icao}</span>
          <span className="airport-name">{ofp.origin.name}</span>
          <span className="airport-runway">RWY {ofp.origin.runway}</span>
        </div>

        <div className="airport-mid-track">
          <span className="track-time">{ofp.flightTime}</span>
          <ArrowRight size={18} className="route-arrow-icon" />
        </div>

        <div className="airport-col airport-dest">
          <span className="airport-icao">{ofp.destination.icao}</span>
          <span className="airport-name">{ofp.destination.name}</span>
          <span className="airport-runway">RWY {ofp.destination.runway}</span>
        </div>
      </div>

      <div className="inset-grouped-section">
        <span className="section-header-label">Enroute & Performance</span>
        <div className="inset-grouped-card">
          <div className="settings-row">
            <span className="settings-row-label">Cruise Altitude</span>
            <span className="settings-row-value font-mono">{ofp.altitude}</span>
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Estimated Enroute</span>
            <span className="settings-row-value font-mono">{ofp.flightTime}</span>
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Estimated Block Time</span>
            <span className="settings-row-value font-mono">{ofp.blockTime}</span>
          </div>
        </div>
      </div>

      <div className="inset-grouped-section">
        <span className="section-header-label">Fuel Planning ({ofp.fuel.units})</span>
        <div className="inset-grouped-card">
          <div className="settings-row">
            <span className="settings-row-label">Ramp / Block Fuel</span>
            <span className="settings-row-value font-mono">
              {ofp.fuel.ramp} {ofp.fuel.units}
            </span>
          </div>

          <div className="settings-row">
            <span className="settings-row-label">Trip Fuel (Enroute Burn)</span>
            <span className="settings-row-value font-mono">
              {ofp.fuel.trip} {ofp.fuel.units}
            </span>
          </div>
        </div>
      </div>

      <div className="inset-grouped-section">
        <span className="section-header-label">Filed Route</span>
        <div className="inset-grouped-card ofp-route-card">
          <span className="ofp-route-header">Airways & Waypoints</span>
          <div className="ofp-route-text font-mono">{ofp.route}</div>
        </div>
      </div>
    </div>
  )
}
