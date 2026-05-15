// Mood history utility for tracking mental wellness journey
export interface MoodEntry {
  date: string
  state: "stress" | "anxiety" | "depression" | "normal"
  iks_dosha: "Vata" | "Pitta" | "Kapha"
}

const MOOD_HISTORY_KEY = "moodHistory"

/**
 * Saves a mood entry to localStorage
 * Appends to existing history or creates new array
 */
export function saveMoodEntry(
  state: "stress" | "anxiety" | "depression" | "normal",
  dosha: "Vata" | "Pitta" | "Kapha",
): void {
  try {
    // Get existing history or create empty array
    const existingHistory = getMoodHistory()

    // Create new entry with current date
    const newEntry: MoodEntry = {
      date: new Date().toISOString(),
      state,
      iks_dosha: dosha,
    }

    // Append to history
    const updatedHistory = [...existingHistory, newEntry]

    // Save to localStorage
    localStorage.setItem(MOOD_HISTORY_KEY, JSON.stringify(updatedHistory))
  } catch (error) {
    // Silently fail if localStorage is not available
    console.log("[v0] Could not save mood entry to localStorage:", error)
  }
}

/**
 * Retrieves mood history from localStorage
 */
export function getMoodHistory(): MoodEntry[] {
  try {
    const stored = localStorage.getItem(MOOD_HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    // Return empty array if parsing fails
    console.log("[v0] Could not retrieve mood history from localStorage:", error)
    return []
  }
}

/**
 * Clears all mood history
 */
export function clearMoodHistory(): void {
  try {
    localStorage.removeItem(MOOD_HISTORY_KEY)
  } catch (error) {
    console.log("[v0] Could not clear mood history:", error)
  }
}

/**
 * Gets mood statistics from history
 */
export function getMoodStatistics() {
  const history = getMoodHistory()

  if (history.length === 0) {
    return {
      totalEntries: 0,
      mostCommonState: null,
      mostCommonDosha: null,
      averageEntriesPerDay: 0,
    }
  }

  // Count occurrences
  const stateCounts = history.reduce((acc, entry) => {
    acc[entry.state] = (acc[entry.state] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const doshaCounts = history.reduce((acc, entry) => {
    acc[entry.iks_dosha] = (acc[entry.iks_dosha] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Find most common
  const mostCommonState = Object.keys(stateCounts).reduce((a, b) => (stateCounts[a] > stateCounts[b] ? a : b), null)
  const mostCommonDosha = Object.keys(doshaCounts).reduce((a, b) => (doshaCounts[a] > doshaCounts[b] ? a : b), null)

  return {
    totalEntries: history.length,
    mostCommonState,
    mostCommonDosha,
    averageEntriesPerDay: (history.length / Math.max(1, getDayCount(history))).toFixed(2),
  }
}

/**
 * Helper function to count unique days in history
 */
function getDayCount(history: MoodEntry[]): number {
  const days = new Set(history.map((entry) => new Date(entry.date).toDateString()))
  return days.size
}
