"use client"

import { Camera, ScanLine, X, CloudUpload, Loader2 } from "lucide-react"
import { useState, useRef, ChangeEvent } from "react"

interface CameraScreenProps {
  onCapture?: (url: string) => void
}

export function CameraScreen({ onCapture }: CameraScreenProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Função para abrir a câmara/seletor de ficheiros
  const handleTriggerCapture = () => {
    fileInputRef.current?.click()
  }

  // Função que lida com o ficheiro selecionado
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    // Criar o FormData para enviar para a tua API
    const formData = new FormData()
    formData.append("file", file)

    try {
      // Exemplo de upload real com XMLHttpRequest para monitorizar progresso
      // Se usares fetch, não consegues monitorizar o progresso nativamente
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percentComplete)
        }
      })

      xhr.onload = () => {
        if (xhr.status === 200) {
          // Aqui a tua API responderia com o URL da imagem ou sucesso
          onCapture?.("upload-success")
        }
        setIsUploading(false)
      }

      // SUBSTITUIR PELO TEU ENDPOINT REAL
      xhr.open("POST", "/api/upload") 
      xhr.send(formData)

      // --- APENAS PARA DEMO (se não tiveres API ainda, apaga o bloco acima e usa este) ---
      /*
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) { clearInterval(interval); return 100; }
          return prev + 10;
        });
      }, 100);
      setTimeout(() => { setIsUploading(false); onCapture?.("fake-url"); }, 1500);
      */
      // --------------------------------------------------------------------------------
    } catch (error) {
      console.error("Erro no upload:", error)
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-foreground/95 px-4">
      {/* Input de Ficheiro Escondido */}
      <input
        type="file"
        accept="image/*"
        capture="environment" // Força abrir a câmara em dispositivos mobile
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {/* Viewfinder */}
      <div className="relative flex h-64 w-64 items-center justify-center rounded-3xl border-2 border-dashed border-primary/30 bg-black/20 overflow-hidden">
        {/* Corner markers */}
        <div className="absolute left-0 top-0 h-10 w-10 rounded-tl-2xl border-l-4 border-t-4 border-primary" />
        <div className="absolute right-0 top-0 h-10 w-10 rounded-tr-2xl border-r-4 border-t-4 border-primary" />
        <div className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-2xl border-b-4 border-l-4 border-primary" />
        <div className="absolute bottom-0 right-0 h-10 w-10 rounded-br-2xl border-b-4 border-r-4 border-primary" />

        {isUploading ? (
          <div className="flex flex-col items-center gap-4 z-10">
            <div className="relative">
              <CloudUpload size={48} className="text-blue-400 animate-bounce" />
              <Loader2 size={60} className="absolute -top-[6px] -left-[6px] text-blue-400 animate-spin opacity-30" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-white">{uploadProgress}%</span>
              <div className="w-32 h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-blue-400 transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-40">
            <Camera size={48} className="text-primary-foreground" />
            <span className="text-[10px] uppercase tracking-tighter text-white">Pronto a capturar</span>
          </div>
        )}
      </div>

      <div className="text-center space-y-1">
        <h3 className="text-lg font-semibold text-white">
          {isUploading ? "A enviar foto..." : "Tirar foto"}
        </h3>
        <p className="text-xs text-white/50 max-w-[200px]">
          {isUploading 
            ? "Não feches a aplicação enquanto processamos o teu talão." 
            : "Centraliza o código ou o talão dentro da moldura."}
        </p>
      </div>

      {/* Botão Principal */}
      <button
        onClick={handleTriggerCapture}
        disabled={isUploading}
        className={`group relative flex h-20 w-20 items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-50 ${
          isUploading ? "bg-slate-800" : "bg-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]"
        }`}
      >
        {isUploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        ) : (
          <Camera size={32} className="text-primary-foreground" />
        )}
      </button>

      {/* Cancelar */}
      <button 
        disabled={isUploading}
        className="flex items-center gap-2 text-white/30 hover:text-white transition-colors py-2 disabled:invisible"
      >
        <X size={16} />
        <span className="text-xs font-bold uppercase tracking-widest">Cancelar</span>
      </button>
    </div>
  )
}