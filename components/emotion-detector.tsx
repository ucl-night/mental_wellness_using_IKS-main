"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, RefreshCcw, CheckCircle } from "lucide-react"

export type DetectedEmotion = 
  "happy" | "sad" | "angry" | "fearful" | "disgusted" | "surprised" | "neutral"

interface EmotionResult {
  emotion: DetectedEmotion
  confidence: number
  allScores: Record<DetectedEmotion, number>
}

interface EmotionDetectorProps {
  onEmotionDetected: (result: EmotionResult) => void
  onSkip?: () => void
}

// Maps detected emotion to wellness-friendly display labels
const EMOTION_LABELS: Record<DetectedEmotion, { label: string; emoji: string; color: string }> = {
  happy:     { label: "Happy / Content",    emoji: "😊", color: "text-yellow-600" },
  sad:       { label: "Sad / Low",          emoji: "😔", color: "text-blue-600" },
  angry:     { label: "Frustrated / Angry", emoji: "😠", color: "text-red-600" },
  fearful:   { label: "Anxious / Fearful",  emoji: "😰", color: "text-purple-600" },
  disgusted: { label: "Overwhelmed",        emoji: "😣", color: "text-orange-600" },
  surprised: { label: "Startled / Alert",   emoji: "😮", color: "text-teal-600" },
  neutral:   { label: "Calm / Neutral",     emoji: "😐", color: "text-slate-600" },
}

export default function EmotionDetector({ onEmotionDetected, onSkip }: EmotionDetectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [status, setStatus] = useState<"loading" | "ready" | "scanning" | "done" | "error">("loading")
  const [result, setResult] = useState<EmotionResult | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  // Load face-api models
  useEffect(() => {
    async function loadModels() {
      try {
        const faceapi = await import("face-api.js")
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        ])
        setStatus("ready")
      } catch (err) {
        console.error("Model load error:", err)
        setErrorMsg("Could not load emotion detection models.")
        setStatus("error")
      }
    }
    loadModels()
  }, [])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setStatus("scanning")
      setTimeout(captureEmotion, 2000) // Give camera 2s to warm up
    } catch (err) {
      setErrorMsg("Camera access denied. Please allow camera permissions.")
      setStatus("error")
    }
  }, [])

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

      const expressions = detection.expressions as Record<DetectedEmotion, number>
      const topEmotion = Object.entries(expressions).reduce((a, b) =>
        a[1] > b[1] ? a : b
      )

      const emotionResult: EmotionResult = {
        emotion: topEmotion[0] as DetectedEmotion,
        confidence: Math.round(topEmotion[1] * 100),
        allScores: expressions,
      }

      setResult(emotionResult)
      setStatus("done")
      stopCamera()
    } catch (err) {
      setErrorMsg("Detection failed. Please try again.")
      setStatus("error")
      stopCamera()
    }
  }, [])

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const retry = () => {
    setResult(null)
    setErrorMsg("")
    setStatus("ready")
  }

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [])

  const detected = result ? EMOTION_LABELS[result.emotion] : null

  return (
    <Card className="border-emerald-100 shadow-sm">
      <CardContent className="p-6 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-700 flex items-center justify-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            Facial Emotion Scan
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Optional: Let us read your expression to better understand how you feel
          </p>
        </div>

        {/* Loading state */}
        {status === "loading" && (
          <div className="text-center py-8 text-slate-400 text-sm animate-pulse">
            Loading emotion detection models…
          </div>
        )}

        {/* Ready state */}
        {status === "ready" && (
          <div className="text-center space-y-3">
            <p className="text-sm text-slate-600">
              We'll take a quick snapshot to detect your current emotional state.
            </p>
            <Button onClick={startCamera} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Camera className="w-4 h-4 mr-2" /> Start Scan
            </Button>
          </div>
        )}

        {/* Scanning state */}
        {status === "scanning" && (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video ref={videoRef} className="w-full rounded-xl" muted playsInline />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
              <div className="absolute inset-0 border-4 border-emerald-400 rounded-xl animate-pulse pointer-events-none" />
            </div>
            <p className="text-center text-sm text-slate-500 animate-pulse">
              Analyzing your expression…
            </p>
          </div>
        )}

        {/* Result state */}
        {status === "done" && result && detected && (
          <div className="space-y-4">
            <div className="text-center py-4 bg-emerald-50 rounded-xl">
              <span className="text-5xl">{detected.emoji}</span>
              <p className={`mt-2 text-xl font-semibold ${detected.color}`}>{detected.label}</p>
              <p className="text-sm text-slate-500 mt-1">Confidence: {result.confidence}%</p>
            </div>

            {/* Top 3 emotion breakdown */}
            <div className="space-y-2">
              {Object.entries(result.allScores)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([emotion, score]) => {
                  const info = EMOTION_LABELS[emotion as DetectedEmotion]
                  return (
                    <div key={emotion} className="flex items-center gap-2">
                      <span className="text-lg w-6">{info.emoji}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.round(score * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-8 text-right">
                        {Math.round(score * 100)}%
                      </span>
                    </div>
                  )
                })}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => onEmotionDetected(result)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Use This Result
              </Button>
              <Button variant="outline" onClick={retry} className="px-3">
                <RefreshCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div className="space-y-3 text-center">
            <p className="text-sm text-red-500">{errorMsg}</p>
            <Button variant="outline" onClick={retry}>
              <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
            </Button>
          </div>
        )}

        {/* Skip option */}
        {onSkip && status !== "scanning" && status !== "done" && (
          <button
            onClick={onSkip}
            className="w-full text-xs text-slate-400 hover:text-slate-600 underline text-center"
          >
            Skip — I'll answer manually
          </button>
        )}
      </CardContent>
    </Card>
  )
}