"use client"

import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { IconDots, IconPencil, IconTrash } from "@tabler/icons-react"

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
import { formatCurrency, cn } from "@/lib/utils"
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
      cell: ({ row }) => <div className="font-semibold text-foreground">{row.getValue("name")}</div>
    },
    {
      accessorKey: "type",
      header: "ประเภท",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        if (type === "FIXED_DISCOUNT") {
          return (
            <Badge className="bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100/80 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/50 font-semibold">
              ลดราคาคงที่
            </Badge>
          )
        }
        if (type === "PERCENT_DISCOUNT") {
          return (
            <Badge className="bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/80 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50 font-semibold">
              ลดเปอร์เซ็นต์
            </Badge>
          )
        }
        if (type === "BUNDLE") {
          return (
            <Badge className="bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100/80 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800/50 font-semibold">
              ซื้อเป็นชุด
            </Badge>
          )
        }
        return <Badge>{type}</Badge>
      }
    },
    {
      id: "details",
      header: "รายละเอียดส่วนลด",
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="font-bold text-foreground/90">
            {p.type === "FIXED_DISCOUNT" && `ลด ${formatCurrency(p.value)}`}
            {p.type === "PERCENT_DISCOUNT" && `ลด ${p.value}%`}
            {p.type === "BUNDLE" && `ซื้อ ${p.quantityRequired} ชิ้น ราคา ${formatCurrency(p.specialPrice)}`}
          </div>
        )
      }
    },
    {
      id: "applicableCategories",
      header: "ใช้ได้กับ",
      cell: ({ row }) => {
        const p = row.original
        const hasCategories = p.applicableCategories && p.applicableCategories.length > 0
        return (
          <div className="flex flex-wrap gap-1 items-center max-w-[240px]">
            {hasCategories ? (
              p.applicableCategories.map((cat) => (
                <Badge 
                  key={cat} 
                  variant="outline" 
                  className="text-[10px] px-2 py-0.5 bg-violet-50/40 text-violet-700 border-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-800"
                >
                  {cat}
                </Badge>
              ))
            ) : (
              <Badge 
                variant="outline" 
                className="text-[10px] px-2 py-0.5 text-muted-foreground bg-muted/20 border-border/50"
              >
                ทุกสินค้า (ทั้งร้าน)
              </Badge>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: "isActive",
      header: "สถานะ",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return isActive ? (
          <Badge className="bg-[var(--success-soft)] text-[var(--success)] hover:bg-[var(--success-soft)] border-transparent font-bold">
            เปิดใช้งาน
          </Badge>
        ) : (
          <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-transparent dark:bg-slate-800 dark:text-slate-400 font-medium">
            ปิด
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
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-lg">
                <span className="sr-only">Open menu</span>
                <IconDots className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuLabel>จัดการ</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(promotion)} className="rounded-lg">
                <IconPencil className="mr-2 h-4 w-4 stroke-[2]" /> แก้ไข
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setDeletePromo(promotion)}
                className="text-destructive focus:text-destructive rounded-lg"
              >
                <IconTrash className="mr-2 h-4 w-4 stroke-[2]" /> ลบ
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
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const id = header.id
                  const isCenter = id === "isActive"
                  const isRight = id === "actions"
                  return (
                    <TableHead 
                      key={header.id} 
                      className={cn(
                        "text-[11px] font-bold uppercase tracking-wider text-muted-foreground h-11 px-4 align-middle border-b border-border/40",
                        isCenter ? "text-center" : isRight ? "text-right" : "text-left"
                      )}
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
                    const id = cell.column.id
                    const isCenter = id === "isActive"
                    const isRight = id === "actions"
                    return (
                      <TableCell 
                        key={cell.id}
                        className={cn(
                          "px-4 py-3.5 align-middle border-b border-border/40",
                          isCenter ? "text-center" : isRight ? "text-right" : "text-left"
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
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
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>ยืนยันการลบโปรโมชั่น</DialogTitle>
            <DialogDescription>
              คุณต้องการลบโปรโมชั่น <span className="font-bold text-foreground">"{deletePromo?.name}"</span> ใช่หรือไม่?
              (ระบบจะเปลี่ยนสถานะเป็นปิดใช้งานแทนการลบถาวรเพื่อรักษาประวัติ)
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setDeletePromo(null)}>ยกเลิก</Button>
            <Button variant="destructive" className="rounded-xl" onClick={() => {
              if (deletePromo) onDelete(deletePromo)
              setDeletePromo(null)
            }}>ลบโปรโมชั่น</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

