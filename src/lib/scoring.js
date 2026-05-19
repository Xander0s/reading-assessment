export function tokenizeWords(text) {
  // Split on whitespace but keep punctuation attached to the word for display.
  return text
    .replace(/—/g, ' — ')
    .split(/\s+/)
    .filter(Boolean)
}

export function computeScore({ totalWords, markedWords, selfCorrectedWords, oneMinuteMark }) {
  const wordsReadInMinute =
    oneMinuteMark !== null && oneMinuteMark !== undefined ? oneMinuteMark + 1 : totalWords
  const errorsInWindow = [...markedWords].filter((i) => i < wordsReadInMinute).length
  const selfCorrectsInWindow = [...selfCorrectedWords].filter((i) => i < wordsReadInMinute).length
  const accuracy =
    wordsReadInMinute > 0
      ? (((wordsReadInMinute - errorsInWindow) / wordsReadInMinute) * 100).toFixed(1)
      : '0.0'
  const wcpm = Math.max(0, wordsReadInMinute - errorsInWindow)
  return {
    wordsReadInMinute,
    errors: errorsInWindow,
    selfCorrections: selfCorrectsInWindow,
    accuracy,
    wcpm,
  }
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function formatDate(d) {
  const date = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
