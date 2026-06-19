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
  const isLowStock = remainingStock > 0 && remainingStock <= 5

  const handleAdd = () => {
    if (isOutOfStock) return
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      stock: product.stock,
      category: product.category,
    })
  }

  return (
    <button 
      type="button"
      onClick={handleAdd}
      disabled={isOutOfStock}
      aria-label={`${isOutOfStock ? "สินค้าหมด" : "เพิ่มสินค้า"} ${product.name} ราคา ${formatCurrency(product.price)} เหลือ ${remainingStock} ชิ้น`}
      className={`group relative flex min-h-[128px] flex-col justify-between overflow-hidden rounded-2xl border bg-card p-4 text-left text-card-foreground shadow-[var(--shadow-soft)] card-hover-transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        isOutOfStock 
          ? "cursor-not-allowed opacity-65 grayscale" 
          : "cursor-pointer hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[var(--shadow-lift)] active:scale-[0.97] active:shadow-[var(--shadow-soft)]"
      }`}
    >
      <div className="space-y-1 z-10">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold leading-tight line-clamp-2 text-sm">{product.name}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{product.category}</p>
      </div>

      <div className="mt-4 flex items-center justify-between w-full z-10">
        <div className="font-extrabold text-primary">
          {formatCurrency(product.price)}
        </div>
        <Badge variant={isOutOfStock ? "destructive" : isLowStock ? "warning" : "success"} className="text-[10px] px-1.5 py-0">
          เหลือ {remainingStock}
        </Badge>
      </div>

      {/* Hover overlay add button effect */}
      {!isOutOfStock && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/[0.03] opacity-0 transition-opacity duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] group-hover:opacity-100 group-focus-visible:opacity-100">
          <div className="rounded-full bg-card/95 p-2.5 shadow-[var(--shadow-lift)] transition-transform duration-[var(--duration-smooth)] ease-[var(--ease-out-back)] translate-y-2 group-hover:translate-y-0">
            <Plus className="h-5 w-5 text-foreground" />
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
        <div className="absolute top-2 right-2 z-20 flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-2 text-[11px] font-bold text-primary-foreground shadow-[var(--shadow-soft)] animate-[fadeInScale_0.2s_var(--ease-out-back)]">
          {inCart}
        </div>
      )}
    </button>
  )
}
