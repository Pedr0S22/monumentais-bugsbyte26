"use client"

import React from "react"
import Image from "next/image"

// Importa diretamente da mesma pasta onde está o componente
import happyImg from "./sadletty_1@500x.png"
import sadImg from "./letty_2@500x.png"
import mehImg from "./mehletty@500x.png"

export type MascotMood = "happy" | "sad" | "meh"

interface LettyAdvisorProps {
  mood?: MascotMood
  size?: number
  message?: string
}

export function LettyAdvisor({ mood = "happy", size = 200, message }: LettyAdvisorProps) {
  
  // Mapeamento usando as variáveis importadas
  const mascotImages = {
    happy: happyImg,
    sad: sadImg,
    meh: mehImg,
  }

  // Se o mood não existir, usa o happy como fallback
  const imageToRender = mascotImages[mood] || happyImg

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="relative transition-all duration-500 transform hover:scale-105"
        style={{ width: size, height: size }}
      >
        <Image
          src={imageToRender}
          alt={`Letty ${mood}`}
          width={size}
          height={size}
          priority
          className="object-contain"
        />
      </div>

      {message && (
        <div className="relative animate-in fade-in zoom-in duration-300 bg-white dark:bg-zinc-800 p-4 rounded-[24px] shadow-2xl border border-zinc-100 dark:border-zinc-700 max-w-[220px]">
          <p className="text-sm font-bold text-center text-zinc-700 dark:text-zinc-200 leading-tight">
            {message}
          </p>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-white dark:border-b-zinc-800" />
        </div>
      )}
    </div>
  )
}