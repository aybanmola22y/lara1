"use client"

import { useState, useRef, useEffect } from 'react'
import { Download, X, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Type, Sparkles, Heart, Star, Smile, Sun, Moon, Cloud, Zap, Gift, Music, Camera } from "lucide-react"

interface PhotoEditorProps {
  photo: string
  onClose: () => void
  onSave: (editedPhoto: string) => void
}

interface Sticker {
  id: string
  emoji: string
  x: number
  y: number
  size: number
  rotation: number
}

interface TextElement {
  id: string
  text: string
  x: number
  y: number
  size: number
  color: string
  font: string
  rotation: number
}

interface Filter {
  name: string
  style: string
  preview: string
}

const filters: Filter[] = [
  { name: 'Original', style: '', preview: 'brightness-100' },
  { name: 'Vintage', style: 'sepia(100%) contrast(110%) brightness(90%)', preview: 'sepia' },
  { name: 'Grayscale', style: 'grayscale(100%)', preview: 'grayscale' },
  { name: 'Warm', style: 'sepia(30%) saturate(150%) brightness(110%)', preview: 'sepia-[.3]' },
  { name: 'Cool', style: 'hue-rotate(180deg) saturate(120%)', preview: 'hue-rotate-180' },
  { name: 'Bright', style: 'brightness(120%) contrast(110%)', preview: 'brightness-125' },
  { name: 'Dark', style: 'brightness(80%) contrast(120%)', preview: 'brightness-75' },
  { name: 'Retro', style: 'sepia(50%) hue-rotate(30deg) saturate(150%)', preview: 'sepia-[.5] hue-rotate-30' },
  { name: 'Dramatic', style: 'contrast(150%) brightness(110%) saturate(120%)', preview: 'contrast-150' },
]

const frames = [
  { name: 'None', style: 'border-none' },
  { name: 'White', style: 'border-8 border-white' },
  { name: 'Black', style: 'border-8 border-black' },
  { name: 'Gold', style: 'border-8 border-yellow-400' },
  { name: 'Polaroid', style: 'border-8 border-white border-b-16' },
  { name: 'Rounded', style: 'border-4 border-white rounded-2xl' },
  { name: 'Vintage', style: 'border-4 border-amber-800 rounded-lg' },
  { name: 'Neon', style: 'border-4 border-pink-500 rounded-lg shadow-lg shadow-pink-500/50' },
]

const stickers = [
  { emoji: '❤️', name: 'Heart' },
  { emoji: '⭐', name: 'Star' },
  { emoji: '😊', name: 'Smile' },
  { emoji: '☀️', name: 'Sun' },
  { emoji: '🌙', name: 'Moon' },
  { emoji: '☁️', name: 'Cloud' },
  { emoji: '⚡', name: 'Zap' },
  { emoji: '🎁', name: 'Gift' },
  { emoji: '🎵', name: 'Music' },
  { emoji: '📸', name: 'Camera' },
  { emoji: '✨', name: 'Sparkles' },
  { emoji: '🎉', name: 'Party' },
  { emoji: '🌈', name: 'Rainbow' },
  { emoji: '🔥', name: 'Fire' },
  { emoji: '💎', name: 'Diamond' },
  { emoji: '🌸', name: 'Flower' },
]

const fonts = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Impact', value: 'Impact, sans-serif' },
  { name: 'Comic Sans', value: 'Comic Sans MS, cursive' },
  { name: 'Times', value: 'Times New Roman, serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
]

const colors = [
  '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', 
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#FFD700', '#C0C0C0'
]

