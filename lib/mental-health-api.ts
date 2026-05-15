// API layer for mental health classification and recommendations
import { aiClassifier, type ClassificationResult } from "./ai-classification"
import { saveMoodEntry } from "./mood-history"

export interface UserProfile {
  name: string
  age: number
  gender: string
  experience?: "beginner" | "intermediate" | "advanced"
  culturalPreferences?: string[]
  previousTreatment?: string
}

export interface AnalysisRequest {
  text: string
  duration?: string
  userProfile?: UserProfile
  context?: "initial" | "follow-up" | "crisis"
}

export interface DoshaRecommendation {
  dosha: "Vata" | "Pitta" | "Kapha"
  recommendations: string[]
}

export interface AnalysisResponse {
  classification: ClassificationResult
  culturalMessage: string
  nextSteps: string[]
  estimatedTimeToRelief: string
  followUpRecommended: boolean
  iks_recommendations?: DoshaRecommendation
}

/**
 * Main API function for analyzing user input and providing recommendations
 */
export async function analyzeUserInput(request: AnalysisRequest): Promise<AnalysisResponse> {
  // Simulate API processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Get AI classification
  const classification = aiClassifier.classifyAndRecommend(request.text, request.duration, request.userProfile)

  // Generate culturally aware messaging
  const culturalMessage = aiClassifier.generateCulturallyAwareMessage(classification)

  // Determine next steps based on classification
  const nextSteps = generateNextSteps(classification, request.context)

  // Estimate time to relief
  const estimatedTimeToRelief = estimateTimeToRelief(classification)

  // Determine if follow-up is recommended
  const followUpRecommended = shouldRecommendFollowUp(classification, request.context)

  // Get dosha-specific recommendations
  const dosha = (classification as any).iks_mapping?.dosha || "Vata"
  const iks_recommendations = getDoshaRecommendations(dosha)

  // Save mood entry to history (with default state if enhanced result not available)
  try {
    const state = (classification as any).state || "normal"
    saveMoodEntry(state, dosha)
  } catch (error) {
    console.log("[v0] Could not save mood history:", error)
  }

  return {
    classification,
    culturalMessage,
    nextSteps,
    estimatedTimeToRelief,
    followUpRecommended,
    iks_recommendations,
  }
}

/**
 * Generates dosha-specific recommendations based on imbalance
 */
function getDoshaRecommendations(dosha: string): DoshaRecommendation {
  const doshaRecommendationsMap: Record<string, string[]> = {
    Vata: [
      "Practice Anulom Vilom (Alternate Nostril Breathing) for grounding",
      "Consume warm, nourishing foods (soups, stews, cooked grains)",
      "Establish a consistent daily routine with fixed meal times",
      "Use sesame oil massage (Abhyanga) for calming effect",
      "Keep warm - avoid cold foods and environments",
    ],
    Pitta: [
      "Practice cooling breathing techniques (Shitali, Sitkari Pranayama)",
      "Reduce screen time and exposure to intense stimuli",
      "Consume cooling foods (coconut, cucumber, leafy greens)",
      "Practice restorative yoga rather than intense exercises",
      "Spend time in nature and avoid excessive heat",
    ],
    Kapha: [
      "Engage in regular physical activity and dynamic exercises",
      "Practice energizing breathing (Bhastrika Pranayama)",
      "Include warming spices in diet (ginger, turmeric, black pepper)",
      "Establish an active morning routine with sunlight exposure",
      "Try stimulating practices like cold water therapy",
    ],
  }

  return {
    dosha: dosha as "Vata" | "Pitta" | "Kapha",
    recommendations: doshaRecommendationsMap[dosha] || doshaRecommendationsMap.Vata,
  }
}

/**
 * Generates contextual next steps based on classification
 */
