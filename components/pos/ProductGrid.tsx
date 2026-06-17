"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ProductCard } from "./ProductCard"
import { Product } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ProductGridProps {
  products: Product[]
  isLoading: boolean
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  const [search, setSearch] = useState("")

  const filteredProducts = useMemo(() => {
    if (!search) return products
    const lowerSearch = search.toLowerCase()
    return products.filter(p => 
      p.name.toLowerCase().includes(lowerSearch) || 
      (p.barcode && p.barcode.toLowerCase().includes(lowerSearch))
    )
  }, [products, search])

  // Get unique categories for future filter chips
  // const categories = Array.from(new Set(products.map(p => p.category)))

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Bar for Grid */}
      <div className="flex items-center gap-4 bg-card p-2 rounded-xl border shadow-sm shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาสินค้าด้วยชื่อ หรือ สแกนบาร์โค้ด..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background border-none shadow-none focus-visible:ring-1 focus-visible:ring-violet-500"
            autoFocus
          />
        </div>
      </div>

      {/* Grid */}
      <ScrollArea className="flex-1 -mx-2 px-2">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-[120px] rounded-2xl bg-muted animate-pulse"></div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card/50 rounded-2xl border border-dashed">
            <Search className="h-10 w-10 mb-4 opacity-20" />
            <p>ไม่พบสินค้าที่ค้นหา</p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
