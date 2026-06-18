"use client"

import { Minus, Plus, Trash2 } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CartItemProps {
  productId: number
}

export function CartItem({ productId }: CartItemProps) {
  const item = useCartStore((state) => state.items.find(i => i.productId === productId))
  const updateQty = useCartStore((state) => state.updateQty)
  const removeItem = useCartStore((state) => state.removeItem)

  if (!item) return null

  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 group">
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-sm font-medium leading-none mb-1 truncate">{item.name}</h4>
        <div className="text-[10px] text-muted-foreground mb-1">{formatCurrency(item.price)} / ชิ้น</div>
        <div className="text-sm text-primary font-bold">
          {formatCurrency(item.price * item.quantity)}
        </div>
      </div>
      
      <div className="flex items-center gap-1 bg-muted/60 rounded-xl p-1 border">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-lg hover:bg-card" 
          onClick={() => updateQty(productId, item.quantity - 1)}
          aria-label={`ลดจำนวน ${item.name}`}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-6 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-lg hover:bg-card" 
          onClick={() => updateQty(productId, item.quantity + 1)}
          disabled={item.quantity >= item.stock}
          aria-label={`เพิ่มจำนวน ${item.name}`}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 ml-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
        onClick={() => removeItem(productId)}
        aria-label={`ลบ ${item.name} ออกจากตะกร้า`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
