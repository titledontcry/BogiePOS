import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/products/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    })
    if (!product) {
      return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    console.error("GET /api/products/[id] error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 })
  }
}

// PUT /api/products/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, category, price, costPrice, stock, barcode } = body

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        ...(name !== undefined && { name }),
        ...(category !== undefined && { category }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(costPrice !== undefined && { costPrice: parseFloat(costPrice) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(barcode !== undefined && { barcode: barcode || null }),
      },
    })

    return NextResponse.json(product)
  } catch (error: unknown) {
    console.error("PUT /api/products/[id] error:", error)
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "บาร์โค้ดนี้มีอยู่ในระบบแล้ว" }, { status: 409 })
    }
    return NextResponse.json({ error: "ไม่สามารถแก้ไขสินค้าได้" }, { status: 500 })
  }
}

// DELETE /api/products/[id] — soft delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error)
    return NextResponse.json({ error: "ไม่สามารถลบสินค้าได้" }, { status: 500 })
  }
}