export default function PhotoEditor({ photo, onClose, onSave }: PhotoEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedFilter, setSelectedFilter] = useState<string>('')
  const [selectedFrame, setSelectedFrame] = useState<string>('border-none')
  const [appliedStickers, setAppliedStickers] = useState<Sticker[]>([])
  const [textElements, setTextElements] = useState<TextElement[]>([])
  const [rotation, setRotation] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [draggedType, setDraggedType] = useState<'sticker' | 'text' | null>(null)
  const [newText, setNewText] = useState('')
  const [selectedTextColor, setSelectedTextColor] = useState('#FFFFFF')
  const [selectedFont, setSelectedFont] = useState('Arial, sans-serif')
  const [selectedTextSize, setSelectedTextSize] = useState(32)
  const [activeTab, setActiveTab] = useState<'filters' | 'frames' | 'stickers' | 'text'>('filters')

  const handleSave = () => {
    // Create the final edited image
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = 800
      canvas.height = 800
      
      // Apply transformations
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      if (isFlipped) {
        ctx.scale(-1, 1)
      }
      
      // Apply filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${selectedFilter}`
      
      // Draw image
      const size = Math.min(img.width, img.height)
      const offsetX = (img.width - size) / 2
      const offsetY = (img.height - size) / 2
      ctx.drawImage(img, offsetX, offsetY, size, size, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height)
      
      ctx.restore()
      
      // Draw stickers
      appliedStickers.forEach(sticker => {
        ctx.save()
        ctx.translate(sticker.x, sticker.y)
        ctx.rotate((sticker.rotation * Math.PI) / 180)
        ctx.font = `${sticker.size}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(sticker.emoji, 0, 0)
        ctx.restore()
      })
      
      // Draw text
      textElements.forEach(text => {
        ctx.save()
        ctx.translate(text.x, text.y)
        ctx.rotate((text.rotation * Math.PI) / 180)
        ctx.font = `${text.size}px ${text.font}`
        ctx.fillStyle = text.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text.text, 0, 0)
        ctx.restore()
      })
      
      // Convert to data URL and save
      const editedPhoto = canvas.toDataURL('image/jpeg', 0.9)
      onSave(editedPhoto)
    }
    img.src = photo
  }

  const handleDownload = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = 800
      canvas.height = 800
      
      // Apply transformations
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      if (isFlipped) {
        ctx.scale(-1, 1)
      }
      
      // Apply filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${selectedFilter}`
      
      // Draw image
      const size = Math.min(img.width, img.height)
      const offsetX = (img.width - size) / 2
      const offsetY = (img.height - size) / 2
      ctx.drawImage(img, offsetX, offsetY, size, size, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height)
      
      ctx.restore()
      
      // Draw stickers
      appliedStickers.forEach(sticker => {
        ctx.save()
        ctx.translate(sticker.x, sticker.y)
        ctx.rotate((sticker.rotation * Math.PI) / 180)
        ctx.font = `${sticker.size}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(sticker.emoji, 0, 0)
        ctx.restore()
      })
      
      // Draw text
      textElements.forEach(text => {
        ctx.save()
        ctx.translate(text.x, text.y)
        ctx.rotate((text.rotation * Math.PI) / 180)
        ctx.font = `${text.size}px ${text.font}`
        ctx.fillStyle = text.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text.text, 0, 0)
        ctx.restore()
      })
      
      // Download
      const link = document.createElement('a')
      link.download = `snapjoy-edited-${Date.now()}.jpg`
      link.href = canvas.toDataURL('image/jpeg', 0.9)
      link.click()
    }
    img.src = photo
  }

  const addText = () => {
    if (!newText.trim()) return
    
    const newTextElement: TextElement = {
      id: Date.now().toString(),
      text: newText,
      x: 200,
      y: 200,
      size: selectedTextSize,
      color: selectedTextColor,
      font: selectedFont,
      rotation: 0
    }
    setTextElements([...textElements, newTextElement])
    setNewText('')
  }

  const addSticker = (emoji: string) => {
    const newSticker: Sticker = {
      id: Date.now().toString(),
      emoji,
      x: 200,
      y: 200,
      size: 48,
      rotation: 0
    }
    setAppliedStickers([...appliedStickers, newSticker])
  }

  const removeSticker = (id: string) => {
    setAppliedStickers(appliedStickers.filter(s => s.id !== id))
  }

  const removeText = (id: string) => {
    setTextElements(textElements.filter(t => t.id !== id))
  }

  const handleDragStart = (e: React.MouseEvent, id: string, type: 'sticker' | 'text') => {
    e.preventDefault()
    setDraggedItem(id)
    setDraggedType(type)
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggedItem) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    if (draggedType === 'sticker') {
      const sticker = appliedStickers.find(s => s.id === draggedItem)
      if (sticker) {
        setAppliedStickers(appliedStickers.map(s => 
          s.id === draggedItem ? { ...s, x, y } : s
        ))
      }
    } else if (draggedType === 'text') {
      const text = textElements.find(t => t.id === draggedItem)
      if (text) {
        setTextElements(textElements.map(t => 
          t.id === draggedItem ? { ...t, x, y } : t
        ))
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDraggedItem(null)
    setDraggedType(null)
  }

  const imageStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${selectedFilter}`,
    transform: `rotate(${rotation}deg) ${isFlipped ? 'scaleX(-1)' : ''}`
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-7xl h-full max-h-[90vh] flex">
        {/* Preview Area */}
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="relative">
            <div 
              className={`relative w-96 h-96 ${selectedFrame} overflow-hidden rounded-lg cursor-move`}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                src={photo}
                alt="Preview"
                className="w-full h-full object-cover"
                style={imageStyle}
              />
              
              {/* Stickers */}
              {appliedStickers.map(sticker => (
                <div
                  key={sticker.id}
                  className="absolute cursor-move select-none"
                  style={{
                    left: sticker.x - 24,
                    top: sticker.y - 24,
                    fontSize: sticker.size,
                    transform: `rotate(${sticker.rotation}deg)`
                  }}
                  onMouseDown={(e) => handleDragStart(e, sticker.id, 'sticker')}
                >
                  {sticker.emoji}
                  <button
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                    onClick={() => removeSticker(sticker.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {/* Text Elements */}
              {textElements.map(text => (
                <div
                  key={text.id}
                  className="absolute cursor-move select-none"
                  style={{
                    left: text.x - 50,
                    top: text.y - 20,
                    fontSize: text.size,
                    fontFamily: text.font,
                    color: text.color,
                    transform: `rotate(${text.rotation}deg)`,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                  }}
                  onMouseDown={(e) => handleDragStart(e, text.id, 'text')}
                >
                  {text.text}
                  <button
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                    onClick={() => removeText(text.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-96 bg-gray-800 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-xl font-bold">Photo Editor</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mb-4 bg-gray-700 rounded-lg p-1">
            {(['filters', 'frames', 'stickers', 'text'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'filters' && (
            <div>
              <h3 className="text-white font-semibold mb-3">Filters</h3>
              <div className="grid grid-cols-3 gap-2">
                {filters.map(filter => (
                  <button
                    key={filter.name}
                    onClick={() => setSelectedFilter(filter.style)}
                    className={`p-2 rounded text-xs ${
                      selectedFilter === filter.style
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className={`w-full h-12 rounded mb-1 ${filter.preview} bg-gradient-to-br from-purple-400 to-pink-400`} />
                    {filter.name}
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-gray-300 text-sm">Brightness</label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Contrast</label>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Saturation</label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'frames' && (
            <div>
              <h3 className="text-white font-semibold mb-3">Frames</h3>
              <div className="grid grid-cols-2 gap-2">
                {frames.map(frame => (
                  <button
                    key={frame.name}
                    onClick={() => setSelectedFrame(frame.style)}
                    className={`p-2 rounded text-xs ${
                      selectedFrame === frame.style
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <div className={`w-full h-8 rounded ${frame.style} bg-gray-600`} />
                    {frame.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stickers' && (
            <div>
              <h3 className="text-white font-semibold mb-3">Stickers</h3>
              <div className="grid grid-cols-4 gap-2">
                {stickers.map(sticker => (
                  <button
                    key={sticker.name}
                    onClick={() => addSticker(sticker.emoji)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-2xl"
                    title={sticker.name}
                  >
                    {sticker.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'text' && (
            <div>
              <h3 className="text-white font-semibold mb-3">Add Text</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm">Text</label>
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Enter your text..."
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm">Font</label>
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                  >
                    {fonts.map(font => (
                      <option key={font.value} value={font.value}>{font.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 text-sm">Size</label>
                  <input
                    type="range"
                    min="16"
                    max="72"
                    value={selectedTextSize}
                    onChange={(e) => setSelectedTextSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-gray-400 text-sm">{selectedTextSize}px</span>
                </div>

                <div>
                  <label className="text-gray-300 text-sm">Color</label>
                  <div className="grid grid-cols-5 gap-1 mt-1">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedTextColor(color)}
                        className={`w-8 h-8 rounded border-2 ${
                          selectedTextColor === color ? 'border-white' : 'border-gray-600'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={addText}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
                >
                  Add Text
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Download
            </button>
            <button
              onClick={handleSave}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold"
            >
              Save & Continue
            </button>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}