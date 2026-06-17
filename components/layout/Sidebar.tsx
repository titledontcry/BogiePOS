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
  { href: "/pos", label: "ขายสินค้า", icon: ShoppingCart },
  { href: "/products", label: "สินค้า", icon: Package },
  { href: "/promotions", label: "โปรโมชั่น", icon: Tag },
  { href: "/history", label: "ประวัติ", icon: History },
  { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-40">
      <div className="flex flex-col flex-grow bg-card border-r border-border overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-6 border-b border-border">
          {/* Minimal Logo Placeholder */}
          <div className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              BogiePOS
            </h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5 uppercase tracking-widest font-semibold">Store</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-black text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-slate-100"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-muted-foreground")} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            © 2024 BogiePOS v1.0
          </p>
        </div>
      </div>
    </aside>
  )
}
