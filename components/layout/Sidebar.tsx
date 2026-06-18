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
      <div className="flex flex-col flex-grow bg-card/92 border-r border-border overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-3 h-18 px-5 border-b border-border">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent border border-border shadow-[var(--shadow-soft)]">
            <Image 
              src="/logo.jpg" 
              alt="BogiePOS Logo" 
              width={30} 
              height={30} 
              className="rounded-xl object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-foreground leading-tight">
              BogiePOS
            </h1>
            <p className="text-[11px] text-muted-foreground font-semibold">ร้านพร้อมขาย</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/75"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-border">
          <p className="rounded-xl bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground text-center">
            BogiePOS v1.0
          </p>
        </div>
      </div>
    </aside>
  )
}
