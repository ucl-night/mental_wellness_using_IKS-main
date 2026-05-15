"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Phone,
  Users,
  BookOpen,
  Stethoscope,
  Home,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface AssessmentQuestion {
  id: string
  question: string
  type: "radio" | "textarea"
  options?: { value: string; label: string; description?: string }[]
  required: boolean
}

const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "primary_concern",
    question: "What is your primary mental health concern?",
    type: "radio",
    required: true,
    options: [
      { value: "depression", label: "Depression", description: "Persistent sadness, hopelessness, loss of interest" },
      { value: "anxiety", label: "Anxiety", description: "Excessive worry, panic, fear, restlessness" },
      { value: "stress", label: "Chronic Stress", description: "Ongoing overwhelm, burnout, pressure" },
      { value: "trauma", label: "Trauma/PTSD", description: "Past traumatic experiences affecting daily life" },
      { value: "sleep", label: "Sleep Disorders", description: "Insomnia, sleep disturbances, fatigue" },
      { value: "relationships", label: "Relationship Issues", description: "Family, romantic, or social difficulties" },
      { value: "other", label: "Other", description: "Something else not listed above" },
    ],
  },
  {
    id: "duration",
    question: "How long have you been experiencing these concerns?",
    type: "radio",
    required: true,
    options: [
      { value: "1-3months", label: "1-3 months" },
      { value: "3-6months", label: "3-6 months" },
      { value: "6-12months", label: "6 months - 1 year" },
      { value: "1-2years", label: "1-2 years" },
      { value: "2+years", label: "More than 2 years" },
    ],
  },
  {
    id: "severity",
    question: "How would you rate the impact on your daily life?",
    type: "radio",
    required: true,
    options: [
      { value: "mild", label: "Mild", description: "Some impact but manageable" },
      { value: "moderate", label: "Moderate", description: "Significant impact on daily activities" },
      { value: "severe", label: "Severe", description: "Major disruption to work, relationships, self-care" },
      { value: "crisis", label: "Crisis", description: "Unable to function, thoughts of self-harm" },
    ],
  },
  {
    id: "previous_treatment",
    question: "Have you received mental health treatment before?",
    type: "radio",
    required: true,
    options: [
      { value: "never", label: "Never" },
      { value: "counseling", label: "Counseling/Therapy" },
      { value: "medication", label: "Medication" },
      { value: "both", label: "Both counseling and medication" },
      { value: "traditional", label: "Traditional/Alternative healing" },
    ],
  },
  {
    id: "support_system",
    question: "Describe your current support system",
    type: "textarea",
    required: true,
  },
  {
    id: "cultural_preferences",
    question: "Do you have any cultural or spiritual preferences for treatment?",
    type: "textarea",
    required: false,
  },
]

interface Resource {
  id: string
  title: string
  type: "crisis" | "professional" | "ngo" | "iks" | "community"
  description: string
  contact?: string
  website?: string
  cost: "free" | "low-cost" | "varies"
  availability: string
  icon: React.ReactNode
}

const resources: Resource[] = [
  {
    id: "crisis-helpline",
    title: "National Mental Health Crisis Helpline",
    type: "crisis",
    description: "24/7 immediate crisis support and suicide prevention",
    contact: "1800-599-0019",
    cost: "free",
    availability: "24/7",
    icon: <Phone className="w-5 h-5" />,
  },
  {
    id: "vandrevala",
    title: "Vandrevala Foundation Helpline",
    type: "crisis",
    description: "Free 24/7 mental health support in multiple languages",
    contact: "1860-2662-345",
    cost: "free",
    availability: "24/7",
    icon: <Heart className="w-5 h-5" />,
  },
  {
    id: "kiran-helpline",
    title: "KIRAN Mental Health Helpline",
    type: "crisis",
    description: "Government of India's 24/7 mental health support",
    contact: "1800-599-0019",
    cost: "free",
    availability: "24/7",
    icon: <Phone className="w-5 h-5" />,
  },
  {
    id: "sneha-helpline",
    title: "SNEHA Suicide Prevention",
    type: "ngo",
    description: "Chennai-based suicide prevention and emotional support",
    contact: "044-2464-0050",
    cost: "free",
    availability: "24/7",
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: "aasra",
    title: "Aasra Suicide Prevention",
    type: "ngo",
    description: "Mumbai-based crisis intervention and suicide prevention",
    contact: "022-2754-6669",
    cost: "free",
    availability: "24/7",
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: "parivarthan",
    title: "Parivarthan Counselling",
    type: "ngo",
    description: "Bangalore-based free counselling services",
    contact: "080-2549-7777",
    cost: "free",
    availability: "Mon-Sat, 10 AM - 6 PM",
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: "nimhans",
    title: "NIMHANS Tele-counseling",
    type: "professional",
    description: "Professional psychiatric consultation and therapy",
    contact: "080-4611-0007",
    website: "nimhans.ac.in",
    cost: "low-cost",
    availability: "Mon-Sat, 9 AM - 5 PM",
    icon: <Stethoscope className="w-5 h-5" />,
  },
  {
    id: "mpower",
    title: "MPower Mental Health Services",
    type: "ngo",
    description: "Affordable counseling and therapy services",
    website: "mpowerminds.com",
    cost: "varies",
    availability: "By appointment",
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: "ayurvedic-consultation",
    title: "Ayurvedic Mental Health Consultation",
    type: "iks",
    description: "Traditional Ayurvedic approach to mental wellness",
    cost: "varies",
    availability: "By appointment",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    id: "yoga-therapy",
    title: "Certified Yoga Therapy Programs",
    type: "iks",
    description: "Structured yoga therapy for mental health conditions",
    cost: "low-cost",
    availability: "Group sessions available",
    icon: <Home className="w-5 h-5" />,
  },
]

