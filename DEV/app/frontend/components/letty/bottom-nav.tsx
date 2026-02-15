"use client"

import { Home, MessageCircle, Camera, ShoppingBag, User } from "lucide-react"

export type TabId = "home" | "chat" | "camera" | "shop" | "user"

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "camera", label: "Camera", icon: Camera },
  { id: "shop", label: "Shop", icon: ShoppingBag },
  { id: "user", label: "User", icon: User },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="flex items-center justify-around bg-primary px-2 py-2" aria-label="Main navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors ${
              isActive
                ? "bg-primary-foreground/15 text-primary-foreground"
                : "text-primary-foreground/60 hover:text-primary-foreground/80"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
