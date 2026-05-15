"use client"

import { Suspense } from "react"
import PracticeGuideContent from "./practice-guide-content"

export default function PracticeGuidePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
          <div className="text-slate-600">Loading...</div>
        </div>
      }
    >
      <PracticeGuideContent />
    </Suspense>
  )
}
