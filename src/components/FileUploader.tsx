import { useState, useRef } from 'react'
import { Upload, FileCheck } from 'lucide-react'

interface FileUploaderProps {
  onFileLoad: (fileName: string, bytes: Uint8Array) => void
}

export function FileUploader({ onFileLoad }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.sav')) {
      alert('请选择 .sav 格式的存档文件')
      return
    }

    try {
      const arrayBuffer = await file.arrayBuffer()
      const bytes = new Uint8Array(arrayBuffer)
      onFileLoad(file.name, bytes)
    } catch (error) {
      console.error('文件读取失败:', error)
      alert('文件读取失败')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="card">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-blue-400" />
        选择存档文件
      </h2>
      
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".sav"
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            transition-all duration-200
            ${isDragging 
              ? 'bg-blue-500/20 scale-110' 
              : 'bg-slate-700/50'
            }
          `}>
            {isDragging ? (
              <FileCheck className="w-8 h-8 text-blue-400" />
            ) : (
              <Upload className="w-8 h-8 text-slate-400" />
            )}
          </div>
          
          <div>
            <p className="text-white font-medium">
              {isDragging ? '释放以上传文件' : '点击或拖拽上传存档'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              支持 .sav 格式的存档文件
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
        <span>支持 Dave the Diver 存档</span>
      </div>
    </div>
  )
}
