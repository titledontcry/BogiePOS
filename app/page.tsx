"use client"

import { useEffect, useState, useCallback } from "react"
import { 
  TrendingUp, 
  ShoppingCart, 
  PackageSearch, 
  Tag, 
  RefreshCw 
} from "lucide-react"
import { useDashboardStore } from "@/store/dashboardStore"
import { toast } from "sonner"

import { StatCard } from "@/components/dashboard/StatCard"
import { SalesCharts } from "@/components/dashboard/SalesCharts"
import { BestSellerList } from "@/components/dashboard/BestSellerList"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"

interface DashboardData {
  revenue: number
  transactions: number
  itemsSold: number
  totalDiscount: number
  profit: number
  dailySales: { date: string; revenue: number; transactions: number }[]
  monthlySales: { month: string; revenue: number }[]
  bestSellers: { productName: string; totalQty: number; totalRevenue: number }[]
}

export default function DashboardPage() {
  const cache = useDashboardStore((state) => state.cache)
  const storeFetchDashboard = useDashboardStore((state) => state.fetchDashboard)
  const storeIsLoading = useDashboardStore((state) => state.isLoading)

  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState("today") // today, week, month, all

  const data = cache[period] || null

  const fetchDashboard = useCallback(async (force = false) => {
    setIsLoading(true)
    try {
      await storeFetchDashboard(period, force)
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูลภาพรวมได้")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [period, storeFetchDashboard])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-3xl border bg-card px-5 py-5 shadow-[var(--shadow-soft)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-balance">ภาพรวมร้านวันนี้</h1>
          <p className="text-muted-foreground mt-1 text-pretty">
            สรุปยอดขาย กำไร และสถิติที่สำคัญของร้าน
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="เลือกช่วงเวลา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">วันนี้</SelectItem>
              <SelectItem value="week">7 วันล่าสุด</SelectItem>
              <SelectItem value="month">เดือนนี้</SelectItem>
              <SelectItem value="all">ทั้งหมด</SelectItem>
            </SelectContent>
          </Select>
          <button 
            onClick={() => fetchDashboard(true)} 
            disabled={isLoading || storeIsLoading}
            className="grid h-11 w-11 place-items-center rounded-2xl border bg-card hover:bg-accent transition-colors disabled:opacity-50"
            aria-label="รีเฟรชข้อมูลภาพรวม"
          >
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${isLoading || storeIsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <RefreshCw className="h-10 w-10 animate-spin mb-4 text-primary" />
          <p>กำลังรวบรวมข้อมูล...</p>
        </div>
      ) : data ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="ยอดขายรวม" 
              value={formatCurrency(data.revenue)} 
              icon={<TrendingUp className="h-5 w-5" />}
              description={`กำไรโดยประมาณ: ${formatCurrency(data.profit)}`}
            />
            <StatCard 
              title="จำนวนบิล" 
              value={`${data.transactions} บิล`} 
              icon={<ShoppingCart className="h-5 w-5" />} 
            />
            <StatCard 
              title="สินค้าที่ขายได้" 
              value={`${data.itemsSold} ชิ้น`} 
              icon={<PackageSearch className="h-5 w-5" />} 
            />
            <StatCard 
              title="ส่วนลดที่มอบให้" 
              value={formatCurrency(data.totalDiscount)} 
              icon={<Tag className="h-5 w-5" />} 
            />
          </div>

          {/* Charts Area */}
          <SalesCharts 
            dailySales={data.dailySales} 
            monthlySales={data.monthlySales} 
          />

          {/* Bottom Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <BestSellerList products={data.bestSellers} />
            </div>
            <div className="lg:col-span-2">
              {/* Optional: We could add Low Stock Items or Recent Transactions here */}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
