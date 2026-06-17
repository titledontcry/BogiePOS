"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, RefreshCw, Tag } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PromotionTable } from "@/components/promotions/PromotionTable"
import { PromotionForm } from "@/components/promotions/PromotionForm"
import { Promotion } from "@/types"

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promotion | undefined>(undefined)

  const fetchPromotions = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/promotions")
      if (!res.ok) throw new Error("Failed to fetch promotions")
      
      const data = await res.json()
      setPromotions(data)
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูลโปรโมชั่นได้")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

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
    try {
      const res = await fetch(`/api/promotions/${promotion.id}`, {
        method: "DELETE",
      })
      
      if (!res.ok) throw new Error("Failed to delete promotion")
      
      toast.success("ลบโปรโมชั่นสำเร็จ")
      fetchPromotions()
    } catch (error) {
      toast.error("ไม่สามารถลบโปรโมชั่นได้")
      console.error(error)
    }
  }

  const handleSuccess = () => {
    setIsDialogOpen(false)
    fetchPromotions()
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
              <Tag className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            จัดการโปรโมชั่น
          </h1>
          <p className="text-muted-foreground mt-1">
            ตั้งค่าส่วนลดสำหรับสินค้าในร้าน ทั้งแบบลดราคาคงที่ ลดเปอร์เซ็นต์ หรือจัดชุดราคาพิเศษ
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2 shadow-md hover:shadow-lg transition-all">
          <Plus className="h-4 w-4" />
          สร้างโปรโมชั่น
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex justify-end bg-card p-2 rounded-xl border shadow-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchPromotions} 
          disabled={isLoading}
          className="text-muted-foreground"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          รีเฟรชข้อมูล
        </Button>
      </div>

      {/* Content */}
      {isLoading && promotions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin mb-4 text-primary" />
          <p>กำลังโหลดข้อมูลโปรโมชั่น...</p>
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
        <DialogContent className="sm:max-w-[425px]">
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
