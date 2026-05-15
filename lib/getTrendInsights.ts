import { getMoodHistory, type MoodEntry } from "./mood-history"

export interface TrendInsight {
  dominantState: "stress" | "anxiety" | "depression" | "normal"
  dominantDosha: "Vata" | "Pitta" | "Kapha"
  message: string
  alert?: string
}

/**
 * Analyzes mood history from the last 7 entries
 * Returns dominant state, dosha, and contextual message
 */
export function getTrendInsights(): TrendInsight {
  // Get full mood history
  const history = getMoodHistory()

  // Get last 7 entries
  const last7Entries = history.slice(-7)

  // Default response if no data
  if (last7Entries.length === 0) {
    return {
      dominantState: "normal",
      dominantDosha: "Vata",
      message: "No mood data available yet. Start tracking your wellness journey today.",
    }
  }

  // Count frequency of each state
  const stateFrequency = countFrequency(last7Entries.map((e) => e.state))
  const doshaFrequency = countFrequency(last7Entries.map((e) => e.iks_dosha))

  // Get dominant state and dosha
  const dominantState = getMaxKey(stateFrequency) as "stress" | "anxiety" | "depression" | "normal"
  const dominantDosha = getMaxKey(doshaFrequency) as "Vata" | "Pitta" | "Kapha"

  // Generate contextual message
  const message = generateMessage(dominantState, dominantDosha, stateFrequency)

  // Detect recurring patterns (state appears 3+ times in last 7 entries)
  const alert = detectRecurringPattern(dominantState, stateFrequency)

  return {
    dominantState,
    dominantDosha,
    message,
    alert,
  }
}

/**
 * Detect recurring patterns - returns alert if state appears 3+ times
 */
function detectRecurringPattern(state: string, stateFrequency: Record<string, number>): string | undefined {
  const count = stateFrequency[state] || 0

  if (count < 3) {
    return undefined
  }

  const alertMessages: Record<string, string> = {
    stress: "Moderate recurring stress detected. Consider lifestyle adjustments.",
    anxiety: "Moderate recurring anxiety detected. Consider lifestyle adjustments.",
    depression: "Moderate recurring depression detected. Consider lifestyle adjustments.",
    normal: undefined,
  }

  return alertMessages[state] as string | undefined
}

/**
 * Helper: Count frequency of items in array
 */
function countFrequency(items: string[]): Record<string, number> {
  return items.reduce((acc, item) => {
    acc[item] = (acc[item] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

/**
 * Helper: Get key with highest frequency
 */
function getMaxKey(frequency: Record<string, number>): string {
  return Object.keys(frequency).reduce((a, b) => (frequency[a] > frequency[b] ? a : b), "normal")
}

/**
 * Generate contextual message based on state and dosha
 */
function generateMessage(
  state: string,
  dosha: string,
  stateFrequency: Record<string, number>,
): string {
  // Define message templates
  const messages: Record<string, Record<string, string>> = {
    stress: {
      Pitta:
        "You have experienced stress frequently this week, indicating a possible Pitta imbalance. Consider cooling practices like meditation and soothing herbs.",
      Vata: "Stress with Vata characteristics suggests nervous system imbalance. Grounding activities and warm oil massage may help.",
      Kapha: "Persistent stress affecting your energy. Warming, stimulating practices can help restore balance.",
    },
    anxiety: {
      Vata: "Anxiety patterns indicate Vata imbalance (excess air element). Focus on grounding practices and calming breathwork.",
      Pitta: "Anxiety with Pitta influence suggests mental restlessness. Cooling and relaxing practices are recommended.",
      Kapha: "Anxiety patterns appearing. Stimulating practices and movement can help shift the energy.",
    },
    depression: {
      Kapha:
        "Depression tendencies detected, linked to Kapha imbalance. Warming, energizing practices like yoga and movement are beneficial.",
      Vata: "Depression with Vata characteristics. Grounding and stabilizing practices can provide support.",
      Pitta: "Depression with Pitta heat. Cooling practices and gentle rest periods are recommended.",
    },
    normal: {
      Vata: "Your mood has been balanced this week. Continue nurturing practices to maintain this positive state.",
      Pitta: "Great! You are maintaining balance. Keep up with your wellness practices.",
      Kapha: "You are in a stable state. Gentle practices help sustain this wellness.",
    },
  }

  // Get base message
  const baseMessage = messages[state]?.[dosha] || "Keep up with your wellness practices."

  // Add frequency context if multiple entries
  const entryCount = Object.values(stateFrequency).reduce((a, b) => a + b, 0)
  if (entryCount >= 7) {
    return baseMessage
  } else if (entryCount >= 4) {
    return baseMessage + " Continue tracking for more detailed insights."
  } else {
    return baseMessage + " Add more entries to see clearer trends."
  }
}
