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
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด")

  // Get unique categories dynamically
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category))
    return ["ทั้งหมด", ...Array.from(cats)]
  }, [products])

  const filteredProducts = useMemo(() => {
    let result = products

    if (selectedCategory !== "ทั้งหมด") {
      result = result.filter(p => p.category === selectedCategory)
    }

    if (search) {
      const lowerSearch = search.toLowerCase()
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) || 
        (p.barcode && p.barcode.toLowerCase().includes(lowerSearch))
      )
    }

    return result
  }, [products, selectedCategory, search])

  // Limit rendering to 60 items for blazing fast typing response
  const DISPLAY_LIMIT = 60
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, DISPLAY_LIMIT)
  }, [filteredProducts])

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Bar for Grid */}
      <div className="flex items-center gap-4 bg-card p-2.5 rounded-2xl border shadow-[var(--shadow-soft)] shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาสินค้าด้วยชื่อ หรือ สแกนบาร์โค้ด..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background border-transparent shadow-none focus-visible:ring-2"
            autoFocus
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 shrink-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
            className={`min-h-9 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border cursor-pointer select-none will-change-transform transition-all duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] active:scale-[0.93] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isActive
                  ? "bg-primary border-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <ScrollArea className="flex-1 -mx-2 px-2">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-[128px] rounded-2xl bg-muted animate-pulse"></div>
            ))}
          </div>
        ) : displayedProducts.length > 0 ? (
          <div className="space-y-4 pb-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {displayedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {filteredProducts.length > DISPLAY_LIMIT && (
              <p className="text-center text-xs text-muted-foreground pt-2">
                แสดงสินค้า {DISPLAY_LIMIT} จากทั้งหมด {filteredProducts.length} รายการ (กรุณาใช้การค้นหาเพื่อหาชิ้นอื่นๆ)
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card/75 rounded-2xl border border-dashed">
            <Search className="h-10 w-10 mb-4 text-primary/35" />
            <p className="font-semibold text-foreground">ไม่พบสินค้าที่ค้นหา</p>
            <p className="mt-1 text-sm">ลองค้นด้วยชื่อสั้นลง หรือสแกนบาร์โค้ดอีกครั้ง</p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
