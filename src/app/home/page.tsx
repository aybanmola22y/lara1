"use client"

import { useState, useRef, useEffect } from 'react'
import { Camera, Settings, Download, RefreshCw, RotateCcw } from "lucide-react"

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user')
  const [numPhotos, setNumPhotos] = useState(3)
  const [timerDuration, setTimerDuration] = useState(3)
  const [isCapturing, setIsCapturing] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [cameraFacing])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: cameraFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraReady(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Could not access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
  }

  const toggleCamera = () => {
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user')
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      
      // Set canvas to square aspect ratio
      const size = Math.min(video.videoWidth, video.videoHeight)
      canvas.width = size
      canvas.height = size
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Mirror the image for front camera
        if (cameraFacing === 'user') {
          ctx.translate(canvas.width, 0)
          ctx.scale(-1, 1)
        }
        
        // Draw centered square crop
        const offsetX = (video.videoWidth - size) / 2
        const offsetY = (video.videoHeight - size) / 2
        ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size)
        
        const imageData = canvas.toDataURL('image/jpeg', 0.9)
        return imageData
      }
    }
    return null
  }

  const handleCameraClick = async () => {
    if (currentPhotoIndex >= numPhotos) {
      // Reset if all photos are taken
      setPhotos([])
      setCurrentPhotoIndex(0)
      return
    }

    setIsCapturing(true)
    
    // Countdown
    for (let j = timerDuration; j > 0; j--) {
      setCountdown(j)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    setCountdown(0)
    
    // Take photo
    const photo = capturePhoto()
    if (photo) {
      const newPhotos = [...photos]
      newPhotos[currentPhotoIndex] = photo
      setPhotos(newPhotos)
      setCurrentPhotoIndex(currentPhotoIndex + 1)
      
      // Flash effect
      const flash = document.createElement('div')
      flash.className = 'fixed inset-0 bg-white z-50 pointer-events-none'
      flash.style.animation = 'flash 0.3s ease-out'
      document.body.appendChild(flash)
      setTimeout(() => flash.remove(), 300)
    }
    
    setIsCapturing(false)
  }

  const retakeAll = () => {
    setPhotos([])
    setCurrentPhotoIndex(0)
    setCountdown(0)
  }

  const downloadCollage = () => {
    if (photos.length === numPhotos) {
      photos.forEach((photo, index) => {
        const link = document.createElement('a')
        link.href = photo
        link.download = `snapjoy-${index + 1}-${Date.now()}.jpg`
        link.click()
      })
    }
  }

  const continueWithSettings = () => {
    setShowSettings(false)
  }

  const getGridClass = () => {
    switch (numPhotos) {
      case 3: return 'grid-cols-2 grid-rows-2'
      case 4: return 'grid-cols-2 grid-rows-2'
      case 6: return 'grid-cols-3 grid-rows-2'
      default: return 'grid-cols-2 grid-rows-2'
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <style jsx>{`
        @keyframes flash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      {/* Header */}
      <div className="bg-gray-800 p-4">
        <h1 className="text-2xl font-bold text-white text-center">Lara1</h1>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-4 gap-8">
        {/* Camera Section - Big Square */}
        <div className="relative w-full lg:w-1/2 flex justify-center">
          <div className="relative w-80 h-80 md:w-96 md:h-96">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover rounded-xl bg-black border-4 border-gray-700 shadow-2xl"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Square Camera Overlay */}
            <div className="absolute inset-0 rounded-xl border-4 border-dashed border-white/20 pointer-events-none">
              {countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl font-bold text-white animate-pulse drop-shadow-lg">
                    {countdown}
                  </div>
                </div>
              )}
              {isCapturing && !countdown && (
                <div className="absolute top-4 left-4 text-white/80 text-sm bg-black/50 px-3 py-1 rounded">
                  Photo {currentPhotoIndex + 1} of {numPhotos}
                </div>
              )}
              {!isCapturing && !countdown && currentPhotoIndex < numPhotos && (
                <div className="absolute top-4 left-4 text-white/80 text-sm bg-black/50 px-3 py-1 rounded">
                  Ready to capture
                </div>
              )}
              {!isCapturing && currentPhotoIndex >= numPhotos && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-xl font-bold"></div>
                </div>
              )}
            </div>
            
            {/* Decorative frame */}
            <div className="absolute -inset-2 rounded-xl border-2 border-purple-400/30 pointer-events-none"></div>
          </div>
        </div>

        {/* Photo Collage Section */}
        <div className="lg:w-1/2 w-full max-w-2xl">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white text-lg font-semibold mb-4 text-center">
              Photo Collage ({currentPhotoIndex}/{numPhotos})
            </h3>
            
            <div className={`grid ${getGridClass()} gap-2 aspect-square`}>
              {Array.from({ length: numPhotos }).map((_, index) => (
                <div
                  key={index}
                  className={`relative bg-gray-700 rounded-lg overflow-hidden ${
                    index === 0 && numPhotos === 3 ? 'col-span-2' : ''
                  }`}
                >
                  {photos[index] ? (
                    <img
                      src={photos[index]}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <Camera className="h-8 w-8" />
                    </div>
                  )}
                  
                  {/* Photo number overlay */}
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-gray-800 p-6">
        <div className="flex items-center justify-center space-x-8">
          {/* Settings Button */}
          <button
            className="p-4 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors"
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            <Settings className="h-6 w-6" />
          </button>

          {/* Camera Button - Now directly captures */}
          <button
            className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed border-4 border-white/20"
            onClick={handleCameraClick}
            disabled={!isCameraReady || isCapturing || currentPhotoIndex >= numPhotos}
          >
            {isCapturing ? (
              <div className="h-10 w-10 mx-auto flex items-center justify-center">
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <Camera className="h-10 w-10 mx-auto" />
            )}
          </button>

          {/* Download Button */}
          <button
            className="p-4 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={downloadCollage}
            disabled={photos.length !== numPhotos}
            title="Download"
          >
            <Download className="h-6 w-6" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-6 bg-gray-700 rounded-lg max-w-md mx-auto">
            <h3 className="text-white font-semibold text-lg mb-4">Capture Settings</h3>
            
            <div className="space-y-6">
              {/* Camera Flip */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Camera</label>
                <button
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors flex items-center justify-center"
                  onClick={toggleCamera}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Flip {cameraFacing === 'user' ? 'Back' : 'Front'}
                </button>
              </div>

              {/* Number of Photos */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Number of Photos</label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 4, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setNumPhotos(num)
                        setPhotos([])
                        setCurrentPhotoIndex(0)
                      }}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        numPhotos === num
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {num} pics
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer Duration */}
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Timer Duration</label>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 4, 5, 6, 10].map((seconds) => (
                    <button
                      key={seconds}
                      onClick={() => setTimerDuration(seconds)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        timerDuration === seconds
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                    >
                      {seconds} s
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-md transition-colors"
                onClick={() => setShowSettings(false)}
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}