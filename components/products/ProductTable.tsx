"use client"

import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
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
import { Product } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ProductTableProps {
  data: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductTable({ data, onEdit, onDelete }: ProductTableProps) {
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "ชื่อสินค้า",
    },
    {
      accessorKey: "category",
      header: "หมวดหมู่",
      cell: ({ row }) => {
        const category = row.getValue("category") as string
        return <Badge variant="outline">{category}</Badge>
      }
    },
    {
      accessorKey: "price",
      header: "ราคาขาย",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"))
        return <div className="font-medium text-violet-600 dark:text-violet-400">{formatCurrency(amount)}</div>
      },
    },
    {
      accessorKey: "costPrice",
      header: "ต้นทุน",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("costPrice"))
        return <div className="text-muted-foreground">{formatCurrency(amount)}</div>
      },
    },
    {
      accessorKey: "stock",
      header: "สต๊อก",
      cell: ({ row }) => {
        const stock = parseInt(row.getValue("stock"))
        return (
          <Badge variant={stock > 10 ? "success" : stock > 0 ? "warning" : "destructive"}>
            {stock} ชิ้น
          </Badge>
        )
      },
    },
    {
      accessorKey: "barcode",
      header: "บาร์โค้ด",
      cell: ({ row }) => {
        const barcode = row.getValue("barcode") as string | null
        return barcode ? <div className="text-muted-foreground font-mono text-xs">{barcode}</div> : <div>-</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original

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
              <DropdownMenuItem onClick={() => onEdit(product)}>
                <Pencil className="mr-2 h-4 w-4" /> แก้ไข
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setDeleteProduct(product)}
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
    getPaginationRowModel: getPaginationRowModel(),
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  ไม่พบข้อมูลสินค้า
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          แสดงผล {table.getRowModel().rows.length} จาก {data.length} รายการ
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ก่อนหน้า
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            ถัดไป
          </Button>
        </div>
      </div>

      <Dialog open={!!deleteProduct} onOpenChange={(open) => !open && setDeleteProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ยืนยันการลบสินค้า</DialogTitle>
            <DialogDescription>
              คุณต้องการลบสินค้า <span className="font-bold text-foreground">"{deleteProduct?.name}"</span> ใช่หรือไม่?
              การกระทำนี้จะลบสินค้าออกจากหน้าร้าน (แต่ยังเก็บประวัติการขายไว้)
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProduct(null)}>ยกเลิก</Button>
            <Button variant="destructive" onClick={() => {
              if (deleteProduct) onDelete(deleteProduct)
              setDeleteProduct(null)
            }}>ลบสินค้า</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
