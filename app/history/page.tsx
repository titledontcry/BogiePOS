"use client"

import { useEffect, useState, useCallback } from "react"
import { Download, RefreshCw, History } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button"
import { SaleTable } from "@/components/history/SaleTable"
import { SaleDetailDialog } from "@/components/history/SaleDetailDialog"
import { Sale } from "@/types"
import { formatDate } from "@/lib/utils"

export default function HistoryPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Dialog state
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const fetchSales = useCallback(async () => {
    setIsLoading(true)
    try {
      // For demo, getting max 100 items. In real app, implement pagination.
      const res = await fetch("/api/sales?limit=100")
      if (!res.ok) throw new Error("Failed to fetch sales")
      
      const data = await res.json()
      setSales(data.sales)
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูลประวัติการขายได้")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const handleViewDetail = (sale: Sale) => {
    setSelectedSale(sale)
    setIsDetailOpen(true)
  }

  const exportToExcel = () => {
    try {
      const dataToExport = sales.map(s => ({
        "รหัสอ้างอิง": s.id,
        "วันที่-เวลา": formatDate(s.createdAt),
        "ยอดรวม": s.subtotal,
        "ส่วนลดโปรโมชั่น": s.promotionDiscount,
        "ส่วนลดเพิ่มเติม": s.manualDiscount,
        "ยอดสุทธิ": s.total,
        "หมายเหตุ": s.note || "",
        "จำนวนรายการ (ชิ้น)": s.items.reduce((sum, i) => sum + i.quantity, 0)
      }))

      const worksheet = XLSX.utils.json_to_sheet(dataToExport)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "ประวัติการขาย")
      
      XLSX.writeFile(workbook, `sales_history_${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success("ดาวน์โหลดไฟล์ Excel สำเร็จ")
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการสร้างไฟล์ Excel")
      console.error(error)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
              <History className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
            ประวัติการขาย
          </h1>
          <p className="text-muted-foreground mt-1">
            ดูรายการขายที่ผ่านมา และดาวน์โหลดรายงานเป็นไฟล์ Excel
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchSales} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </Button>
          <Button 
            onClick={exportToExcel} 
            disabled={sales.length === 0}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Download className="h-4 w-4" />
            ส่งออก Excel
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading && sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <RefreshCw className="h-8 w-8 animate-spin mb-4 text-primary" />
          <p>กำลังโหลดข้อมูลประวัติการขาย...</p>
        </div>
      ) : (
        <SaleTable 
          data={sales} 
          onViewDetail={handleViewDetail} 
        />
      )}

      {/* Detail Dialog */}
      <SaleDetailDialog 
        sale={selectedSale}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  )
}
