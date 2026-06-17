"use client"

import { formatCurrency, formatDate } from "@/lib/utils"
import { Sale } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface SaleDetailDialogProps {
  sale: Sale | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaleDetailDialog({ sale, open, onOpenChange }: SaleDetailDialogProps) {
  if (!sale) return null

  const totalDiscount = sale.promotionDiscount + sale.manualDiscount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>รายละเอียดการขาย</DialogTitle>
          <DialogDescription>
            รหัสอ้างอิง: #{sale.id.toString().padStart(6, '0')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground flex justify-between">
            <span>วันที่: {formatDate(sale.createdAt)}</span>
            <span>รายการสินค้า: {sale.items.length} รายการ</span>
          </div>

          <div className="rounded-xl border overflow-hidden">
            <div className="max-h-[250px] overflow-y-auto p-4 space-y-3 bg-muted/10">
              {sale.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div>
                    <div className="font-medium">{item.product?.name || "สินค้าถูกลบ"}</div>
                    <div className="text-muted-foreground text-xs">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </div>
                  </div>
                  <div className="font-medium">{formatCurrency(item.subtotal)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-xl space-y-2 border">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>ยอดรวมสินค้า</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>

            {sale.promotion && (
              <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                <div className="flex items-center gap-2">
                  <span>โปรโมชั่น</span>
                  <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
                    {sale.promotion.name}
                  </Badge>
                </div>
                <span>-{formatCurrency(sale.promotionDiscount)}</span>
              </div>
            )}

            {sale.manualDiscount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                <span>ส่วนลดเพิ่มเติม</span>
                <span>-{formatCurrency(sale.manualDiscount)}</span>
              </div>
            )}

            <Separator className="my-2" />

            <div className="flex justify-between items-end pt-1">
              <span className="font-medium">ยอดสุทธิ</span>
              <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                {formatCurrency(sale.total)}
              </span>
            </div>
          </div>

          {sale.note && (
            <div className="text-sm bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50">
              <span className="font-semibold">หมายเหตุ:</span> {sale.note}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
