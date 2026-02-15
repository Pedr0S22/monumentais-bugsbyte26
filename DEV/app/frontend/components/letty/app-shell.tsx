"use client"

import { useState, useCallback, useEffect } from "react"
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
  battery: number
  mood: MascotMood
  meals: any[]
  userData: {
    name: string
    username: string
    membership: string
    email: string
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
  battery: 100, // Make sure battery initializes at 100
  mood: "happy",
  meals: [],
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

const API_BASE = "http://127.0.0.1:8000"

export function AppShell() {
  const [state, setState] = useState<AppState>(initialState)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadInitialData = async () => {
      const profileId = 1;

      try {
        // 1. Fetch Profile
        const profileRes = await fetch(`${API_BASE}/api/v1/profile/${profileId}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const p = profileData.profile;
          setState(prev => ({
            ...prev,
            score: p?.points ?? 0,
            userData: {
              ...prev.userData,
              name: p?.name ?? "",
              goal: p?.goal ?? "",
              diet: p?.diet ?? "",
              progress_status: p?.progress_status ?? "",
              membership: p?.goal ?? ""
            }
          }));
        }

        // 2. Fetch Meals
        const mealsRes = await fetch(`${API_BASE}/api/v1/meals/${profileId}/recent`);
        if (mealsRes.ok) {
          const mealsData = await mealsRes.json();
          setState(prev => ({ ...prev, meals: mealsData.meals || [] }));
        }

        // 3. Fetch Energy
        const energyRes = await fetch(`${API_BASE}/api/v1/energy/${profileId}/last`);
        if (energyRes.ok) {
          const energyData = await energyRes.json();
          setState(prev => ({ ...prev, battery: energyData.battery_level ?? 100 }));
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleTabChange = useCallback((tab: TabId) => {
    setState((prev) => ({
      ...prev,
      activeTab: tab,
      scanResult: null,
      mood: tab === "shop" ? "happy" : tab === "camera" ? "meh" : prev.mood,
    }))
  }, [])

  const handleCapture = useCallback((data: any) => {
    // Format the new meal exactly how the HomeScreen expects it
    const newMeal = {
      meal: data.meal_name || "Nova Refeição",
      nutrition_values: data.nutrition_values || { energy: 0, protein: 0 },
      mood: data.mood,
      timestamp: data.timestamp || new Date().toISOString()
    };

    setState((prev) => ({
      ...prev,
      score: prev.score + (data.xp_earned || 0),
      battery: data.new_battery_level ?? prev.battery,
      meals: [newMeal, ...prev.meals],
      scanResult: {
        mood: data.mood as MascotMood,
        tip: data.tip,
        mealName: data.meal_name || "Refeição Analisada",
      },
      mood: data.mood as MascotMood,
    }))
  }, [])

  const showHeader = state.activeTab !== "camera" && !state.scanResult

  // LOADING SCREEN
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
          battery={state.battery}
        />
      )}
      
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {state.scanResult ? (
          <FeedbackScreen
            mood={state.scanResult.mood}
            tip={state.scanResult.tip}
            mealName={state.scanResult.mealName}
            onClose={() => setState(prev => ({ ...prev, scanResult: null, activeTab: "home" }))}
          />
        ) : (
          <>
            {/* O "hidden" impede que os ecrãs sejam destruídos ao mudar de tab! */}
            <div className={state.activeTab === "home" ? "flex flex-1 flex-col h-full overflow-hidden" : "hidden"}>
              <HomeScreen userData={state.userData} meals={state.meals} />
            </div>
            
            <div className={state.activeTab === "chat" ? "flex flex-1 flex-col h-full overflow-hidden" : "hidden"}>
              <ChatScreen />
            </div>
            
            <div className={state.activeTab === "camera" ? "flex flex-1 flex-col h-full overflow-hidden" : "hidden"}>
              <CameraScreen onCapture={handleCapture} />
            </div>
            
            <div className={state.activeTab === "shop" ? "flex flex-1 flex-col h-full overflow-hidden" : "hidden"}>
              <ShopScreen 
                score={state.score} // <-- Pass the score from state here
                onPurchase={() => {}} 
                onFormSubmit={() => {}} 
              />
            </div>
            
            <div className={state.activeTab === "user" ? "flex flex-1 flex-col h-full overflow-hidden" : "hidden"}>
              <UserScreen 
                userData={state.userData} 
                score={state.score} // <-- Add this to sync Points with Header XP
                onFormSubmit={() => {}} 
                onAction={() => {}} 
              />
            </div>
          </>
        )}
      </div>
      <BottomNav activeTab={state.activeTab} onTabChange={handleTabChange} />
    </PhoneFrame>
  )
}