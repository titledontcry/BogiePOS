import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/products/summary — ดึงสรุปยอดสต็อกสินค้าทั้งหมด
export async function GET() {
  try {
    const activeWhere = { isActive: true }

    const [totalCount, inStockCount, lowStockCount, outOfStockCount] = await Promise.all([
      prisma.product.count({ where: activeWhere }),
      prisma.product.count({ where: { ...activeWhere, stock: { gt: 0 } } }),
      prisma.product.count({ where: { ...activeWhere, stock: { gt: 0, lte: 5 } } }),
      prisma.product.count({ where: { ...activeWhere, stock: { equals: 0 } } })
    ])

    return NextResponse.json({
      total: totalCount,
      inStock: inStockCount,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount
    })
  } catch (error) {
    console.error("GET /api/products/summary error:", error)
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลสรุปสินค้าได้" }, { status: 500 })
  }
}
