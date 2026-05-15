"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Navigate to classification system
    router.push("/classify")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 leading-tight">Your Mind Deserves Care</h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            You're in a safe space. Get personalized wellness guidance blending modern AI with ancient Indian wisdom.
          </p>

          <Card className="max-w-md mx-auto mt-12 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-left">
                  <Label htmlFor="name" className="text-slate-700 font-medium">
                    What should we call you?
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="text-left">
                  <Label htmlFor="age" className="text-slate-700 font-medium">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Your age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="mt-1 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="text-left">
                  <Label htmlFor="gender" className="text-slate-700 font-medium">
                    Gender
                  </Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger className="mt-1 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Begin Your Journey
                </Button>

                <p className="text-sm text-slate-500 text-center">
                  <Shield className="inline w-4 h-4 mr-1" />
                  Your data stays private with us
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* AI Guide Introduction */}
      <section className="py-20 px-4 bg-white"></section>

      {/* Indian Knowledge Systems */}
      <section className="py-20 px-4 bg-emerald-50"></section>

      {/* Accessibility Commitment */}
      <section className="py-20 px-4 bg-white"></section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-50 border-t border-slate-200"></footer>
    </div>
  )
}
