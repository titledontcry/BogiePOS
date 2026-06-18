"use client"

import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Promotion } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PromotionTableProps {
  data: Promotion[]
  onEdit: (promotion: Promotion) => void
  onDelete: (promotion: Promotion) => void
}

export function PromotionTable({ data, onEdit, onDelete }: PromotionTableProps) {
  const [deletePromo, setDeletePromo] = useState<Promotion | null>(null)

  const columns: ColumnDef<Promotion>[] = [
    {
      accessorKey: "name",
      header: "ชื่อโปรโมชั่น",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>
    },
    {
      accessorKey: "type",
      header: "ประเภท",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        if (type === "FIXED_DISCOUNT") return <Badge variant="secondary">ลดราคาคงที่</Badge>
        if (type === "PERCENT_DISCOUNT") return <Badge variant="outline">ลดเปอร์เซ็นต์</Badge>
        if (type === "BUNDLE") return <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-200 border-0">ซื้อเป็นชุด</Badge>
        return <Badge>{type}</Badge>
      }
    },
    {
      id: "details",
      header: "รายละเอียด",
      cell: ({ row }) => {
        const p = row.original
        const hasCategories = p.applicableCategories && p.applicableCategories.length > 0
        return (
          <div className="space-y-1">
            <div className="font-medium">
              {p.type === "FIXED_DISCOUNT" && `ลด ${formatCurrency(p.value)}`}
              {p.type === "PERCENT_DISCOUNT" && `ลด ${p.value}%`}
              {p.type === "BUNDLE" && `ซื้อ ${p.quantityRequired} ชิ้น ราคา ${formatCurrency(p.specialPrice)}`}
            </div>
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-[10px] text-muted-foreground mr-1">ใช้กับ:</span>
              {hasCategories ? (
                p.applicableCategories.map((cat) => (
                  <Badge key={cat} variant="outline" className="text-[9px] px-1 py-0 bg-violet-50/50 text-violet-600 dark:bg-violet-950/20 dark:text-violet-400 border-violet-200 dark:border-violet-800">
                    {cat}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="text-[9px] px-1 py-0 text-muted-foreground bg-muted/30">
                  ทุกสินค้า (ทั้งร้าน)
                </Badge>
              )}
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "isActive",
      header: "สถานะ",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <Badge variant={isActive ? "success" : "secondary"}>
            {isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
          </Badge>
        )
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const promotion = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>จัดการ</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(promotion)}>
                <Pencil className="mr-2 h-4 w-4" /> แก้ไข
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setDeletePromo(promotion)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" /> ลบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
    <div>
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  ไม่พบข้อมูลโปรโมชั่น
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deletePromo} onOpenChange={(open) => !open && setDeletePromo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบโปรโมชั่น</DialogTitle>
            <DialogDescription>
              คุณต้องการลบโปรโมชั่น <span className="font-bold text-foreground">"{deletePromo?.name}"</span> ใช่หรือไม่?
              (ระบบจะเปลี่ยนสถานะเป็นปิดใช้งานแทนการลบถาวรเพื่อรักษาประวัติ)
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePromo(null)}>ยกเลิก</Button>
            <Button variant="destructive" onClick={() => {
              if (deletePromo) onDelete(deletePromo)
              setDeletePromo(null)
            }}>ลบโปรโมชั่น</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
