'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, setCurrentUserEmail, getAthletes, initializeDB } from '@/lib/db';
import { KeyRound, Shield, User, Sparkles } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    initializeDB();
    // Acceso libre por defecto: iniciar sesión automáticamente como administrador
    if (!localStorage.getItem('rv_current_user_email')) {
      setCurrentUserEmail('admin@rv.com');
    }
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

  const handleLogin = (email: string) => {
    if (!email || !email.includes('@')) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }
    setCurrentUserEmail(email);
    const user = getCurrentUser();
    
    setShowPopup(false);
    
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
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 font-display uppercase leading-[60px] md:leading-[69.92px] letter-spacing-[-0.01em]">
            Supera tus límites.
          </h1>
          <p className="text-body-md text-[#FBFAF4]/80 mb-8 font-sans font-normal">
            Únete a tu equipo de montaña, realiza el seguimiento de tus cuotas y mantén al día tus aptos médicos de forma simple.
          </p>

          <button
            onClick={() => setShowPopup(true)}
            className="w-full py-3.5 px-6 bg-[#FF5A1F] text-white hover:bg-[#FF5A1F]/90 font-display text-[12px] font-semibold leading-[16px] tracking-[1.68px] uppercase rounded-full shadow-lg shadow-[#FF5A1F]/20 hover:shadow-[#FF5A1F]/35 hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.186 4.114-3.578 0-6.45-2.872-6.45-6.45s2.872-6.45 6.45-6.45c1.621 0 3.098.59 4.254 1.558l3.125-3.125C19.317 2.19 15.992 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-11 0-.648-.053-1.125-.152-1.485H12.24z"/>
            </svg>
            Continuar con Google
          </button>
        </div>

        <div className="text-[11px] text-[#FBFAF4]/60 text-center font-sans">
          Al continuar, aceptas nuestros Términos de servicio y Política de privacidad.
        </div>
      </div>

      {/* SECCIÓN DERECHA: DISEÑO COMPAÑERO LIMPIO (SIN IMAGEN) */}
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

      {/* MODAL / POPUP DE SIMULACIÓN DE GOOGLE */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="gradient-border-shell w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full bg-[#FBFAF4] text-[#1A3834] rounded-[16px] overflow-hidden">
              <div className="p-6 bg-[#F5F3EB] border-b border-[#1A3834]/10 text-center">
                <div className="flex justify-center mb-4">
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#1A3834] font-sans">Iniciar sesión con Google</h3>
                <p className="text-xs font-sans text-[#1A3834]/60 mt-1">
                  para continuar en RV
                </p>
              </div>

              <div className="p-6 space-y-5 bg-[#FBFAF4]">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1A3834]/80 font-sans">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      placeholder="ejemplo@gmail.com"
                      value={customEmail}
                      onChange={(e) => {
                        setCustomEmail(e.target.value);
                        setError('');
                      }}
                      className="w-full bg-white border border-[#1A3834]/20 focus:border-[#4285F4] focus:ring-1 focus:ring-[#4285F4] rounded-[8px] px-4 py-3 text-[#1A3834] placeholder-[#1A3834]/40 text-sm outline-none transition-all duration-200"
                    />
                    {error && <p className="text-xs text-rose-600 font-medium font-sans mt-1">{error}</p>}
                  </div>

                  <button
                    onClick={() => handleLogin(customEmail.trim().toLowerCase())}
                    className="w-full py-3 bg-[#4285F4] hover:bg-[#357ae8] text-white font-semibold text-sm rounded-[8px] shadow-md transition-all duration-150 cursor-pointer text-center"
                  >
                    Siguiente
                  </button>
                </div>

                <div className="p-4 rounded-[12px] bg-[#1A3834]/5 border border-[#1A3834]/10 space-y-1 text-xs text-[#1A3834]/80">
                  <span className="font-bold text-[#FF5A1F] block">💡 Acceso de Prueba (Administrador):</span>
                  <p className="font-sans leading-relaxed">
                    Ingresa <strong className="font-mono text-sm bg-white px-1.5 py-0.5 rounded border border-[#1A3834]/15">admin@rv.com</strong> para acceder con el panel de administración y control completo habilitado.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#F5F3EB] border-t border-[#1A3834]/10 flex justify-end">
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 font-display text-[12px] font-semibold leading-[16px] tracking-[1.68px] uppercase text-[#1A3834]/60 hover:text-[#1A3834] transition-colors duration-150 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

