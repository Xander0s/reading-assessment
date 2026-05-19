import { useState } from 'react'
import { tokenizeWords, uid } from '../lib/scoring'
import { DEFAULT_ASSESSMENT_TEXTS } from '../lib/defaultTexts'

export default function ManageTexts({ texts, setTexts, onBack }) {
  const [editing, setEditing] = useState(null) // text object or {new: true}
  const [title, setTitle] = useState('')
  const [period, setPeriod] = useState('')
  const [grade, setGrade] = useState('')
  const [body, setBody] = useState('')

  const beginEdit = (t) => {
    setEditing(t)
    setTitle(t?.title || '')
    setPeriod(t?.period || '')
    setGrade(t?.grade ? String(t.grade) : '')
    setBody(t?.text || '')
  }

  const beginNew = () => {
    setEditing({ new: true })
    setTitle('')
    setPeriod('')
    setGrade('')
    setBody('')
  }

  const cancelEdit = () => {
    setEditing(null)
  }

  const save = (e) => {
    e?.preventDefault()
    if (!title.trim() || !body.trim()) {
      alert('Title and text are required.')
      return
    }
    if (editing?.new) {
      const t = {
        id: uid(),
        title: title.trim(),
        period: period.trim(),
        grade: grade.trim(),
        text: body.trim(),
        isDefault: false,
      }
      setTexts([t, ...texts])
    } else {
      setTexts(
        texts.map((t) =>
          t.id === editing.id
            ? { ...t, title: title.trim(), period: period.trim(), grade: grade.trim(), text: body.trim() }
            : t,
        ),
      )
    }
    setEditing(null)
  }

  const remove = (id) => {
    if (!confirm('Delete this text?')) return
    setTexts(texts.filter((t) => t.id !== id))
  }

  const restoreDefaults = () => {
    if (!confirm('Re-add the built-in DIBELS passages? Existing custom texts will be kept.')) return
    const existingIds = new Set(texts.map((t) => t.id))
    const missing = DEFAULT_ASSESSMENT_TEXTS.filter((t) => !existingIds.has(t.id))
    if (missing.length === 0) {
      alert('All default texts are already present.')
      return
    }
    setTexts([...texts, ...missing])
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-blue-700">
        ← Back
      </button>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Assessment texts</h1>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={restoreDefaults}>
            Restore defaults
          </button>
          <button className="btn-primary" onClick={beginNew}>
            New text
          </button>
        </div>
      </div>

      {editing && (
        <form onSubmit={save} className="card p-4 space-y-3">
          <h2 className="font-semibold">{editing.new ? 'New text' : 'Edit text'}</h2>
          <input
            className="input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className="input"
              placeholder="Period (e.g. Middle of Year)"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
            <input
              className="input"
              placeholder="Grade (optional)"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
          </div>
          <textarea
            className="input min-h-[200px] font-mono text-sm"
            placeholder="Paste the passage text here…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="text-xs text-slate-500">
            {body.trim() ? `${tokenizeWords(body).length} words` : 'No text yet'}
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" className="btn-secondary" onClick={cancelEdit}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save
            </button>
          </div>
        </form>
      )}

      {texts.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">No texts yet.</div>
      ) : (
        <ul className="card divide-y divide-slate-200">
          {texts.map((t) => (
            <li key={t.id} className="p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium">{t.title}</div>
                <div className="text-sm text-slate-500">
                  {t.period && <span>{t.period}</span>}
                  {t.period && t.grade && <span> · </span>}
                  {t.grade && <span>Grade {t.grade}</span>}
                  {!t.period && !t.grade && <span>Custom</span>}
                  <span> · {tokenizeWords(t.text).length} words</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="btn-ghost text-sm" onClick={() => beginEdit(t)}>
                  Edit
                </button>
                <button
                  className="btn-ghost text-red-600 text-sm"
                  onClick={() => remove(t.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
