import { useState } from "react"
import { Pencil, Trash2, Image as ImageIcon } from "lucide-react"
import { Product } from "@/types"
import { formatCurrency, cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface ProductCardAdminProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductCardAdmin({ product, onEdit, onDelete }: ProductCardAdminProps) {
  const stock = product.stock
  const isOutOfStock = stock <= 0
  const isLowStock = stock > 0 && stock <= 5
  const [showActions, setShowActions] = useState(false)

  return (
    <div 
      onClick={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] hover:shadow-[var(--shadow-lift)] cursor-pointer select-none",
        isOutOfStock ? 'opacity-65 grayscale-[0.2]' : ''
      )}
    >
      {/* Blurred Card Contents */}
      <div className={cn("flex flex-col h-full transition-all duration-300", showActions ? "blur-[2.5px] scale-[0.98]" : "")}>
        {/* Thumbnail Area */}
        <div className="relative aspect-square w-full bg-muted/40 flex items-center justify-center shrink-0 border-b border-border/40 overflow-hidden">
          {/* Placeholder Icon */}
          <ImageIcon className="h-10 w-10 text-muted-foreground/30" strokeWidth={1.5} />
          
          {/* Stock Badge */}
          <div className="absolute bottom-2 left-2">
            <Badge 
              variant={isOutOfStock ? "destructive" : isLowStock ? "warning" : "success"}
              className="text-[10px] px-2 py-0.5 shadow-sm font-semibold"
            >
              {isOutOfStock ? "หมดสต็อก" : isLowStock ? `ใกล้หมด (${stock})` : `มีสต็อก (${stock})`}
            </Badge>
          </div>
        </div>

        {/* Details Area */}
        <div className="p-3 flex flex-col flex-1 gap-1">
          <div className="flex flex-col gap-0.5 mb-1">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{product.category}</span>
            <h3 className="font-semibold leading-tight line-clamp-2 text-sm" title={product.name}>{product.name}</h3>
          </div>
          
          <div className="mt-auto pt-2 flex items-end justify-between">
            <div className="font-extrabold text-foreground text-sm">
              {formatCurrency(product.price)}
            </div>
            {product.barcode && (
              <div className="text-[9px] font-mono text-muted-foreground/80 bg-muted/50 px-1.5 rounded">
                {product.barcode}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay Actions */}
      {showActions && (
        <div 
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-background/75 backdrop-blur-[1px] p-4 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => {
            e.stopPropagation()
            setShowActions(false)
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(product)
              setShowActions(false)
            }}
            className="flex items-center justify-center gap-2 w-full max-w-[120px] h-9 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md hover:scale-105 active:scale-95 transition-all focus:outline-none"
          >
            <Pencil className="h-3.5 w-3.5 stroke-[2.5]" />
            แก้ไขสินค้า
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(product)
              setShowActions(false)
            }}
            className="flex items-center justify-center gap-2 w-full max-w-[120px] h-9 rounded-xl bg-destructive text-destructive-foreground font-semibold text-xs shadow-md hover:scale-105 active:scale-95 transition-all focus:outline-none"
          >
            <Trash2 className="h-3.5 w-3.5 stroke-[2.5]" />
            ลบสินค้า
          </button>
        </div>
      )}
    </div>
  )
}

