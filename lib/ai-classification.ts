// AI/ML Classification Engine for Mental Health Wellness Analyser
// Integrates natural language processing with Indian Knowledge Systems

export interface SymptomAnalysis {
  symptoms: string[]
  severity: "mild" | "moderate" | "severe" | "crisis"
  emotionalState: string[]
  triggers: string[]
  physicalSymptoms: string[]
  confidence: number
}

export interface IKSRecommendation {
  id: string
  title: string
  category: "pranayama" | "yoga" | "ayurveda" | "meditation" | "lifestyle"
  description: string
  instructions: string[]
  benefits: string[]
  duration: string
  difficulty: "beginner" | "intermediate" | "advanced"
  contraindications?: string[]
}

export interface ClassificationResult {
  type: "short-term" | "long-term"
  urgency: "low" | "medium" | "high" | "crisis"
  primaryConcerns: string[]
  recommendations: IKSRecommendation[]
  professionalHelpNeeded: boolean
  confidence: number
}

// Enhanced classification result with detailed structure
export interface EnhancedClassificationResult extends ClassificationResult {
  state: "stress" | "anxiety" | "depression" | "normal"
  severity: "low" | "medium" | "high"
  causes: string[]
  symptoms: string[]
  short_term_solutions: IKSRecommendation[]
  long_term_recommendations: IKSRecommendation[]
  iks_mapping: {
    dosha: "Vata" | "Pitta" | "Kapha"
    explanation: string
  }
}

// Keyword scoring system for detailed analysis
interface KeywordScore {
  category: string
  score: number
  matches: string[]
}

// Dosha mapping rules
const DOSHA_MAPPING: Record<string, "Vata" | "Pitta" | "Kapha"> = {
  anxiety: "Vata",
  stress: "Pitta",
  depression: "Kapha",
  sleep: "Vata",
  physical: "Pitta",
  cognitive: "Vata",
  social: "Kapha",
}

// Comprehensive symptom keyword mapping
const SYMPTOM_KEYWORDS = {
  anxiety: [
    "anxious",
    "worried",
    "nervous",
    "panic",
    "fear",
    "scared",
    "restless",
    "jittery",
    "on edge",
    "tense",
    "apprehensive",
    "uneasy",
    "dread",
  ],
  depression: [
    "sad",
    "depressed",
    "down",
    "hopeless",
    "empty",
    "worthless",
    "guilty",
    "numb",
    "lonely",
    "isolated",
    "meaningless",
    "dark",
    "heavy",
  ],
  stress: [
    "stressed",
    "overwhelmed",
    "pressure",
    "burden",
    "exhausted",
    "burned out",
    "overloaded",
    "stretched",
    "strained",
    "frazzled",
    "swamped",
  ],
  sleep: [
    "insomnia",
    "sleepless",
    "tired",
    "fatigue",
    "restless sleep",
    "nightmares",
    "wake up",
    "can't sleep",
    "sleep problems",
    "drowsy",
    "exhausted",
  ],
  physical: [
    "headache",
    "tension",
    "pain",
    "ache",
    "tight",
    "sore",
    "stomach",
    "nausea",
    "dizzy",
    "breathless",
    "heart racing",
    "sweating",
  ],
  cognitive: [
    "focus",
    "concentrate",
    "memory",
    "confused",
    "foggy",
    "distracted",
    "forgetful",
    "unclear",
    "scattered",
    "racing thoughts",
  ],
  social: [
    "isolated",
    "alone",
    "withdrawn",
    "avoid people",
    "social anxiety",
    "relationships",
    "family problems",
    "conflict",
    "misunderstood",
  ],
}

// Crisis indicators that require immediate attention
const CRISIS_KEYWORDS = [
  "suicide",
  "kill myself",
  "end it all",
  "no point living",
  "better off dead",
  "self harm",
  "hurt myself",
  "can't go on",
  "want to die",
  "hopeless",
]

