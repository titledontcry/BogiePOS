'use client';

import { formatCurrency, formatDate } from '@/lib/utils';
import { Sale } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconPrinter } from '@tabler/icons-react';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';

interface SaleDetailDialogProps {
  sale: Sale | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaleDetailDialog({
  sale,
  open,
  onOpenChange,
}: SaleDetailDialogProps) {
  const cashier = useAuthStore((state) => state.user);
  const settings = useSettingsStore((state) => state.settings);

  if (!sale) return null;

  const totalDiscount = sale.promotionDiscount + sale.manualDiscount;

  const printReceipt = (sale: Sale) => {
    if (!sale) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    const invId = `INV-${sale.id.toString().padStart(6, '0')}`;
    const dateStr = new Date(sale.createdAt).toLocaleString('th-TH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const finalTotal = sale.total;
    const promoDiscount = sale.promotionDiscount || 0;
    const manDiscount = sale.manualDiscount || 0;
    const initialSubtotal = sale.subtotal;
    const totalDiscount = promoDiscount + manDiscount;

    // Dynamic settings
    const enableVat = settings?.enableVat ?? true;
    const vatRate = settings?.vatRate ?? 7.0;

    const vatExcluded = enableVat ? finalTotal / (1 + (vatRate / 100)) : finalTotal;
    const vatAmount = enableVat ? finalTotal - vatExcluded : 0;

    const itemsHtml = sale.items
      .map((item: any, idx: number) => {
        const name = item.product?.name || 'สินค้าไม่มีชื่อ';
        const qty = item.quantity;
        const price = item.unitPrice;
        const itemTotal = item.subtotal;
        return `
        <tr>
          <td style="text-align: center; padding: 5px 4px;">${idx + 1}</td>
          <td style="text-align: left; padding: 5px 4px; max-width: 250px; word-wrap: break-word;">${name}</td>
          <td style="text-align: center; padding: 5px 4px;">${qty}</td>
          <td style="text-align: right; padding: 5px 4px;">${price.toFixed(2)}</td>
          <td style="text-align: right; padding: 5px 4px;">${itemTotal.toFixed(2)}</td>
        </tr>
      `;
      })
      .join('');

    const payMethodText =
      sale.paymentMethod === 'PROMPTPAY' ? 'PromptPay (โอนชำระ)' : 'เงินสด';

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
                      <td class="value">${cashier?.name || 'พนักงานหน้าร้าน'}</td>
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
                    <div style="font-size: 8px; color: #555; margin-top: 3px;">( ${cashier?.name || 'พนักงานหน้าร้าน'} )</div>
                  </div>
                </div>

                <div class="totals-area">
                  <div class="totals-row">
                    <span>รวมเงินก่อนลด / Subtotal:</span>
                    <span class="bold">฿${initialSubtotal.toFixed(2)}</span>
                  </div>
                  ${
                    totalDiscount > 0
                      ? `
                  <div class="totals-row" style="color: #10b981;">
                    <span>ส่วนลดรวม / Discount:</span>
                    <span class="bold">-฿${totalDiscount.toFixed(2)}</span>
                  </div>
                  `
                      : ''
                  }
                  ${enableVat ? `
                  <div class="totals-row">
                    <span>ฐานภาษี ${vatRate}% / VAT-Excl. Amount:</span>
                    <span>฿${vatExcluded.toFixed(2)}</span>
                  </div>
                  <div class="totals-row">
                    <span>ภาษีมูลค่าเพิ่ม ${vatRate}% / VAT ${vatRate}%:</span>
                    <span>฿${vatAmount.toFixed(2)}</span>
                  </div>
                  ` : ''}
                  <div class="totals-row grand-total">
                    <span>ยอดรวมทั้งสิ้น / Net Total:</span>
                    <span>฿${finalTotal.toFixed(2)}</span>
                  </div>
                  <div class="totals-row bold">
                    <span>ชำระเงินโดย / Paid by:</span>
                    <span>${payMethodText}</span>
                  </div>
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
    `;

    doc.open();
    doc.write(receiptHtml);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 5000);
    }, 500);
  };

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
                <div
                  key={item.id}
                  className="flex justify-between items-start text-sm"
                >
                  <div>
                    <div className="font-medium">
                      {item.product?.name || 'สินค้าถูกลบ'}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-xl space-y-2 border">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>ยอดรวมสินค้า</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>ช่องทางชำระเงิน</span>
              <span className="font-semibold text-foreground/80">
                {sale.paymentMethod === 'PROMPTPAY' ? 'PromptPay QR' : 'เงินสด'}
              </span>
            </div>

            {sale.promotion && (
              <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                <div className="flex items-center gap-2">
                  <span>โปรโมชั่น</span>
                  <Badge
                    variant="outline"
                    className="text-[10px] h-4 px-1 py-0 border-emerald-200 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30"
                  >
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

          <div className="flex justify-end gap-2 pt-3 border-t mt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-10 px-4 text-xs font-semibold"
            >
              ปิดหน้าต่าง
            </Button>
            <Button
              onClick={() => printReceipt(sale)}
              className="rounded-xl h-10 px-4 text-xs font-bold gap-1.5"
            >
              <IconPrinter className="h-4 w-4" /> พิมพ์ใบเสร็จ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
