"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function BreathingExercisePage() {
  const router = useRouter()
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold" | "exhale">("inhale")
  const [cycleCount, setCycleCount] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(4)
  const [isComplete, setIsComplete] = useState(false)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev > 1) {
          return prev - 1
        }

        // Move to next phase
        if (currentPhase === "inhale") {
          setCurrentPhase("hold")
          return 2
        } else if (currentPhase === "hold") {
          setCurrentPhase("exhale")
          return 4
        } else {
          // Completed one full cycle
          const newCycleCount = cycleCount + 1
          setCycleCount(newCycleCount)

          if (newCycleCount >= 3) {
            setIsComplete(true)
            setIsActive(false)
            return 0
          }

          setCurrentPhase("inhale")
          return 4
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentPhase, cycleCount, isActive])

  const startBreathing = () => {
    setIsActive(true)
    setCurrentPhase("inhale")
    setTimeRemaining(4)
  }

  const getPhaseText = () => {
    switch (currentPhase) {
      case "inhale":
        return "Inhale..."
      case "hold":
        return "Hold..."
      case "exhale":
        return "Exhale..."
    }
  }

  const getCircleScale = () => {
    switch (currentPhase) {
      case "inhale":
        return "scale-150"
      case "hold":
        return "scale-150"
      case "exhale":
        return "scale-100"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col items-center justify-center px-4 leading-3">
      <div className="text-center space-y-8 max-w-md">
        <h1 className="text-2xl font-semibold text-slate-700 mb-2 leading-[5 ] leading-[5.75rem]">Take this time to center yourself</h1>

        {!isActive && !isComplete && (
          <Button onClick={startBreathing} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full">
            Begin Breathing Exercise
          </Button>
        )}

        {isActive && (
          <>
            <div className="relative flex items-center justify-center">
              <div
                className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 transition-transform duration-1000 ease-in-out ${getCircleScale()}`}
              />
            </div>

            <div className="space-y-4">
              <p className="text-xl font-medium text-slate-600">{getPhaseText()}</p>
              <p className="text-lg text-slate-500">{timeRemaining}</p>
              <p className="text-sm text-slate-400">Cycle {cycleCount + 1} of 3</p>
            </div>
          </>
        )}

        {isComplete && (
          <div className="space-y-6">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-green-300 to-green-500 flex items-center justify-center">
              <span className="text-white text-4xl">✓</span>
            </div>

            <p className="text-lg text-slate-600 mb-6">Well done. You're ready to continue.</p>

            <Button
              onClick={() => router.push("/home")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full"
            >
              Continue to Platform
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
