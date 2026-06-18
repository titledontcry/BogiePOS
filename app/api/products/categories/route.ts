import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/products/categories
export async function GET() {
  try {
    const categories = await prisma.product.groupBy({
      by: ["category"],
      where: { isActive: true },
      orderBy: {
        category: "asc",
      },
    })
    return NextResponse.json(categories.map((c) => c.category))
  } catch (error) {
    console.error("GET /api/products/categories error:", error)
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลหมวดหมู่ได้" }, { status: 500 })
  }
}
