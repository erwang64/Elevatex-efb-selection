export interface VerificationResult {
  isValid: boolean
  hasOfp: boolean
  message: string
  errorType?: 'unknown_user' | 'network_error' | 'other'
}

export async function verifySimbriefUser(identifier: string): Promise<VerificationResult> {
  const trimmed = identifier.trim()
  if (!trimmed) {
    return {
      isValid: false,
      hasOfp: false,
      message: 'Enter a SimBrief Pilot ID or username',
    }
  }

  const isNumeric = /^\d+$/.test(trimmed)
  const queryParam = isNumeric
    ? `userid=${encodeURIComponent(trimmed)}`
    : `username=${encodeURIComponent(trimmed)}`
  const url = `https://www.simbrief.com/api/xml.fetcher.php?${queryParam}&json=1`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      return {
        isValid: false,
        hasOfp: false,
        message: 'SimBrief service unavailable',
        errorType: 'network_error',
      }
    }

    const data = await response.json()
    const status = data.fetch?.status || data.status || ''

    if (status === 'Success') {
      return {
        isValid: true,
        hasOfp: true,
        message: 'Account verified, OFP ready',
      }
    }

    if (typeof status === 'string' && status.includes('No flight plan on file')) {
      return {
        isValid: true,
        hasOfp: false,
        message: 'Account verified (no active flight plan)',
      }
    }

    if (typeof status === 'string' && status.includes('Unknown UserID')) {
      return {
        isValid: false,
        hasOfp: false,
        message: 'User not found on SimBrief',
        errorType: 'unknown_user',
      }
    }

    return {
      isValid: false,
      hasOfp: false,
      message: typeof status === 'string' ? status : 'Verification failed',
      errorType: 'other',
    }
  } catch {
    return {
      isValid: false,
      hasOfp: false,
      message: 'Network connection failed',
      errorType: 'network_error',
    }
  }
}
