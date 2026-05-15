"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Heart,
  Users,
  Activity,
  TrendingUp,
  Mic,
  RefreshCcw,
  Camera,
  CheckCircle,
  ScanFace,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface ClassificationQuestion {
  id: string
  question: string
  options: { value: string; label: string; description?: string }[]
  icon: React.ReactNode
}

type DetectedEmotion =
  | "happy"
  | "sad"
  | "angry"
  | "fearful"
  | "disgusted"
  | "surprised"
  | "neutral"

interface EmotionResult {
  emotion: DetectedEmotion
  confidence: number
  allScores: Record<DetectedEmotion, number>
}

interface VoiceFeedback {
  emotion: string
  description: string
  keywords: string[]
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const EMOTION_META: Record<
  DetectedEmotion,
  { label: string; emoji: string; color: string }
> = {
  happy:     { label: "Happy / Content",    emoji: "😊", color: "text-yellow-600" },
  sad:       { label: "Sad / Low",          emoji: "😔", color: "text-blue-600"   },
  angry:     { label: "Frustrated / Angry", emoji: "😠", color: "text-red-600"    },
  fearful:   { label: "Anxious / Fearful",  emoji: "😰", color: "text-purple-600" },
  disgusted: { label: "Overwhelmed",        emoji: "😣", color: "text-orange-600" },
  surprised: { label: "Startled / Alert",   emoji: "😮", color: "text-teal-600"   },
  neutral:   { label: "Calm / Neutral",     emoji: "😐", color: "text-slate-600"  },
}

// Maps a detected face emotion → the "severity" answer in the questionnaire
const EMOTION_TO_SEVERITY: Partial<Record<DetectedEmotion, string>> = {
  sad:       "moderate",
  fearful:   "high",
  angry:     "high",
  disgusted: "moderate",
  happy:     "mild",
  neutral:   "mild",
  surprised: "moderate",
}

const classificationQuestions: ClassificationQuestion[] = [
  {
    id: "duration",
    question: "How long have you been experiencing these feelings or concerns?",
    icon: <Clock className="w-6 h-6" />,
    options: [
      { value: "recent",  label: "Recently (within the last few days)", description: "New or sudden onset"    },
      { value: "weeks",   label: "A few weeks",                          description: "Ongoing for 2-4 weeks"  },
      { value: "months",  label: "Several months",                       description: "Persistent for months"  },
      { value: "ongoing", label: "This has been ongoing for a long time", description: "Chronic or recurring"  },
    ],
  },
  {
    id: "impact",
    question: "How much are these feelings affecting your daily activities?",
    icon: <Activity className="w-6 h-6" />,
    options: [
      { value: "minimal",     label: "Minimal impact",     description: "I can manage my usual activities"    },
      { value: "some",        label: "Some difficulty",     description: "Some activities are harder than usual" },
      { value: "significant", label: "Significant impact",  description: "Many activities are affected"        },
      { value: "severe",      label: "Severe impact",       description: "Unable to do most daily activities"  },
    ],
  },
  {
    id: "episodes",
    question: "Have you experienced similar feelings before?",
    icon: <TrendingUp className="w-6 h-6" />,
    options: [
      { value: "never",      label: "Never",       description: "This is completely new for me"      },
      { value: "rarely",     label: "Rarely",      description: "Maybe once or twice before"         },
      { value: "sometimes",  label: "Sometimes",   description: "I've had episodes like this before" },
      { value: "frequently", label: "Frequently",  description: "This happens regularly"             },
    ],
  },
  {
    id: "severity",
    question: "On a scale of concern, how would you rate what you're experiencing?",
    icon: <Heart className="w-6 h-6" />,
    options: [
      { value: "mild",     label: "Mild concern",     description: "Manageable but noticeable"        },
      { value: "moderate", label: "Moderate concern",  description: "Definitely affecting my wellbeing" },
      { value: "high",     label: "High concern",      description: "Very distressing and difficult"   },
      { value: "crisis",   label: "Crisis level",      description: "I need immediate support"         },
    ],
  },
  {
    id: "support",
    question: "Do you have people you can talk to about how you're feeling?",
    icon: <Users className="w-6 h-6" />,
    options: [
      { value: "strong",  label: "Yes, strong support", description: "Family/friends I can rely on"   },
      { value: "some",    label: "Some support",         description: "A few people I can talk to"     },
      { value: "limited", label: "Limited support",      description: "Not many people to turn to"     },
      { value: "none",    label: "No support",           description: "I feel quite alone"             },
    ],
  },
]

const unsureQuestions = [
  {
    id: "duration",
    question: "Has this been happening for more than a few weeks?",
    options: [
      { value: "yes", label: "Yes, it's been going on for weeks or months" },
      { value: "no",  label: "No, it's been just a few days or less than a week" },
    ],
  },
  {
    id: "pattern",
    question: "Do these feelings come and go, or do they feel constant?",
    options: [
      { value: "constant",   label: "They feel pretty constant or persistent"      },
      { value: "comeandgo",  label: "They come and go, sometimes I feel better"   },
    ],
  },
  {
    id: "first_time",
    question: "Is this the first time you've been experiencing something like this?",
    options: [
      { value: "no",  label: "No, I've experienced similar feelings before" },
      { value: "yes", label: "Yes, this is new for me"                      },
    ],
  },
]

// ─────────────────────────────────────────────
// INLINE EMOTION DETECTOR COMPONENT
// ─────────────────────────────────────────────

interface EmotionDetectorProps {
  onEmotionDetected: (result: EmotionResult) => void
  onSkip: () => void
}

function EmotionDetector({ onEmotionDetected, onSkip }: EmotionDetectorProps) {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [status,   setStatus]   = useState<"loading" | "ready" | "scanning" | "done" | "error">("loading")
  const [result,   setResult]   = useState<EmotionResult | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  // Load face-api.js models on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const faceapi = await import("face-api.js")
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        ])
        if (!cancelled) setStatus("ready")
      } catch (err) {
        console.error("face-api model load error:", err)
        if (!cancelled) {
          setErrorMsg("Could not load emotion detection models.")
          setStatus("error")
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  // Clean up camera on unmount
  useEffect(() => () => stopCamera(), [stopCamera])

  const captureEmotion = useCallback(async () => {
    if (!videoRef.current) return
    try {
      const faceapi = await import("face-api.js")
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions()

      if (!detection) {
        setErrorMsg("No face detected. Please ensure your face is visible and well-lit.")
        setStatus("error")
        stopCamera()
        return
      }

      const expressions = detection.expressions as unknown as Record<DetectedEmotion, number>
      const [topKey, topVal] = Object.entries(expressions).reduce((a, b) =>
        a[1] > b[1] ? a : b
      )

      const emotionResult: EmotionResult = {
        emotion:   topKey as DetectedEmotion,
        confidence: Math.round(topVal * 100),
        allScores: expressions,
      }

      setResult(emotionResult)
      setStatus("done")
      stopCamera()
    } catch (err) {
      console.error("Detection error:", err)
      setErrorMsg("Detection failed. Please try again.")
      setStatus("error")
      stopCamera()
    }
  }, [stopCamera])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
  video: { facingMode: "user", width: 640, height: 480 } 
})
streamRef.current = stream
if (videoRef.current) {
  videoRef.current.srcObject = stream
  videoRef.current.onloadedmetadata = () => {
    videoRef.current?.play()
  }
}

      setStatus("scanning")
      // Give the camera 2 s to warm up before we grab the frame
      setTimeout(captureEmotion, 2000)
    } catch {
      setErrorMsg("Camera access denied. Please allow camera permissions and try again.")
      setStatus("error")
    }
  }, [captureEmotion])

  const retry = () => {
    setResult(null)
    setErrorMsg("")
    setStatus("ready")
  }

  const detected = result ? EMOTION_META[result.emotion] : null

  return (
    <Card className="border-2 border-emerald-100 shadow-md mb-6">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <ScanFace className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-slate-700">Facial Emotion Scan</h3>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              Optional
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Let us read your expression to better understand how you feel right now
          </p>
        </div>

        {/* Loading */}
        {status === "loading" && (
          <div className="text-center py-8 text-slate-400 text-sm animate-pulse">
            Loading emotion detection models…
          </div>
        )}

        {/* Ready */}
        {status === "ready" && (
          <div className="text-center space-y-3 py-2">
            <p className="text-sm text-slate-600">
              We'll take a quick snapshot to detect your current emotional state.
              <br />
              <span className="text-xs text-slate-400">
                🔒 All processing happens in your browser — nothing is sent to a server.
              </span>
            </p>
            <Button
              onClick={startCamera}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Camera className="w-4 h-4 mr-2" /> Start Scan
            </Button>
          </div>
        )}

        {/* Scanning — live camera feed */}
        {status === "scanning" && (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video
  ref={videoRef}
  className="w-full h-full object-cover rounded-xl"
  autoPlay
  muted
  playsInline
/>
              {/* Animated scan border */}
              <div className="absolute inset-0 border-4 border-emerald-400 rounded-xl animate-pulse pointer-events-none" />
              {/* Corner guides */}
              <div className="absolute top-3 left-3  w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg" />
              <div className="absolute bottom-3 left-3  w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg" />
            </div>
            <p className="text-center text-sm text-slate-500 animate-pulse">
              📸 Analyzing your expression… please look at the camera
            </p>
          </div>
        )}

        {/* Result */}
        {status === "done" && result && detected && (
          <div className="space-y-4">
            {/* Main result card */}
            <div className="text-center py-5 bg-gradient-to-br from-emerald-50 to-white rounded-xl border border-emerald-100">
              <span className="text-6xl">{detected.emoji}</span>
              <p className={`mt-2 text-2xl font-bold ${detected.color}`}>{detected.label}</p>
              <p className="text-sm text-slate-400 mt-1">Confidence: {result.confidence}%</p>
            </div>

            {/* Top-3 emotion bar chart */}
            <div className="space-y-2 px-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Emotion breakdown
              </p>
              {(Object.entries(result.allScores) as [DetectedEmotion, number][])
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([emotion, score]) => {
                  const meta = EMOTION_META[emotion]
                  return (
                    <div key={emotion} className="flex items-center gap-2">
                      <span className="text-lg w-6 text-center">{meta.emoji}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                          style={{ width: `${Math.round(score * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-9 text-right">
                        {Math.round(score * 100)}%
                      </span>
                    </div>
                  )
                })}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <Button
                onClick={() => onEmotionDetected(result)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Use This Result
              </Button>
              <Button variant="outline" onClick={retry} className="px-3" title="Retry">
                <RefreshCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="space-y-3 text-center py-2">
            <p className="text-sm text-red-500">{errorMsg}</p>
            <Button variant="outline" onClick={retry} size="sm">
              <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
            </Button>
          </div>
        )}

        {/* Skip link — hidden while camera is live or result shown */}
        {status !== "scanning" && status !== "done" && (
          <button
            onClick={onSkip}
            className="w-full text-xs text-slate-400 hover:text-slate-600 underline text-center pt-1"
          >
            Skip — I'll answer the questions manually
          </button>
        )}
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────

export default function ClassificationPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  // ── Existing state ──
  const [currentStep,              setCurrentStep]              = useState(0)
  const [answers,                  setAnswers]                  = useState<Record<string, string>>({})
  const [showInitialQuestion,      setShowInitialQuestion]      = useState(true)
  const [showUnsureQuestionnaire,  setShowUnsureQuestionnaire]  = useState(false)
  const [showVoiceStep,            setShowVoiceStep]            = useState(false)
  const [pendingRoute,             setPendingRoute]             = useState<string>("")
  const [isRecording,              setIsRecording]              = useState(false)
  const [recordingTime,            setRecordingTime]            = useState(0)
  const [voiceFeedback,            setVoiceFeedback]            = useState<VoiceFeedback | null>(null)
  const [debugMetrics,             setDebugMetrics]             = useState<{ vol: string; range: string; silence: string } | null>(null)
  const [unsureAnswers,            setUnsureAnswers]            = useState<Record<string, string[]>>({})
  const [currentUnsureStep,        setCurrentUnsureStep]        = useState(0)
  const [recommendedOption,        setRecommendedOption]        = useState<"short-term" | "long-term" | null>(null)
  const [recommendationReason,     setRecommendationReason]     = useState<string>("")
  const [selectedOptions,          setSelectedOptions]          = useState<string[]>([])

  // ── NEW: Emotion detection state ──
  const [showEmotionScanner,  setShowEmotionScanner]  = useState(true)
  const [detectedEmotion,     setDetectedEmotion]     = useState<DetectedEmotion | null>(null)

  // ── Audio refs (unchanged) ──
  const audioContextRef   = useRef<AudioContext | null>(null)
  const analyzerRef       = useRef<AnalyserNode | null>(null)
  const dataArrayRef      = useRef<Float32Array | null>(null)
  const sourceRef         = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef         = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const audioMetricsRef   = useRef<{ volumes: number[] }>({ volumes: [] })
  const isRecordingRef    = useRef(false)
  const timerRef          = useRef<NodeJS.Timeout | null>(null)

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopMic()
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    const recommended = searchParams.get("recommended") as "short-term" | "long-term" | null
    const reason      = searchParams.get("reason")
    if (recommended && reason) {
      setRecommendedOption(recommended)
      setRecommendationReason(decodeURIComponent(reason))
    }
  }, [searchParams])

  // ── NEW: Handle emotion scan result ──
  const handleEmotionDetected = (result: EmotionResult) => {
    setDetectedEmotion(result.emotion)
    setShowEmotionScanner(false)

    // Auto-prefill the severity answer based on the detected face emotion
    const suggestedSeverity = EMOTION_TO_SEVERITY[result.emotion]
    if (suggestedSeverity) {
      setAnswers((prev) => ({ ...prev, severity: suggestedSeverity }))
    }
  }

  // ─────────────────────────────────────────
  // Existing audio helpers (unchanged)
  // ─────────────────────────────────────────

  function stopMic() {
    isRecordingRef.current = false
    setIsRecording(false)
    if (timerRef.current)          clearInterval(timerRef.current)
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }
  }

  function goToVoiceStep(route: string) {
    setPendingRoute(route)
    setShowInitialQuestion(false)
    setShowUnsureQuestionnaire(false)
    setShowVoiceStep(true)
  }

  function finalizeAndRoute() {
    stopMic()
    const pathParts  = pendingRoute.split("?")
    const pathname   = pathParts[0] || "/home"
    const queryParams = new URLSearchParams(pathParts[1] || "")

    if (voiceFeedback) {
      queryParams.set("voice_keywords", voiceFeedback.keywords.join(","))
      queryParams.set("voice_emotion",  voiceFeedback.emotion)
    }
    // Pass the face emotion forward so downstream pages can use it
    if (detectedEmotion) {
      queryParams.set("face_emotion", detectedEmotion)
    }

    router.push(`${pathname}?${queryParams.toString()}`)
  }

  async function startRecording() {
    stopMic()
    setVoiceFeedback(null)
    setDebugMetrics(null)
    audioMetricsRef.current = { volumes: [] }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { autoGainControl: false, echoCancellation: false, noiseSuppression: false },
      })
      streamRef.current = stream

      if (!audioContextRef.current) {
        const AudioContextClass =
          window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!
        audioContextRef.current = new AudioContextClass()
      }
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume()
      }

      const source = audioContextRef.current.createMediaStreamSource(stream)
      sourceRef.current = source

      if (!analyzerRef.current) {
        analyzerRef.current = audioContextRef.current.createAnalyser()
        analyzerRef.current.fftSize = 2048
      }
      source.connect(analyzerRef.current)

      const bufferLength  = analyzerRef.current.frequencyBinCount
      dataArrayRef.current = new Float32Array(bufferLength)

      isRecordingRef.current = true
      setIsRecording(true)
      setRecordingTime(10)
      processAudio()

      let timeLeft = 10
      timerRef.current = setInterval(() => {
        timeLeft -= 1
        setRecordingTime(timeLeft)
        if (timeLeft <= 0) stopRecordingAndAnalyze()
      }, 1000)
    } catch (err) {
      console.error("Microphone error:", err)
      alert("Microphone access denied or unavailable. Skipping voice analysis.")
      finalizeAndRoute()
    }
  }

  function processAudio() {
    if (!analyzerRef.current || !dataArrayRef.current || !isRecordingRef.current) return
    analyzerRef.current.getFloatTimeDomainData(dataArrayRef.current as unknown as Float32Array)
    let sumSquares = 0
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sumSquares += dataArrayRef.current[i] * dataArrayRef.current[i]
    }
    const rms    = Math.sqrt(sumSquares / dataArrayRef.current.length)
    const volume = rms * 100
    audioMetricsRef.current.volumes.push(volume)
    if (isRecordingRef.current) {
      animationFrameRef.current = requestAnimationFrame(processAudio)
    }
  }
  function stopRecordingAndAnalyze() {
  const volumes = audioMetricsRef.current.volumes
  stopMic()
  const emptyDebug = { vol: "0.00", range: "0.00", silence: "0.00" }

  if (volumes.length === 0) {
    setVoiceFeedback({ emotion: "Neutral", description: "No clear emotional patterns detected.", keywords: ["normal"] })
    setDebugMetrics(emptyDebug)
    return
  }

  const speakingVolumes = volumes.filter((v: number) => v > 0.5)

  if (speakingVolumes.length === 0) {
    setVoiceFeedback({
      emotion: "Low Energy / Sad",
      description: "Your voice was extremely quiet.",
      keywords: ["heavy", "sad", "depressed", "tired"]
    })
    setDebugMetrics(emptyDebug)
    return
  }

  const avgVol       = speakingVolumes.reduce((a: number, b: number) => a + b, 0) / speakingVolumes.length
  const maxVol       = Math.max(...speakingVolumes)
  const minVol       = Math.min(...speakingVolumes)
  const dynamicRange = maxVol - minVol
  const silenceCount = volumes.length - speakingVolumes.length
  const silenceRatio = silenceCount / volumes.length

  setDebugMetrics({
    vol:     avgVol.toFixed(2),
    range:   dynamicRange.toFixed(2),
    silence: silenceRatio.toFixed(2)
  })

  // ── YOUR CALIBRATED METRICS ──────────────────────────────
  //
  //  NORMAL:  avgVol 1.5–2.5  | dynamicRange 6–8   | silenceRatio < 0.5
  //  SAD:     avgVol < 1.5    | dynamicRange < 6    | silenceRatio > 0.4
  //  HAPPY:   avgVol 2.5–3.5  | dynamicRange > 9    | doesn't matter
  //  ANXIOUS: doesn't matter  | dynamicRange > 10   | silenceRatio > 0.5
  //  STRESS:  avgVol > 3.5    | dynamicRange 8–10   | silenceRatio < 0.4
  // ─────────────────────────────────────────────────────────

  if (dynamicRange > 10 && silenceRatio > 0.5) {
    // ANXIOUS — volume doesn't matter, choppy + lots of silence
    setVoiceFeedback({
      emotion: "Anxiety / Nervousness",
      description: "Your voice shows choppy patterns and frequent pauses, indicating nervousness or anxiety.",
      keywords: ["nervous", "anxious", "jittery", "tense", "restless"]
    })
  }
  else if (avgVol >= 2.5 && avgVol <= 4.0 && dynamicRange > 9) {
    // HAPPY — volume 2.5 to 4, dynamic range > 9, silence doesn't matter
    setVoiceFeedback({
      emotion: "Happy / Enthusiastic",
      description: "Your voice sounds bright, energetic, and expressive!",
      keywords: ["happy", "energetic", "positive", "balanced"]
    })
  }
  else if (avgVol > 4.0 && dynamicRange >= 8 && dynamicRange <= 10 && silenceRatio < 0.4) {
    // STRESS — volume > 4, dynamic range 8 to 10, silence ratio < 0.4
    setVoiceFeedback({
      emotion: "Stress / Tension",
      description: "Your voice is consistently loud with signs of strain, indicating stress or tension.",
      keywords: ["stressed", "pressure", "strained", "overwhelmed"]
    })
  }
  else if (avgVol < 1.5 || dynamicRange < 6) {
    // SAD — volume < 1.5 OR dynamic range < 6, silence ratio > 0.4
    setVoiceFeedback({
      emotion: "Low Energy / Sad",
      description: "Your voice sounds heavy and low in energy, indicating sadness or exhaustion.",
      keywords: ["heavy", "sad", "depressed", "tired", "numb"]
    })
  }
  else if (avgVol >= 1.5 && avgVol <= 2.5 && dynamicRange >= 6 && dynamicRange <= 8 && silenceRatio < 0.5) {
    // NORMAL — volume 1.5 to 2.5, dynamic range 6 to 8, silence < 0.5
    setVoiceFeedback({
      emotion: "Normal / Balanced",
      description: "Your voice sounds calm, steady, and balanced.",
      keywords: ["normal", "calm", "steady", "balanced"]
    })
  }
  else {
    // FALLBACK
    setVoiceFeedback({
      emotion: "Normal / Balanced",
      description: "Your voice sounds calm and steady.",
      keywords: ["normal", "calm", "steady"]
    })
  }
}





  function retakeAnalysis() {
    stopMic()
    setVoiceFeedback(null)
    setDebugMetrics(null)
  }

  // ─────────────────────────────────────────
  // Selection / routing helpers (unchanged)
  // ─────────────────────────────────────────

  const handleOptionToggle = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    )
  }

  const handleMultipleSelections = () => {
    if (selectedOptions.includes("short-term") && selectedOptions.includes("long-term")) {
      goToVoiceStep("/long-term?multiple=true&includes=short-term")
    } else if (selectedOptions.includes("short-term")) {
      goToVoiceStep("/short-term")
    } else if (selectedOptions.includes("long-term")) {
      goToVoiceStep("/long-term")
    } else if (selectedOptions.includes("unsure")) {
      setShowInitialQuestion(false)
      setShowUnsureQuestionnaire(true)
    }
  }

  const handleContinueWithSelections = () => {
    if (selectedOptions.length > 0) handleMultipleSelections()
  }

  const handleUnsureAnswer = (questionId: string, value: string, checked: boolean) => {
    setUnsureAnswers((prev) => {
      const cur = prev[questionId] || []
      return checked
        ? { ...prev, [questionId]: [...cur, value] }
        : { ...prev, [questionId]: cur.filter((a) => a !== value) }
    })
  }

  const handleUnsureNext = () => {
    if (currentUnsureStep < unsureQuestions.length - 1) {
      setCurrentUnsureStep(currentUnsureStep + 1)
    } else {
      const result = analyzeUnsureAnswers(unsureAnswers)
      const reason =
        result === "long-term"
          ? "because this has been affecting you for a while"
          : "because this seems to have started recently"
      setRecommendedOption(result)
      setRecommendationReason(reason)
      goToVoiceStep(`/${result}`)
      setUnsureAnswers({})
      setCurrentUnsureStep(0)
    }
  }

  const handleUnsureBack = () => {
    if (currentUnsureStep > 0) {
      setCurrentUnsureStep(currentUnsureStep - 1)
    } else {
      setShowUnsureQuestionnaire(false)
      setShowInitialQuestion(true)
    }
  }

  const analyzeUnsureAnswers = (ans: Record<string, string[]>): "short-term" | "long-term" => {
    let score = 0
    if ((ans.duration  || []).includes("yes"))      score++
    if ((ans.pattern   || []).includes("constant")) score++
    if ((ans.first_time || []).includes("no"))      score++
    return score >= 2 ? "long-term" : "short-term"
  }

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const handleNext = () => {
    if (currentStep < classificationQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      const classification = analyzeAnswers(answers)
      goToVoiceStep(classification === "short-term" ? "/short-term" : "/long-term")
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      setShowInitialQuestion(true)
    }
  }

  const analyzeAnswers = (ans: Record<string, string>): "short-term" | "long-term" => {
    let s = 0, l = 0
    if (ans.duration === "recent") s += 2
    else if (ans.duration === "weeks") s += 1
    else l += 2

    if (ans.impact === "minimal" || ans.impact === "some") s += 1
    else l += 2

    if (ans.episodes === "never" || ans.episodes === "rarely") s += 1
    else l += 2

    if (ans.severity === "crisis") l += 3
    else if (ans.severity === "mild") s += 1

    if (ans.support === "none" || ans.support === "limited") l += 1

    return s > l ? "short-term" : "long-term"
  }

  const currentQuestion      = classificationQuestions[currentStep]
  const progress             = ((currentStep + 1) / classificationQuestions.length) * 100
  const unsureProgress       = ((currentUnsureStep + 1) / unsureQuestions.length) * 100
  const currentUnsureQuestion = unsureQuestions[currentUnsureStep]

  // ─────────────────────────────────────────
  // RENDER: Voice Step (unchanged layout)
  // ─────────────────────────────────────────

  if (showVoiceStep) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-md">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-slate-800">
              Voice Emotion Analysis
            </CardTitle>
            <p className="text-slate-600 mt-2">
              We'll analyze the rhythm and tone of your voice (without capturing any words) to understand your feelings better.
            </p>
          </CardHeader>

          <CardContent className="space-y-6 flex flex-col items-center">
            {/* Show face-emotion result badge if available */}
            {detectedEmotion && (
              <div className="w-full flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <span className="text-2xl">{EMOTION_META[detectedEmotion].emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Face scan detected: {EMOTION_META[detectedEmotion].label}
                  </p>
                  <p className="text-xs text-slate-500">
                    Now let's confirm with your voice
                  </p>
                </div>
              </div>
            )}

            {!voiceFeedback ? (
              <div className="text-center space-y-6 w-full py-4">
                <p className="text-slate-700 font-medium text-lg">
                  {isRecording
                    ? `Listening… ${recordingTime}s remaining`
                    : "Click below and speak naturally for 10 seconds about how you're feeling today."}
                </p>

                {isRecording ? (
                  <div className="flex justify-center items-center h-24">
                    <div className="flex space-x-3 items-end h-16">
                      <div className="w-4 bg-emerald-500 rounded-full animate-pulse" style={{ height: "60%"  }} />
                      <div className="w-4 bg-emerald-600 rounded-full animate-pulse" style={{ height: "100%", animationDelay: "0.1s" }} />
                      <div className="w-4 bg-emerald-400 rounded-full animate-pulse" style={{ height: "40%",  animationDelay: "0.2s" }} />
                      <div className="w-4 bg-emerald-500 rounded-full animate-pulse" style={{ height: "80%",  animationDelay: "0.3s" }} />
                      <div className="w-4 bg-emerald-600 rounded-full animate-pulse" style={{ height: "50%",  animationDelay: "0.4s" }} />
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={startRecording}
                    className="bg-emerald-600 hover:bg-emerald-700 h-16 px-8 text-lg rounded-full shadow-md transition-transform hover:scale-105"
                  >
                    <Mic className="w-6 h-6 mr-2" /> Start Voice Analysis
                  </Button>
                )}
              </div>
            ) : (
              <div className="w-full space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 text-center space-y-4">
                  <Activity className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="text-xl font-bold text-slate-800">Analysis Complete</h3>

                  <div className="p-4 bg-white rounded-lg shadow-sm border border-emerald-100">
                    <p className="font-bold text-emerald-800 text-xl mb-2">{voiceFeedback.emotion}</p>
                    <p className="text-slate-600">{voiceFeedback.description}</p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {voiceFeedback.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold tracking-wide capitalize border border-emerald-200"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>

                  {debugMetrics && (
                    <div className="mt-4 p-4 bg-slate-800 rounded-lg text-left text-green-400 font-mono text-sm border border-slate-700 shadow-inner">
                      <div className="flex items-center mb-2 text-white font-bold border-b border-slate-600 pb-2">
                        <Activity className="w-4 h-4 mr-2" /> Microphone Calibration Data
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <span className="text-slate-400">Avg Volume:</span>
                        <span className="font-bold">{debugMetrics.vol}</span>
                        <span className="text-slate-400">Dynamic Range:</span>
                        <span className="font-bold">{debugMetrics.range}</span>
                        <span className="text-slate-400">Silence Ratio:</span>
                        <span className="font-bold">{debugMetrics.silence}</span>
                      </div>
                      <p className="mt-3 text-xs text-slate-400">
                        If the result is wrong, test your voice again, look at these numbers, and edit the &lt; or &gt; signs in the analyzeMetrics() function to match these numbers!
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-3 mt-6">
                  <Button onClick={finalizeAndRoute} className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 text-lg rounded-xl shadow-md">
                    Continue to Solutions <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button onClick={retakeAnalysis} variant="outline" className="w-full h-12 text-slate-600 border-slate-300 hover:bg-slate-50">
                    <RefreshCcw className="w-4 h-4 mr-2" /> Retake Analysis
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─────────────────────────────────────────
  // RENDER: Unsure Questionnaire (unchanged)
  // ─────────────────────────────────────────

  if (showUnsureQuestionnaire) {
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
                    Question {currentUnsureStep + 1} of {unsureQuestions.length}
                  </div>
                  <div className="font-semibold text-slate-800">Let's figure this out together</div>
                </div>
              </div>
            </div>
            <Progress value={unsureProgress} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">{currentUnsureQuestion.question}</h3>
              <p className="text-sm text-slate-500 mb-6">You can select multiple options if they apply to you</p>
              <div className="space-y-3">
                {currentUnsureQuestion.options.map((option) => {
                  const isChecked = (unsureAnswers[currentUnsureQuestion.id] || []).includes(option.value)
                  return (
                    <div key={option.value} className="flex items-start space-x-3">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleUnsureAnswer(currentUnsureQuestion.id, option.value, checked as boolean)
                        }
                        id={option.value}
                        className="mt-1 border-emerald-300 text-emerald-600"
                      />
                      <Label
                        htmlFor={option.value}
                        className="flex-1 cursor-pointer p-3 rounded-lg border border-transparent hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
                      >
                        <div className="font-medium text-slate-800">{option.label}</div>
                      </Label>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex justify-between pt-6">
              <Button onClick={handleUnsureBack} variant="outline" className="flex items-center space-x-2 bg-transparent">
                <ArrowLeft className="w-4 h-4" /> <span>Back</span>
              </Button>
              <Button
                onClick={handleUnsureNext}
                disabled={!unsureAnswers[currentUnsureQuestion.id]?.length}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <span>{currentUnsureStep === unsureQuestions.length - 1 ? "Next Step" : "Next"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ─────────────────────────────────────────
  // RENDER: Initial question (+ emotion scanner on top)
  // ─────────────────────────────────────────

  if (showInitialQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4 py-10">
        <div className="max-w-2xl w-full space-y-0">

          {/* ── EMOTION SCANNER (shown until dismissed) ── */}
          {showEmotionScanner && (
            <EmotionDetector
              onEmotionDetected={handleEmotionDetected}
              onSkip={() => setShowEmotionScanner(false)}
            />
          )}

          {/* ── Emotion badge (shown after scan is done) ── */}
          {!showEmotionScanner && detectedEmotion && (
            <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <span className="text-2xl">{EMOTION_META[detectedEmotion].emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-800">
                  We detected: {EMOTION_META[detectedEmotion].label}
                </p>
                <p className="text-xs text-slate-500">
                  This has been used to pre-fill your severity rating below
                </p>
              </div>
              <button
                onClick={() => setShowEmotionScanner(true)}
                className="text-xs text-emerald-600 underline whitespace-nowrap"
              >
                Re-scan
              </button>
            </div>
          )}

          {/* ── Original initial question card ── */}
          <Card className="w-full shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-slate-800">
                Let's understand what you're going through
              </CardTitle>
              <p className="text-slate-600 mt-2">
                This helps us provide the most appropriate support for your situation
              </p>
              <p className="text-sm text-slate-500 mt-1">
                You can select multiple options if they apply to you
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {recommendedOption && (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-emerald-800">We recommend</span>
                  </div>
                  <p className="text-emerald-700">
                    <strong>
                      {recommendedOption === "short-term" ? "Recent/New feelings" : "Ongoing/Recurring"}
                    </strong>{" "}
                    – {recommendationReason}
                  </p>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-xl font-semibold text-slate-800 mb-8">
                  Is this something you've been dealing with for a while, or is it more recent?
                </h3>
                <div className="space-y-4">
                  <div
                    className={`w-full p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedOptions.includes("short-term")
                        ? "border-emerald-500 bg-emerald-50 shadow-md"
                        : recommendedOption === "short-term"
                        ? "border-emerald-300 bg-emerald-25"
                        : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-25"
                    }`}
                    onClick={() => handleOptionToggle("short-term")}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox checked={selectedOptions.includes("short-term")} className="mt-1" />
                      <div className="text-left flex-1">
                        <div className="font-semibold text-slate-800 text-lg">Recent or new feelings</div>
                        <div className="text-slate-600 mt-2">Something that started recently or feels temporary</div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-full p-6 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedOptions.includes("long-term")
                        ? "border-emerald-500 bg-emerald-50 shadow-md"
                        : recommendedOption === "long-term"
                        ? "border-emerald-300 bg-emerald-25"
                        : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-25"
                    }`}
                    onClick={() => handleOptionToggle("long-term")}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox checked={selectedOptions.includes("long-term")} className="mt-1" />
                      <div className="text-left flex-1">
                        <div className="font-semibold text-slate-800 text-lg">Ongoing or recurring</div>
                        <div className="text-slate-600 mt-2">Something I've been dealing with for a while</div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedOptions.length > 0 && (
                  <div className="mt-6">
                    <Button onClick={handleContinueWithSelections} className="bg-emerald-600 hover:bg-emerald-700 px-8">
                      Continue with selected options
                    </Button>
                  </div>
                )}

                <div className="mt-8 pt-4 border-t border-slate-200">
                  <div
                    className={`inline-flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedOptions.includes("unsure")
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                    onClick={() => handleOptionToggle("unsure")}
                  >
                    <Checkbox checked={selectedOptions.includes("unsure")} className="text-sm" />
                    <span className="text-sm">I'm not sure - help me figure it out</span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <Button
                  onClick={() => router.push("/home")}
                  variant="ghost"
                  className="text-slate-500 hover:text-slate-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────
  // RENDER: Main questionnaire
  // ─────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4 py-10">
      <div className="max-w-2xl w-full space-y-0">

        {/* ── Emotion badge while answering questions ── */}
        {detectedEmotion && (
          <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <span className="text-2xl">{EMOTION_META[detectedEmotion].emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800">
                Face scan: {EMOTION_META[detectedEmotion].label}
              </p>
              <p className="text-xs text-slate-500">Severity has been pre-filled based on your expression</p>
            </div>
          </div>
        )}

        <Card className="w-full shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                  {currentQuestion.icon}
                </div>
                <div>
                  <div className="text-sm text-slate-500">
                    Question {currentStep + 1} of {classificationQuestions.length}
                  </div>
                  <div className="font-semibold text-slate-800">Understanding your situation</div>
                </div>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-6">{currentQuestion.question}</h3>

              {/* Show "pre-filled" hint on the severity question */}
              {currentQuestion.id === "severity" && detectedEmotion && answers["severity"] && (
                <div className="mb-4 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  <ScanFace className="w-4 h-4 shrink-0" />
                  <span>
                    Pre-filled from your face scan ({EMOTION_META[detectedEmotion].label}).
                    Feel free to change it.
                  </span>
                </div>
              )}

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
                      {option.description && (
                        <div className="text-sm text-slate-600 mt-1">{option.description}</div>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex justify-between pt-6">
              <Button onClick={handleBack} variant="outline" className="flex items-center space-x-2 bg-transparent">
                <ArrowLeft className="w-4 h-4" /> <span>Back</span>
              </Button>
              <Button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <span>
                  {currentStep === classificationQuestions.length - 1 ? "Next Step" : "Next"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
