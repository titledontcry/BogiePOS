"use client"

import { Plus } from "lucide-react"
import { Product } from "@/types"
import { useCartStore } from "@/store/cartStore"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const cartItems = useCartStore((state) => state.items)
  
  const inCart = cartItems.find(i => i.productId === product.id)?.quantity || 0
  const remainingStock = product.stock - inCart
  const isOutOfStock = remainingStock <= 0

  const handleAdd = () => {
    if (isOutOfStock) return
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      stock: product.stock,
    })
  }

  return (
    <div 
      onClick={handleAdd}
      className={`group relative flex flex-col justify-between p-4 rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-200 cursor-pointer overflow-hidden ${
        isOutOfStock 
          ? "opacity-60 cursor-not-allowed grayscale" 
          : "hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 active:scale-[0.98]"
      }`}
    >
      <div className="space-y-1 z-10">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold leading-tight line-clamp-2 text-sm">{product.name}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{product.category}</p>
      </div>

      <div className="mt-4 flex items-end justify-between z-10">
        <div className="font-bold text-violet-600 dark:text-violet-400">
          {formatCurrency(product.price)}
        </div>
        <Badge variant={remainingStock > 5 ? "secondary" : "destructive"} className="text-[10px] px-1.5 py-0">
          เหลือ {remainingStock}
        </Badge>
      </div>

      {/* Hover overlay add button effect */}
      {!isOutOfStock && (
        <div className="absolute inset-0 bg-violet-600/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-background/90 backdrop-blur-sm rounded-full p-2 shadow-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-200">
            <Plus className="h-6 w-6 text-violet-600 dark:text-violet-400" />
          </div>
        </div>
      )}
      
      {/* Out of stock overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px] z-20">
          <Badge variant="destructive" className="px-3 py-1 text-xs shadow-md">
            สินค้าหมด
          </Badge>
        </div>
      )}
      
      {/* In cart badge indicator */}
      {inCart > 0 && (
        <div className="absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white shadow-sm">
          {inCart}
        </div>
      )}
    </div>
  )
}
