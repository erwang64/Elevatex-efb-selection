export interface VerificationResult {
  isValid: boolean
  hasOfp: boolean
  message: string
  errorType?: 'unknown_user' | 'network_error' | 'no_ofp' | 'other'
}

export interface FlightAirport {
  icao: string
  name: string
  runway: string
}

export interface FlightAircraft {
  icao: string
  name: string
  registration: string
}

export interface FlightFuel {
  ramp: string
  trip: string
  reserve: string
  taxi: string
  units: string
}

export interface SimbriefOfp {
  flightNumber: string
  origin: FlightAirport
  destination: FlightAirport
  aircraft: FlightAircraft
  route: string
  altitude: string
  flightTime: string
  blockTime: string
  distance: string
  fuel: FlightFuel
  generatedDate: string
}

export interface OfpFetchResult {
  success: boolean
  data?: SimbriefOfp
  error?: string
  errorType?: 'unknown_user' | 'no_ofp' | 'network_error' | 'other'
}

function getSafeString(val: unknown, fallback = ''): string {
  if (typeof val === 'string') return val
  if (typeof val === 'number') return String(val)
  return fallback
}

function formatSeconds(sec: unknown): string {
  const s = parseInt(String(sec), 10)
  if (isNaN(s)) return '--:--'
  const hrs = Math.floor(s / 3600)
  const mins = Math.floor((s % 3600) / 60)
  return `${hrs}h ${mins < 10 ? '0' : ''}${mins}m`
}

function formatAltitude(alt: unknown): string {
  const a = parseInt(String(alt), 10)
  if (isNaN(a)) return '--'
  if (a >= 10000) return `FL${Math.round(a / 100)}`
  return `${a.toLocaleString()} ft`
}

function formatWeight(num: unknown): string {
  const n = parseInt(String(num), 10)
  if (isNaN(n)) return '0'
  return n.toLocaleString()
}

export async function verifySimbriefUser(identifier: string): Promise<VerificationResult> {
  const trimmed = identifier.trim()
  if (!trimmed) {
    return {
      isValid: false,
      hasOfp: false,
      message: 'Enter your SimBrief Pilot ID or username to proceed',
    }
  }

  const isNumeric = /^\d+$/.test(trimmed)
  const queryParam = isNumeric
    ? `userid=${encodeURIComponent(trimmed)}`
    : `username=${encodeURIComponent(trimmed)}`
  const url = `https://www.simbrief.com/api/xml.fetcher.php?${queryParam}&json=1`

  try {
    const response = await fetch(url)
    const data = await response.json().catch(() => null)

    if (!data) {
      return {
        isValid: false,
        hasOfp: false,
        message: 'Unable to reach SimBrief servers. Please verify your internet connection and try again.',
        errorType: 'network_error',
      }
    }

    const status = data.fetch?.status || data.status || ''

    if (status === 'Success') {
      return {
        isValid: true,
        hasOfp: true,
        message: 'Account verified. Flight plan ready for import.',
      }
    }

    if (typeof status === 'string' && status.includes('No flight plan on file')) {
      return {
        isValid: true,
        hasOfp: false,
        message: 'Account verified. No flight plan generated on SimBrief yet.',
        errorType: 'no_ofp',
      }
    }

    if (typeof status === 'string' && status.includes('Unknown UserID')) {
      return {
        isValid: false,
        hasOfp: false,
        message: 'No SimBrief account matches this Pilot ID or username. Please check your credentials.',
        errorType: 'unknown_user',
      }
    }

    return {
      isValid: false,
      hasOfp: false,
      message: typeof status === 'string' && status.length > 0 ? status : 'Unable to verify account with SimBrief',
      errorType: 'other',
    }
  } catch {
    return {
      isValid: false,
      hasOfp: false,
      message: 'Network connection failed. Unable to communicate with SimBrief.',
      errorType: 'network_error',
    }
  }
}

export async function fetchFlightPlan(identifier: string): Promise<OfpFetchResult> {
  const trimmed = identifier.trim()
  if (!trimmed) {
    return {
      success: false,
      error: 'Please enter and verify your SimBrief Pilot ID in Settings first.',
      errorType: 'unknown_user',
    }
  }

  const isNumeric = /^\d+$/.test(trimmed)
  const queryParam = isNumeric
    ? `userid=${encodeURIComponent(trimmed)}`
    : `username=${encodeURIComponent(trimmed)}`
  const url = `https://www.simbrief.com/api/xml.fetcher.php?${queryParam}&json=1`

  try {
    const response = await fetch(url)
    const data = await response.json().catch(() => null)

    if (!data) {
      return {
        success: false,
        error: 'Unable to reach SimBrief API. Please check your internet connection.',
        errorType: 'network_error',
      }
    }

    const status = data.fetch?.status || data.status || ''

    if (status !== 'Success') {
      if (typeof status === 'string' && status.includes('No flight plan on file')) {
        return {
          success: false,
          error: 'No active flight plan found for this account. Please generate a new OFP on SimBrief.com, then tap Refresh.',
          errorType: 'no_ofp',
        }
      }
      if (typeof status === 'string' && status.includes('Unknown UserID')) {
        return {
          success: false,
          error: 'SimBrief account not found. Please verify your Pilot ID or username in Settings.',
          errorType: 'unknown_user',
        }
      }
      return {
        success: false,
        error: typeof status === 'string' && status.length > 0 ? status : 'SimBrief could not retrieve an active flight plan.',
        errorType: 'other',
      }
    }

    const airline = getSafeString(data.general?.icao_airline)
    const fltNum = getSafeString(data.general?.flight_number)
    const fullFlight = `${airline}${fltNum}`.trim() || 'NONAME'

    const parsedOfp: SimbriefOfp = {
      flightNumber: fullFlight,
      origin: {
        icao: getSafeString(data.origin?.icao_code, '----'),
        name: getSafeString(data.origin?.name, 'Departure Airport'),
        runway: getSafeString(data.origin?.plan_rwy, '--'),
      },
      destination: {
        icao: getSafeString(data.destination?.icao_code, '----'),
        name: getSafeString(data.destination?.name, 'Arrival Airport'),
        runway: getSafeString(data.destination?.plan_rwy, '--'),
      },
      aircraft: {
        icao: getSafeString(data.aircraft?.icao_code, 'AIRCRAFT'),
        name: getSafeString(data.aircraft?.name, 'Generic Aircraft'),
        registration: getSafeString(data.aircraft?.reg, 'N/A'),
      },
      route: getSafeString(data.general?.route, 'DIRECT'),
      altitude: formatAltitude(data.general?.initial_altitude),
      flightTime: formatSeconds(data.times?.est_time_enroute),
      blockTime: formatSeconds(data.times?.est_block),
      distance: `${formatWeight(data.general?.air_distance || data.general?.route_distance)} NM`,
      fuel: {
        ramp: formatWeight(data.fuel?.plan_ramp),
        trip: formatWeight(data.fuel?.enroute_burn),
        reserve: formatWeight(data.fuel?.reserve),
        taxi: formatWeight(data.fuel?.taxi),
        units: (getSafeString(data.params?.units) || 'KGS').toUpperCase(),
      },
      generatedDate: getSafeString(data.params?.time_generated),
    }

    return {
      success: true,
      data: parsedOfp,
    }
  } catch {
    return {
      success: false,
      error: 'Network request failed. Please check your internet connection and try again.',
      errorType: 'network_error',
    }
  }
}
