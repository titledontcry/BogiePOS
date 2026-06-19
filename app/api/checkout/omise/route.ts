import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json()

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: "ยอดชำระเงินไม่ถูกต้อง" }, { status: 400 })
    }

    const secretKey = process.env.OMISE_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: "ไม่พบการตั้งค่า Omise Secret Key" }, { status: 500 })
    }

    // Convert amount to Satangs (Integer)
    const amountInSatang = Math.round(Number(amount) * 100)

    // Basic Auth header for Omise API
    const authHeader = "Basic " + Buffer.from(secretKey + ":").toString("base64")

    // 1. Create a PromptPay Source
    const sourceResponse = await fetch("https://api.omise.co/sources", {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "promptpay",
        amount: amountInSatang,
        currency: "thb",
      }),
    })

    const sourceData = await sourceResponse.json()

    if (!sourceResponse.ok) {
      console.error("Omise Source Creation Error:", sourceData)
      throw new Error(sourceData.message || "ไม่สามารถสร้าง PromptPay Source ได้")
    }

    // 2. Create a Charge using the Source
    const chargeResponse = await fetch("https://api.omise.co/charges", {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInSatang,
        currency: "thb",
        source: sourceData.id,
      }),
    })

    const chargeData = await chargeResponse.json()

    if (!chargeResponse.ok) {
      console.error("Omise Charge Creation Error:", chargeData)
      throw new Error(chargeData.message || "ไม่สามารถสร้างรายการชำระเงินได้")
    }

    // Extract PromptPay QR Code Image URL
    const qrCodeImageUrl = chargeData.source?.scannable_code?.image?.download_uri || null

    if (!qrCodeImageUrl) {
      throw new Error("ไม่สามารถดาวน์โหลดรูปภาพ QR Code ได้")
    }

    return NextResponse.json({
      chargeId: chargeData.id,
      status: chargeData.status,
      qrCodeImageUrl,
    })
  } catch (error: any) {
    console.error("Omise API Error:", error)
    return NextResponse.json({ error: error.message || "การเชื่อมโยงระบบชำระเงินขัดข้อง" }, { status: 500 })
  }
}
