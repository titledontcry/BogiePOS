import { NextRequest, NextResponse } from "next/server"
import { simulatedPaidCharges } from "@/lib/omiseSimulation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const chargeId = body.chargeId

    if (!chargeId) {
      return NextResponse.json({ error: "ไม่พบข้อมูล Charge ID" }, { status: 400 })
    }

    // Add to simulated success cache
    simulatedPaidCharges.add(chargeId)
    console.log(`[Omise Sandbox] Simulated successful payment for charge: ${chargeId}`)

    return NextResponse.json({
      success: true,
      chargeId,
      status: "successful",
      message: "ระบบได้จำลองการโอนเงินสำเร็จสำหรับรหัสรายการนี้แล้ว",
    })
  } catch (error: any) {
    console.error("Simulation API Error:", error)
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการจำลองการชำระเงิน" }, { status: 500 })
  }
}
