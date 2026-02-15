"use client"

import { DynamicForm, type FormField } from "../dynamic-form"
import { Settings, Bell, Shield, LogOut, ChevronRight } from "lucide-react"

interface UserScreenProps {
  userData: {
    name: string
    username: string
    membership: string
    email?: string
  }
  onFormSubmit?: (data: Record<string, string | boolean>) => void
  onAction?: (action: string) => void
}

const profileFormFields: FormField[] = [
  { id: "name", label: "Nome", type: "text", placeholder: "O teu nome", required: true },
  { id: "email", label: "Email", type: "text", placeholder: "email@exemplo.com", required: true },
  { id: "bio", label: "Bio", type: "textarea", placeholder: "Conta-nos sobre ti..." },
  { id: "notifications", label: "Notificacoes", type: "checkbox", placeholder: "Receber notificacoes push" },
]

const menuItems = [
  { id: "settings", label: "Definicoes", icon: Settings },
  { id: "notifications", label: "Notificacoes", icon: Bell },
  { id: "privacy", label: "Privacidade", icon: Shield },
  { id: "logout", label: "Sair", icon: LogOut },
]

export function UserScreen({ userData, onFormSubmit, onAction }: UserScreenProps) {
  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3">
      {/* Avatar + info */}
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent">
          <span className="text-2xl font-bold text-accent-foreground">
            {userData.name.charAt(0)}
          </span>
        </div>
        <div className="text-center">
          <h2 className="text-sm font-bold text-foreground">{userData.name}</h2>
          <p className="text-xs text-muted-foreground">@{userData.username}</p>
          <span className="mt-1 inline-flex rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
            {userData.membership}
          </span>
        </div>
      </div>

      {/* Quick tiles */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col items-center rounded-2xl bg-card p-3 shadow-sm">
          <span className="text-lg font-bold text-primary">42</span>
          <span className="text-[10px] text-muted-foreground">Streak</span>
        </div>
        <div className="flex flex-col items-center rounded-2xl bg-card p-3 shadow-sm">
          <span className="text-lg font-bold text-primary">1265</span>
          <span className="text-[10px] text-muted-foreground">Pontos</span>
        </div>
      </div>

      {/* Menu items */}
      <div className="rounded-2xl bg-card shadow-sm">
        {menuItems.map((item, i) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onAction?.(item.id)}
              className={`flex w-full items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary ${
                i < menuItems.length - 1 ? "border-b border-border" : ""
              } ${item.id === "logout" ? "text-destructive" : "text-foreground"}`}
            >
              <Icon size={16} />
              <span className="flex-1 text-left text-xs font-medium">{item.label}</span>
              <ChevronRight size={14} className="text-muted-foreground" />
            </button>
          )
        })}
      </div>

      {/* Edit profile form */}
      <div className="rounded-2xl bg-card p-3 shadow-sm">
        <DynamicForm
          fields={profileFormFields}
          onSubmit={(data) => onFormSubmit?.(data)}
          title="Editar perfil"
          submitLabel="Guardar"
        />
      </div>
    </div>
  )
}
