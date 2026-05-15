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

  let cycleTimeSpent = 0
  if (currentPhase === "inhale") {
    cycleTimeSpent = 4 - timeRemaining
  } else if (currentPhase === "hold") {
    cycleTimeSpent = 4 + (2 - timeRemaining)
  } else if (currentPhase === "exhale") {
    cycleTimeSpent = 6 + (4 - timeRemaining)
  }
  
  // Calculate progress for the current cycle (completes 1 full circle per cycle)
  const progress = Math.min(1, Math.max(0, cycleTimeSpent / 9))
  const isResetting = progress === 0

  const getPhaseMainText = () => {
    switch (currentPhase) {
      case "inhale": return "Inhale"
      case "hold": return "Hold"
      case "exhale": return "Exhale"
    }
  }

  const getPhaseSubText = () => {
    switch (currentPhase) {
      case "inhale": return "Breathe in slowly and deeply"
      case "hold": return "Hold your breath steadily"
      case "exhale": return "Breathe out slowly and completely"
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex flex-col items-center justify-center font-sans relative overflow-hidden">
      {/* SVASTYA Title */}
      <div className="absolute top-12 left-0 right-0 text-center">
        <h1 className="text-sm tracking-[0.5em] text-[#3B3F70] font-medium uppercase">
          Svastya
        </h1>
      </div>

      {!isActive && !isComplete && (
        <div className="flex flex-col items-center text-center space-y-8 z-20 max-w-md px-4">
           <h1 className="text-2xl font-medium text-[#3B3F70]">Take this time to center yourself</h1>
           <Button onClick={startBreathing} className="bg-[#6B7BF5] hover:bg-[#5A6EF6] text-white px-8 py-3 rounded-full shadow-lg shadow-[#6B7BF5]/30 transition-all text-lg">
             Begin Breathing Exercise
           </Button>
        </div>
      )}

      {isActive && (
        <div className="relative flex flex-col items-center justify-center mt-8 w-full max-w-md">
          {/* Orb and Arc Container */}
          <div className="relative flex items-center justify-center w-[340px] h-[340px]">
            {/* Progress Arc */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="48"
                  fill="none"
                  stroke="#6B7BF5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="301.59"
                  strokeDashoffset={301.59 - (301.59 * progress)}
                  className={`ease-linear ${isResetting ? 'transition-none' : 'transition-all duration-1000'}`}
                />
                <g className={`origin-center ease-linear ${isResetting ? 'transition-none' : 'transition-transform duration-1000'}`} style={{ transform: `rotate(${360 * progress}deg)` }}>
                  <circle cx="98" cy="50" r="2.5" fill="#6B7BF5" />
                </g>
              </svg>
            </div>

            {/* Breathing Circle Container */}
            <div className="relative flex items-center justify-center w-48 h-48">
              <div
                className={`absolute inset-0 rounded-full bg-[#7A8CFF] blur-[35px] opacity-40 transition-transform duration-[4000ms] ease-in-out ${getCircleScale()}`}
              />
              <div
                className={`absolute inset-2 rounded-full bg-gradient-to-br from-[#A6B6FF] to-[#5A6EF6] opacity-80 backdrop-blur-md transition-transform duration-[4000ms] ease-in-out ${getCircleScale()}`}
              />
              <div
                className={`absolute inset-4 rounded-full bg-gradient-to-br from-[#8599FF] to-[#4659F5] shadow-[inset_0_0_50px_rgba(255,255,255,0.4)] transition-transform duration-[4000ms] ease-in-out ${getCircleScale()}`}
              />
              
              {/* Non-scaling Text Container */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                 <div className="flex flex-col items-center text-center text-white transition-opacity duration-500 opacity-100">
                   <div className="text-3xl font-normal tracking-wide mb-1 drop-shadow-sm">
                     {getPhaseMainText()}
                   </div>
                   <div className="text-xs font-light text-white/90 max-w-[140px] leading-snug drop-shadow-sm">
                     {getPhaseSubText()}
                   </div>
                 </div>
              </div>
            </div>
          </div>
          
          {/* Cycle Indicator */}
          <div className="mt-16 flex flex-col items-center space-y-4 z-20">
            <div className="text-[#3B3F70] font-medium text-[15px]">
              Cycle {cycleCount + 1} of 3
            </div>
            <div className="flex items-center space-x-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${
                    i <= cycleCount ? "bg-[#6B7BF5]" : "bg-[#D1D5FC]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {isComplete && (
        <div className="flex flex-col items-center space-y-8 z-30">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#A6B6FF] to-[#6B7BF5] flex items-center justify-center shadow-[0_0_40px_rgba(107,123,245,0.4)]">
            <span className="text-white text-4xl font-light">✓</span>
          </div>
          <p className="text-lg text-[#3B3F70] font-medium">Well done. You're ready to continue.</p>
          <Button
            onClick={() => router.push("/home")}
            className="bg-[#6B7BF5] hover:bg-[#5A6EF6] text-white px-8 py-3 rounded-full shadow-lg shadow-[#6B7BF5]/30 transition-all"
          >
            Continue to Platform
          </Button>
        </div>
      )}
    </div>
  )
}
