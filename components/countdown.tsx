import React, { useEffect, useState } from 'react'

type TimeParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const getTimeParts = (totalSeconds: number): TimeParts => {
  const days = Math.floor(totalSeconds / (60 * 60 * 24))
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds }
}

const TimeUnit = ({
  label,
  value,
  prevValue,
}: {
  label: string
  value: number
  prevValue: number
}) => {
  return (
    <div className="flex flex-col items-center w-16">
      <div className="w-full h-12 relative overflow-hidden text-2xl sm:text-4xl font-bold">
        {/* prev */}
        <div
          key={`prev-${label}-${prevValue}`}
          className="absolute inset-0 flex items-center justify-center animate-slide-out"
        >
          {String(prevValue).padStart(2, '0')}
        </div>
        {/* current */}
        <div
          key={`curr-${label}-${value}`}
          className="absolute inset-0 flex items-center justify-center animate-slide-in"
        >
          {String(value).padStart(2, '0')}
        </div>
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

export const Countdown = ({ initialSeconds }: { initialSeconds: number }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [prevParts, setPrevParts] = useState(getTimeParts(initialSeconds))

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevParts(getTimeParts(secondsLeft))
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [secondsLeft])

  const parts = getTimeParts(secondsLeft)

  return (
    <div className="flex gap-4 justify-center">
      <TimeUnit label="days" value={parts.days} prevValue={prevParts.days} />
      <TimeUnit label="hours" value={parts.hours} prevValue={prevParts.hours} />
      <TimeUnit
        label="minutes"
        value={parts.minutes}
        prevValue={prevParts.minutes}
      />
      <TimeUnit
        label="seconds"
        value={parts.seconds}
        prevValue={prevParts.seconds}
      />
    </div>
  )
}
