"use client"

import { useState, useCallback, useMemo } from "react"
import { PhoneFrame } from "./phone-frame"
import { AppHeader } from "./app-header"
import { BottomNav, type TabId } from "./bottom-nav"
import type { MascotMood } from "./mascot"
import { HomeScreen } from "./screens/home-screen"
import { ChatScreen } from "./screens/chat-screen"
import { CameraScreen } from "./screens/camera-screen"
import { ShopScreen } from "./screens/shop-screen"
import { UserScreen } from "./screens/user-screen"
import { FeedbackScreen } from "./screens/feedback-screen" // Importa o novo ecrã

interface AppState {
  activeTab: TabId
  score: number
  mood: MascotMood
  userData: {
    name: string
    username: string
    membership: string
    email: string
  }
  // Adicionamos o scanResult ao estado global
  scanResult: {
    mood: MascotMood
    tip: string
    mealName: string
  } | null
  routeData: Record<string, unknown>
}

const initialState: AppState = {
  activeTab: "home",
  score: 1265,
  mood: "happy",
  userData: {
    name: "Maria Silva",
    username: "xxxuser",
    membership: "Golden Member",
    email: "maria@exemplo.com",
  },
  scanResult: null, // Inicialmente nulo
  routeData: {},
}

export function AppShell() {
  const [state, setState] = useState<AppState>(initialState)

  const handleTabChange = useCallback((tab: TabId) => {
    setState((prev) => ({
      ...prev,
      activeTab: tab,
      scanResult: null, // Limpa o resultado ao trocar de tab
      mood: tab === "shop" ? "happy" : tab === "camera" ? "meh" : prev.mood,
    }))
  }, [])

  // Esta é a função que a CameraScreen vai chamar quando receber o JSON do Docker
  const handleCapture = useCallback((data: any) => {
    setState((prev) => ({
      ...prev,
      score: prev.score + 50,
      scanResult: data, // Guarda o JSON aqui (deve ter mood, tip, mealName)
      mood: data.mood as MascotMood,
    }))
  }, [])

  const screenContent = useMemo(() => {
    // SE houver um resultado de scan, mostramos o Feedback independente da tab
    if (state.scanResult) {
      return (
        <FeedbackScreen
          mood={state.scanResult.mood}
          tip={state.scanResult.tip}
          mealName={state.scanResult.mealName}
          onClose={() => setState(prev => ({ ...prev, scanResult: null, activeTab: "home" }))}
        />
      )
    }

    switch (state.activeTab) {
      case "home":
        return <HomeScreen userData={state.userData} onFormSubmit={() => {}} />
      case "chat":
        return <ChatScreen onSendMessage={() => {}} />
      case "camera":
        return <CameraScreen onCapture={handleCapture} />
      case "shop":
        return <ShopScreen onPurchase={() => {}} onFormSubmit={() => {}} />
      case "user":
        return <UserScreen userData={state.userData} onFormSubmit={() => {}} onAction={() => {}} />
      default:
        return null
    }
  }, [state.activeTab, state.scanResult, state.userData, handleCapture])

  // Escondemos o header se estivermos na câmara OU a ver o feedback
  const showHeader = state.activeTab !== "camera" && !state.scanResult

  return (
    <PhoneFrame>
      {showHeader && (
        <AppHeader
          mood={state.mood}
          score={state.score}
        />
      )}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {screenContent}
      </div>
      <BottomNav activeTab={state.activeTab} onTabChange={handleTabChange} />
    </PhoneFrame>
  )
}