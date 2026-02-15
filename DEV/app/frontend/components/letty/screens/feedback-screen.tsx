"use client"

import React from "react"
import { LettyAdvisor, type MascotMood } from "../lettyadvisor"
import { CheckCircle2, ArrowRight } from "lucide-react"

interface FeedbackScreenProps {
  mood: string
  tip: string
  mealName: string
  onClose: () => void
}

export function FeedbackScreen({ mood, tip, mealName, onClose }: FeedbackScreenProps) {
  
  const normalizedMood = React.useMemo(() => {
    const m = mood?.toLowerCase() as MascotMood
    return (["happy", "sad", "meh"].includes(m)) ? m : "meh"
  }, [mood])

  // Configuração de cores precisa por Mood
  const theme = {
    happy: {
      gradient: "from-emerald-500/30 via-emerald-900/10 to-zinc-950",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      glow: "bg-emerald-500/20",
      accent: "bg-emerald-500/10"
    },
    sad: {
      gradient: "from-rose-500/30 via-rose-900/10 to-zinc-950",
      text: "text-rose-400",
      border: "border-rose-500/30",
      glow: "bg-rose-500/20",
      accent: "bg-rose-500/10"
    },
    meh: {
      gradient: "from-amber-500/30 via-amber-900/10 to-zinc-950",
      text: "text-amber-400",
      border: "border-amber-500/30",
      glow: "bg-amber-500/20",
      accent: "bg-amber-500/10"
    }
  }[normalizedMood]

  return (
    <div className={`flex h-full w-full flex-col items-center justify-between p-8 bg-gradient-to-b ${theme.gradient} transition-all duration-700 overflow-hidden`}>
      
      {/* 1. Header Compacto */}
      <div className="flex flex-col items-center gap-2 mt-2 animate-in fade-in slide-in-from-top duration-700">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${theme.accent} border border-white/5 backdrop-blur-md`}>
          <CheckCircle2 size={10} className={theme.text} />
          <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${theme.text}`}>
            Análise Concluída
          </span>
        </div>
        <h2 className="text-[11px] font-bold text-white/50 tracking-[0.2em] uppercase">
          {mealName}
        </h2>
      </div>

      {/* 2. Letty (Subida e centralizada) */}
<div className="relative flex-1 flex items-center justify-center w-full -translate-y-6"> 
  {/* O -translate-y-6 sobe a Letty e o Glow em conjunto */}
  
  <div className={`absolute w-48 h-48 rounded-full blur-[60px] ${theme.glow} animate-pulse`} />
  
  <div className="relative z-10 drop-shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
    <LettyAdvisor mood={normalizedMood} size={100} />
  </div>
</div>

      {/* 3. Balão de Dica (Mais integrado com a cor do mood) */}
      <div className={`relative w-full bg-zinc-900/40 backdrop-blur-xl rounded-[28px] p-6 shadow-2xl border ${theme.border} mb-6`}>
        {/* Triângulo do balão ajustado para a cor do zinc-900/40 */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-zinc-900/40" />
        
        <div className="space-y-3 text-center">
          <p className={`text-[9px] font-black uppercase tracking-[0.4em] opacity-80 ${theme.text}`}>
            Letty aconselha
          </p>
          <p className="text-[15px] font-medium leading-relaxed text-zinc-100 italic">
            "{tip}"
          </p>
        </div>
      </div>

      {/* 4. Botão de Saída (Fino e elegante) */}
      <button
        onClick={onClose}
        className={`group flex w-full items-center justify-center gap-3 bg-white text-zinc-950 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all mb-2`}
      >
        Prosseguir
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>

    </div>
  )
}