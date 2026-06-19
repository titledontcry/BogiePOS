import { ReactNode } from "react"
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
    <div className={cn(
      "overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-[var(--shadow-soft)] card-hover-transition hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[var(--shadow-lift)] select-none",
      className
    )}>
      <div className="flex flex-row items-center justify-between p-6 pb-2 space-y-0">
        <h3 className="text-sm font-medium text-muted-foreground leading-none tracking-tight">
          {title}
        </h3>
        <div className="p-2 bg-accent text-accent-foreground rounded-xl">
          {icon}
        </div>
      </div>
      <div className="p-6 pt-0">
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
      </div>
    </div>
  )
}
