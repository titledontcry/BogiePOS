"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { Plus, Search, RefreshCw, Package, AlertCircle, PackageX, Layers, Filter } from "lucide-react"
import { useProductStore } from "@/store/productStore"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { ProductGridAdmin } from "@/components/products/ProductGridAdmin"
import { ProductForm } from "@/components/products/ProductForm"
import { Product } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProductsPage() {
  const allProducts = useProductStore((state) => state.products)
  const summary = useProductStore((state) => state.summary)
  const categories = useProductStore((state) => state.categories)
  const storeFetchProducts = useProductStore((state) => state.fetchProducts)
  const storeIsLoading = useProductStore((state) => state.isLoading)

  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  
  // Pagination
  const [page, setPage] = useState(1)
  const limit = 40
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)

  // Delete Confirmation state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  // Initial load from store
  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      try {
        await storeFetchProducts()
      } catch (error) {
        toast.error("ไม่สามารถโหลดข้อมูลสินค้าได้")
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [storeFetchProducts])

  // Client-side filtering and searching
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // 1. Search filter
      const matchesSearch = !search
        ? true
        : product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.barcode?.includes(search)

      // 2. Status filter
      let matchesStatus = true
      if (statusFilter === "in_stock") {
        matchesStatus = product.stock > 0
      } else if (statusFilter === "low_stock") {
        matchesStatus = product.stock > 0 && product.stock <= 5
      } else if (statusFilter === "out_of_stock") {
        matchesStatus = product.stock <= 0
      }

      // 3. Category filter
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [allProducts, search, statusFilter, categoryFilter])

  // Paginate filtered products
  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * limit
    return filteredProducts.slice(startIndex, startIndex + limit)
  }, [filteredProducts, page, limit])

  const totalItems = filteredProducts.length

  const handleAdd = () => {
    setEditingProduct(undefined)
    setIsDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
      })
      
      if (!res.ok) throw new Error("Failed to delete product")
      
      toast.success("ลบสินค้าสำเร็จ")
      await storeFetchProducts(true) // Force refresh cache
    } catch (error) {
      toast.error("ไม่สามารถลบสินค้าได้")
      console.error(error)
    } finally {
      setIsLoading(false)
      setIsDeleteConfirmOpen(false)
      setProductToDelete(null)
    }
  }

  const handleSuccess = async () => {
    setIsDialogOpen(false)
    setIsLoading(true)
    try {
      await storeFetchProducts(true) // Force refresh cache
    } catch (error) {
      toast.error("ไม่สามารถรีเฟรชข้อมูลได้")
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(totalItems / limit)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full">
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
            onClick={async () => {
              setIsLoading(true)
              try {
                await storeFetchProducts(true)
              } finally {
                setIsLoading(false)
              }
            }} 
            disabled={isLoading || storeIsLoading}
            className="shrink-0 h-10 w-10 border-transparent bg-muted/30 hover:bg-muted/60"
            title="รีเฟรช"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading || storeIsLoading ? 'animate-spin' : 'text-muted-foreground'}`} />
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      {(isLoading || storeIsLoading) && allProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin mb-4 text-primary/50" />
          <p>กำลังโหลดข้อมูลสินค้า...</p>
        </div>
      ) : (
        <ProductGridAdmin 
          data={paginatedProducts} 
          onEdit={handleEdit} 
          onDelete={handleDeleteClick} 
        />
      )}

      {/* Footer / Pagination */}
      {!isLoading && filteredProducts.length > 0 && (
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
        <DialogContent 
          className="sm:max-w-[500px]"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</DialogTitle>
          </DialogHeader>
          <ProductForm 
            initialData={editingProduct} 
            onSuccess={handleSuccess} 
          />
        </DialogContent>
      </Dialog>

      {/* Dialog for Delete Confirmation */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">ยืนยันการลบสินค้า</DialogTitle>
            <DialogDescription>
              การดำเนินการนี้ไม่สามารถย้อนกลับได้ สินค้าจะถูกลบออกจากระบบถาวร
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-sm">
            คุณต้องการลบสินค้า <span className="font-bold text-foreground">"{productToDelete?.name}"</span> ใช่หรือไม่?
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              ยืนยันการลบ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
