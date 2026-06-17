"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Eye, FileText } from "lucide-react"

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
import { formatCurrency, formatDate } from "@/lib/utils"

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
        return <div className="font-mono text-xs text-muted-foreground">#{id.toString().padStart(6, '0')}</div>
      }
    },
    {
      accessorKey: "createdAt",
      header: "วันที่-เวลา",
      cell: ({ row }) => <div>{formatDate(row.getValue("createdAt") as string)}</div>
    },
    {
      id: "items",
      header: "จำนวนชิ้น",
      cell: ({ row }) => {
        const items = row.original.items
        const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)
        return <div>{totalQty} ชิ้น</div>
      }
    },
    {
      id: "discount",
      header: "ส่วนลด",
      cell: ({ row }) => {
        const s = row.original
        const totalDiscount = s.promotionDiscount + s.manualDiscount
        if (totalDiscount === 0) return <div className="text-muted-foreground">-</div>
        return <div className="text-emerald-600 dark:text-emerald-400">-{formatCurrency(totalDiscount)}</div>
      }
    },
    {
      accessorKey: "total",
      header: "ยอดสุทธิ",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("total"))
        return <div className="font-bold text-violet-600 dark:text-violet-400">{formatCurrency(amount)}</div>
      },
    },
    {
      id: "note",
      header: "หมายเหตุ",
      cell: ({ row }) => {
        const note = row.original.note
        return note ? <Badge variant="outline" className="text-xs truncate max-w-[150px]">{note}</Badge> : <div>-</div>
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const sale = row.original
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 gap-1"
            onClick={() => onViewDetail(sale)}
          >
            <Eye className="h-4 w-4" /> ดูบิล
          </Button>
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
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="font-semibold text-foreground">
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
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-48 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <FileText className="h-8 w-8 opacity-20" />
                ไม่มีข้อมูลการขายในช่วงเวลานี้
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