// Severity indicators
const SEVERITY_INDICATORS = {
  mild: ["sometimes", "occasionally", "manageable", "slight", "minor"],
  moderate: ["often", "regularly", "affecting", "difficult", "struggling"],
  severe: ["always", "constantly", "unbearable", "can't function", "overwhelming"],
  crisis: ["can't cope", "desperate", "emergency", "immediate help", "crisis"],
}

// Duration indicators for classification
const DURATION_INDICATORS = {
  shortTerm: ["today", "yesterday", "this week", "recently", "sudden", "new"],
  longTerm: ["months", "years", "always", "chronic", "ongoing", "persistent"],
}

// IKS Recommendations Database
const IKS_RECOMMENDATIONS: IKSRecommendation[] = [
  {
    id: "nadi-shodhana",
    title: "Nadi Shodhana (Alternate Nostril Breathing)",
    category: "pranayama",
    description: "Balancing pranayama technique that harmonizes the nervous system",
    instructions: [
      "Sit comfortably with spine straight",
      "Use right thumb to close right nostril",
      "Inhale through left nostril for 4 counts",
      "Close left nostril with ring finger, release thumb",
      "Exhale through right nostril for 4 counts",
      "Inhale through right nostril",
      "Close right nostril, release left",
      "Exhale through left nostril",
      "This completes one round - repeat 5-10 times",
    ],
    benefits: ["Balances nervous system", "Reduces anxiety", "Improves focus", "Calms mind"],
    duration: "10-15 minutes",
    difficulty: "beginner",
  },
  {
    id: "bhramari",
    title: "Bhramari Pranayama (Humming Bee Breath)",
    category: "pranayama",
    description: "Calming breathing technique that soothes the nervous system",
    instructions: [
      "Sit comfortably with eyes closed",
      "Place thumbs in ears, index fingers above eyebrows",
      "Place remaining fingers over closed eyes",
      "Take deep breath in",
      "Exhale making humming sound like a bee",
      "Feel vibrations in head and chest",
      "Repeat 5-10 times",
    ],
    benefits: ["Reduces stress", "Calms anxiety", "Improves concentration", "Relieves tension"],
    duration: "5-10 minutes",
    difficulty: "beginner",
  },
  {
    id: "child-pose",
    title: "Balasana (Child's Pose)",
    category: "yoga",
    description: "Restorative pose that calms the mind and relieves stress",
    instructions: [
      "Kneel on floor with big toes touching",
      "Sit back on heels",
      "Separate knees hip-width apart",
      "Fold forward, extending arms in front",
      "Rest forehead on ground",
      "Breathe deeply and hold for 1-5 minutes",
    ],
    benefits: ["Calms nervous system", "Relieves back tension", "Promotes introspection"],
    duration: "3-5 minutes",
    difficulty: "beginner",
  },
  {
    id: "legs-up-wall",
    title: "Viparita Karani (Legs Up the Wall)",
    category: "yoga",
    description: "Gentle inversion that promotes relaxation and reduces anxiety",
    instructions: [
      "Lie on back near a wall",
      "Extend legs up the wall",
      "Arms relaxed by sides",
      "Close eyes and breathe naturally",
      "Hold for 5-15 minutes",
      "Focus on breath and body sensations",
    ],
    benefits: ["Reduces anxiety", "Improves circulation", "Calms nervous system", "Relieves fatigue"],
    duration: "10-15 minutes",
    difficulty: "beginner",
  },
  {
    id: "ashwagandha",
    title: "Ashwagandha Supplementation",
    category: "ayurveda",
    description: "Adaptogenic herb that helps manage stress and anxiety",
    instructions: [
      "Consult with qualified Ayurvedic practitioner",
      "Typical dose: 300-600mg daily",
      "Best taken with warm milk or water",
      "Take consistently for 4-6 weeks",
      "Monitor effects and adjust as needed",
    ],
    benefits: ["Reduces cortisol levels", "Manages stress", "Improves sleep", "Boosts energy"],
    duration: "Daily supplementation",
    difficulty: "beginner",
    contraindications: ["Pregnancy", "Autoimmune conditions", "Thyroid disorders"],
  },
  {
    id: "brahmi",
    title: "Brahmi (Bacopa Monnieri)",
    category: "ayurveda",
    description: "Cognitive enhancing herb that supports mental clarity and reduces anxiety",
    instructions: [
      "Consult Ayurvedic practitioner for proper dosage",
      "Typically 300-600mg daily",
      "Take with meals to avoid stomach upset",
      "Use consistently for 8-12 weeks for best results",
      "Can be taken as powder, capsule, or tea",
    ],
    benefits: ["Improves memory", "Reduces anxiety", "Enhances cognitive function", "Supports nervous system"],
    duration: "Daily supplementation",
    difficulty: "beginner",
    contraindications: ["Pregnancy", "Breastfeeding", "Slow heart rate"],
  },
  {
    id: "yoga-nidra",
    title: "Yoga Nidra (Yogic Sleep)",
    category: "meditation",
    description: "Deep relaxation practice that promotes healing and reduces stress",
    instructions: [
      "Lie down comfortably on back",
      "Close eyes and relax entire body",
      "Follow guided instructions for body awareness",
      "Set positive intention (sankalpa)",
      "Systematically relax each body part",
      "Remain aware but deeply relaxed",
      "End with gentle movement and opening eyes",
    ],
    benefits: ["Deep relaxation", "Reduces PTSD symptoms", "Improves sleep", "Releases trauma"],
    duration: "20-45 minutes",
    difficulty: "beginner",
  },
  {
    id: "trataka",
    title: "Trataka (Candle Gazing Meditation)",
    category: "meditation",
    description: "Concentration practice that calms the mind and improves focus",
    instructions: [
      "Sit comfortably 3-4 feet from lit candle",
      "Gaze steadily at candle flame",
      "Blink naturally, don't strain eyes",
      "When eyes water, close them",
      "Visualize flame in mind's eye",
      "Open eyes and repeat",
      "Practice for 10-20 minutes",
    ],
    benefits: ["Improves concentration", "Calms mind", "Reduces mental chatter", "Enhances willpower"],
    duration: "10-20 minutes",
    difficulty: "intermediate",
  },
  {
    id: "dinacharya",
    title: "Dinacharya (Daily Routine)",
    category: "lifestyle",
    description: "Ayurvedic daily routine that promotes balance and well-being",
    instructions: [
      "Wake up before sunrise (5-6 AM)",
      "Drink warm water upon waking",
      "Practice meditation or pranayama",
      "Exercise or yoga practice",
      "Eat largest meal at midday",
      "Wind down activities after sunset",
      "Sleep by 10 PM for optimal rest",
    ],
    benefits: ["Balances doshas", "Improves digestion", "Enhances energy", "Promotes mental clarity"],
    duration: "Daily practice",
    difficulty: "intermediate",
  },
]

