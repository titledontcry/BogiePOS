"use client"

import { useEffect, useState, useCallback } from "react"
import { IconHistory, IconRefresh, IconDownload, IconCalendar } from "@tabler/icons-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button"
import { SaleTable } from "@/components/history/SaleTable"
import { SaleDetailDialog } from "@/components/history/SaleDetailDialog"
import { Sale } from "@/types"
import { formatDate, cn } from "@/lib/utils"

export default function HistoryPage() {
  const formatLocalDate = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const date = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${date}`
  }

  const getDatesFromOption = useCallback((option: string) => {
    const today = new Date()
    const toStr = formatLocalDate(today)
    let fromStr = toStr

    if (option === "7days") {
      const past = new Date()
      past.setDate(today.getDate() - 6)
      fromStr = formatLocalDate(past)
    } else if (option === "30days") {
      const past = new Date()
      past.setDate(today.getDate() - 29)
      fromStr = formatLocalDate(past)
    }
    return { from: fromStr, to: toStr }
  }, [])

  const initialDates = getDatesFromOption("7days")

  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Date filter state
  const [rangeOption, setRangeOption] = useState<"today" | "7days" | "30days" | "custom">("7days")
  const [fromDate, setFromDate] = useState<string>(initialDates.from)
  const [toDate, setToDate] = useState<string>(initialDates.to)
  
  // Custom range input fields
  const [customFrom, setCustomFrom] = useState<string>(initialDates.from)
  const [customTo, setCustomTo] = useState<string>(initialDates.to)

  // Dialog state
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const fetchSales = useCallback(async () => {
    setIsLoading(true)
    try {
      const url = new URL("/api/sales", window.location.origin)
      url.searchParams.append("limit", "100") // Get max 100 items for history page
      if (fromDate) url.searchParams.append("from", fromDate)
      if (toDate) url.searchParams.append("to", toDate)
      
      const res = await fetch(url.toString())
      if (!res.ok) throw new Error("Failed to fetch sales")
      
      const data = await res.json()
      setSales(data.sales)
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูลประวัติการขายได้")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [fromDate, toDate])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  const handleRangeOptionChange = (opt: "today" | "7days" | "30days" | "custom") => {
    setRangeOption(opt)
    if (opt !== "custom") {
      const dates = getDatesFromOption(opt)
      setFromDate(dates.from)
      setToDate(dates.to)
    } else {
      // Set inputs to current values or today
      const todayStr = formatLocalDate(new Date())
      setCustomFrom(fromDate || todayStr)
      setCustomTo(toDate || todayStr)
    }
  }

  const handleApplyCustomDates = () => {
    if (!customFrom || !customTo) {
      toast.error("กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด")
      return
    }
    if (new Date(customFrom) > new Date(customTo)) {
      toast.error("วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด")
      return
    }
    setFromDate(customFrom)
    setToDate(customTo)
  }

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-2xl shrink-0">
            <IconHistory className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">ประวัติการขาย</h1>
            <p className="text-sm text-muted-foreground mt-1">
              ดูรายการขายที่ผ่านมา ค้นหาช่วงเวลา และส่งออกรายงานเป็นไฟล์ Excel
            </p>
          </div>
        </div>
        <div className="flex gap-3 shrink-0 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={fetchSales} 
            disabled={isLoading}
            className="gap-2 rounded-xl h-10 w-10 p-0 sm:w-auto sm:px-4 shrink-0"
            title="รีเฟรช"
          >
            <IconRefresh className={`h-4 w-4 stroke-[2] ${isLoading ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
            <span className="hidden sm:inline">รีเฟรช</span>
          </Button>
          <Button 
            onClick={exportToExcel} 
            disabled={sales.length === 0}
            className="gap-2 rounded-xl h-10 flex-1 sm:flex-none shrink-0"
          >
            <IconDownload className="h-4 w-4 stroke-[2.5]" />
            ส่งออก Excel
          </Button>
        </div>
      </div>

      {/* Date Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-3 rounded-2xl border border-border/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground/80 shrink-0">
            <IconCalendar className="h-4 w-4 text-muted-foreground stroke-[2]" />
            <span>ช่วงเวลา:</span>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {["today", "7days", "30days", "custom"].map((opt) => {
              const label = opt === "today" ? "วันนี้" 
                          : opt === "7days" ? "7 วันล่าสุด" 
                          : opt === "30days" ? "30 วันล่าสุด" 
                          : "กำหนดเอง"
              const isActive = rangeOption === opt
              return (
                <Button
                  key={opt}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleRangeOptionChange(opt as any)}
                  className={cn(
                    "rounded-xl px-4.5 py-1.5 text-xs font-semibold h-9",
                    isActive 
                      ? "bg-secondary text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                  )}
                >
                  {label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Custom date range inputs */}
        {rangeOption === "custom" && (
          <div className="flex items-center gap-2 w-full md:w-auto animate-in fade-in slide-in-from-top-1 duration-200">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-3 py-1.5 h-9 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto"
            />
            <span className="text-muted-foreground text-xs shrink-0">ถึง</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-3 py-1.5 h-9 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto"
            />
            <Button 
              size="sm" 
              onClick={handleApplyCustomDates}
              className="h-9 px-4 rounded-xl shrink-0"
            >
              ตกลง
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading && sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <IconRefresh className="h-8 w-8 animate-spin mb-4 text-primary/50 stroke-[2]" />
          <p>กำลังโหลดข้อมูลประวัติการขาย...</p>
        </div>
      ) : (
        <SaleTable 
          data={sales} 
          onViewDetail={handleViewDetail} 
        />
      )}

      {/* Footer / Summary row */}
      {sales.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-8 border-t border-border/40 mt-6">
          <div className="text-sm text-muted-foreground">
            ทั้งหมด <span className="font-semibold text-foreground">{sales.length}</span> รายการ
          </div>
          <Button 
            variant="outline"
            onClick={exportToExcel}
            className="gap-2 rounded-xl border-border/60 hover:bg-muted/40 h-10 px-4 text-sm font-semibold"
          >
            <IconDownload className="h-4 w-4 stroke-[2]" />
            ส่งออก Excel
          </Button>
        </div>
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
