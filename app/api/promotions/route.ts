import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/promotions
export async function GET() {
  try {
    const promotions = await prisma.promotion.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(promotions)
  } catch (error) {
    console.error("GET /api/promotions error:", error)
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลโปรโมชั่นได้" }, { status: 500 })
  }
}

// POST /api/promotions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, value, quantityRequired, specialPrice, applicableCategories } = body

    if (!name || !type) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 })
    }

    const promotion = await prisma.promotion.create({
      data: {
        name,
        type,
        value: parseFloat(value || "0"),
        quantityRequired: parseInt(quantityRequired || "0"),
        specialPrice: parseFloat(specialPrice || "0"),
        applicableCategories: Array.isArray(applicableCategories) ? applicableCategories : [],
      },
    })

    return NextResponse.json(promotion, { status: 201 })
  } catch (error) {
    console.error("POST /api/promotions error:", error)
    return NextResponse.json({ error: "ไม่สามารถสร้างโปรโมชั่นได้" }, { status: 500 })
  }
}
