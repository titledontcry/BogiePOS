"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { IconEye, IconReceiptOff } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Sale } from "@/types"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

interface SaleTableProps {
  data: Sale[]
  onViewDetail: (sale: Sale) => void
}

export function SaleTable({ data, onViewDetail }: SaleTableProps) {
  const columns: ColumnDef<Sale>[] = [
    {
      accessorKey: "id",
      header: "รหัสอ้างอิง",
      cell: ({ row }) => {
        const id = row.getValue("id") as number
        return (
          <div className="flex justify-center">
            <span className="font-mono text-xs bg-muted border border-border/40 px-2 py-0.5 rounded font-semibold text-foreground/80">
              #{id.toString().padStart(6, '0')}
            </span>
          </div>
        )
      }
    },
    {
      accessorKey: "createdAt",
      header: "วันที่-เวลา",
      cell: ({ row }) => <div className="text-foreground/90 text-center">{formatDate(row.getValue("createdAt") as string)}</div>
    },
    {
      id: "items",
      header: "จำนวนชิ้น",
      cell: ({ row }) => {
        const items = row.original.items
        const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)
        return <div className="tabular-nums font-semibold text-foreground/90 text-center">{totalQty} ชิ้น</div>
      }
    },
    {
      id: "discount",
      header: "ส่วนลด",
      cell: ({ row }) => {
        const s = row.original
        const totalDiscount = s.promotionDiscount + s.manualDiscount
        if (totalDiscount === 0) return <div className="text-muted-foreground text-center">-</div>
        return <div className="text-[var(--success)] font-bold tabular-nums text-center">-{formatCurrency(totalDiscount)}</div>
      }
    },
    {
      accessorKey: "total",
      header: "ยอดสุทธิ",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("total"))
        return <div className="font-extrabold text-foreground tabular-nums text-center">{formatCurrency(amount)}</div>
      },
    },
    {
      accessorKey: "paymentMethod",
      header: "ช่องทางชำระ",
      cell: ({ row }) => {
        const method = row.original.paymentMethod || "CASH"
        return (
          <div className="flex justify-center">
            <Badge 
              variant={method === "PROMPTPAY" ? "default" : "secondary"}
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-bold select-none",
                method === "PROMPTPAY" 
                  ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 shadow-none" 
                  : "bg-muted text-muted-foreground border-border/40 hover:bg-muted/80 shadow-none"
              )}
            >
              {method === "PROMPTPAY" ? "PromptPay" : "เงินสด"}
            </Badge>
          </div>
        )
      }
    },
    {
      id: "note",
      header: "หมายเหตุ",
      cell: ({ row }) => {
        const note = row.original.note
        return note ? (
          <div className="flex justify-center">
            <Badge variant="outline" className="text-xs truncate max-w-[150px]">{note}</Badge>
          </div>
        ) : (
          <div className="text-muted-foreground text-center">-</div>
        )
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const sale = row.original
        return (
          <div className="flex justify-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 gap-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => onViewDetail(sale)}
            >
              <IconEye className="h-4 w-4 stroke-[2]" /> ดูบิล
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/30">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead 
                    key={header.id} 
                    className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground h-11 px-4 align-middle border-b border-border/40 text-center"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:bg-muted/30 transition-colors"
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <TableCell 
                      key={cell.id}
                      className="align-middle border-b border-border/40 text-center"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-72">
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4 max-w-sm mx-auto">
                  <div className="p-4 bg-muted/40 rounded-full text-muted-foreground/60">
                    <IconReceiptOff className="h-10 w-10 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-foreground">ไม่มีข้อมูลการขายในช่วงเวลานี้</h3>
                    <p className="text-sm text-muted-foreground">
                      ไม่พบประวัติการทำรายการในช่วงเวลาที่เลือก คุณสามารถลองเปลี่ยนการกรองช่วงเวลาอื่น
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