// Enhanced keyword scoring categories
const ENHANCED_KEYWORDS = {
  anxiety: ["overthinking", "restless", "worried", "panic", "nervous", "anxious", "dread", "fear"],
  stress: ["pressure", "workload", "overwhelmed", "burned out", "stressed", "overloaded", "burden"],
  depression: ["low energy", "tired", "no energy", "sad", "hopeless", "empty", "worthless", "dark"],
}

export class AIClassificationEngine {
  /**
   * Keyword-based scoring system for detailed analysis
   */
  private scoreKeywords(text: string): KeywordScore[] {
    const lowerText = text.toLowerCase()
    const scores: KeywordScore[] = []

    Object.entries(ENHANCED_KEYWORDS).forEach(([category, keywords]) => {
      const matches = keywords.filter((keyword) => lowerText.includes(keyword))
      if (matches.length > 0) {
        scores.push({
          category,
          score: matches.length,
          matches,
        })
      }
    })

    return scores.sort((a, b) => b.score - a.score)
  }

  /**
   * Determines primary mental state based on keyword scoring
   */
  private determineMentalState(keywordScores: KeywordScore[]): "stress" | "anxiety" | "depression" | "normal" {
    if (keywordScores.length === 0) return "normal"
    return (keywordScores[0].category as "stress" | "anxiety" | "depression") || "normal"
  }

