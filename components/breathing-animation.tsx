"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface BreathingAnimationProps {
  onComplete?: () => void
  duration?: number // in seconds
}

export function BreathingAnimation({ onComplete, duration = 60 }: BreathingAnimationProps) {
  const [isInhaling, setIsInhaling] = useState(true)
  const [showText, setShowText] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(duration)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsComplete(true)
          clearInterval(countdownInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    const breathingCycle = () => {
      // Inhale for 4 seconds
      setIsInhaling(true)
      setShowText(true)

      setTimeout(() => {
        // Hold for 1 second
        setShowText(false)

        setTimeout(() => {
          // Exhale for 4 seconds
          setIsInhaling(false)
          setShowText(true)

          setTimeout(() => {
            setShowText(false)
          }, 3000)
        }, 1000)
      }, 4000)
    }

    // Start the cycle
    breathingCycle()

    // Repeat every 9 seconds (4 inhale + 1 hold + 4 exhale)
    const interval = setInterval(breathingCycle, 9000)

    return () => {
      clearInterval(interval)
      clearInterval(countdownInterval)
    }
  }, [duration])

  useEffect(() => {
    if (isComplete && onComplete) {
      onComplete()
    }
  }, [isComplete, onComplete])

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-6 text-center">
        <div className="text-3xl font-bold text-emerald-700 mb-2">
          {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
        </div>
        <p className="text-sm text-slate-600">Take this time to breathe and center yourself</p>
      </div>

      {/* Breathing Circle */}
      <div className="relative">
        <div
          className={`w-32 h-32 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500 opacity-30 transition-all duration-4000 ease-in-out ${
            isInhaling ? "scale-150" : "scale-100"
          }`}
        />
        <div
          className={`absolute inset-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-50 transition-all duration-4000 ease-in-out ${
            isInhaling ? "scale-125" : "scale-100"
          }`}
        />
        <div
          className={`absolute inset-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 transition-all duration-4000 ease-in-out ${
            isInhaling ? "scale-110" : "scale-100"
          }`}
        />
      </div>

      {/* Breathing Text */}
      <div className="mt-8 h-8 flex items-center justify-center">
        {showText && (
          <p
            className={`text-lg font-medium transition-opacity duration-500 ${
              isInhaling ? "text-emerald-700" : "text-emerald-600"
            }`}
          >
            {isInhaling ? "Breathe In..." : "Breathe Out..."}
          </p>
        )}
      </div>

      {isComplete && (
        <div className="mt-8">
          <Button onClick={onComplete} className="bg-emerald-600 hover:bg-emerald-700 px-8 py-3 text-lg">
            Continue
          </Button>
        </div>
      )}
    </div>
  )
}
