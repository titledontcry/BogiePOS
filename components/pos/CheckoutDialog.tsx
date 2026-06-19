"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Receipt, Coins, QrCode, Loader2, Printer, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCartStore } from "@/store/cartStore"
import { formatCurrency } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import { useSettingsStore } from "@/store/settingsStore"

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subtotal: number
  promotionDiscount: number
  manualDiscount: number
  total: number
  promotionId: number | null
  onSuccess: (soldItems: { productId: number; quantity: number }[]) => void
}

export function CheckoutDialog({ 
  open, 
  onOpenChange, 
  subtotal, 
  promotionDiscount, 
  manualDiscount, 
  total,
  promotionId,
  onSuccess
}: CheckoutDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "PROMPTPAY">("CASH")
  const [cashReceived, setCashReceived] = useState<string>("")
  const [note, setNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const items = useCartStore((state) => state.items)
  const cashier = useAuthStore((state) => state.user)
  const settings = useSettingsStore((state) => state.settings)
  
  // Checkout success & Receipt states
  const [createdSale, setCreatedSale] = useState<any | null>(null)

  useEffect(() => {
    if (settings && !settings.enablePromptpay && paymentMethod === "PROMPTPAY") {
      setPaymentMethod("CASH")
    }
  }, [settings, paymentMethod])
  
  // Omise states
  const [chargeId, setChargeId] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "generating" | "pending" | "successful" | "failed">("idle")
  
  const cash = parseFloat(cashReceived) || 0
  const change = Math.max(0, cash - total)
  const isEnoughCash = cash >= total || cash === 0

  // Reset states on dialog close
  useEffect(() => {
    if (!open) {
      setPaymentMethod("CASH")
      setCashReceived("")
      setNote("")
      setChargeId(null)
      setQrCodeUrl(null)
      setPaymentStatus("idle")
      setCreatedSale(null)
      setIsLoading(false)
    }
  }, [open])

  // Poll status when charge is pending
  useEffect(() => {
    if (paymentStatus !== "pending" || !chargeId) return

    let isMounted = true
    let intervalId: NodeJS.Timeout

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/checkout/omise/status?chargeId=${chargeId}`)
        if (!res.ok) throw new Error("Failed to check status")
        const data = await res.json()

        if (isMounted) {
          if (data.status === "successful") {
            setPaymentStatus("successful")
          } else if (data.status === "failed") {
            setPaymentStatus("failed")
            toast.error("การชำระเงินล้มเหลว หรือหมดเวลาทำรายการ")
          }
        }
      } catch (err) {
        console.error("Status polling error:", err)
      }
    }

    checkStatus()
    intervalId = setInterval(checkStatus, 3000)

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [paymentStatus, chargeId])

  // Trigger sale recording when paymentStatus changes to successful
  useEffect(() => {
    if (paymentStatus === "successful") {
      const timer = setTimeout(() => {
        submitSaleRecord("PROMPTPAY")
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [paymentStatus])

  const generateQrCode = async () => {
    setPaymentStatus("generating")
    try {
      const res = await fetch("/api/checkout/omise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "สร้างคิวอาร์โค้ดไม่สำเร็จ")

      setChargeId(data.chargeId)
      setQrCodeUrl(data.qrCodeImageUrl)
      setPaymentStatus("pending")
    } catch (error: any) {
      setPaymentStatus("idle")
      toast.error(error.message || "ไม่สามารถสร้างคิวอาร์โค้ดได้")
    }
  }

  const simulatePaymentSuccess = async () => {
    if (!chargeId) return
    try {
      const res = await fetch("/api/checkout/omise/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chargeId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "จำลองจ่ายเงินไม่สำเร็จ")
      toast.success("จำลองการจ่ายเงินสำเร็จ รอยืนยันการชำระ...")
    } catch (error: any) {
      toast.error(error.message || "จำลองการจ่ายเงินล้มเหลว")
    }
  }

  const submitSaleRecord = async (overrideMethod?: "CASH" | "PROMPTPAY") => {
    const methodToUse = overrideMethod || paymentMethod
    if (methodToUse === "CASH" && cash > 0 && cash < total) {
      toast.error("รับเงินมาไม่พอดีกับยอดชำระ")
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
        promotionId,
        promotionDiscount,
        manualDiscount,
        subtotal,
        total,
        paymentMethod: methodToUse,
        note: note || undefined
      }

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "ชำระเงินไม่สำเร็จ")
      }

      toast.success("บันทึกการขายสำเร็จ")
      setCreatedSale(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ชำระเงินไม่สำเร็จ")
      if (methodToUse === "PROMPTPAY") {
        setPaymentStatus("idle")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const printReceipt = (sale: any) => {
    if (!sale) return

    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "0"
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow?.document || iframe.contentDocument
    if (!doc) return

    const invId = `INV-${sale.id.toString().padStart(6, "0")}`
    const dateStr = new Date(sale.createdAt).toLocaleString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    const finalTotal = sale.total
    const promoDiscount = sale.promotionDiscount || 0
    const manDiscount = sale.manualDiscount || 0
    const initialSubtotal = sale.subtotal
    const totalDiscount = promoDiscount + manDiscount
    
    // Dynamic settings
    const enableVat = settings?.enableVat ?? true
    const vatRate = settings?.vatRate ?? 7.0
    
    const vatExcluded = enableVat ? finalTotal / (1 + (vatRate / 100)) : finalTotal
    const vatAmount = enableVat ? finalTotal - vatExcluded : 0

    const itemsHtml = sale.items.map((item: any, idx: number) => {
      const name = item.product?.name || "สินค้าไม่มีชื่อ"
      const qty = item.quantity
      const price = item.unitPrice
      const itemTotal = item.subtotal
      return `
        <tr>
          <td style="text-align: center; padding: 5px 4px;">${idx + 1}</td>
          <td style="text-align: left; padding: 5px 4px; max-width: 250px; word-wrap: break-word;">${name}</td>
          <td style="text-align: center; padding: 5px 4px;">${qty}</td>
          <td style="text-align: right; padding: 5px 4px;">${price.toFixed(2)}</td>
          <td style="text-align: right; padding: 5px 4px;">${itemTotal.toFixed(2)}</td>
        </tr>
      `
    }).join("")

    const payMethodText = sale.paymentMethod === "PROMPTPAY" ? "PromptPay (โอนชำระ)" : "เงินสด"
    
    let cashPayHtml = ""
    if (sale.paymentMethod === "CASH") {
      const cashValue = parseFloat(cashReceived) || finalTotal
      const changeValue = Math.max(0, cashValue - finalTotal)
      cashPayHtml = `
        <div class="totals-row">
          <span>รับเงินสด / Cash Received:</span>
          <span>฿${cashValue.toFixed(2)}</span>
        </div>
        <div class="totals-row bold">
          <span>เงินทอน / Change:</span>
          <span>฿${changeValue.toFixed(2)}</span>
        </div>
      `
    }

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Receipt ${invId}</title>
          <style>
            @page { 
              size: A5 landscape; 
              margin: 5mm; 
            }
            body { 
              font-family: 'Sarabun', 'Thonburi', 'Helvetica Neue', Helvetica, Arial, sans-serif; 
              margin: 0; 
              padding: 0; 
              color: #111; 
              background: #fff; 
              line-height: 1.4; 
              font-size: 11px; 
            }
            .receipt-container {
              border: 1px solid #000;
              padding: 12px;
              min-height: 125mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .header-left {
              width: 60%;
            }
            .header-right {
              width: 40%;
              text-align: right;
            }
            .store-name { 
              font-size: 16px; 
              font-weight: bold; 
              margin-bottom: 3px; 
              color: #000;
            }
            .store-info { 
              font-size: 10px; 
              color: #222; 
              margin-bottom: 1.5px; 
            }
            .doc-title { 
              font-size: 14px; 
              font-weight: bold; 
              margin-bottom: 4px; 
              color: #000;
            }
            .doc-subtitle {
              font-size: 9px;
              font-weight: bold;
              color: #333;
              margin-bottom: 6px;
            }
            .meta-table {
              width: 100%;
              font-size: 10px;
              border-collapse: collapse;
            }
            .meta-table td {
              padding: 1.5px 0;
            }
            .meta-table td.label {
              color: #333;
              text-align: right;
              padding-right: 6px;
            }
            .meta-table td.value {
              font-weight: bold;
              text-align: left;
            }
            .table-items { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 4px; 
              font-size: 10px; 
            }
            .table-items th { 
              border-top: 1px solid #000;
              border-bottom: 1px solid #000; 
              padding: 5px 4px; 
              font-weight: bold; 
              background-color: #f5f5f7;
            }
            .table-items td {
              border-bottom: 1px dashed #ddd;
              vertical-align: middle;
            }
            .bottom-section {
              display: flex;
              justify-content: space-between;
              margin-top: auto;
              padding-top: 10px;
            }
            .signature-area {
              width: 50%;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              padding-bottom: 10px;
            }
            .signature-box {
              width: 48%;
              text-align: center;
              font-size: 10px;
            }
            .totals-area {
              width: 45%;
              font-size: 10px;
            }
            .totals-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 3.5px; 
            }
            .grand-total { 
              font-size: 13px; 
              font-weight: bold; 
              border-top: 1px solid #000; 
              border-bottom: 2px double #000; 
              padding: 5px 0; 
              margin-top: 4px; 
              margin-bottom: 4px;
            }
            .footer-note {
              text-align: center;
              font-size: 8px;
              color: #555;
              margin-top: 8px;
              border-top: 1px dashed #ccc;
              padding-top: 4px;
            }
            .bold {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div>
              <div class="header-container">
                <div class="header-left">
                  <div class="store-name">${settings?.storeName || 'หจก.น้องพรีม'}</div>
                  <div class="store-info">${settings?.storeBranch || 'สำนักงานใหญ่ (Branch 00000)'}</div>
                  <div class="store-info">${settings?.storeAddress || 'แขวงเสนานิคม เขตจตุจักร กรุงเทพมหานคร'}</div>
                  <div class="store-info"><span class="bold">เลขประจำตัวผู้เสียภาษี (TAX ID):</span> ${settings?.storeTaxId || '-'}</div>
                  <div class="store-info"><span class="bold">โทร:</span> ${settings?.storePhone || '064-514-5498'}</div>
                </div>
                <div class="header-right">
                  <div class="doc-title">ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ</div>
                  <div class="doc-subtitle">RECEIPT / ABBREVIATED TAX INVOICE</div>
                  <table class="meta-table" style="float: right; width: auto;">
                    <tr>
                      <td class="label">เลขที่ / No:</td>
                      <td class="value">${invId}</td>
                    </tr>
                    <tr>
                      <td class="label">วันที่ / Date:</td>
                      <td class="value">${dateStr}</td>
                    </tr>
                    <tr>
                      <td class="label">เครื่อง / POS:</td>
                      <td class="value">POS#1</td>
                    </tr>
                    <tr>
                      <td class="label">ผู้ขาย / Cashier:</td>
                      <td class="value">${cashier?.name || "พนักงานหน้าร้าน"}</td>
                    </tr>
                  </table>
                </div>
              </div>

              <table class="table-items">
                <thead>
                  <tr>
                    <th style="text-align: center; width: 6%;">ลำดับ</th>
                    <th style="text-align: left; width: 54%;">รายการสินค้า / Description</th>
                    <th style="text-align: center; width: 10%;">จำนวน / Qty</th>
                    <th style="text-align: right; width: 14%;">ราคา/หน่วย / Price</th>
                    <th style="text-align: right; width: 16%;">รวมเงิน / Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <div>
              <div class="bottom-section">
                <div class="signature-area">
                  <div class="signature-box">
                    <div style="margin-bottom: 35px; color: #777;">ลงชื่อ .......................................................</div>
                    <div class="bold">ผู้รับสินค้า / Customer</div>
                    <div style="font-size: 8px; color: #555; margin-top: 3px;">วันที่ / Date: ...../...../.....</div>
                  </div>
                  <div class="signature-box">
                    <div style="margin-bottom: 35px; color: #777;">ลงชื่อ .......................................................</div>
                    <div class="bold">ผู้รับเงิน / Authorized Signature</div>
                    <div style="font-size: 8px; color: #555; margin-top: 3px;">( ${cashier?.name || "พนักงานหน้าร้าน"} )</div>
                  </div>
                </div>

                <div class="totals-area">
                  <div class="totals-row">
                    <span>รวมเงินก่อนลด / Subtotal:</span>
                    <span class="bold">฿${initialSubtotal.toFixed(2)}</span>
                  </div>
                  ${totalDiscount > 0 ? `
                  <div class="totals-row" style="color: #10b981;">
                    <span>ส่วนลดรวม / Discount:</span>
                    <span class="bold">-฿${totalDiscount.toFixed(2)}</span>
                  </div>
                  ` : ""}
                  
                  ${enableVat ? `
                  <div class="totals-row">
                    <span>ฐานภาษี ${vatRate}% / VAT-Excl. Amount:</span>
                    <span>฿${vatExcluded.toFixed(2)}</span>
                  </div>
                  <div class="totals-row">
                    <span>ภาษีมูลค่าเพิ่ม ${vatRate}% / VAT ${vatRate}%:</span>
                    <span>฿${vatAmount.toFixed(2)}</span>
                  </div>
                  ` : ""}
                  
                  <div class="totals-row grand-total">
                    <span>ยอดรวมทั้งสิ้น / Net Total:</span>
                    <span>฿${finalTotal.toFixed(2)}</span>
                  </div>
                  <div class="totals-row bold">
                    <span>ชำระเงินโดย / Paid by:</span>
                    <span>${payMethodText}</span>
                  </div>
                  ${cashPayHtml}
                </div>
              </div>

              <div class="footer-note">
                ${settings?.receiptFooter || 'ขอบคุณที่อุดหนุนสินค้าของเรา / Thank You for Your Business. สินค้าซื้อแล้วไม่รับเปลี่ยนหรือคืน / No Exchange, No Return.'}
                <br>
                ${enableVat ? '*ราคารวมภาษีมูลค่าเพิ่มแล้ว / VAT Included | ' : ''}เอกสารนี้ออกโดยระบบคอมพิวเตอร์ / Computer-generated document
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    doc.open()
    doc.write(receiptHtml)
    doc.close()

    setTimeout(() => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 5000)
    }, 500)
  }

  const handleNewSale = () => {
    onSuccess(items.map(i => ({ productId: i.productId, quantity: i.quantity })))
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      if (createdSale) {
        handleNewSale()
      } else {
        onOpenChange(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {createdSale ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-6 animate-fade-in-scale">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-16 w-16 bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center rounded-full shadow-inner animate-[fadeInScale_0.4s_var(--ease-spring)]">
                <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">ทำรายการขายสำเร็จ</h3>
                <p className="text-sm text-muted-foreground">
                  เลขที่ใบเสร็จ: <span className="font-mono font-bold text-foreground">INV-{createdSale.id.toString().padStart(6, "0")}</span>
                </p>
              </div>
            </div>

            {/* Transaction Brief Card */}
            <div className="w-full bg-muted/40 p-4 rounded-xl border space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ช่องทางชำระเงิน</span>
                <span className="font-bold">
                  {createdSale.paymentMethod === "PROMPTPAY" ? "PromptPay QR" : "เงินสด"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ยอดสุทธิ</span>
                <span className="font-bold text-primary">{formatCurrency(createdSale.total)}</span>
              </div>
              {createdSale.paymentMethod === "CASH" && (cashReceived !== "") && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">รับเงินสด</span>
                    <span>{formatCurrency(parseFloat(cashReceived) || createdSale.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-border/40">
                    <span className="text-muted-foreground font-semibold">เงินทอน</span>
                    <span className="font-bold text-[var(--success)]">{formatCurrency(change)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => printReceipt(createdSale)}
                className="w-full h-11 rounded-xl font-bold gap-2 hover:bg-muted/80"
              >
                <Printer className="h-4 w-4" /> พิมพ์ใบเสร็จ
              </Button>
              <Button
                onClick={handleNewSale}
                className="w-full h-11 rounded-xl font-bold gap-2"
              >
                <RefreshCw className="h-4 w-4" /> เริ่มการขายใหม่
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Receipt className="h-5 w-5 text-primary" /> ยืนยันการชำระเงิน
              </DialogTitle>
              <DialogDescription>
                เลือกวิธีชำระเงินและตรวจสอบยอดสุทธิ
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-3">
              {/* Top Invoice Card */}
              <div className="bg-muted/30 p-4 rounded-xl space-y-2 border">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>ยอดรวมสินค้า</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {(promotionDiscount > 0 || manualDiscount > 0) && (
                  <div className="flex justify-between text-sm text-[var(--success)]">
                    <span>ส่วนลดรวม</span>
                    <span>-{formatCurrency(promotionDiscount + manualDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-2 border-t border-border/50">
                  <span className="font-medium">ยอดสุทธิ</span>
                  <span className="text-3xl font-extrabold text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Payment Method Toggle Selector */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted/60 rounded-xl border select-none">
                <button
                  type="button"
                  onClick={() => {
                    if (paymentStatus === "idle" || paymentStatus === "failed") {
                      setPaymentMethod("CASH")
                    }
                  }}
                  disabled={paymentStatus === "generating" || paymentStatus === "pending" || paymentStatus === "successful"}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                    paymentMethod === "CASH"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/30"
                  }`}
                >
                  <Coins className="h-3.5 w-3.5" />
                  ชำระเงินสด
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (paymentStatus === "idle" || paymentStatus === "failed") {
                      setPaymentMethod("PROMPTPAY")
                    }
                  }}
                  disabled={paymentStatus === "generating" || paymentStatus === "pending" || paymentStatus === "successful"}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                    paymentMethod === "PROMPTPAY"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/30"
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5" />
                  PromptPay QR
                </button>
              </div>

              {/* Payment Method Screens */}
              {paymentMethod === "CASH" ? (
                <div className="space-y-4 pt-1 animate-fade-in-scale">
                  <div className="space-y-2">
                    <Label htmlFor="cash">รับเงินสด (บาท)</Label>
                    <Input
                      id="cash"
                      type="number"
                      placeholder="จำนวนเงินที่รับมา (เว้นว่างได้)"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="text-lg rounded-xl h-11"
                      autoFocus
                    />
                  </div>

                  {cash > 0 && (
                    <div className={`p-4 rounded-xl border flex justify-between items-center ${
                      isEnoughCash 
                        ? 'bg-[var(--success-soft)] border-transparent text-[var(--success)]' 
                        : 'bg-destructive/10 border-destructive/20 text-destructive'
                    }`}>
                      <span className="font-medium text-sm">เงินทอน</span>
                      <span className="text-xl font-bold">
                        {isEnoughCash ? formatCurrency(change) : "รับเงินไม่พอ"}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="note">หมายเหตุ (ถ้ามี)</Label>
                    <Input
                      id="note"
                      placeholder="เช่น จ่ายโอน, ลูกค้า VIP..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              ) : (
                // PromptPay View State Machine
                <div className="border rounded-xl p-4 bg-muted/10 min-h-[220px] flex flex-col justify-center">
                  {paymentStatus === "idle" && (
                    <div className="flex flex-col items-center justify-center text-center space-y-4 animate-fade-in-scale">
                      <QrCode className="h-14 w-14 text-primary/40 stroke-[1.5]" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold">สแกนชำระด้วย PromptPay QR</p>
                        <p className="text-xs text-muted-foreground">ระบบจะสร้างคิวอาร์ความปลอดภัยพร้อมล็อกยอดเงินสุทธิ</p>
                      </div>
                      <Button 
                        onClick={generateQrCode}
                        className="w-full max-w-[200px] rounded-xl h-10 font-bold"
                      >
                        สร้าง QR Code โอนเงิน
                      </Button>
                    </div>
                  )}

                  {paymentStatus === "generating" && (
                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-xs font-semibold text-muted-foreground">กำลังเจเนอเรต QR Code จาก Omise...</p>
                    </div>
                  )}

                  {paymentStatus === "pending" && (
                    <div className="flex flex-col items-center justify-center text-center space-y-4 animate-fade-in-scale">
                      <div className="relative p-2 bg-white rounded-xl border shadow-sm">
                        <img 
                          src={qrCodeUrl!} 
                          alt="PromptPay QR Code" 
                          className="h-44 w-44 object-contain select-none" 
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-primary animate-pulse flex items-center gap-1.5 justify-center">
                          <Loader2 className="h-3 w-3 animate-spin" /> กำลังตรวจสอบยอดชำระเงิน...
                        </p>
                        <p className="text-[10px] text-muted-foreground">ลูกค้าสแกน QR Code เพื่อชำระยอดเงิน {formatCurrency(total)}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={simulatePaymentSuccess}
                        className="text-[10px] h-8 border-dashed text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-xl"
                      >
                        จำลองชำระเงินสำเร็จ (Test Mode)
                      </Button>
                    </div>
                  )}

                  {paymentStatus === "successful" && (
                    <div className="flex flex-col items-center justify-center text-center space-y-3 animate-fade-in-scale">
                      <div className="h-12 w-12 bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center rounded-full shadow-inner animate-[fadeInScale_0.3s_var(--ease-spring)]">
                        <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--success)]">ชำระเงินเสร็จสมบูรณ์!</p>
                        <p className="text-xs text-muted-foreground mt-1">กำลังบันทึกประวัติเข้าระบบ...</p>
                      </div>
                    </div>
                  )}

                  {paymentStatus === "failed" && (
                    <div className="flex flex-col items-center justify-center text-center space-y-3 animate-fade-in-scale">
                      <p className="text-xs font-bold text-destructive">ชำระเงินล้มเหลว หรือหมดเวลา</p>
                      <Button 
                        onClick={generateQrCode}
                        className="rounded-xl h-8 text-xs"
                      >
                        สร้าง QR Code อีกครั้ง
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="mt-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading || paymentStatus === "generating" || paymentStatus === "pending" || paymentStatus === "successful"}
                className="rounded-xl"
              >
                ยกเลิก
              </Button>
              {paymentMethod === "CASH" && (
                <Button 
                  onClick={() => submitSaleRecord("CASH")} 
                  disabled={isLoading || (cash > 0 && cash < total)}
                  className="gap-2 rounded-xl"
                >
                  {isLoading ? "กำลังบันทึก..." : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> ยืนยันชำระเงิน
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
