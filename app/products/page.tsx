"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Search, RefreshCw, Package, AlertCircle, PackageX, Layers, Filter } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProductGridAdmin } from "@/components/products/ProductGridAdmin"
import { ProductForm } from "@/components/products/ProductForm"
import { Product } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [categories, setCategories] = useState<string[]>([])
  
  // Summary Stats
  const [summary, setSummary] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  })

  // Pagination
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const limit = 40
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/products/summary")
      if (res.ok) {
        const data = await res.json()
        setSummary(data)
      }
    } catch (error) {
      console.error("Failed to fetch summary", error)
    }
  }, [])

  const fetchProducts = useCallback(async (isInitial = false) => {
    setIsLoading(true)
    try {
      const url = new URL("/api/products", window.location.origin)
      if (search) url.searchParams.append("search", search)
      if (statusFilter !== "all") url.searchParams.append("status", statusFilter)
      if (categoryFilter !== "all") url.searchParams.append("category", categoryFilter)
      url.searchParams.append("page", page.toString())
      url.searchParams.append("limit", limit.toString())
      
      const res = await fetch(url.toString())
      if (!res.ok) throw new Error("Failed to fetch products")
      
      const data = await res.json()
      setProducts(data.products)
      setTotalItems(data.total)
      
      // Extract unique categories only on initial full load or if we don't have them
      if (isInitial || categories.length === 0) {
        const allRes = await fetch("/api/products?limit=1000&minimal=true")
        if (allRes.ok) {
          const allData = await allRes.json()
          const uniqueCategories = Array.from(new Set(allData.products.map((p: any) => p.category))) as string[]
          setCategories(uniqueCategories.filter(Boolean).sort())
        }
      }
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูลสินค้าได้")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [search, statusFilter, categoryFilter, page, categories.length])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchProducts(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [fetchProducts, search, statusFilter, categoryFilter]) // Reset on filter change

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
      fetchSummary()
    } catch (error) {
      toast.error("ไม่สามารถลบสินค้าได้")
      console.error(error)
    }
  }

  const handleSuccess = () => {
    setIsDialogOpen(false)
    fetchProducts()
    fetchSummary()
  }

  const totalPages = Math.ceil(totalItems / limit)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">จัดการสินค้า</h1>
          <p className="text-sm text-muted-foreground mt-1">
            เพิ่ม แก้ไข ลบ และจัดการสต๊อกสินค้าทั้งหมดในร้าน
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          เพิ่มสินค้าใหม่
        </Button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-0.5">สินค้าทั้งหมด</p>
            <p className="text-xl font-bold leading-none">{summary.total}</p>
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-[var(--success)]/10 text-[var(--success)] flex items-center justify-center shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-0.5">มีสต็อก</p>
            <p className="text-xl font-bold leading-none">{summary.inStock}</p>
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-[var(--warning)]/10 text-[var(--warning)] flex items-center justify-center shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-0.5">ใกล้หมด</p>
            <p className="text-xl font-bold leading-none">{summary.lowStock}</p>
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-[var(--destructive)]/10 text-[var(--destructive)] flex items-center justify-center shrink-0">
            <PackageX className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-0.5">หมดสต็อก</p>
            <p className="text-xl font-bold leading-none">{summary.outOfStock}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-card p-3 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อ หรือ บาร์โค้ด..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-10 h-10 bg-muted/30 border-transparent hover:bg-muted/50 focus-visible:bg-transparent"
          />
        </div>
        
        <div className="flex w-full sm:w-auto gap-3">
          <Select 
            value={categoryFilter} 
            onValueChange={(val) => {
              setCategoryFilter(val)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px] h-10 bg-muted/30 border-transparent">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="หมวดหมู่" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={statusFilter} 
            onValueChange={(val) => {
              setStatusFilter(val)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-[150px] h-10 bg-muted/30 border-transparent">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกสถานะ</SelectItem>
              <SelectItem value="in_stock">มีสต็อก</SelectItem>
              <SelectItem value="low_stock">ใกล้หมด</SelectItem>
              <SelectItem value="out_of_stock">หมดสต็อก</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="icon"
            onClick={() => fetchProducts(true)} 
            disabled={isLoading}
            className="shrink-0 h-10 w-10 border-transparent bg-muted/30 hover:bg-muted/60"
            title="รีเฟรช"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : 'text-muted-foreground'}`} />
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      {isLoading && products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin mb-4 text-primary/50" />
          <p>กำลังโหลดข้อมูลสินค้า...</p>
        </div>
      ) : (
        <ProductGridAdmin 
          data={products} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}

      {/* Footer / Pagination */}
      {!isLoading && products.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-8 border-t border-border/40 mt-6">
          <div className="text-sm text-muted-foreground">
            แสดง {((page - 1) * limit) + 1} ถึง {Math.min(page * limit, totalItems)} จากทั้งหมด <span className="font-semibold text-foreground">{totalItems}</span> รายการ
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 px-4"
            >
              ก่อนหน้า
            </Button>
            <div className="text-sm font-medium px-2">
              หน้า {page} / {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-8 px-4"
            >
              ถัดไป
            </Button>
          </div>
        </div>
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
