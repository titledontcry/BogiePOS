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
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all duration-200 min-w-[56px]",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-full transition-all duration-200",
                isActive && "bg-black text-white"
              )}>
                <item.icon className="h-4 w-4" />
              </div>
              <span className={cn("text-[10px] font-medium", isActive && "font-bold")}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
