import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/sales/[id] — ดูรายละเอียด sale
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: { product: true },
        },
        promotion: true,
      },
    })

    if (!sale) {
      return NextResponse.json({ error: "ไม่พบรายการขาย" }, { status: 404 })
    }

    return NextResponse.json(sale)
  } catch (error) {
    console.error("GET /api/sales/[id] error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}
