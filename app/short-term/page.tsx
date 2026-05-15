"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Heart,
  MessageCircle,
  Wind,
  Flower2,
  Coffee,
  Moon,
  ArrowLeft,
  Play,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Leaf,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { analyzeUserInput, validateUserInput, type AnalysisResponse } from "@/lib/mental-health-api"
import { getTrendInsights, type TrendInsight } from "@/lib/getTrendInsights"
import { getMoodHistory } from "@/lib/mood-history"

interface Remedy {
  id: string
  title: string
  category: "breathing" | "meditation" | "yoga" | "herbal" | "mindfulness"
  duration: string
  description: string
  instructions: string[]
  benefits: string[]
  icon: React.ReactNode
}

const remedies: Remedy[] = [
  {
    id: "box-breathing",
    title: "Box Breathing (Sama Vritti)",
    category: "breathing",
    duration: "5-10 minutes",
    description: "A calming pranayama technique that balances the nervous system",
    instructions: [
      "Sit comfortably with your spine straight",
      "Inhale slowly for 4 counts",
      "Hold your breath for 4 counts",
      "Exhale slowly for 4 counts",
      "Hold empty for 4 counts",
      "Repeat for 5-10 cycles",
    ],
    benefits: ["Reduces anxiety", "Improves focus", "Calms mind"],
    icon: <Wind className="w-5 h-5" />,
  },
  {
    id: "body-scan",
    title: "Progressive Body Scan",
    category: "meditation",
    duration: "10-15 minutes",
    description: "Mindful awareness practice to release tension and stress",
    instructions: [
      "Lie down or sit comfortably",
      "Close your eyes and take 3 deep breaths",
      "Start from your toes, notice any sensations",
      "Slowly move attention up through each body part",
      "Breathe into areas of tension",
      "End at the crown of your head",
    ],
    benefits: ["Releases physical tension", "Promotes relaxation", "Increases body awareness"],
    icon: <Heart className="w-5 h-5" />,
  },
  {
    id: "child-pose",
    title: "Balasana (Child's Pose)",
    category: "yoga",
    duration: "3-5 minutes",
    description: "A gentle resting pose that calms the mind and relieves stress",
    instructions: [
      "Kneel on the floor with big toes touching",
      "Sit back on your heels",
      "Separate knees about hip-width apart",
      "Fold forward, extending arms in front",
      "Rest forehead on the ground",
      "Breathe deeply and hold",
    ],
    benefits: ["Calms nervous system", "Relieves back tension", "Promotes introspection"],
    icon: <Flower2 className="w-5 h-5" />,
  },
  {
    id: "chamomile-tea",
    title: "Chamomile Tea Ritual",
    category: "herbal",
    duration: "15-20 minutes",
    description: "A soothing herbal remedy with mindful preparation",
    instructions: [
      "Boil water mindfully, focusing on the sound",
      "Add 1-2 tsp dried chamomile or 1 tea bag",
      "Steep for 5-7 minutes",
      "Hold the warm cup in both hands",
      "Inhale the gentle aroma deeply",
      "Sip slowly with full attention",
    ],
    benefits: ["Natural relaxation", "Digestive comfort", "Mindful ritual"],
    icon: <Coffee className="w-5 h-5" />,
  },
  {
    id: "grounding-54321",
    title: "5-4-3-2-1 Grounding",
    category: "mindfulness",
    duration: "5-10 minutes",
    description: "A sensory awareness technique to anchor you in the present moment",
    instructions: [
      "Notice 5 things you can see around you",
      "Notice 4 things you can touch or feel",
      "Notice 3 things you can hear",
      "Notice 2 things you can smell",
      "Notice 1 thing you can taste",
      "Take 3 deep breaths to complete",
    ],
    benefits: ["Reduces overwhelm", "Increases present-moment awareness", "Calms racing thoughts"],
    icon: <Moon className="w-5 h-5" />,
  },
]

