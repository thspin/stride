'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, setCurrentUserEmail, Athlete } from '@/lib/db';
import { LogOut, Shield, Compass, Grid, Sparkles, User } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<Athlete | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, [pathname]);

  const handleLogout = () => {
    setCurrentUserEmail(null);
    router.push('/');
  };

  const handleSwitchUser = (email: string) => {
    setCurrentUserEmail(email);
    const updated = getCurrentUser();
    setUser(updated);

    if (updated) {
      if (!updated.onboardingComplete) {
        router.push('/onboarding');
      } else if (updated.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1A3834]/90 backdrop-blur-md border-b border-[#FBFAF4]/10 shadow-lg shadow-[#1A3834]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* LOGO */}
          <div className="flex items-center gap-6">
            <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-[16px] bg-gradient-to-br from-[#FF5A1F] to-[#FBFAF4] flex items-center justify-center shadow-lg shadow-[#FF5A1F]/25 group-hover:scale-105 transition-transform duration-200">
                <Sparkles className="w-5 h-5 text-[#1A3834]" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-[#FF5A1F] transition-colors duration-200 font-display uppercase">
                RV
              </span>
            </Link>

            {/* NAV LINKS */}
            <nav className="hidden md:flex items-center gap-1.5">
              {user.role === 'admin' ? (
                <Link
                  href="/admin"
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold font-display uppercase tracking-[1.68px] transition-all duration-150 ${
                    pathname === '/admin'
                      ? 'bg-[#FBFAF4]/10 text-white border border-[#FBFAF4]/20'
                      : 'text-[#FBFAF4]/80 hover:text-white hover:bg-[#FBFAF4]/5'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Administración
                </Link>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold font-display uppercase tracking-[1.68px] transition-all duration-150 ${
                      pathname === '/dashboard'
                        ? 'bg-[#FBFAF4]/10 text-white border border-[#FBFAF4]/20'
                        : 'text-[#FBFAF4]/80 hover:text-white hover:bg-[#FBFAF4]/5'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    Mi Panel
                  </Link>

                  <Link
                    href="/equipos"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold font-display uppercase tracking-[1.68px] transition-all duration-150 ${
                      pathname === '/equipos'
                        ? 'bg-[#FBFAF4]/10 text-white border border-[#FBFAF4]/20'
                        : 'text-[#FBFAF4]/80 hover:text-white hover:bg-[#FBFAF4]/5'
                    }`}
                  >
                    <Compass className="w-4 h-4" />
                    Explorar Equipos
                  </Link>

                  <Link
                    href="/perfil"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold font-display uppercase tracking-[1.68px] transition-all duration-150 ${
                      pathname === '/perfil'
                        ? 'bg-[#FBFAF4]/10 text-white border border-[#FBFAF4]/20'
                        : 'text-[#FBFAF4]/80 hover:text-white hover:bg-[#FBFAF4]/5'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* USER ACTIONS & QUICK SWITCHER */}
           <div className="flex items-center gap-4">
             {/* USER PROFILE INFO */}
            <div className="flex items-center gap-3 pl-2 border-l border-[#FBFAF4]/10">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-white leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-[#FBFAF4]/60 font-medium leading-none mt-0.5 font-sans">
                  {user.email}
                </div>
              </div>

              <div className="w-9 h-9 rounded-full bg-[#FBFAF4]/10 border border-[#FBFAF4]/10 flex items-center justify-center text-white font-bold text-sm">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>

              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="p-2 text-[#FBFAF4]/70 hover:text-rose-400 bg-[#FBFAF4]/5 hover:bg-rose-500/10 border border-[#FBFAF4]/10 hover:border-rose-500/20 rounded-[16px] transition-all duration-150 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
