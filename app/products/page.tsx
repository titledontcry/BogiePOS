"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Search, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProductTable } from "@/components/products/ProductTable"
import { ProductForm } from "@/components/products/ProductForm"
import { Product } from "@/types"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const url = new URL("/api/products", window.location.origin)
      if (search) url.searchParams.append("search", search)
      
      const res = await fetch(url.toString())
      if (!res.ok) throw new Error("Failed to fetch products")
      
      const data = await res.json()
      setProducts(data.products)
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูลสินค้าได้")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [search])

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchProducts()
    }, 500)
    return () => clearTimeout(timer)
  }, [fetchProducts])

  const handleAdd = () => {
    setEditingProduct(undefined)
    setIsDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const handleDelete = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      })
      
      if (!res.ok) throw new Error("Failed to delete product")
      
      toast.success("ลบสินค้าสำเร็จ")
      fetchProducts()
    } catch (error) {
      toast.error("ไม่สามารถลบสินค้าได้")
      console.error(error)
    }
  }

  const handleSuccess = () => {
    setIsDialogOpen(false)
    fetchProducts()
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-3xl border bg-card px-5 py-5 shadow-[var(--shadow-soft)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-balance">จัดการสินค้า</h1>
          <p className="text-muted-foreground mt-1 text-pretty">
            เพิ่ม แก้ไข ลบ และจัดการสต๊อกสินค้าทั้งหมดในร้าน
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มสินค้าใหม่
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border shadow-[var(--shadow-soft)]">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อสินค้า หรือ บาร์โค้ด..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={fetchProducts} 
          disabled={isLoading}
          className="shrink-0"
          aria-label="รีเฟรชรายการสินค้า"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
        </Button>
      </div>

      {/* Content */}
      {isLoading && products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin mb-4 text-primary" />
          <p>กำลังโหลดข้อมูลสินค้า...</p>
        </div>
      ) : (
        <ProductTable 
          data={products} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}

      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</DialogTitle>
          </DialogHeader>
          <ProductForm 
            initialData={editingProduct} 
            onSuccess={handleSuccess} 
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
