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

  const totalCycles = Math.max(1, Math.ceil(duration / 9))
  const currentCycle = Math.min(totalCycles, totalCycles - Math.floor((timeRemaining - 1) / 9))
  const progress = duration > 0 ? 1 - timeRemaining / duration : 0

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[600px] bg-[#F8F9FF] rounded-3xl relative font-sans overflow-hidden">
      {/* SVASTYA Title */}
      <div className="absolute top-12 left-0 right-0 text-center">
        <h1 className="text-sm tracking-[0.5em] text-[#3B3F70] font-medium uppercase">
          Svastya
        </h1>
      </div>

      {/* Main Content Container */}
      <div className="relative flex flex-col items-center justify-center mt-8">
        {/* Progress Arc */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] pointer-events-none z-10">
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
              className="transition-all duration-1000 ease-linear"
            />
            <g className="transition-transform duration-1000 ease-linear origin-center" style={{ transform: `rotate(${360 * progress}deg)` }}>
              <circle cx="98" cy="50" r="2.5" fill="#6B7BF5" />
            </g>
          </svg>
        </div>

        {/* Breathing Circle Container */}
        <div className="relative flex items-center justify-center w-72 h-72">
          {/* Outer glow layer */}
          <div
            className={`absolute inset-0 rounded-full bg-[#7A8CFF] blur-[35px] opacity-40 transition-transform duration-4000 ease-in-out ${isInhaling ? "scale-125" : "scale-90"
              }`}
          />
          {/* Middle layer */}
          <div
            className={`absolute inset-3 rounded-full bg-gradient-to-br from-[#A6B6FF] to-[#5A6EF6] opacity-80 backdrop-blur-md transition-transform duration-4000 ease-in-out ${isInhaling ? "scale-110" : "scale-95"
              }`}
          />
          {/* Inner Layer */}
          <div
            className={`absolute inset-6 rounded-full bg-gradient-to-br from-[#8599FF] to-[#4659F5] shadow-[inset_0_0_50px_rgba(255,255,255,0.4)] transition-transform duration-4000 ease-in-out ${isInhaling ? "scale-105" : "scale-100"
              }`}
          />

          {/* Non-scaling Text Container */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className={`transition-opacity duration-500 flex flex-col items-center text-center text-white ${showText ? "opacity-100" : "opacity-0"}`}>
              <div className="text-[38px] font-normal tracking-wide mb-1 drop-shadow-sm">
                {isInhaling ? "Inhale" : "Exhale"}
              </div>
              <div className="text-[14px] font-light text-white/90 max-w-[160px] leading-snug drop-shadow-sm">
                {isInhaling ? "Breathe in slowly and deeply" : "Breathe out slowly and completely"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cycle Indicator */}
      <div className="mt-20 flex flex-col items-center space-y-4 z-20">
        <div className="text-[#3B3F70] font-medium text-[15px]">
          Cycle {currentCycle} of {totalCycles}
        </div>
        <div className="flex items-center space-x-3">
          {Array.from({ length: totalCycles }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${i < currentCycle ? "bg-[#6B7BF5]" : "bg-[#D1D5FC]"
                }`}
            />
          ))}
        </div>
      </div>

      {isComplete && (
        <div className="absolute bottom-8 z-30">
          <Button onClick={onComplete} className="bg-[#6B7BF5] hover:bg-[#5A6EF6] text-white rounded-full px-8 py-3 shadow-lg shadow-[#6B7BF5]/30 transition-all">
            Continue
          </Button>
        </div>
      )}
    </div>
  )
}
