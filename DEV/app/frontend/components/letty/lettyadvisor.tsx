"use client"

import React from "react"

export type MascotMood = "happy" | "sad" | "meh"

interface LettyAdvisorProps {
  mood?: MascotMood
  size?: number
  message?: string
}

export function LettyAdvisor({ mood = "happy", size = 100, message }: LettyAdvisorProps) {
  const renderMascotSvg = () => {
    switch (mood) {
      case "happy":
        return (
          <svg width={size} viewBox="0 0 114.32 162.64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#006633" strokeWidth="3" strokeMiterlimit="10">
              <path d="M60.1,7.97c4.38.89,6.91-4.97,10.74-4.13,3.46.76,4.95,6.69,5.78,10.17,1.04,4.37,2.48,10.36,1.16,17.34-.28,1.47-.86,3.92.32,4.85,1.28,1.02,3.26-.83,5.23,0,2.61,1.1,2.9,5.91,3,7.63.21,3.44-.41,6.18-2.31,12.02-1.44,4.42-3.8,10.86-4.85,14.79-1.36,5.06-.86,6.47-1.39,20.57-.49,12.93-.76,19.46-2.08,22.19-3.78,7.82-12.15,13.06-20.34,14.56-11.76,2.16-24.45-3.16-29.36-11.79-1.07-1.89-2.42-6.03-3.47-14.56-.71-5.77-1.49-12.21-3-17.8-1.89-6.99-3.33-6.82-8.78-18.95-8.14-18.13-6.4-21.8-5.55-23.12,2.28-3.52,5.62-1.65,9.25-5.55,4.85-5.2.84-10.68,5.09-20.11,2.61-5.8,7.68-11.64,11.42-10.93,1.98.38,2.26,2.35,5.92,3.76,1.59.61,4.25,1.6,6.24.46,2.68-1.53,1.42-5.37,4.29-7.16,1.98-1.24,4.47-.57,5.11-.4,4.34,1.17,4.31,5.47,7.6,6.14Z" />
              <path d="M33.86,79.43c-9.42-25.51-10.3-33.4-8.32-34.42,1.56-.8,4.23,3,6.24,2.06,3.93-1.85-4.85-18.28,2.08-30.97,1.61-2.94,3.66-4.98,5.22-6.28" strokeLinecap="round" />
              <path d="M64.51,76.86c9.42-25.51,10.3-33.4,8.32-34.42-1.56-.8-4.23,3-6.24,2.06-4.01-1.89,4.98-18.92-2.08-30.97-2.03-3.46-4.8-5.55-6.42-6.6" strokeLinecap="round" />
            </g>
            <ellipse cx="39.98" cy="98.21" rx="3.5" ry="5.4" fill="#006633"/>
            <ellipse cx="59.92" cy="98.21" rx="3.5" ry="5.4" fill="#006633"/>
            <path d="M44.42,110.67c1.15,1.94,3.27,3.1,5.49,2.99,3.17-.15,4.79-2.79,4.91-2.99" stroke="#006633" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )
      case "sad":
        return (
          <svg width={size} viewBox="0 0 96.57 156.23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.2,97.27l-1.23.06c-3.22.16-6,1.05-8.27,2.63-6.86,4.78-7.76,14.71-8.24,20.05h0c-.03.34-.06.66-.07.95-.92.24-1.75.63-2.48,1.18-.58.43-2.35,1.76-1.8,3.4.38,1.15,1.55,1.42,2.32,1.59.97.22,1.75.22,2.32.19,0,.32.02.72.12,1.2.13.65.43,2.17,1.78,2.84.38.19.78.28,1.18.28.21,0,.42-.03.62-.08,1.27-.34,1.76-1.57,1.97-2.1" fill="#b02248"/>
            <ellipse cx="38.41" cy="94.34" rx="3.36" ry="5.18" fill="#b02248"/>
            <ellipse cx="57.56" cy="94.34" rx="3.36" ry="5.18" fill="#b02248"/>
            <path d="M52.66,108.7c-.39,0-.77-.15-1.05-.46-.38-.4-1.77-1.72-3.94-1.72s-3.56,1.31-3.94,1.72" stroke="#b02248" strokeWidth="2" />
          </svg>
        )
      case "meh":
        return (
          <svg width={size} viewBox="0 0 100.52 162.64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.14,125.07c.48-5.29,1.37-15.21,7.94-19.78,1.27-.89,3.75-2.26,7.83-2.47" stroke="#fabc3b" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="39.98" cy="98.21" rx="3.5" ry="5.4" fill="#fabc3b"/>
            <ellipse cx="59.92" cy="98.21" rx="3.5" ry="5.4" fill="#fabc3b"/>
            <path d="M44.42,110.67h10.39" stroke="#fabc3b" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )
    }
  }

  return (
    <div className="flex flex-col items-center">
      {renderMascotSvg()}
      {message && (
        <div className="mt-2 bg-white p-2 rounded-xl shadow-sm border text-[10px] text-center max-w-[120px]">
          {message}
        </div>
      )}
    </div>
  )
}