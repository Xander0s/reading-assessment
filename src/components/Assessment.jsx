import { useMemo, useState } from 'react'
import Timer from './Timer'
import { tokenizeWords, computeScore, uid } from '../lib/scoring'

export default function Assessment({ student, assessmentText, onCancel, onSave }) {
  const words = useMemo(() => tokenizeWords(assessmentText.text), [assessmentText])

  const [markedWords, setMarkedWords] = useState(() => new Set())
  const [selfCorrectedWords, setSelfCorrectedWords] = useState(() => new Set())
  const [oneMinuteMark, setOneMinuteMark] = useState(null)
  const [timerStarted, setTimerStarted] = useState(false)
  const [timerExpired, setTimerExpired] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(60)

  const startTimer = () => {
    setTimerStarted(true)
    setTimerExpired(false)
  }

  const resetAssessment = () => {
    if (!confirm('Reset assessment? All marks will be cleared.')) return
    setMarkedWords(new Set())
    setSelfCorrectedWords(new Set())
    setOneMinuteMark(null)
    setTimerStarted(false)
    setTimerExpired(false)
    setTimeRemaining(60)
  }

  // Three-state cycle on tap: unmarked → error → self-corrected → unmarked.
  const cycleWord = (index) => {
    if (oneMinuteMark !== null && index > oneMinuteMark) return
    const isError = markedWords.has(index)
    const isSC = selfCorrectedWords.has(index)
    const nextErrors = new Set(markedWords)
    const nextSC = new Set(selfCorrectedWords)
    if (!isError && !isSC) {
      nextErrors.add(index)
    } else if (isError && !isSC) {
      nextErrors.delete(index)
      nextSC.add(index)
    } else {
      nextErrors.delete(index)
      nextSC.delete(index)
    }
    setMarkedWords(nextErrors)
    setSelfCorrectedWords(nextSC)
  }

  // Place the ] one-minute mark. Only allowed once timer has expired.
  const placeMinuteMark = (index) => {
    if (!timerExpired) return
    setOneMinuteMark((prev) => (prev === index ? null : index))
  }

  const score = computeScore({
    totalWords: words.length,
    markedWords,
    selfCorrectedWords,
    oneMinuteMark,
  })

  const saveResult = () => {
    if (!timerExpired) {
      if (!confirm('Timer has not finished. Save anyway?')) return
    }
    const result = {
      id: uid(),
      date: new Date().toISOString(),
      studentId: student.id,
      assessmentId: assessmentText.id,
      assessmentTitle: assessmentText.title,
      totalWords: words.length,
      markedWords: [...markedWords],
      selfCorrectedWords: [...selfCorrectedWords],
      oneMinuteMark,
      ...score,
    }
    onSave(result)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{assessmentText.title}</h1>
          <div className="text-sm text-slate-500">
            {student.firstName} {student.lastName}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Timer
            running={timerStarted && !timerExpired}
            onTick={(t) => setTimeRemaining(t)}
            onComplete={() => {
              setTimerExpired(true)
              setTimeRemaining(0)
            }}
          />
          {!timerStarted ? (
            <button className="btn-primary" onClick={startTimer}>
              Start timer
            </button>
          ) : (
            <button className="btn-secondary" onClick={resetAssessment}>
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="card p-4 grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
        <Stat label="Words" value={score.wordsReadInMinute} />
        <Stat label="Errors" value={score.errors} />
        <Stat label="Self-corr." value={score.selfCorrections} />
        <Stat label="Accuracy" value={`${score.accuracy}%`} />
        <Stat label="WCPM" value={score.wcpm} highlight />
      </div>

      <div className="card p-4">
        <div className="text-xs text-slate-500 mb-2">
          Tap a word once for an error, twice for self-correction, three times to clear.
          {timerExpired
            ? ' Timer finished — tap after a word to place the one-minute mark.'
            : ' One-minute mark can be placed once the timer hits 0:00.'}
        </div>
        <div className="leading-loose text-lg select-none">
          {words.map((w, i) => {
            const isError = markedWords.has(i)
            const isSC = selfCorrectedWords.has(i)
            const afterMark = oneMinuteMark !== null && i > oneMinuteMark
            const cls = [
              'inline-block px-1 py-0.5 rounded cursor-pointer transition-colors',
              afterMark ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100',
              isError ? 'line-through decoration-2 text-red-600' : '',
              isSC ? 'bg-yellow-200 text-amber-900' : '',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <span key={i} className="inline">
                <span className={cls} onClick={() => cycleWord(i)}>
                  {w}
                </span>
                {timerExpired && (
                  <button
                    type="button"
                    onClick={() => placeMinuteMark(i)}
                    className={`inline-block w-3 align-baseline text-blue-700 font-bold ${
                      oneMinuteMark === i ? 'opacity-100' : 'opacity-30 hover:opacity-80'
                    }`}
                    aria-label="Place one-minute mark after this word"
                  >
                    {oneMinuteMark === i ? ']' : '·'}
                  </button>
                )}
                {' '}
              </span>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-primary" onClick={saveResult}>
          Save assessment
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value, highlight }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`text-xl font-semibold ${highlight ? 'text-blue-700' : ''}`}>{value}</div>
    </div>
  )
}
