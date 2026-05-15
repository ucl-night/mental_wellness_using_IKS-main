import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSymptomForDisplay(symptom: string): string {
  const displayNames: Record<string, string> = {
    anxiety: "Anxiety",
    depression: "Depression",
    stress: "Stress",
    sleep: "Sleep Issues",
    physical: "Physical Symptoms",
    cognitive: "Concentration Issues",
    social: "Social Concerns",
  }

  return displayNames[symptom] || symptom.charAt(0).toUpperCase() + symptom.slice(1)
}

export function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case "crisis":
      return "bg-red-100 text-red-800 border-red-200"
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "low":
      return "bg-green-100 text-green-800 border-green-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hour${hours > 1 ? "s" : ""}`
  }
}
