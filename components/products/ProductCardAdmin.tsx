import { Pencil, Trash2, Image as ImageIcon } from "lucide-react"
import { Product } from "@/types"
import { formatCurrency } from "@/lib/utils"
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

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-[var(--shadow-soft)] transition-all duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] hover:shadow-[var(--shadow-lift)] ${isOutOfStock ? 'opacity-65 grayscale-[0.2]' : ''}`}>
      
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

        {/* Hover Actions (Absolute Top Right) */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(product)}
            className="h-8 w-8 rounded-full bg-white text-muted-foreground shadow-md flex items-center justify-center hover:text-primary hover:scale-110 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`แก้ไข ${product.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="h-8 w-8 rounded-full bg-white text-muted-foreground shadow-md flex items-center justify-center hover:text-destructive hover:scale-110 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
            aria-label={`ลบ ${product.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
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
  )
}
