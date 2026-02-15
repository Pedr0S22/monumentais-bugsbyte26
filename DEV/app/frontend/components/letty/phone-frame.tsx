"use client"

import type { ReactNode } from "react"

interface PhoneFrameProps {
  children: ReactNode
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="relative mx-auto w-full h-[100dvh] md:w-auto md:h-auto">
      {/* Botões Físicos Laterais Esquerda (Volume) - Hidden on mobile */}
      <div className="absolute -left-1.5 top-24 hidden h-12 w-1.5 rounded-l-md bg-zinc-800 md:block" />
      <div className="absolute -left-1.5 top-40 hidden h-12 w-1.5 rounded-l-md bg-zinc-800 md:block" />
      
      {/* Botão Físico Lateral Direita (Power) - Hidden on mobile */}
      <div className="absolute -right-1.5 top-32 hidden h-16 w-1.5 rounded-r-md bg-zinc-800 md:block" />

      {/* Corpo do Telemóvel - Fullscreen on mobile, phone frame on desktop */}
      <div className="relative mx-auto flex h-full w-full flex-col overflow-hidden bg-background shadow-2xl md:block md:h-auto md:w-[320px] md:rounded-[2.5rem] md:border-[8px] md:border-zinc-950 md:ring-1 md:ring-zinc-800">
        
        {/* Status bar - Hidden on real mobile devices, visible on desktop mockup */}
        <div className="relative z-10 hidden items-center justify-between bg-background px-6 py-3 md:flex">
          <span className="text-[12px] font-bold text-foreground">9:41</span>
          
          {/* Dynamic Island / Notch */}
          <div className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-zinc-950" />
          
          <div className="flex items-center gap-1.5">
            {/* Ícones de sinal e bateria */}
            <div className="flex items-end gap-0.5">
              <div className="h-2 w-0.5 rounded-full bg-foreground" />
              <div className="h-2.5 w-0.5 rounded-full bg-foreground" />
              <div className="h-3 w-0.5 rounded-full bg-foreground/30" />
            </div>
            <div className="h-3 w-5 rounded-sm border border-foreground/30 p-0.5">
              <div className="h-full w-full rounded-0.5 bg-foreground" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden md:h-[580px]">
          {children}
        </div>

        {/* Home Indicator (Barra inferior de navegação) - Hidden on mobile */}
        <div className="absolute bottom-1.5 left-1/2 hidden h-1 w-32 -translate-x-1/2 rounded-full bg-foreground/20 md:block" />
      </div>
    </div>
  )
}