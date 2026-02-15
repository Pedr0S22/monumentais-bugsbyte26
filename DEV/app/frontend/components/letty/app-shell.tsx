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
  }
  scanResult: any | null
}

const initialState: AppState = {
  activeTab: "home",
  score: 1265,
  battery: 100,
  mood: "happy",
  meals: [],
  userData: {
    name: "Maria Silva",
    username: "xxxuser",
    membership: "Golden Member",
    email: "maria@exemplo.com",
  },
  scanResult: null,
}

const API_BASE = "http://127.0.0.1:8000"

export function AppShell() {
  const [state, setState] = useState<AppState>(initialState)

  useEffect(() => {
    const loadInitialData = async () => {
      const profileId = 1;

      // 1. Fetch Meals Independently
      try {
        const mealsRes = await fetch(`${API_BASE}/api/v1/meals/${profileId}/recent`);
        if (mealsRes.ok) {
          const mealsData = await mealsRes.json();
          // This will definitely set your meals now, even if other endpoints fail!
          setState(prev => ({ ...prev, meals: mealsData.meals || [] }));
        }
      } catch (error) {
        console.error("Failed to fetch meals:", error);
      }

      // 2. Fetch Profile Independently
      try {
        const profileRes = await fetch(`${API_BASE}/api/v1/profile/${profileId}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setState(prev => ({
            ...prev,
            score: profileData.profile?.points ?? prev.score,
            userData: {
              ...prev.userData,
              name: profileData.profile?.name ?? prev.userData.name,
              membership: profileData.profile?.goal ?? prev.userData.membership
            }
          }));
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }

      // 3. Fetch Energy Independently
      try {
        const energyRes = await fetch(`${API_BASE}/api/v1/energy/${profileId}/last`);
        if (energyRes.ok) {
          const energyData = await energyRes.json();
          setState(prev => ({ ...prev, battery: energyData.battery_level ?? 100 }));
        }
      } catch (error) {
        console.error("Failed to fetch energy:", error);
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
    setState((prev) => ({
      ...prev,
      score: prev.score + (data.xp_earned || 50),
      battery: data.new_battery_level || prev.battery,
      scanResult: data,
      mood: data.mood as MascotMood,
    }))
  }, [])

  const showHeader = state.activeTab !== "camera" && !state.scanResult

  return (
    <PhoneFrame>
      {showHeader && (
        <AppHeader mood={state.mood} score={state.score} />
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
            {/* The "hidden" class prevents React from destroying the screen when you switch tabs! */}
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
              <ShopScreen onPurchase={() => {}} onFormSubmit={() => {}} />
            </div>
            
            <div className={state.activeTab === "user" ? "flex flex-1 flex-col h-full overflow-hidden" : "hidden"}>
              <UserScreen userData={state.userData} onFormSubmit={() => {}} onAction={() => {}} />
            </div>
          </>
        )}
      </div>
      <BottomNav activeTab={state.activeTab} onTabChange={handleTabChange} />
    </PhoneFrame>
  )
}