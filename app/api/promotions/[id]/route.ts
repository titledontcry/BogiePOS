import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PUT /api/promotions/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, type, value, quantityRequired, specialPrice, applicableCategories, isActive } = body

    const promotion = await prisma.promotion.update({
      where: { id: parseInt(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(value !== undefined && { value: parseFloat(value) }),
        ...(quantityRequired !== undefined && { quantityRequired: parseInt(quantityRequired) }),
        ...(specialPrice !== undefined && { specialPrice: parseFloat(specialPrice) }),
        ...(applicableCategories !== undefined && { applicableCategories }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(promotion)
  } catch (error) {
    console.error("PUT /api/promotions/[id] error:", error)
    return NextResponse.json({ error: "ไม่สามารถแก้ไขโปรโมชั่นได้" }, { status: 500 })
  }
}

// DELETE /api/promotions/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.promotion.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/promotions/[id] error:", error)
    return NextResponse.json({ error: "ไม่สามารถลบโปรโมชั่นได้" }, { status: 500 })
  }
}
