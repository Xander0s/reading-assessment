import { useEffect, useRef, useState } from 'react'

export default function Timer({ running, onTick, onComplete, durationSeconds = 60 }) {
  const [remaining, setRemaining] = useState(durationSeconds)
  const intervalRef = useRef(null)
  const completedRef = useRef(false)

  useEffect(() => {
    if (running) {
      completedRef.current = false
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          const next = Math.max(0, prev - 1)
          onTick?.(next)
          if (next === 0 && !completedRef.current) {
            completedRef.current = true
            clearInterval(intervalRef.current)
            intervalRef.current = null
            onComplete?.()
          }
          return next
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [running])

  const mm = Math.floor(remaining / 60)
  const ss = remaining % 60
  const display = `${mm}:${ss.toString().padStart(2, '0')}`
  const isExpired = remaining === 0

  return (
    <div
      className={`text-4xl font-mono tabular-nums px-4 py-2 rounded-lg ${
        isExpired ? 'bg-amber-100 text-amber-800' : running ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'
      }`}
    >
      {display}
    </div>
  )
}
