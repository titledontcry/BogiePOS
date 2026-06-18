import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Trophy } from "lucide-react"

interface BestSellerListProps {
  products: {
    productName: string
    totalQty: number
    totalRevenue: number
  }[]
}

export function BestSellerList({ products }: BestSellerListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-[oklch(0.62_0.12_78)]" /> สินค้าขายดี 5 อันดับแรก
        </CardTitle>
        <CardDescription>จัดอันดับจากจำนวนชิ้นที่ขายได้</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="flex justify-center py-8 text-muted-foreground text-sm">
            ไม่มีข้อมูลการขาย
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`
                    flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold
                    ${index === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500' : 
                      index === 1 ? 'bg-secondary text-secondary-foreground' : 
                      index === 2 ? 'bg-[var(--coral-soft)] text-[var(--coral)]' : 
                      'bg-muted text-muted-foreground'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none mb-1">{product.productName}</p>
                    <p className="text-xs text-muted-foreground">ยอดขายรวม {formatCurrency(product.totalRevenue)}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {product.totalQty} ชิ้น
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
