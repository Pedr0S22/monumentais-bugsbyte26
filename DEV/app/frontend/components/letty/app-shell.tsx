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
  routeData: {},
}

export function AppShell() {
  const [state, setState] = useState<AppState>(initialState)

  const handleTabChange = useCallback((tab: TabId) => {
    setState((prev) => ({
      ...prev,
      activeTab: tab,
      mood: tab === "shop" ? "happy" : tab === "camera" ? "meh" : prev.mood,
    }))
  }, [])

  const handleFormSubmit = useCallback((data: Record<string, string | boolean>) => {
    setState((prev) => ({
      ...prev,
      score: prev.score + 10,
      mood: "happy" as MascotMood,
      routeData: { ...prev.routeData, lastSubmission: data },
    }))
  }, [])

  const handleSendMessage = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      score: prev.score + 5,
      routeData: { ...prev.routeData, lastMessage: message },
    }))
  }, [])

  const handleCapture = useCallback((data: string) => {
    setState((prev) => ({
      ...prev,
      score: prev.score + 20,
      mood: "happy" as MascotMood,
      routeData: { ...prev.routeData, lastCapture: data },
    }))
  }, [])

  const handlePurchase = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      score: Math.max(0, prev.score - 100),
      routeData: { ...prev.routeData, lastPurchase: productId },
    }))
  }, [])

  const handleUserAction = useCallback((action: string) => {
    if (action === "logout") {
      setState(initialState)
    }
  }, [])

  const screenContent = useMemo(() => {
    switch (state.activeTab) {
      case "home":
        return (
          <HomeScreen
            userData={state.userData}
            onFormSubmit={handleFormSubmit}
          />
        )
      case "chat":
        return <ChatScreen onSendMessage={handleSendMessage} />
      case "camera":
        return <CameraScreen onCapture={handleCapture} />
      case "shop":
        return (
          <ShopScreen
            onPurchase={handlePurchase}
            onFormSubmit={handleFormSubmit}
          />
        )
      case "user":
        return (
          <UserScreen
            userData={state.userData}
            onFormSubmit={handleFormSubmit}
            onAction={handleUserAction}
          />
        )
      default:
        return null
    }
  }, [state.activeTab, state.userData, handleFormSubmit, handleSendMessage, handleCapture, handlePurchase, handleUserAction])

  const showHeader = state.activeTab !== "camera"

  return (
    <PhoneFrame>
      {showHeader && (
        <AppHeader
          mood={state.mood}
          score={state.score}
          userName={state.activeTab === "home" ? undefined : undefined}
        />
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        {screenContent}
      </div>
      <BottomNav activeTab={state.activeTab} onTabChange={handleTabChange} />
    </PhoneFrame>
  )
}