function generateNextSteps(classification: ClassificationResult, context?: string): string[] {
  const steps: string[] = []

  if (classification.urgency === "crisis") {
    steps.push("Contact crisis helpline immediately: 1800-599-0019")
    steps.push("Reach out to a trusted friend or family member")
    steps.push("Consider visiting nearest emergency room if in immediate danger")
    return steps
  }

  if (classification.professionalHelpNeeded) {
    steps.push("Schedule appointment with mental health professional")
    steps.push("Consider counseling or therapy services")
  }

  if (classification.type === "short-term") {
    steps.push("Try the recommended breathing exercises immediately")
    steps.push("Practice for 10-15 minutes, 2-3 times today")
    steps.push("Monitor how you feel after each practice")
    steps.push("Return if symptoms persist beyond 48 hours")
  } else {
    steps.push("Begin with beginner-level practices")
    steps.push("Establish a daily routine incorporating these techniques")
    steps.push("Consider consulting an Ayurvedic practitioner")
    steps.push("Track your progress over the next 2-4 weeks")
  }

  return steps
}

/**
 * Estimates time to relief based on classification and recommendations
 */
function estimateTimeToRelief(classification: ClassificationResult): string {
  if (classification.urgency === "crisis") {
    return "Immediate professional intervention needed"
  }

  if (classification.type === "short-term") {
    if (classification.urgency === "low") {
      return "15-30 minutes with breathing exercises"
    } else {
      return "1-3 hours with combined practices"
    }
  } else {
    if (classification.urgency === "high") {
      return "1-2 weeks with consistent practice + professional help"
    } else {
      return "2-4 weeks with regular practice"
    }
  }
}

/**
 * Determines if follow-up is recommended
 */
function shouldRecommendFollowUp(classification: ClassificationResult, context?: string): boolean {
  // Always recommend follow-up for crisis or high urgency
  if (classification.urgency === "crisis" || classification.urgency === "high") {
    return true
  }

  // Recommend follow-up for long-term issues
  if (classification.type === "long-term") {
    return true
  }

  // Recommend follow-up if confidence is low
  if (classification.confidence < 70) {
    return true
  }

  return false
}

/**
 * Validates user input for safety and appropriateness
 */
export function validateUserInput(text: string): { isValid: boolean; reason?: string } {
  if (!text || text.trim().length < 10) {
    return { isValid: false, reason: "Please provide more details about how you're feeling" }
  }

  if (text.length > 2000) {
    return { isValid: false, reason: "Please keep your message under 2000 characters" }
  }

  // Check for inappropriate content (basic filter)
  const inappropriatePatterns = [/\b(spam|advertisement|buy now|click here)\b/i, /\b(viagra|casino|lottery|winner)\b/i]

  for (const pattern of inappropriatePatterns) {
    if (pattern.test(text)) {
      return { isValid: false, reason: "Please focus on your mental health concerns" }
    }
  }

  return { isValid: true }
}

/**
 * Formats recommendations for display with cultural context
 */
export function formatRecommendationsWithCulture(recommendations: any[], userProfile?: UserProfile): any[] {
  return recommendations.map((rec) => ({
    ...rec,
    culturalContext: getCulturalContext(rec.category, userProfile),
    adaptedInstructions: adaptInstructionsForUser(rec.instructions, userProfile),
  }))
}

/**
 * Provides cultural context for recommendations
 */
function getCulturalContext(category: string, userProfile?: UserProfile): string {
  const contexts = {
    pranayama: "प्राणायाम - Ancient breathing practices from yoga tradition for mental balance",
    yoga: "योग - Physical postures that unite body and mind for holistic wellness",
    ayurveda: "आयुर्वेद - Traditional Indian medicine focusing on natural healing",
    meditation: "ध्यान - Contemplative practices for inner peace and mental clarity",
    lifestyle: "जीवनशैली - Daily routines aligned with natural rhythms",
  }

  return contexts[category as keyof typeof contexts] || "Traditional wellness practice"
}

/**
 * Adapts instructions based on user profile
 */
function adaptInstructionsForUser(instructions: string[], userProfile?: UserProfile): string[] {
  if (!userProfile) return instructions

  // Adapt for age
  if (userProfile.age > 60) {
    return instructions.map((instruction) =>
      instruction.replace("Hold for", "Hold gently for").replace("Deep breath", "Comfortable breath"),
    )
  }

  // Adapt for beginners
  if (userProfile.experience === "beginner") {
    return instructions.map((instruction) => instruction + " (Take your time, no rush)")
  }

  return instructions
}
