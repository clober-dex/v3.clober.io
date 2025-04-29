import { UTCTimestamp } from 'lightweight-charts'
import { useCallback } from 'react'

export function useHeaderDateFormatter() {
  return useCallback((time?: UTCTimestamp) => {
    if (!time) {
      return '-'
    }
    const headerDateFormatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    }

    return new Date(time * 1000).toLocaleDateString(
      'en-US',
      headerDateFormatOptions,
    )
  }, [])
}