  /**
   * Maps mental state to Ayurvedic dosha
   */
  private mapToDosha(state: string): { dosha: "Vata" | "Pitta" | "Kapha"; explanation: string } {
    const doshaMap: Record<string, { dosha: "Vata" | "Pitta" | "Kapha"; explanation: string }> = {
      anxiety: {
        dosha: "Vata",
        explanation:
          "Anxiety is associated with excess Vata (air element). Balancing practices include grounding activities, warm oil massage, and calming breathing techniques.",
      },
      stress: {
        dosha: "Pitta",
        explanation:
          "Stress is linked to elevated Pitta (fire element). Cooling practices like meditation, soothing herbs, and rest help restore balance.",
      },
      depression: {
        dosha: "Kapha",
        explanation:
          "Depression relates to increased Kapha (earth & water elements). Warming, stimulating practices and gentle exercise help lift energy.",
      },
      normal: {
        dosha: "Vata",
        explanation: "Maintaining balanced mental state through daily wellness practices.",
      },
    }

    return doshaMap[state] || doshaMap.normal
  }

  /**
   * Extracts potential causes from user input
   */
  private extractCauses(text: string): string[] {
    const causes: string[] = []
    const commonCauses = [
      "work",
      "family",
      "relationship",
      "money",
      "health",
      "school",
      "change",
      "loss",
      "uncertainty",
      "conflict",
    ]

    commonCauses.forEach((cause) => {
      if (text.toLowerCase().includes(cause)) {
        causes.push(cause)
      }
    })

    return causes.length > 0 ? causes : ["unspecified"]
  }

  /**
   * Analyzes user input text to extract symptoms and emotional indicators
   */
  analyzeSymptoms(text: string): SymptomAnalysis {
    const lowerText = text.toLowerCase()
    const words = lowerText.split(/\s+/)

    const symptoms: string[] = []
    const emotionalState: string[] = []
    const triggers: string[] = []
    const physicalSymptoms: string[] = []

    // Check for crisis indicators first
    const hasCrisisKeywords = CRISIS_KEYWORDS.some((keyword) => lowerText.includes(keyword.toLowerCase()))

    // Analyze symptoms by category
    Object.entries(SYMPTOM_KEYWORDS).forEach(([category, keywords]) => {
      const matches = keywords.filter((keyword) => lowerText.includes(keyword.toLowerCase()))

      if (matches.length > 0) {
        symptoms.push(category)

        // Categorize further
        if (["anxiety", "depression", "stress"].includes(category)) {
          emotionalState.push(category)
        }
        if (category === "physical") {
          physicalSymptoms.push(...matches)
        }
      }
    })

    // Determine severity
    let severity: "mild" | "moderate" | "severe" | "crisis" = "mild"

    if (hasCrisisKeywords) {
      severity = "crisis"
    } else {
      // Check severity indicators
      Object.entries(SEVERITY_INDICATORS).forEach(([level, indicators]) => {
        if (indicators.some((indicator) => lowerText.includes(indicator))) {
          severity = level as any
        }
      })
    }

    // Extract potential triggers
    const commonTriggers = ["work", "family", "relationship", "money", "health", "school"]
    triggers.push(...commonTriggers.filter((trigger) => lowerText.includes(trigger)))

    // Calculate confidence based on keyword matches
    const totalKeywords = Object.values(SYMPTOM_KEYWORDS).flat().length
    const matchedKeywords = symptoms.length
    const confidence = Math.min((matchedKeywords / totalKeywords) * 100, 95)

    return {
      symptoms,
      severity,
      emotionalState,
      triggers,
      physicalSymptoms,
      confidence,
    }
  }

