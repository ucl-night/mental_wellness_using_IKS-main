"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, ExternalLink } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

// Mirror of remedies from short-term page
const remedyMap: Record<
  string,
  {
    title: string
    duration: string
    description: string
    instructions: string[]
    category: string
    videoPlaceholder: string
  }
> = {
  "box-breathing": {
    title: "Box Breathing (Sama Vritti)",
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
    category: "breathing",
    videoPlaceholder: "https://www.youtube.com/embed/temt1Znux58",
  },
  "body-scan": {
    title: "Progressive Body Scan",
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
    category: "meditation",
    videoPlaceholder: "https://youtu.be/oMN0x4s2wL0?si=YWM0cYNmXIB35QOT",
  },
  "child-pose": {
    title: "Balasana (Child's Pose)",
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
    category: "yoga",
    videoPlaceholder: "https://youtu.be/kH12QrSGedM?si=Upnkb7j6QcUvDyhl",
  },
  "chamomile-tea": {
    title: "Chamomile Tea Ritual",
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
    category: "herbal",
    videoPlaceholder: "https://www.youtube.com/embed/YOUR_VIDEO_ID_HERE",
  },
  "grounding-54321": {
    title: "5-4-3-2-1 Grounding",
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
    category: "mindfulness",
    videoPlaceholder: "https://www.youtube.com/embed/YOUR_VIDEO_ID_HERE",
  },
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

export default function PracticeGuideContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const remedyId = searchParams.get("id")
  const [remedy, setRemedy] = useState<(typeof remedyMap)[string] | null>(null)

  useEffect(() => {
    if (remedyId && remedyMap[remedyId]) {
      setRemedy(remedyMap[remedyId])
    }
  }, [remedyId])

  if (!remedy) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
        <Card className="max-w-md w-full shadow-lg border-0 bg-white/90">
          <CardContent className="p-8 text-center">
            <p className="text-slate-600 mb-4">Exercise not found</p>
            <Button onClick={() => router.back()} className="bg-emerald-600 hover:bg-emerald-700">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-6 flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>

        {/* Title Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Badge className={getCategoryColor(remedy.category)}>{remedy.category}</Badge>
            <span className="text-slate-500 text-sm">{remedy.duration}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">{remedy.title}</h1>
          <p className="text-slate-600 text-lg">{remedy.description}</p>
        </div>

        {/* Video Section */}
        <Card className="mb-8 border-0 shadow-lg bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="w-5 h-5 text-emerald-600" />
              <span>Follow Along Video</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full bg-slate-900 rounded-lg overflow-hidden">
              <div className="aspect-video flex items-center justify-center">
                <iframe
                  width="100%"
                  height="100%"
                  src={remedy.videoPlaceholder}
                  title={remedy.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Replace the video placeholder with your preferred YouTube video URL. Update the
                video embed link in the code for this exercise.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Section */}
        <Card className="mb-8 border-0 shadow-lg bg-white/90">
          <CardHeader>
            <CardTitle>Step-by-Step Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {remedy.instructions.map((instruction, idx) => (
                <li key={idx} className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-7 h-7 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-semibold text-sm">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 pt-0.5">{instruction}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="mb-8 border-0 shadow-lg bg-white/90">
          <CardHeader>
            <CardTitle>Practice Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
              <p className="text-slate-700">
                Find a quiet, comfortable space where you won't be disturbed
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
              <p className="text-slate-700">
                Consistency matters more than duration—practice regularly for best results
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
              <p className="text-slate-700">
                Listen to your body and adjust the practice to fit your comfort level
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
              <p className="text-slate-700">
                If you have any medical concerns, consult with a healthcare provider first
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="flex items-center justify-center space-x-2"
          >
            <span>Back to Exercises</span>
          </Button>
          <a
            href={remedy.videoPlaceholder}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Video in New Tab</span>
          </a>
        </div>
      </div>
    </div>
  )
}
