"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ShoppingCart,
  Package,
  Tag,
  History,
  LayoutDashboard,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/pos", label: "ขาย", icon: ShoppingCart },
  { href: "/products", label: "สินค้า", icon: Package },
  { href: "/promotions", label: "โปรฯ", icon: Tag },
  { href: "/history", label: "ประวัติ", icon: History },
  { href: "/", label: "สรุป", icon: LayoutDashboard },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/90 backdrop-blur-xl border-t border-border/50 safe-area-pb">
      <div className="flex items-center justify-around h-17 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition-all duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] active:scale-[0.92]",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-[var(--duration-smooth)] ease-[var(--ease-out-back)]",
                isActive && "bg-primary/8 text-foreground shadow-[var(--shadow-soft)] scale-110"
              )}>
                <item.icon className="h-4 w-4" />
              </div>
              <span className={cn(
                "text-[10px] transition-all duration-[var(--duration-normal)]",
                isActive ? "font-bold" : "font-medium"
              )}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
