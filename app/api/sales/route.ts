import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/sales — ดึงประวัติการขาย
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const where = {
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to + "T23:59:59.999Z") }),
            },
          }
        : {}),
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          items: {
            include: { product: true },
          },
          promotion: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sale.count({ where }),
    ])

    return NextResponse.json({ sales, total, page, limit })
  } catch (error) {
    console.error("GET /api/sales error:", error)
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลการขายได้" }, { status: 500 })
  }
}

// POST /api/sales — Checkout (ใช้ Prisma Transaction)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, promotionId, promotionDiscount, manualDiscount, subtotal, total, note, paymentMethod } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "ไม่มีสินค้าในตะกร้า" }, { status: 400 })
    }

    const sale = await prisma.$transaction(async (tx) => {
      // 1. ตรวจสอบ stock เพียงพอ
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        })
        if (!product) {
          throw new Error(`ไม่พบสินค้า ID: ${item.productId}`)
        }
        if (product.stock < item.quantity) {
          throw new Error(`สินค้า "${product.name}" stock ไม่พอ (เหลือ ${product.stock} ชิ้น)`)
        }
      }

      // 2. สร้าง Sale + SaleItems
      const newSale = await tx.sale.create({
        data: {
          subtotal: parseFloat(subtotal),
          promotionDiscount: parseFloat(promotionDiscount || "0"),
          manualDiscount: parseFloat(manualDiscount || "0"),
          total: parseFloat(total),
          note: note || null,
          paymentMethod: paymentMethod || "CASH",
          promotionId: promotionId || null,
          items: {
            create: items.map((item: { productId: number; quantity: number; unitPrice: number }) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          items: { include: { product: true } },
          promotion: true,
        },
      })

      // 3. ลด stock ทุกชิ้น
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      return newSale
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    console.error("POST /api/sales error:", error)
    const message = error instanceof Error ? error.message : "ไม่สามารถชำระเงินได้"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
