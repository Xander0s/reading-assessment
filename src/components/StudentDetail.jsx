import { useEffect, useState } from 'react'
import { storage, Keys } from '../lib/storage'
import { downloadCSV } from '../lib/csv'
import { formatDate } from '../lib/scoring'

export default function StudentDetail({ student, assessmentTexts, onBack, onStartAssessment }) {
  const [assessments, setAssessments] = useState([])
  const [selectedTextId, setSelectedTextId] = useState(assessmentTexts[0]?.id || '')

  useEffect(() => {
    setAssessments(storage.get(Keys.ASSESSMENTS(student.id)) || [])
  }, [student.id])

  const deleteAssessment = (id) => {
    if (!confirm('Delete this assessment?')) return
    const next = assessments.filter((a) => a.id !== id)
    storage.set(Keys.ASSESSMENTS(student.id), next)
    setAssessments(next)
  }

  const exportStudentCSV = () => {
    const header = [
      'Student Name',
      'Assessment Date',
      'Assessment Title',
      'Words Read (1 min)',
      'Errors',
      'Self-Corrections',
      'Accuracy %',
      'WCPM',
    ]
    const rows = [header]
    const fullName = `${student.firstName} ${student.lastName}`.trim()
    for (const a of assessments) {
      rows.push([
        fullName,
        formatDate(a.date),
        a.assessmentTitle,
        a.wordsReadInMinute,
        a.errors,
        a.selfCorrections,
        a.accuracy,
        a.wcpm,
      ])
    }
    downloadCSV(`${fullName.replace(/\s+/g, '_')}_assessments.csv`, rows)
  }

  const selectedText = assessmentTexts.find((t) => t.id === selectedTextId)

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-blue-700">
        ← Back to students
      </button>

      <div className="card p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold">
              {student.firstName} {student.lastName}
            </h1>
            {student.grade && (
              <div className="text-sm text-slate-500">Grade {student.grade}</div>
            )}
          </div>
          <button className="btn-secondary" onClick={exportStudentCSV} disabled={!assessments.length}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <h2 className="font-semibold">Start a new assessment</h2>
        <div className="flex flex-wrap gap-2">
          <select
            className="input flex-1 min-w-[200px]"
            value={selectedTextId}
            onChange={(e) => setSelectedTextId(e.target.value)}
          >
            {assessmentTexts.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
                {t.period ? ` — ${t.period}` : ''}
              </option>
            ))}
          </select>
          <button
            className="btn-primary"
            onClick={() => selectedText && onStartAssessment(selectedText)}
            disabled={!selectedText}
          >
            Start
          </button>
        </div>
      </div>

      <div className="card divide-y divide-slate-200">
        <h2 className="font-semibold p-4">Assessment history</h2>
        {assessments.length === 0 ? (
          <div className="p-4 text-slate-500 text-sm">No assessments yet.</div>
        ) : (
          assessments.map((a) => (
            <div key={a.id} className="p-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-medium">{a.assessmentTitle}</div>
                <div className="text-sm text-slate-500">{formatDate(a.date)}</div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span>WCPM: <strong>{a.wcpm}</strong></span>
                <span>Accuracy: <strong>{a.accuracy}%</strong></span>
                <span>Errors: {a.errors}</span>
                <span>SC: {a.selfCorrections}</span>
                <span>Words: {a.wordsReadInMinute}</span>
              </div>
              <button
                className="btn-ghost text-red-600 text-sm"
                onClick={() => deleteAssessment(a.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
