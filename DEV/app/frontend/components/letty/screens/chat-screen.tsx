"use client"

import { useState, useRef, useEffect, type FormEvent } from "react"
import { Send, Loader2 } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: string
}

const initialMessages: Message[] = [
  { id: "1", text: "Olá! Eu sou a Letty. Como posso ajudar?", sender: "bot", timestamp: "09:00" },
]

export function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll sempre que as mensagens mudam ou a Letty começa a pensar
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    
    // Inicia o estado de "pensar"
    setIsTyping(true)

    // Simulação de resposta da Letty
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Estou a analisar o que disseste... Sabias que podes subir de nível ao completar os desafios de hoje?",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
      }
      
      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false) // Para de pensar
    }, 2500) // Tempo que ela fica a pensar
  }

  return (
    <div className="flex flex-1 flex-col h-full bg-background">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm transition-all ${
                msg.sender === "user"
                  ? "rounded-br-none bg-primary text-primary-foreground"
                  : "rounded-bl-none bg-card border border-border text-foreground"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <span className={`mt-1 block text-[10px] opacity-60 ${
                msg.sender === "user" ? "text-right" : "text-left"
              }`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {/* Letty Thinking Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              <span className="ml-2 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Letty está a pensar...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form 
        onSubmit={handleSend} 
        className="p-4 border-t border-border bg-background/80 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder={isTyping ? "A Letty está a responder..." : "Escreve uma mensagem..."}
            className="flex-1 rounded-full border border-border bg-card px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:scale-105 active:scale-95 disabled:grayscale disabled:opacity-50"
          >
            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </form>
    </div>
  )
}