export default function LongTermPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [assessment, setAssessment] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const handleNext = () => {
    if (currentStep < assessmentQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete assessment and show results
      const assessmentResult = analyzeAssessment(answers)
      setAssessment(assessmentResult)
      setShowResults(true)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push("/classify")
    }
  }

  const analyzeAssessment = (answers: Record<string, string>) => {
    const severity = answers.severity
    const primaryConcern = answers.primary_concern
    const duration = answers.duration
    const previousTreatment = answers.previous_treatment

    // Determine urgency level
    let urgency: "crisis" | "high" | "moderate" | "standard" = "standard"
    if (severity === "crisis") urgency = "crisis"
    else if (severity === "severe") urgency = "high"
    else if (severity === "moderate" && duration.includes("2+")) urgency = "moderate"

    // Get appropriate resources
    const recommendedResources = getRecommendedResources(urgency, primaryConcern, previousTreatment)

    // Generate IKS plan
    const iksRecommendations = getIKSRecommendations(primaryConcern, severity)

    return {
      urgency,
      primaryConcern,
      severity,
      duration,
      recommendedResources,
      iksRecommendations,
      needsImmediate: urgency === "crisis",
    }
  }

  const getRecommendedResources = (urgency: string, concern: string, treatment: string): Resource[] => {
    const recommended: Resource[] = []

    // Crisis resources always first
    if (urgency === "crisis") {
      recommended.push(...resources.filter((r) => r.type === "crisis"))
    }

    // Prioritize free NGO resources for all users
    recommended.push(...resources.filter((r) => r.type === "ngo" && r.cost === "free"))

    // Professional help for severe cases
    if (urgency === "high" || urgency === "crisis") {
      recommended.push(...resources.filter((r) => r.type === "professional"))
    }

    // Add remaining NGO resources
    recommended.push(...resources.filter((r) => r.type === "ngo" && r.cost !== "free"))

    // IKS resources for holistic approach
    if (treatment === "traditional" || treatment === "never") {
      recommended.push(...resources.filter((r) => r.type === "iks"))
    }

    // Remove duplicates and limit to 8 resources for better UX
    const uniqueResources = recommended.filter(
      (resource, index, self) => index === self.findIndex((r) => r.id === resource.id),
    )

    return uniqueResources.slice(0, 8)
  }

  const getIKSRecommendations = (concern: string, severity: string) => {
    const recommendations = []

    if (concern === "depression") {
      recommendations.push({
        practice: "Surya Namaskara (Sun Salutation)",
        description: "Daily morning practice to boost energy and mood",
        frequency: "Daily, 15-20 minutes",
      })
      recommendations.push({
        practice: "Brahmi and Ashwagandha",
        description: "Herbal supplements for mental clarity and mood balance",
        frequency: "As per Ayurvedic consultation",
      })
    }

    if (concern === "anxiety") {
      recommendations.push({
        practice: "Nadi Shodhana (Alternate Nostril Breathing)",
        description: "Balancing pranayama for nervous system regulation",
        frequency: "Twice daily, 10-15 minutes",
      })
      recommendations.push({
        practice: "Jatamansi and Shankhpushpi",
        description: "Calming herbs for anxiety and restlessness",
        frequency: "As per Ayurvedic consultation",
      })
    }

    if (concern === "sleep") {
      recommendations.push({
        practice: "Yoga Nidra",
        description: "Deep relaxation practice for better sleep",
        frequency: "Before bedtime, 20-30 minutes",
      })
      recommendations.push({
        practice: "Warm milk with nutmeg",
        description: "Traditional Ayurvedic sleep remedy",
        frequency: "30 minutes before bed",
      })
    }

    // Add general recommendations
    recommendations.push({
      practice: "Dinacharya (Daily Routine)",
      description: "Structured daily routine aligned with natural rhythms",
      frequency: "Daily practice",
    })

    return recommendations
  }

  const currentQuestion = assessmentQuestions[currentStep]
  const progress = ((currentStep + 1) / assessmentQuestions.length) * 100
  const canProceed =
    currentQuestion && ((currentQuestion.required && answers[currentQuestion.id]) || !currentQuestion.required)

  if (showResults && assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Crisis Alert */}
          {assessment.needsImmediate && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-2">Immediate Support Needed</h3>
                    <p className="text-red-700 mb-4">
                      Based on your responses, we strongly recommend reaching out for immediate professional support.
                      You don't have to go through this alone.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-800">Crisis Helpline: 1800-599-0019</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-800">Vandrevala Foundation: 1860-2662-345</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Your Comprehensive Support Plan</h1>
            <p className="text-slate-600">
              Based on your assessment, here's a personalized plan combining professional resources with traditional
              wellness practices
            </p>
          </div>

          {/* Assessment Summary */}
          <Card className="mb-8 border-0 shadow-lg bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Assessment Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-500">Primary Concern:</span>
                  <Badge className="ml-2 bg-blue-100 text-blue-800">{assessment.primaryConcern}</Badge>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Severity Level:</span>
                  <Badge
                    className={`ml-2 ${
                      assessment.severity === "crisis"
                        ? "bg-red-100 text-red-800"
                        : assessment.severity === "severe"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {assessment.severity}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Duration:</span>
                  <span className="ml-2 text-slate-700">{assessment.duration}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Priority Level:</span>
                  <Badge
                    className={`ml-2 ${
                      assessment.urgency === "crisis"
                        ? "bg-red-100 text-red-800"
                        : assessment.urgency === "high"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {assessment.urgency}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Content */}
          <Tabs defaultValue="resources" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="resources">Professional Resources</TabsTrigger>
              <TabsTrigger value="iks">Traditional Wellness</TabsTrigger>
            </TabsList>

            <TabsContent value="resources" className="mt-6">
              <div className="grid gap-6">
                {assessment.recommendedResources.map((resource: Resource) => (
                  <Card key={resource.id} className="border-0 shadow-lg bg-white/90">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              resource.type === "crisis"
                                ? "bg-red-100 text-red-600"
                                : resource.type === "professional"
                                  ? "bg-blue-100 text-blue-600"
                                  : resource.type === "ngo"
                                    ? "bg-purple-100 text-purple-600"
                                    : "bg-green-100 text-green-600"
                            }`}
                          >
                            {resource.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">{resource.title}</h3>
                            <p className="text-slate-600 mt-1">{resource.description}</p>
                          </div>
                        </div>
                        <Badge
                          className={`${
                            resource.cost === "free"
                              ? "bg-green-100 text-green-800"
                              : resource.cost === "low-cost"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {resource.cost}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        {resource.contact && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-slate-500" />
                            <span className="font-medium text-slate-700">{resource.contact}</span>
                          </div>
                        )}
                        {resource.website && (
                          <div className="flex items-center space-x-2">
                            <ExternalLink className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-700">{resource.website}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-700">{resource.availability}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="iks" className="mt-6">
              <div className="grid gap-6">
                {assessment.iksRecommendations.map((recommendation: any, index: number) => (
                  <Card key={index} className="border-0 shadow-lg bg-white/90">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 mb-2">{recommendation.practice}</h3>
                          <p className="text-slate-600 mb-3">{recommendation.description}</p>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span className="text-sm text-slate-700 font-medium">{recommendation.frequency}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card className="border-0 shadow-lg bg-amber-50">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-amber-800 mb-3">Important Note</h3>
                    <p className="text-amber-700">
                      These traditional practices are complementary to professional treatment, not replacements. Please
                      consult with qualified Ayurvedic practitioners and your healthcare provider before starting any
                      new wellness regimen.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button onClick={() => router.push("/short-term")} variant="outline">
              Try Quick Relief Practices
            </Button>
            <Button onClick={() => setShowResults(false)} variant="outline">
              Retake Assessment
            </Button>
            <Button onClick={() => router.push("/")} className="bg-emerald-600 hover:bg-emerald-700">
              Start Over
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-slate-500">
                  Question {currentStep + 1} of {assessmentQuestions.length}
                </div>
                <div className="font-semibold text-slate-800">Comprehensive Assessment</div>
              </div>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-6">{currentQuestion.question}</h3>

            {currentQuestion.type === "radio" && currentQuestion.options && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div key={option.value} className="flex items-start space-x-3">
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="mt-1 border-emerald-300 text-emerald-600"
                    />
                    <Label
                      htmlFor={option.value}
                      className="flex-1 cursor-pointer p-3 rounded-lg border border-transparent hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
                    >
                      <div className="font-medium text-slate-800">{option.label}</div>
                      {option.description && <div className="text-sm text-slate-600 mt-1">{option.description}</div>}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === "textarea" && (
              <Textarea
                placeholder="Please share as much or as little as you're comfortable with..."
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                className="min-h-32 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            )}
          </div>

          <div className="flex justify-between pt-6">
            <Button onClick={handleBack} variant="outline" className="flex items-center space-x-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <span>{currentStep === assessmentQuestions.length - 1 ? "Get My Plan" : "Next"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
