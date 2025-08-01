"use client"

import { useState } from 'react'
import { Camera } from "lucide-react"
import { useRouter } from 'next/navigation'

// Simple Button component
const Button = ({ 
  children, 
  className = "", 
  onClick, 
  size = "default",
  disabled = false,
  ...props 
}: { 
  children: React.ReactNode
  className?: string
  onClick?: () => void
  size?: "default" | "lg"
  disabled?: boolean
}) => {
  const sizeClasses = size === "lg" 
    ? "px-8 py-4 text-lg" 
    : "px-4 py-2"
  
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-75 disabled:cursor-not-allowed ${sizeClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default function LandingPage() {
  const [isStarting, setIsStarting] = useState(false)
  const router = useRouter()

  const handleStart = () => {
    setIsStarting(true)
    setTimeout(() => {
      router.push('/home')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Lara1
          </h1>
          <p className="text-lg text-gray-600 font-light">
            Created by Aivanne
          </p>
        </div>

        <div className="space-y-4">
          <blockquote className="text-xl md:text-2xl text-gray-700 italic leading-relaxed">
            &ldquo;Every picture tells a story. Let&apos;s create yours together.&rdquo;
          </blockquote>
        </div>

        <div className="pt-8">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={handleStart}
            disabled={isStarting}
          >
            <Camera className={`mr-2 h-5 w-5 ${isStarting ? 'animate-pulse' : ''}`} />
            {isStarting ? 'Starting...' : 'Start Photobooth'}
          </Button>
        </div>

        <div className="flex justify-center space-x-2 pt-8">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      <footer className="absolute bottom-4 text-center text-sm text-gray-400">
        <p>© 2025 Lara1. Ready to capture your smile!</p>
      </footer>
    </div>
  )
}
