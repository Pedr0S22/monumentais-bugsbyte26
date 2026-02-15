"use client"

import { Camera, X, CloudUpload, Loader2 } from "lucide-react"
import { useState, useRef, ChangeEvent } from "react"

interface CameraScreenProps {
  // Alterado para receber o objeto completo vindo do FastAPI
  onCapture?: (data: any) => void
}

export function CameraScreen({ onCapture }: CameraScreenProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTriggerCapture = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    // Criar o FormData exatamente como o FastAPI espera
    const formData = new FormData()
    formData.append("image", file) // "image" corresponde ao 'image: Optional[UploadFile]'
    formData.append("profile_id", "1") // O teu backend exige um int profile_id

    try {
      const xhr = new XMLHttpRequest()
      
      // Monitor de progresso para a UI
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percentComplete)
        }
      })

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            // Parse da resposta do FastAPI
            const responseData = JSON.parse(xhr.responseText)
            
            // Enviamos o JSON (com mood, tip, meal_name) para o AppShell
            // O AppShell vai detectar que existe um resultado e trocar para o FeedbackScreen
            onCapture?.(responseData)
          } catch (e) {
            console.error("Erro ao processar resposta do servidor", e)
          }
        } else {
          console.error("Erro no upload:", xhr.statusText)
          alert("Ocorreu um erro ao processar a refeição.")
        }
        setIsUploading(false)
      }

      xhr.onerror = () => {
        console.error("Erro de rede.")
        setIsUploading(false)
      }

      // URL do teu container Docker / Backend FastAPI
      // Se estiveres a testar no telemóvel, usa o IP da tua máquina em vez de localhost
      xhr.open("POST", "http://127.0.0.1:8000/api/v1/meals") 
      xhr.send(formData)

    } catch (error) {
      console.error("Erro fatal no upload:", error)
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-950 px-4 h-full">
      {/* Input de Ficheiro Escondido */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Viewfinder Estilizado */}
      <div className="relative flex h-64 w-64 items-center justify-center rounded-[40px] border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 overflow-hidden">
        {/* Cantos da Moldura */}
        <div className="absolute left-6 top-6 h-8 w-8 rounded-tl-xl border-l-4 border-t-4 border-emerald-500" />
        <div className="absolute right-6 top-6 h-8 w-8 rounded-tr-xl border-r-4 border-t-4 border-emerald-500" />
        <div className="absolute bottom-6 left-6 h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-emerald-500" />
        <div className="absolute bottom-6 right-6 h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-emerald-500" />

        {isUploading ? (
          <div className="flex flex-col items-center gap-4 z-10 animate-pulse">
            <div className="relative">
              <CloudUpload size={48} className="text-emerald-400 animate-bounce" />
              <Loader2 size={64} className="absolute -top-2 -left-2 text-emerald-400 animate-spin opacity-20" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-white">{uploadProgress}%</span>
              <div className="w-24 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-20">
            <Camera size={48} className="text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Aguardando Captura</span>
          </div>
        )}
      </div>

      <div className="text-center space-y-1">
        <h3 className="text-lg font-bold text-white">
          {isUploading ? "A analisar nutrientes..." : "Tirar foto à refeição"}
        </h3>
        <p className="text-xs text-zinc-500 max-w-[220px]">
          {isUploading 
            ? "A Letty está a verificar a tua proteína e gordura saturada." 
            : "Centraliza o prato para uma análise mais precisa da IA."}
        </p>
      </div>

      {/* Botão de Disparo */}
      <button
        onClick={handleTriggerCapture}
        disabled={isUploading}
        className={`group relative flex h-20 w-20 items-center justify-center rounded-full transition-all active:scale-90 disabled:opacity-50 ${
          isUploading ? "bg-zinc-800" : "bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
        }`}
      >
        {isUploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        ) : (
          <Camera size={32} className="text-white" />
        )}
      </button>

      {/* Botão Cancelar */}
      <button 
        disabled={isUploading}
        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors py-2 disabled:invisible"
      >
        <X size={16} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Cancelar</span>
      </button>
    </div>
  )
}