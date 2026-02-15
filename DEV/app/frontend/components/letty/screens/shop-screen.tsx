/* frontend/components/letty/screens/shop-screen.tsx */

"use client"

import { DynamicForm, type FormField } from "../dynamic-form"
import { ShoppingBag, Star } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  points: number
  rating: number
}

interface ShopScreenProps {
  score: number; 
  onPurchase?: (productId: string) => void
  onFormSubmit?: (data: Record<string, string | boolean>) => void
}

const products: Product[] = [
  { id: "1", name: "Protetor solar", description: "SPF 50+ biodegradavel", points: 450, rating: 4.5 },
  { id: "2", name: "Garrafa reutilizavel", description: "500ml aco inoxidavel", points: 320, rating: 4.8 },
  { id: "3", name: "Saco de compras", description: "Algodao organico", points: 180, rating: 4.2 },
  { id: "4", name: "Kit de sementes", description: "Ervas aromaticas", points: 250, rating: 4.6 },
]

// Make sure 'score' is destuctured here:
export function ShopScreen({ score, onPurchase, onFormSubmit }: ShopScreenProps) {
  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Loja</h2>
        <div className="flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5">
          <ShoppingBag size={12} className="text-accent-foreground" />
          {/* CHANGE THIS LINE BELOW: */}
          <span className="text-[10px] font-semibold text-accent-foreground">{score} pts</span>
        </div>
      </div>

      {/* Product grid remains same... */}
      <div className="grid grid-cols-2 gap-2">
        {products.map((product) => (
          <div key={product.id} className="flex flex-col rounded-2xl bg-card p-3 shadow-sm">
            <div className="mb-2 flex h-16 items-center justify-center rounded-xl bg-secondary">
              <ShoppingBag size={24} className="text-muted-foreground/40" />
            </div>
            <h3 className="text-xs font-semibold text-foreground">{product.name}</h3>
            <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{product.description}</p>
            <div className="mt-1 flex items-center gap-1">
              <Star size={10} className="fill-accent text-accent" />
              <span className="text-[10px] text-muted-foreground">{product.rating}</span>
            </div>
            <button
              onClick={() => onPurchase?.(product.id)}
              className="mt-2 rounded-lg bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {product.points} pts
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}