  /**
   * Classifies whether issue is short-term or long-term based on input
   */
  classifyIssueType(text: string, duration?: string): "short-term" | "long-term" {
    const lowerText = text.toLowerCase()

    // Check duration indicators in text
    const hasShortTermIndicators = DURATION_INDICATORS.shortTerm.some((indicator) => lowerText.includes(indicator))

    const hasLongTermIndicators = DURATION_INDICATORS.longTerm.some((indicator) => lowerText.includes(indicator))

    // Use explicit duration if provided
    if (duration) {
      if (duration.includes("recent") || duration.includes("weeks")) {
        return "short-term"
      }
      if (duration.includes("months") || duration.includes("years")) {
        return "long-term"
      }
    }

    // Default classification based on text analysis
    if (hasLongTermIndicators && !hasShortTermIndicators) {
      return "long-term"
    }

    return hasShortTermIndicators ? "short-term" : "short-term" // Default to short-term
  }

  /**
   * Determines urgency level based on symptoms and severity
   */
  assessUrgency(analysis: SymptomAnalysis): "low" | "medium" | "high" | "crisis" {
    if (analysis.severity === "crisis") {
      return "crisis"
    }

    if (analysis.severity === "severe") {
      return "high"
    }

    if (
      analysis.severity === "moderate" &&
      (analysis.symptoms.includes("anxiety") || analysis.symptoms.includes("depression"))
    ) {
      return "medium"
    }

    return "low"
  }

  /**
   * Recommends IKS practices based on symptoms and user profile
   */
  recommendIKSPractices(
    symptoms: string[],
    severity: string,
    userProfile?: { age?: number; experience?: string },
  ): IKSRecommendation[] {
    const recommendations: IKSRecommendation[] = []

    // Breathing practices for anxiety and stress
    if (symptoms.includes("anxiety") || symptoms.includes("stress")) {
      recommendations.push(
        IKS_RECOMMENDATIONS.find((r) => r.id === "nadi-shodhana")!,
        IKS_RECOMMENDATIONS.find((r) => r.id === "bhramari")!,
      )
    }

    // Yoga poses for physical tension and general wellness
    if (symptoms.includes("physical") || symptoms.includes("stress")) {
      recommendations.push(
        IKS_RECOMMENDATIONS.find((r) => r.id === "child-pose")!,
        IKS_RECOMMENDATIONS.find((r) => r.id === "legs-up-wall")!,
      )
    }

    // Meditation for depression and cognitive issues
    if (symptoms.includes("depression") || symptoms.includes("cognitive")) {
      recommendations.push(
        IKS_RECOMMENDATIONS.find((r) => r.id === "yoga-nidra")!,
        IKS_RECOMMENDATIONS.find((r) => r.id === "trataka")!,
      )
    }

    // Sleep-related practices
    if (symptoms.includes("sleep")) {
      recommendations.push(
        IKS_RECOMMENDATIONS.find((r) => r.id === "yoga-nidra")!,
        IKS_RECOMMENDATIONS.find((r) => r.id === "legs-up-wall")!,
      )
    }

    // Ayurvedic herbs for moderate to severe cases
    if (severity === "moderate" || severity === "severe") {
      if (symptoms.includes("anxiety") || symptoms.includes("stress")) {
        recommendations.push(IKS_RECOMMENDATIONS.find((r) => r.id === "ashwagandha")!)
      }
      if (symptoms.includes("cognitive") || symptoms.includes("depression")) {
        recommendations.push(IKS_RECOMMENDATIONS.find((r) => r.id === "brahmi")!)
      }
    }

    // Lifestyle recommendations for chronic issues
    if (severity === "moderate" || severity === "severe") {
      recommendations.push(IKS_RECOMMENDATIONS.find((r) => r.id === "dinacharya")!)
    }

    // Filter by user experience level
    if (userProfile?.experience === "beginner") {
      return recommendations.filter((r) => r.difficulty === "beginner").slice(0, 4)
    }

    // Remove duplicates and limit to 5 recommendations
    const uniqueRecommendations = recommendations.filter(
      (rec, index, self) => index === self.findIndex((r) => r.id === rec.id),
    )

    return uniqueRecommendations.slice(0, 5)
  }

