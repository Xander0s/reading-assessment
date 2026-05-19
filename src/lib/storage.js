const PREFIX = 'reading-assessment:'

export const storage = {
  get(key) {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },
  set(key, value) {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  },
  remove(key) {
    localStorage.removeItem(PREFIX + key)
  },
}

export const Keys = {
  STUDENTS: 'students',
  TEXTS: 'assessmentTexts',
  ASSESSMENTS: (studentId) => `assessments:${studentId}`,
}
