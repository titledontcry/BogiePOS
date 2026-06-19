import { NextRequest, NextResponse } from "next/server"
import { simulatedPaidCharges } from "@/lib/omiseSimulation"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const chargeId = searchParams.get("chargeId")

    if (!chargeId) {
      return NextResponse.json({ error: "ไม่พบข้อมูล Charge ID" }, { status: 400 })
    }

    // 1. Check local simulation cache first
    if (simulatedPaidCharges.has(chargeId)) {
      return NextResponse.json({
        id: chargeId,
        status: "successful",
      })
    }

    // 2. Fall back to calling Omise live/test API
    const secretKey = process.env.OMISE_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: "ไม่พบการตั้งค่า Omise Secret Key" }, { status: 500 })
    }

    const authHeader = "Basic " + Buffer.from(secretKey + ":").toString("base64")

    const response = await fetch(`https://api.omise.co/charges/${chargeId}`, {
      method: "GET",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(`Omise Query Status Error for ${chargeId}:`, data)
      throw new Error(data.message || "ไม่สามารถดึงข้อมูลรายการชำระเงินได้")
    }

    // If the charge has been paid on the sandbox webview or simulated, also sync it back
    if (data.status === "successful") {
      simulatedPaidCharges.add(chargeId)
    }

    return NextResponse.json({
      id: data.id,
      status: data.status, // successful, pending, failed
    })
  } catch (error: any) {
    console.error("Omise Status API Error:", error)
    return NextResponse.json({ error: error.message || "การดึงข้อมูลสถานะชำระเงินขัดข้อง" }, { status: 500 })
  }
}
