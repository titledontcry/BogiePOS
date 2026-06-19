"use client"

import { useEffect, useState, useCallback } from "react"
import { IconPlus, IconRefresh, IconTag, IconTagOff } from "@tabler/icons-react"
import { usePromotionStore } from "@/store/promotionStore"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PromotionTable } from "@/components/promotions/PromotionTable"
import { PromotionForm } from "@/components/promotions/PromotionForm"
import { Promotion } from "@/types"

export default function PromotionsPage() {
  const promotions = usePromotionStore((state) => state.promotions)
  const storeFetchPromotions = usePromotionStore((state) => state.fetchPromotions)
  const storeIsLoading = usePromotionStore((state) => state.isLoading)
  const [isLoading, setIsLoading] = useState(true)
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promotion | undefined>(undefined)

  const fetchPromotions = useCallback(async (force = false) => {
    setIsLoading(true)
    try {
      await storeFetchPromotions(force)
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูลโปรโมชั่นได้")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [storeFetchPromotions])

  useEffect(() => {
    fetchPromotions()
  }, [fetchPromotions])

  const handleAdd = () => {
    setEditingPromo(undefined)
    setIsDialogOpen(true)
  }

  const handleEdit = (promotion: Promotion) => {
    setEditingPromo(promotion)
    setIsDialogOpen(true)
  }

  const handleDelete = async (promotion: Promotion) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/promotions/${promotion.id}`, {
        method: "DELETE",
      })
      
      if (!res.ok) throw new Error("Failed to delete promotion")
      
      toast.success("ลบโปรโมชั่นสำเร็จ")
      await fetchPromotions(true) // Force refresh
    } catch (error) {
      toast.error("ไม่สามารถลบโปรโมชั่นได้")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccess = async () => {
    setIsDialogOpen(false)
    await fetchPromotions(true) // Force refresh
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0">
            <IconTag className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">จัดการโปรโมชั่น</h1>
            <p className="text-sm text-muted-foreground mt-1">
              ตั้งค่าส่วนลดสำหรับสินค้าในร้าน ทั้งแบบลดราคาคงที่ ลดเปอร์เซ็นต์ หรือจัดชุดราคาพิเศษ
            </p>
          </div>
        </div>
        <Button onClick={handleAdd} className="gap-2 shrink-0 rounded-2xl">
          <IconPlus className="h-4 w-4 stroke-[2.5]" />
          สร้างโปรโมชั่น
        </Button>
      </div>

      {/* Toolbar */}
      {promotions.length > 0 && (
        <div className="flex justify-end bg-card p-2 rounded-2xl border border-border/50 shadow-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => fetchPromotions(true)} 
            disabled={isLoading || storeIsLoading}
            className="text-muted-foreground rounded-2xl"
          >
            <IconRefresh className={`h-4 w-4 mr-2 stroke-[2] ${isLoading || storeIsLoading ? 'animate-spin text-primary' : ''}`} />
            รีเฟรชข้อมูล
          </Button>
        </div>
      )}

      {/* Content */}
      {isLoading && promotions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <IconRefresh className="h-8 w-8 animate-spin mb-4 text-primary/50 stroke-[2]" />
          <p>กำลังโหลดข้อมูลโปรโมชั่น...</p>
        </div>
      ) : promotions.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed rounded-3xl bg-card/30 text-center space-y-4 max-w-md mx-auto mt-8 shadow-sm">
          <div className="p-4 bg-muted/40 rounded-full text-muted-foreground">
            <IconTagOff className="h-10 w-10 text-muted-foreground/60 stroke-[1.5]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-foreground">ยังไม่มีโปรโมชั่น</h3>
            <p className="text-sm text-muted-foreground max-w-[280px]">
              สร้างโปรโมชั่นแรกเพื่อกระตุ้นยอดขายของคุณ เช่น ลดราคาคงที่ ลดเป็นเปอร์เซ็นต์ หรือจัดเซ็ตราคาสุดพิเศษ
            </p>
          </div>
          <Button onClick={handleAdd} className="gap-2 rounded-2xl mt-2">
            <IconPlus className="h-4 w-4 stroke-[2.5]" />
            สร้างโปรโมชั่นแรก
          </Button>
        </div>
      ) : (
        <PromotionTable 
          data={promotions} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
        />
      )}

      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className="sm:max-w-[425px]"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{editingPromo ? "แก้ไขโปรโมชั่น" : "สร้างโปรโมชั่นใหม่"}</DialogTitle>
          </DialogHeader>
          <PromotionForm 
            initialData={editingPromo} 
            onSuccess={handleSuccess} 
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

