import { useRef, useState } from 'react'
import { downloadCSV, parseCSV } from '../lib/csv'
import { formatDate, uid } from '../lib/scoring'
import { storage, Keys } from '../lib/storage'

export default function StudentList({ students, setStudents, onOpenStudent }) {
  const [showAdd, setShowAdd] = useState(false)
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [grade, setGrade] = useState('')
  const fileInput = useRef(null)

  const addStudent = (e) => {
    e?.preventDefault()
    if (!first.trim() && !last.trim()) return
    const student = {
      id: uid(),
      firstName: first.trim(),
      lastName: last.trim(),
      grade: grade.trim(),
      createdAt: new Date().toISOString(),
    }
    setStudents([student, ...students])
    setFirst('')
    setLast('')
    setGrade('')
    setShowAdd(false)
  }

  const deleteStudent = (id) => {
    if (!confirm('Delete this student and all their assessments?')) return
    setStudents(students.filter((s) => s.id !== id))
    try {
      localStorage.removeItem(`reading-assessment:assessments:${id}`)
    } catch {}
  }

  const exportAllCSV = () => {
    const header = [
      'Student Name',
      'Grade',
      'Assessment Date',
      'Assessment Title',
      'Words Read (1 min)',
      'Errors',
      'Self-Corrections',
      'Accuracy %',
      'WCPM',
    ]
    const rows = [header]
    let total = 0
    for (const s of students) {
      const assessments = storage.get(Keys.ASSESSMENTS(s.id)) || []
      const fullName = `${s.firstName} ${s.lastName}`.trim()
      for (const a of assessments) {
        rows.push([
          fullName,
          s.grade || '',
          formatDate(a.date),
          a.assessmentTitle,
          a.wordsReadInMinute,
          a.errors,
          a.selfCorrections,
          a.accuracy,
          a.wcpm,
        ])
        total++
      }
    }
    if (total === 0) {
      alert('No assessments to export yet.')
      return
    }
    const stamp = new Date().toISOString().slice(0, 10)
    downloadCSV(`reading-assessments_${stamp}.csv`, rows)
  }

  const onImportCSV = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const rows = parseCSV(text)
    if (!rows.length) return
    // Detect header row: look for "first" / "last" headings.
    const header = rows[0].map((c) => c.trim().toLowerCase())
    let dataRows = rows
    let firstIdx = 0
    let lastIdx = 1
    let gradeIdx = 2
    if (header.some((h) => h.includes('first') || h.includes('last') || h.includes('name'))) {
      dataRows = rows.slice(1)
      firstIdx = header.findIndex((h) => h.includes('first'))
      lastIdx = header.findIndex((h) => h.includes('last'))
      gradeIdx = header.findIndex((h) => h.includes('grade'))
      if (firstIdx < 0 && lastIdx < 0) {
        const nameIdx = header.findIndex((h) => h.includes('name'))
        firstIdx = nameIdx
        lastIdx = -1
      }
    }
    const imported = dataRows
      .map((r) => {
        const f = firstIdx >= 0 ? (r[firstIdx] || '').trim() : ''
        const l = lastIdx >= 0 ? (r[lastIdx] || '').trim() : ''
        const g = gradeIdx >= 0 ? (r[gradeIdx] || '').trim() : ''
        let firstName = f
        let lastName = l
        if (f && !l && f.includes(' ')) {
          const parts = f.split(/\s+/)
          firstName = parts.shift()
          lastName = parts.join(' ')
        }
        if (!firstName && !lastName) return null
        return {
          id: uid(),
          firstName,
          lastName,
          grade: g,
          createdAt: new Date().toISOString(),
        }
      })
      .filter(Boolean)
    if (imported.length) {
      setStudents([...imported, ...students])
      alert(`Imported ${imported.length} students.`)
    } else {
      alert('No students found in CSV.')
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Students</h1>
        <div className="flex gap-2">
          <button
            className="btn-secondary"
            onClick={exportAllCSV}
            disabled={students.length === 0}
            title="Export every assessment from every student"
          >
            Export all
          </button>
          <button className="btn-secondary" onClick={() => fileInput.current?.click()}>
            Import CSV
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={onImportCSV}
          />
          <button className="btn-primary" onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? 'Cancel' : 'Add student'}
          </button>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={addStudent} className="card p-4 grid sm:grid-cols-4 gap-3">
          <input
            className="input"
            placeholder="First name"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            autoFocus
          />
          <input
            className="input"
            placeholder="Last name"
            value={last}
            onChange={(e) => setLast(e.target.value)}
          />
          <input
            className="input"
            placeholder="Grade (optional)"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Save
          </button>
        </form>
      )}

      {students.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">
          No students yet. Add one above or import a CSV.
          <div className="mt-2 text-xs">CSV headings: first name, last name, grade</div>
        </div>
      ) : (
        <ul className="card divide-y divide-slate-200">
          {students.map((s) => (
            <li key={s.id} className="flex items-center justify-between p-4">
              <button
                onClick={() => onOpenStudent(s)}
                className="text-left flex-1"
              >
                <div className="font-medium">
                  {s.firstName} {s.lastName}
                </div>
                {s.grade && <div className="text-sm text-slate-500">Grade {s.grade}</div>}
              </button>
              <button
                className="btn-ghost text-red-600 text-sm"
                onClick={() => deleteStudent(s.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
