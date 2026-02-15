"use client"

import type { ReactNode } from "react"

interface PhoneFrameProps {
  children: ReactNode
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="relative mx-auto">
      {/* Botões Físicos Laterais Esquerda (Volume) */}
      <div className="absolute -left-1.5 top-24 h-12 w-1.5 rounded-l-md bg-zinc-800" />
      <div className="absolute -left-1.5 top-40 h-12 w-1.5 rounded-l-md bg-zinc-800" />
      
      {/* Botão Físico Lateral Direita (Power) */}
      <div className="absolute -right-1.5 top-32 h-16 w-1.5 rounded-r-md bg-zinc-800" />

      {/* Corpo do Telemóvel com bordas pretas (Zinc-950) */}
      <div className="relative mx-auto w-[320px] overflow-hidden rounded-[2.5rem] border-[8px] border-zinc-950 bg-background shadow-2xl ring-1 ring-zinc-800">
        
        {/* Status bar */}
        <div className="relative z-10 flex items-center justify-between bg-background px-6 py-3">
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
        <div className="flex h-[580px] flex-col overflow-hidden">
          {children}
        </div>

        {/* Home Indicator (Barra inferior de navegação) */}
        <div className="absolute bottom-1.5 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-foreground/20" />
      </div>
    </div>
  )
}