export default function ShortTermPage() {
  const router = useRouter()
  const [userInput, setUserInput] = useState("")
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResponse | null>(null)
  const [completedRemedies, setCompletedRemedies] = useState<string[]>([])
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [validationError, setValidationError] = useState<string>("")
  const [trendInsight, setTrendInsight] = useState<TrendInsight | null>(null)
  const [recurringPattern, setRecurringPattern] = useState(false)

  // Load trend insights on component mount
  useEffect(() => {
    const insight = getTrendInsights()
    setTrendInsight(insight)

    // Check for recurring patterns (same state 3+ times in last 7 entries)
    const history = getMoodHistory()
    const last7 = history.slice(-7)
    const stateFrequency: Record<string, number> = {}
    last7.forEach((entry) => {
      stateFrequency[entry.state] = (stateFrequency[entry.state] || 0) + 1
    })
    const hasRecurring = Object.values(stateFrequency).some((count) => count >= 3)
    setRecurringPattern(hasRecurring)
  }, [])

  const analyzeInput = async () => {
    if (!userInput.trim()) return

    const validation = validateUserInput(userInput)
    if (!validation.isValid) {
      setValidationError(validation.reason || "Please provide valid input")
      return
    }

    setValidationError("")
    setIsAnalyzing(true)

    try {
      const analysis = await analyzeUserInput({
        text: userInput,
        context: "initial",
        userProfile: {
          name: "User", // Could be retrieved from session
          age: 25, // Could be from onboarding form
          gender: "not-specified",
          experience: "beginner",
        },
      })

      setAiAnalysis(analysis)
      setShowRecommendations(true)
    } catch (error) {
      console.error("Analysis failed:", error)
      setValidationError("Sorry, we couldn't analyze your input right now. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRecommendedRemedies = (): Remedy[] => {
    if (!aiAnalysis) return []

    const aiRecommendations = aiAnalysis.classification.recommendations
    const mappedRemedies: Remedy[] = []

    // Map AI recommendations to existing remedies
    aiRecommendations.forEach((aiRec) => {
      if (aiRec.category === "pranayama") {
        mappedRemedies.push(remedies.find((r) => r.id === "box-breathing")!)
      } else if (aiRec.category === "yoga") {
        mappedRemedies.push(remedies.find((r) => r.id === "child-pose")!)
      } else if (aiRec.category === "meditation") {
        mappedRemedies.push(remedies.find((r) => r.id === "body-scan")!)
      }
    })

    // Add grounding technique for anxiety
    if (aiAnalysis.classification.primaryConcerns.includes("anxiety")) {
      mappedRemedies.push(remedies.find((r) => r.id === "grounding-54321")!)
    }

    // Ensure we have at least 3 recommendations
    if (mappedRemedies.length < 3) {
      const remaining = remedies.filter((r) => !mappedRemedies.includes(r))
      mappedRemedies.push(...remaining.slice(0, 3 - mappedRemedies.length))
    }

    return mappedRemedies.slice(0, 4)
  }

  const markRemedyComplete = (remedyId: string) => {
    setCompletedRemedies([...completedRemedies, remedyId])
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breathing":
        return "bg-blue-100 text-blue-800"
      case "meditation":
        return "bg-purple-100 text-purple-800"
      case "yoga":
        return "bg-green-100 text-green-800"
      case "herbal":
        return "bg-amber-100 text-amber-800"
      case "mindfulness":
        return "bg-emerald-100 text-emerald-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!showRecommendations) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-slate-800">Tell us what's on your mind</CardTitle>
            <p className="text-slate-600 mt-2">
              Share how you're feeling right now. Our AI will suggest personalized wellness practices to help you feel
              better.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <Textarea
                placeholder="I'm feeling stressed about work and can't seem to relax... or describe whatever is on your mind"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="min-h-32 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
              />
              <p className="text-sm text-slate-500 mt-2">
                Take your time. There's no right or wrong way to express yourself.
              </p>
              {validationError && <p className="text-sm text-red-600 mt-2">{validationError}</p>}
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                onClick={() => router.push("/classify")}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>

              <Button
                onClick={analyzeInput}
                disabled={!userInput.trim() || isAnalyzing}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 min-w-32"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    <span>Get Support</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const recommendedRemedies = getRecommendedRemedies()

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Your Personalized Wellness Plan</h1>
          <p className="text-slate-600">
            Based on what you shared, here are some practices that can help you feel better
          </p>
          {aiAnalysis && <p className="text-emerald-700 mt-2 font-medium">{aiAnalysis.culturalMessage}</p>}
        </div>

        {aiAnalysis && (
          <Card className="mb-8 border-0 shadow-lg bg-white/90">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-800 mb-3">AI Analysis Summary:</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-slate-500">Primary Concerns:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {aiAnalysis.classification.primaryConcerns.map((concern, index) => (
                      <Badge key={index} variant="secondary" className="bg-emerald-100 text-emerald-800">
                        {concern}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Urgency Level:</span>
                  <Badge
                    className={`ml-2 ${
                      aiAnalysis.classification.urgency === "crisis"
                        ? "bg-red-100 text-red-800"
                        : aiAnalysis.classification.urgency === "high"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {aiAnalysis.classification.urgency}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-slate-600">
                <strong>Estimated time to relief:</strong> {aiAnalysis.estimatedTimeToRelief}
              </div>
            </CardContent>
          </Card>
        )}

        {/* IKS Insight Section */}
        {aiAnalysis && (aiAnalysis.classification as any).iks_mapping && (
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Leaf className="w-5 h-5 text-amber-600" />
                <CardTitle className="text-lg text-amber-900">IKS Insight</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-amber-800">Ayurvedic Dosha:</span>
                <Badge className="ml-2 bg-amber-200 text-amber-900">{(aiAnalysis.classification as any).iks_mapping?.dosha}</Badge>
              </div>
              <p className="text-sm text-amber-800">{(aiAnalysis.classification as any).iks_mapping?.explanation}</p>
            </CardContent>
          </Card>
        )}

        {/* Your Pattern Section */}
        {trendInsight && (
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg text-blue-900">Your Pattern</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800">{trendInsight.message}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="bg-white/60 p-2 rounded">
                  <span className="text-xs text-blue-600 font-medium">Most Frequent State:</span>
                  <Badge className="ml-1 bg-blue-100 text-blue-900">{trendInsight.dominantState}</Badge>
                </div>
                <div className="bg-white/60 p-2 rounded">
                  <span className="text-xs text-blue-600 font-medium">Associated Dosha:</span>
                  <Badge className="ml-1 bg-blue-100 text-blue-900">{trendInsight.dominantDosha}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alert Section */}
        {recurringPattern && (
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-amber-50 to-red-50 border-l-4 border-orange-500">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <CardTitle className="text-lg text-orange-900">Pattern Alert</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-800">
                Recurring pattern detected. The same emotional state has appeared multiple times in your recent history. 
                Consider lifestyle adjustments or exploring our long-term support options for deeper wellness support.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Dosha-Specific Recommendations */}
        {aiAnalysis?.iks_recommendations && (
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Leaf className="w-5 h-5 text-purple-600" />
                <CardTitle className="text-lg text-purple-900">
                  {aiAnalysis.iks_recommendations.dosha} Balancing Practices
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {aiAnalysis.iks_recommendations.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <span className="text-purple-600 font-bold mt-0.5">•</span>
                    <span className="text-sm text-purple-800">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <div className="grid gap-6">
          {recommendedRemedies.map((remedy, index) => (
            <Card key={remedy.id} className="border-0 shadow-lg bg-white/90 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white">
                      {remedy.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-slate-800">{remedy.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getCategoryColor(remedy.category)}>{remedy.category}</Badge>
                        <span className="text-sm text-slate-500">{remedy.duration}</span>
                      </div>
                    </div>
                  </div>
                  {completedRemedies.includes(remedy.id) && <CheckCircle className="w-6 h-6 text-green-600" />}
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-slate-600 mb-4">{remedy.description}</p>

                <Tabs defaultValue="instructions" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="instructions">Instructions</TabsTrigger>
                    <TabsTrigger value="benefits">Benefits</TabsTrigger>
                  </TabsList>

                  <TabsContent value="instructions" className="mt-4">
                    <ol className="space-y-2">
                      {remedy.instructions.map((instruction, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-sm font-medium">
                            {idx + 1}
                          </span>
                          <span className="text-slate-700">{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </TabsContent>

                  <TabsContent value="benefits" className="mt-4">
                    <ul className="space-y-2">
                      {remedy.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-slate-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                  <Button 
                    onClick={() => router.push(`/practice-guide?id=${remedy.id}`)}
                    variant="outline" 
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Practice</span>
                  </Button>

                  {!completedRemedies.includes(remedy.id) ? (
                    <Button
                      onClick={() => markRemedyComplete(remedy.id)}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Mark Complete
                    </Button>
                  ) : (
                    <span className="text-sm text-green-600 font-medium">Completed ✓</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Follow-up Actions */}
        <Card className="mt-8 border-0 shadow-lg bg-white/90">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-slate-800 mb-4">How are you feeling now?</h3>
            {aiAnalysis && aiAnalysis.followUpRecommended && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Recommended Next Steps:</h4>
                <ul className="text-sm text-blue-700 text-left space-y-1">
                  {aiAnalysis.nextSteps.map((step, index) => (
                    <li key={index}>• {step}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={() => setShowRecommendations(false)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Different Practices
              </Button>
              <Button onClick={() => router.push("/long-term")} className="bg-emerald-600 hover:bg-emerald-700">
                I need ongoing support
              </Button>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              If you're still struggling after trying these practices, consider exploring our long-term support options.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
