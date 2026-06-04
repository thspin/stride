'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { getCurrentUser, setCurrentUserEmail, initializeDB } from '@/lib/db';
import { Sparkles } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeDB();
  }, []);

  // Cuando NextAuth tiene sesión activa, sincronizar con localStorage y redirigir
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      setCurrentUserEmail(session.user.email);

      // Si NextAuth devuelve nombre, actualizar en la DB local
      const user = getCurrentUser();
      if (user && session.user.name && user.name === user.email.split('@')[0]) {
        // Actualizar nombre del usuario con el de Google
        const athletes = JSON.parse(localStorage.getItem('rv_athletes') || '[]');
        const idx = athletes.findIndex((a: { email: string }) => a.email === session.user!.email);
        if (idx !== -1) {
          athletes[idx].name = session.user.name;
          localStorage.setItem('rv_athletes', JSON.stringify(athletes));
        }
      }

      const updatedUser = getCurrentUser();
      if (updatedUser) {
        if (!updatedUser.onboardingComplete) {
          router.push('/onboarding');
        } else if (updatedUser.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    }
  }, [session, status, router]);

  // Si ya hay sesión en localStorage (ej. cuenta de prueba), redirigir
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (!user.onboardingComplete) {
        router.push('/onboarding');
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [router]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch {
      setIsLoading(false);
    }
  };

  // Para propósitos de demo/testing, mantenemos un acceso rápido
  const handleDemoLogin = (email: string) => {
    setCurrentUserEmail(email);
    const user = getCurrentUser();
    if (user) {
      if (!user.onboardingComplete) {
        router.push('/onboarding');
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A3834]">
        <div className="animate-pulse text-[#FBFAF4]">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#1A3834] text-[#FBFAF4] font-sans antialiased overflow-hidden">
      {/* SECCIÓN IZQUIERDA: LOGIN */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-8 md:p-16 bg-[#1A3834]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FBFAF4]/10 border border-[#FBFAF4]/20">
            <span className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-pulse"></span>
            <span className="text-[12px] font-semibold text-[#FBFAF4] tracking-[1.68px] uppercase font-display leading-none">RV MVP</span>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-12">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 font-display uppercase leading-[60px] md:leading-[69.92px]">
            Supera tus límites.
          </h1>
          <p className="text-body-md text-[#FBFAF4]/80 mb-8 font-sans font-normal">
            Únete a tu equipo de montaña, realiza el seguimiento de tus cuotas y mantén al día tus aptos médicos de forma simple.
          </p>

          {/* BOTÓN PRINCIPAL: GOOGLE */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3.5 px-6 bg-[#FF5A1F] text-white hover:bg-[#FF5A1F]/90 font-display text-[12px] font-semibold leading-[16px] tracking-[1.68px] uppercase rounded-full shadow-lg shadow-[#FF5A1F]/20 hover:shadow-[#FF5A1F]/35 hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.186 4.114-3.578 0-6.45-2.872-6.45-6.45s2.872-6.45 6.45-6.45c1.621 0 3.098.59 4.254 1.558l3.125-3.125C19.317 2.19 15.992 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-11 0-.648-.053-1.125-.152-1.485H12.24z"/>
            </svg>
            {isLoading ? 'Conectando...' : 'Continuar con Google'}
          </button>

          {/* ACCESOS DE DEMO */}
          <div className="mt-8 p-4 rounded-[12px] bg-[#FBFAF4]/5 border border-[#FBFAF4]/10">
            <p className="text-[10px] text-[#FBFAF4]/50 uppercase tracking-wider font-semibold mb-3">Accesos de prueba (Demo)</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoLogin('admin@rv.com')}
                className="py-2 px-3 bg-[#FBFAF4]/10 hover:bg-[#FBFAF4]/20 border border-[#FBFAF4]/15 rounded-full text-[11px] text-[#FBFAF4]/80 font-semibold transition-all duration-150 cursor-pointer"
              >
                🔑 Admin
              </button>
              <button
                onClick={() => handleDemoLogin('atleta_activo@rv.com')}
                className="py-2 px-3 bg-[#FBFAF4]/10 hover:bg-[#FBFAF4]/20 border border-[#FBFAF4]/15 rounded-full text-[11px] text-[#FBFAF4]/80 font-semibold transition-all duration-150 cursor-pointer"
              >
                🏃 Atleta Activo
              </button>
              <button
                onClick={() => handleDemoLogin('atleta_nuevo@rv.com')}
                className="py-2 px-3 bg-[#FBFAF4]/10 hover:bg-[#FBFAF4]/20 border border-[#FBFAF4]/15 rounded-full text-[11px] text-[#FBFAF4]/80 font-semibold transition-all duration-150 cursor-pointer"
              >
                🆕 Nuevo Usuario
              </button>
              <button
                onClick={() => handleDemoLogin('pendiente_pago@rv.com')}
                className="py-2 px-3 bg-[#FBFAF4]/10 hover:bg-[#FBFAF4]/20 border border-[#FBFAF4]/15 rounded-full text-[11px] text-[#FBFAF4]/80 font-semibold transition-all duration-150 cursor-pointer"
              >
                💳 Pago Pendiente
              </button>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-[#FBFAF4]/60 text-center font-sans">
          Al continuar, aceptas nuestros Términos de servicio y Política de privacidad.
        </div>
      </div>

      {/* SECCIÓN DERECHA: DISEÑO */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#1A3834] via-[#1A3834]/95 to-[#1A2B42] border-l border-[#FBFAF4]/10 justify-center items-center p-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(255,90,31,0.08),transparent_50%)]"></div>
        <div className="max-w-md text-center z-10 space-y-6">
          <div className="w-16 h-16 rounded-[16px] bg-gradient-to-tr from-[#FF5A1F] to-[#FBFAF4] p-[1px] mx-auto shadow-xl shadow-[#FF5A1F]/10">
            <div className="w-full h-full bg-[#1A3834] rounded-[15px] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#FF5A1F]" />
            </div>
          </div>
          <h2 className="text-4xl font-extrabold text-white font-display uppercase tracking-wide">Gestión de Equipos Deportivos</h2>
          <p className="text-body-md text-[#FBFAF4]/70 font-sans">
            Una herramienta para coordinadores y atletas. Controla la seguridad médica y administrativa de tus salidas presenciales de montaña.
          </p>
        </div>
      </div>
    </div>
  );
}
