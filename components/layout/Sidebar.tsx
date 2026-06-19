'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconShoppingCart,
  IconPackage,
  IconTag,
  IconHistory,
  IconLayoutDashboard,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/pos', label: 'ขายสินค้า', icon: IconShoppingCart },
  { href: '/products', label: 'สินค้า', icon: IconPackage },
  { href: '/promotions', label: 'โปรโมชั่น', icon: IconTag },
  { href: '/history', label: 'ประวัติ', icon: IconHistory },
  { href: '/', label: 'แดชบอร์ด', icon: IconLayoutDashboard },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col w-[200px] h-full shrink-0 z-40 bg-card border-r border-border/40">
      <div className="flex flex-col flex-grow overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-2.5 h-16 px-4 border-b border-border/40 shrink-0">
          <div className="h-8 w-8 rounded-xl overflow-hidden border border-border/50 shadow-sm shrink-0">
            <Image
              src="/logo.jpg"
              alt="BogiePOS Logo"
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-foreground leading-tight tracking-tight">
              BogiePOS
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium">
              ร้านพรีม
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group',
                  isActive
                    ? 'bg-secondary/70 text-foreground font-semibold shadow-sm'
                    : 'text-muted-foreground font-medium hover:text-foreground hover:bg-accent/50',
                )}
              >
                <item.icon
                  stroke={isActive ? 2.5 : 1.75}
                  className={cn(
                    'h-[18px] w-[18px] shrink-0 transition-colors',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground group-hover:text-foreground',
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 mt-auto shrink-0">
          <div className="rounded-2xl bg-secondary/80 px-3 py-2 text-[10px] font-medium text-muted-foreground text-center border border-border/40">
            BogiePOS v1.0 by Title.
          </div>
        </div>
      </div>
    </aside>
  );
}
