// components/auth/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const { login, isLoading, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!username.trim()) {
      setValidationError('กรุณากรอกชื่อผู้ใช้');
      return;
    }
    if (!password) {
      setValidationError('กรุณากรอกรหัสผ่าน');
      return;
    }

    await login(username, password);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F5F7] p-4 md:p-6 lg:p-8">
      {/* Premium Split Card Container */}
      <div className="w-full max-w-[940px] bg-white border border-[#D2D2D7]/50 rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.06),0_2px_12px_rgba(0,0,0,0.03)] flex flex-col md:flex-row min-h-[580px] animate-fade-in-up transform transition-all duration-300">
        {/* Left Pane - Image & Branding (Hidden on mobile) */}
        <div
          className="relative md:w-1/2 bg-cover bg-center flex flex-col justify-end p-8 lg:p-12 text-white overflow-hidden min-h-[260px] md:min-h-auto"
          style={{ backgroundImage: "url('/IMG_0324.JPG')" }}
        >
          {/* Blur / Darkening overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-10" />

          <div className="relative z-20">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md text-white font-extrabold text-lg mb-6 tracking-tight">
              B
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
              Welcome to BogiePOS
            </h2>
            <p className="text-white/80 text-sm lg:text-base font-normal leading-relaxed max-w-[340px]">
              ระบบจัดการหน้าร้านเสื้อผ้ามือสอง ของกรชุลี(พรีม)
              แต่เพียงผู้เดียวนะจ๊ะ
            </p>
          </div>
        </div>

        {/* Right Pane - Form */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-[340px] mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#1D1D1F]">
                เข้าสู่ระบบใช้งาน
              </h1>
              <p className="text-xs font-semibold text-[#6E6E73] mt-2 uppercase tracking-wider">
                User Login
              </p>
            </div>

            {/* Error Banners */}
            {(error || validationError) && (
              <div className="mb-6 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-xl flex items-start gap-2">
                <span className="text-[#FF3B30] text-sm font-medium leading-relaxed">
                  {validationError || error}
                </span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-2 uppercase tracking-wider">
                  ชื่อผู้ใช้
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6E73]">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    placeholder="กรอกชื่อผู้ใช้"
                    autoComplete="username"
                    className="w-full bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl h-12 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all text-[#1D1D1F] text-sm"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-2 uppercase tracking-wider">
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6E73]">
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="กรอกรหัสผ่าน"
                    autoComplete="current-password"
                    className="w-full bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl h-12 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition-all text-[#1D1D1F] text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6E73] hover:text-[#1D1D1F] transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1D1D1F] text-white font-semibold rounded-2xl h-12 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  'เข้าสู่ระบบ'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-[11px] text-[#6E6E73] font-medium">
                หากจำรหัสผ่านไม่ได้ กรุณาติดต่อผู้ดูแลระบบ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Smooth Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#F5F5F7]/85 backdrop-blur-md z-[9999] flex flex-col items-center justify-center animate-fade-in">
          <div className="text-center">
            {/* Pulsating Logo Container */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1D1D1F] text-white font-extrabold text-3xl mb-6 tracking-tight shadow-lg animate-bounce-gentle">
              B
            </div>
            {/* Spinning Indicator */}
            <div className="flex justify-center mb-4">
              <Loader2 className="animate-spin text-[#1D1D1F]" size={28} />
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F] tracking-tight">
              กำลังเข้าสู่ระบบ...
            </h3>
            <p className="text-xs font-semibold text-[#6E6E73] mt-1.5">
              กำลังเตรียมข้อมูล POS ร้านของหนูพรีม
            </p>
          </div>
        </div>
      )}

      {/* Styled Entry Animation */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes bounceGentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-bounce-gentle {
          animation: bounceGentle 1.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
