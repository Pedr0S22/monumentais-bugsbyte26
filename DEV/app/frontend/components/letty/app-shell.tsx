"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { PhoneFrame } from "./phone-frame"
import { AppHeader } from "./app-header"
import { BottomNav, type TabId } from "./bottom-nav"
import type { MascotMood } from "./mascot"
import { HomeScreen } from "./screens/home-screen"
import { ChatScreen } from "./screens/chat-screen"
import { CameraScreen } from "./screens/camera-screen"
import { ShopScreen } from "./screens/shop-screen"
import { UserScreen } from "./screens/user-screen"
import { FeedbackScreen } from "./screens/feedback-screen"

interface AppState {
  activeTab: TabId
  score: number
  mood: MascotMood
  userData: {
    name: string
    username: string // Opcional, se não vier do backend ficará vazio
    membership: string // Vamos mapear o 'diet' ou 'goal' aqui se quiseres
    email: string
    // Adicionamos os novos campos do teu GET:
    goal: string
    diet: string
    progress_status: string
  }
  scanResult: {
    mood: MascotMood
    tip: string
    mealName: string
  } | null
}

const initialState: AppState = {
  activeTab: "home",
  score: 0,
  mood: "happy",
  userData: {
    name: "",
    username: "",
    membership: "",
    email: "",
    goal: "",
    diet: "",
    progress_status: "",
  },
  scanResult: null,
}

export function AppShell() {
  const [state, setState] = useState<AppState>(initialState)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("http://localhost:8000/api/v1/profile/1")
        if (!response.ok) throw new Error("Falha ao carregar perfil")
        
        const data = await response.json()
        
        // REPARA AQUI: Acedemos a data.profile porque o teu backend
        // encapsula os dados dentro dessa chave.
        const p = data.profile 

        setState((prev) => ({
          ...prev,
          score: p.points || 0,
          userData: {
            ...prev.userData,
            name: p.name,
            goal: p.goal,
            diet: p.diet,
            progress_status: p.progress_status,
            // Exemplo: usar o diet como membership label
            membership: p.diet 
          },
        }))
      } catch (error) {
        console.error("Erro na API de Perfil:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // 2. GESTÃO DE NAVEGAÇÃO
  const handleTabChange = useCallback((tab: TabId) => {
    setState((prev) => ({
      ...prev,
      activeTab: tab,
      scanResult: null, // Reset ao resultado de scan sempre que muda de aba
      // Mudança estética de humor conforme a secção
      mood: tab === "shop" ? "happy" : tab === "camera" ? "meh" : prev.mood,
    }))
  }, [])

  // 3. CAPTURA E PROCESSAMENTO (Docker/Backend)
  const handleCapture = useCallback((data: any) => {
    setState((prev) => ({
      ...prev,
      // Atualiza o score (soma se vier xp_earned ou substitui se vier total)
      score: data.xp_earned ? prev.score + data.xp_earned : (data.new_battery_level || prev.score),
      scanResult: {
        mood: data.mood as MascotMood,
        tip: data.tip,
        mealName: data.meal_name || data.mealName, // Normalização de nomes
      },
      mood: data.mood as MascotMood,
    }))
  }, [])

  // 4. LÓGICA DE RENDERIZAÇÃO DE ECRÃS
  const screenContent = useMemo(() => {
    // Se houver um scan pendente, mostramos Feedback independente da aba selecionada
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

  // 5. VISIBILIDADE DO HEADER
  const showHeader = state.activeTab !== "camera" && !state.scanResult

  // Tela de Loading (Letty a acordar)
  if (isLoading) {
    return (
      <PhoneFrame>
        <div className="flex h-full items-center justify-center bg-zinc-950">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
              Acordando a Letty...
            </p>
          </div>
        </div>
      </PhoneFrame>
    )
  }

  return (
    <PhoneFrame>
      {showHeader && (
        <AppHeader
          mood={state.mood}
          score={state.score}
          // Se quiseres mostrar o progresso no header, podes passar state.userData.progress_status
        />
      )}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {screenContent}
      </div>
      <BottomNav activeTab={state.activeTab} onTabChange={handleTabChange} />
    </PhoneFrame>
  )
}