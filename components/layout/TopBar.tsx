'use client';

import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { LogOut } from 'lucide-react';

export default function TopBar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 border-b border-border bg-background/88 backdrop-blur-md">
      {/* Mobile Logo */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="h-10 w-10 rounded-2xl overflow-hidden border border-border shadow-[var(--shadow-soft)] shrink-0">
          <Image
            src="/logo.jpg"
            alt="BogiePOS Logo"
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-sm font-extrabold text-foreground leading-none">
            BogiePOS
          </h1>
          <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
            ร้านของหนูพรีมมมมมมม{' '}
          </p>
        </div>
      </div>

      {/* Desktop spacer */}
      <div className="hidden lg:block" />

      {/* Right corner User Profile & Logout */}
      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-foreground leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                  {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'พนักงานขาย'}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm">
                {user.name ? user.name[0] : 'U'}
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl bg-[#FF3B30]/10 hover:bg-[#FF3B30]/15 text-[#FF3B30] active:scale-97 transition-all cursor-pointer"
              title="ออกจากระบบ"
            >
              <LogOut size={15} />
              <span className="text-xs font-bold hidden xs:inline">ออกจากระบบ</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