  /**
   * Main classification method that combines all analysis
   */
  classifyAndRecommend(
    text: string,
    duration?: string,
    userProfile?: { age?: number; experience?: string },
  ): ClassificationResult {
    // Analyze symptoms
    const analysis = this.analyzeSymptoms(text)

    // Classify issue type
    const type = this.classifyIssueType(text, duration)

    // Assess urgency
    const urgency = this.assessUrgency(analysis)

    // Get IKS recommendations
    const recommendations = this.recommendIKSPractices(analysis.symptoms, analysis.severity, userProfile)

    // Determine if professional help is needed
    const professionalHelpNeeded =
      urgency === "crisis" || urgency === "high" || (urgency === "medium" && type === "long-term")

    return {
      type,
      urgency,
      primaryConcerns: analysis.symptoms,
      recommendations,
      professionalHelpNeeded,
      confidence: analysis.confidence,
    }
  }

  /**
   * Enhanced classification with detailed structured output
   */
  classifyEnhanced(
    text: string,
    duration?: string,
    userProfile?: { age?: number; experience?: string },
  ): EnhancedClassificationResult {
    // Get base classification
    const baseResult = this.classifyAndRecommend(text, duration, userProfile)

    // Perform keyword-based scoring
    const keywordScores = this.scoreKeywords(text)

    // Determine mental state
    const mentalState = this.determineMentalState(keywordScores)

    // Map to dosha
    const iksMapping = this.mapToDosha(mentalState)

    // Extract causes
    const causes = this.extractCauses(text)

    // Split recommendations into short-term and long-term
    const shortTermSolutions = this.recommendIKSPractices(
      ["anxiety", "stress"],
      baseResult.severity === "crisis" ? "severe" : baseResult.severity,
      userProfile,
    ).slice(0, 3)

    const longTermRecommendations = this.recommendIKSPractices(
      baseResult.primaryConcerns,
      baseResult.severity === "crisis" ? "severe" : baseResult.severity,
      userProfile,
    )

    return {
      ...baseResult,
      state: mentalState,
      severity: baseResult.severity === "crisis" ? "high" : (baseResult.severity as "low" | "medium" | "high"),
      causes,
      symptoms: baseResult.primaryConcerns,
      short_term_solutions: shortTermSolutions,
      long_term_recommendations: longTermRecommendations,
      iks_mapping: iksMapping,
    }
  }

  /**
   * Provides culturally appropriate messaging based on classification
   */
  generateCulturallyAwareMessage(result: ClassificationResult): string {
    if (result.urgency === "crisis") {
      return "आपकी स्थिति को देखते हुए, तुरंत सहायता लेना आवश्यक है। कृपया हेल्पलाइन पर संपर्क करें। / Given your situation, immediate support is essential. Please contact the helpline."
    }

    if (result.type === "long-term") {
      return "दीर्घकालिक कल्याण के लिए पारंपरिक और आधुनिक दोनों दृष्टिकोणों का संयोजन सबसे प्रभावी है। / For long-term wellness, combining traditional and modern approaches is most effective."
    }

    return "तत्काल राहत के लिए ये प्राचीन भारतीय प्रथाएं सहायक हो सकती हैं। / These ancient Indian practices can be helpful for immediate relief."
  }
}

// Export singleton instance
export const aiClassifier = new AIClassificationEngine()
