import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({ title, value, icon, description, trend, className }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 bg-accent text-accent-foreground rounded-xl">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-extrabold tracking-tight">{value}</div>
        
        {(description || trend) && (
          <div className="flex items-center mt-1 text-xs text-muted-foreground">
            {trend && (
              <span className={cn(
                "font-medium mr-1",
                trend.isPositive ? "text-[var(--success)]" : "text-destructive"
              )}>
                {trend.isPositive ? "+" : "-"}{trend.value}%
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
