"use client"

import Image from "next/image"
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
  { href: "/", label: "แดชบอร์ด", icon: LayoutDashboard },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-40">
      <div className="flex flex-col flex-grow bg-card border-r border-border overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-6 border-b border-border">
          <Image 
            src="/logo.jpg" 
            alt="BogiePOS Logo" 
            width={32} 
            height={32} 
            className="rounded-md object-cover border border-border"
          />
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
