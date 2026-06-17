import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/dashboard — ดึงข้อมูลสรุปสำหรับ Dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "today" // today | week | month | all

    const now = new Date()
    let startDate = new Date(0) // all time default

    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (period === 'week') {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const sales = await prisma.sale.findMany({
      where: period !== 'all' ? {
        createdAt: {
          gte: startDate
        }
      } : undefined,
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // คำนวณ Stats เบื้องต้น
    let revenue = 0
    let transactions = sales.length
    let itemsSold = 0
    let totalDiscount = 0
    let profit = 0

    // เตรียมข้อมูลสำหรับกราฟ
    const dailySalesMap = new Map<string, { revenue: number; transactions: number }>()
    const monthlySalesMap = new Map<string, { revenue: number }>()
    const bestSellersMap = new Map<string, { totalQty: number; totalRevenue: number }>()

    for (const sale of sales) {
      revenue += sale.total
      totalDiscount += sale.promotionDiscount + sale.manualDiscount

      // แปลงวันที่เป็น YYYY-MM-DD
      const dateStr = sale.createdAt.toISOString().split('T')[0]
      const monthStr = dateStr.substring(0, 7) // YYYY-MM

      // Daily
      if (!dailySalesMap.has(dateStr)) {
        dailySalesMap.set(dateStr, { revenue: 0, transactions: 0 })
      }
      const daily = dailySalesMap.get(dateStr)!
      daily.revenue += sale.total
      daily.transactions += 1

      // Monthly
      if (!monthlySalesMap.has(monthStr)) {
        monthlySalesMap.set(monthStr, { revenue: 0 })
      }
      monthlySalesMap.get(monthStr)!.revenue += sale.total

      // คำนวณ Item & Best Sellers
      for (const item of sale.items) {
        itemsSold += item.quantity
        const itemCost = (item.product?.costPrice || 0) * item.quantity
        profit += (item.subtotal - itemCost)

        // Best sellers
        const pName = item.product?.name || `Product #${item.productId}`
        if (!bestSellersMap.has(pName)) {
          bestSellersMap.set(pName, { totalQty: 0, totalRevenue: 0 })
        }
        const bs = bestSellersMap.get(pName)!
        bs.totalQty += item.quantity
        bs.totalRevenue += item.subtotal
      }
    }

    // หักลบส่วนลดรวมออกจากกำไร
    profit -= totalDiscount

    // แปลง Map เป็น Array เพื่อส่งกลับ
    const dailySales = Array.from(dailySalesMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const monthlySales = Array.from(monthlySalesMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))

    const bestSellers = Array.from(bestSellersMap.entries())
      .map(([productName, data]) => ({ productName, ...data }))
      .sort((a, b) => b.totalQty - a.totalQty)
      .slice(0, 5) // เอาแค่ 5 อันดับแรก

    return NextResponse.json({
      revenue,
      transactions,
      itemsSold,
      totalDiscount,
      profit,
      dailySales,
      monthlySales,
      bestSellers
    })

  } catch (error) {
    console.error("GET /api/dashboard error:", error)
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูล Dashboard ได้" }, { status: 500 })
  }
}
