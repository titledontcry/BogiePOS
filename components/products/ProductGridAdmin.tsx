import { Product } from "@/types"
import { ProductCardAdmin } from "./ProductCardAdmin"
import { PackageOpen } from "lucide-react"

interface ProductGridAdminProps {
  data: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductGridAdmin({ data, onEdit, onDelete }: ProductGridAdminProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed bg-card/50">
        <div className="bg-muted p-4 rounded-full mb-4">
          <PackageOpen className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-semibold text-muted-foreground">ไม่พบข้อมูลสินค้า</p>
        <p className="text-sm text-muted-foreground/60 mt-1">ลองเปลี่ยนคำค้นหา หรือเพิ่มสินค้าใหม่เข้าสู่ระบบ</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
      {data.map((product) => (
        <ProductCardAdmin
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
