import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/products — ดึงสินค้าทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const activeOnly = searchParams.get("active") !== "false"
    const isMinimal = searchParams.get("minimal") === "true"

    const where = {
      ...(activeOnly && { isActive: true }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { barcode: { equals: search } }, // ปรับเป็น equals เพื่อให้ชน index ของบาร์โค้ดโดยตรง (เร็วขึ้นมาก)
        ],
      }),
      ...(category && category !== "all" && { category }),
    }

    const select = isMinimal ? {
      id: true,
      name: true,
      category: true,
      price: true,
      stock: true,
      barcode: true,
    } : undefined

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select, // ส่ง select ไปยัง Prisma เพื่อดึงเฉพาะฟิลด์ที่ต้องการ
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({ products, total, page, limit })
  } catch (error) {
    console.error("GET /api/products error:", error)
    return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลสินค้าได้" }, { status: 500 })
  }
}

// POST /api/products — สร้างสินค้าใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, price, costPrice, stock, barcode } = body

    if (!name || price === undefined) {
      return NextResponse.json({ error: "กรุณากรอกชื่อสินค้าและราคา" }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        category: category || "อื่นๆ",
        price: parseFloat(price),
        costPrice: parseFloat(costPrice || "0"),
        stock: parseInt(stock || "0"),
        barcode: barcode || null,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: unknown) {
    console.error("POST /api/products error:", error)
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "บาร์โค้ดนี้มีอยู่ในระบบแล้ว" }, { status: 409 })
    }
    return NextResponse.json({ error: "ไม่สามารถสร้างสินค้าได้" }, { status: 500 })
  }
}
