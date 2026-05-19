import { useEffect, useState } from 'react'
import { storage, Keys } from './lib/storage'
import { DEFAULT_ASSESSMENT_TEXTS } from './lib/defaultTexts'
import StudentList from './components/StudentList'
import StudentDetail from './components/StudentDetail'
import Assessment from './components/Assessment'
import ManageTexts from './components/ManageTexts'

const VIEW = {
  STUDENT_LIST: 'studentList',
  STUDENT_DETAIL: 'studentDetail',
  ASSESSMENT: 'assessment',
  MANAGE_TEXTS: 'manageTexts',
}

export default function App() {
  const [students, setStudents] = useState(() => storage.get(Keys.STUDENTS) || [])
  const [assessmentTexts, setAssessmentTexts] = useState(() => {
    const stored = storage.get(Keys.TEXTS)
    return stored && stored.length ? stored : DEFAULT_ASSESSMENT_TEXTS
  })
  const [view, setView] = useState(VIEW.STUDENT_LIST)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedAssessment, setSelectedAssessment] = useState(null)

  useEffect(() => {
    storage.set(Keys.STUDENTS, students)
  }, [students])

  useEffect(() => {
    storage.set(Keys.TEXTS, assessmentTexts)
  }, [assessmentTexts])

  const goHome = () => {
    setSelectedStudent(null)
    setSelectedAssessment(null)
    setView(VIEW.STUDENT_LIST)
  }

  const openStudent = (student) => {
    setSelectedStudent(student)
    setView(VIEW.STUDENT_DETAIL)
  }

  const startAssessment = (student, text) => {
    setSelectedStudent(student)
    setSelectedAssessment(text)
    setView(VIEW.ASSESSMENT)
  }

  const saveAssessmentResult = (result) => {
    const key = Keys.ASSESSMENTS(selectedStudent.id)
    const existing = storage.get(key) || []
    const next = [result, ...existing]
    storage.set(key, next)
    setView(VIEW.STUDENT_DETAIL)
  }

  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={goHome} className="text-lg font-semibold text-blue-700">
            Reading Assessment
          </button>
          <nav className="flex gap-2">
            <button className="btn-ghost text-sm" onClick={goHome}>
              Students
            </button>
            <button
              className="btn-ghost text-sm"
              onClick={() => setView(VIEW.MANAGE_TEXTS)}
            >
              Texts
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {view === VIEW.STUDENT_LIST && (
          <StudentList
            students={students}
            setStudents={setStudents}
            onOpenStudent={openStudent}
          />
        )}
        {view === VIEW.STUDENT_DETAIL && selectedStudent && (
          <StudentDetail
            student={selectedStudent}
            assessmentTexts={assessmentTexts}
            onBack={goHome}
            onStartAssessment={(text) => startAssessment(selectedStudent, text)}
          />
        )}
        {view === VIEW.ASSESSMENT && selectedStudent && selectedAssessment && (
          <Assessment
            student={selectedStudent}
            assessmentText={selectedAssessment}
            onCancel={() => setView(VIEW.STUDENT_DETAIL)}
            onSave={saveAssessmentResult}
          />
        )}
        {view === VIEW.MANAGE_TEXTS && (
          <ManageTexts
            texts={assessmentTexts}
            setTexts={setAssessmentTexts}
            onBack={goHome}
          />
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-4 text-xs text-slate-400">
        v{__APP_VERSION__} · Offline-ready
      </footer>
    </div>
  )
}
