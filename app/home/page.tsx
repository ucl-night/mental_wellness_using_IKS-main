"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, User, Calendar, ArrowRight, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

const GenderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="10" r="4"></circle>
    <path d="M12 14v7"></path>
    <path d="M9 18h6"></path>
    <path d="M15 3h4v4"></path>
    <path d="M14.5 7.5l4.5-4.5"></path>
  </svg>
)

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
    <div className="min-h-screen bg-[#F8F9FF] relative overflow-hidden font-sans">
      {/* Background Arch */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[850px] h-[85vh] bg-white rounded-t-[400px] shadow-[0_0_100px_rgba(107,123,245,0.05)] -z-10" />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 px-8 py-6 flex justify-between items-start z-10 w-full">
        <div className="flex items-center space-x-3">
          <div className="text-[#8B98FF]">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-[13px] tracking-[0.4em] text-[#2D3159] font-medium uppercase">
            Svastya
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-white shadow-sm text-[13px]">
          <div className="text-[#8B98FF]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-[#7A7E9F]">
            Ancient wisdom. <span className="text-[#6B7BF5] font-medium">Modern care.</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-screen px-4 pt-16">
        
        {/* Title Section */}
        <div className="text-center space-y-5 relative mt-8">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-[#D1D5FC]">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-5xl md:text-[64px] text-[#2D3159] leading-[1.1] tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            <div className="mb-2">Your Mind</div>
            <div>Deserves <span className="text-[#8B98FF]">Care</span></div>
          </h1>
          
          <div className="flex justify-center my-6">
            <div className="w-4 h-4 text-[#D1D5FC] opacity-60">
              <Sparkles className="w-full h-full" />
            </div>
          </div>

          <p className="text-[#7A7E9F] text-[15px] md:text-base max-w-[380px] mx-auto leading-relaxed font-light">
            You're in a safe space.<br />
            Get personalized wellness guidance blending<br />
            modern AI with ancient Indian wisdom.
          </p>
        </div>

        {/* Form Card */}
        <Card className="w-full max-w-[420px] mx-auto mt-10 shadow-[0_20px_60px_-15px_rgba(107,123,245,0.1)] border border-white/80 bg-white/95 backdrop-blur-xl rounded-[32px] overflow-hidden z-10">
          <CardContent className="p-2 sm:p-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              
              <div className="px-4 py-2">
                <div className="flex items-center py-2 border-b border-[#F0F2FF]">
                  <div className="w-10 h-10 rounded-full bg-[#F5F6FF] flex items-center justify-center text-[#8B98FF] mr-4 shrink-0">
                     <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                     <Input
                        id="name"
                        type="text"
                        placeholder="What should we call you?"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="border-0 shadow-none focus-visible:ring-0 p-0 text-[#3B3F70] placeholder:text-[#A0A4C0] font-medium h-auto text-[15px] bg-transparent"
                        required
                     />
                  </div>
                </div>

                <div className="flex items-center py-4 border-b border-[#F0F2FF]">
                  <div className="w-10 h-10 rounded-full bg-[#F5F6FF] flex items-center justify-center text-[#8B98FF] mr-4 shrink-0">
                     <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                     <Input
                        id="age"
                        type="number"
                        placeholder="Your age"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="border-0 shadow-none focus-visible:ring-0 p-0 text-[#3B3F70] placeholder:text-[#A0A4C0] font-medium h-auto text-[15px] bg-transparent"
                        required
                     />
                  </div>
                </div>

                <div className="flex items-center py-4 border-b border-[#F0F2FF] mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#F5F6FF] flex items-center justify-center text-[#8B98FF] mr-4 shrink-0">
                     <GenderIcon />
                  </div>
                  <div className="flex-1 relative">
                     <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })} required>
                       <SelectTrigger className="border-0 shadow-none focus:ring-0 p-0 h-auto text-[#3B3F70] font-medium bg-transparent w-full text-[15px]">
                         <SelectValue placeholder={<span className="text-[#A0A4C0]">Select gender</span>} />
                       </SelectTrigger>
                       <SelectContent className="rounded-xl border-[#E5E8FF] shadow-xl">
                         <SelectItem value="male" className="rounded-lg">Male</SelectItem>
                         <SelectItem value="female" className="rounded-lg">Female</SelectItem>
                         <SelectItem value="other" className="rounded-lg">Other</SelectItem>
                         <SelectItem value="prefer-not-to-say" className="rounded-lg">Prefer not to say</SelectItem>
                       </SelectContent>
                     </Select>
                  </div>
                </div>
              </div>

              <div className="px-2 pb-2">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#8B98FF] to-[#6B7BF5] hover:from-[#7A8CFF] hover:to-[#5A6EF6] text-white font-medium py-7 rounded-[20px] transition-all shadow-[0_10px_30px_rgba(107,123,245,0.3)] text-base flex items-center justify-center group"
                >
                  Begin Your Journey
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <div className="text-center pb-2 pt-1">
                <p className="text-[13px] text-[#A0A4C0] font-medium flex items-center justify-center">
                  <Shield className="w-[14px] h-[14px] mr-1.5 text-[#8B98FF]" />
                  Your data stays private with us
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
