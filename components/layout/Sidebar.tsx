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
  IconSettings,
  IconPower,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: '/pos', label: 'ขายสินค้า', icon: IconShoppingCart },
  { href: '/products', label: 'สินค้า', icon: IconPackage },
  { href: '/promotions', label: 'โปรโมชั่น', icon: IconTag },
  { href: '/history', label: 'ประวัติ', icon: IconHistory },
  { href: '/', label: 'แดชบอร์ด', icon: IconLayoutDashboard },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  return (
    <aside className="hidden lg:flex lg:flex-col w-[72px] h-full shrink-0 z-40 bg-card border-r border-border/40">
      <div className="flex flex-col items-center h-full flex-grow py-4 overflow-y-auto min-h-0">
        {/* Logo (Centered, no text) */}
        <div className="flex items-center justify-center h-12 w-12 rounded-xl overflow-hidden border border-border/50 shadow-sm shrink-0 mb-6 bg-white">
          <Image
            src="/logo.jpg"
            alt="BogiePOS Logo"
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Navigation - Icon only with custom tooltips */}
        <nav className="flex-1 flex flex-col items-center gap-3 w-full px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'h-12 w-12 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 group relative',
                  isActive
                    ? 'bg-[#1D1D1F] text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
                )}
              >
                <item.icon
                  stroke={isActive ? 2.25 : 1.75}
                  className="h-5 w-5 shrink-0"
                />
                
                {/* Custom tooltip helper (on hover) */}
                <span className="absolute left-16 opacity-0 translate-x-1 transition-all duration-200 rounded bg-neutral-900 p-2 text-xs text-white group-hover:opacity-100 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-md pointer-events-none font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions (Settings & Logout) */}
        <div className="flex flex-col items-center gap-3 mt-auto shrink-0 w-full px-2 pt-4 border-t border-border/30">
          {/* Settings button */}
          <Link
            href="/settings"
            className={cn(
              'h-12 w-12 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 group relative',
              pathname === '/settings'
                ? 'bg-[#1D1D1F] text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
            )}
          >
            <IconSettings stroke={pathname === '/settings' ? 2.25 : 1.75} className="h-5 w-5" />
            <span className="absolute left-16 opacity-0 translate-x-1 transition-all duration-200 rounded bg-neutral-900 p-2 text-xs text-white group-hover:opacity-100 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-md pointer-events-none font-medium">
              ตั้งค่า
            </span>
          </Link>

          {/* Logout button */}
          <button
            onClick={() => logout()}
            className="h-12 w-12 flex items-center justify-center rounded-xl text-[#FF3B30] bg-[#FF3B30]/10 hover:bg-[#FF3B30]/15 transition-all duration-200 active:scale-95 cursor-pointer group relative"
          >
            <IconPower stroke={2} className="h-5 w-5" />
            <span className="absolute left-16 opacity-0 translate-x-1 transition-all duration-200 rounded bg-neutral-900 p-2 text-xs text-white group-hover:opacity-100 group-hover:translate-x-0 z-50 whitespace-nowrap shadow-md pointer-events-none font-medium">
              ออกจากระบบ
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
