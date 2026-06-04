'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getTeam, requestJoinTeam, Team, Athlete, initializeDB } from '@/lib/db';
import Navbar from '@/components/Navbar';
import { Compass, Users, Clock, UserCheck, CheckCircle2 } from 'lucide-react';

export default function EquiposMarket() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Athlete | null>(null);
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    initializeDB();
    const user = getCurrentUser();
    if (!user) {
      router.push('/');
      return;
    }
    if (!user.onboardingComplete) {
      router.push('/onboarding');
      return;
    }
    setCurrentUser(user);
    setTeam(getTeam());
  }, [router]);

  const handleJoinRequest = () => {
    if (!currentUser || !team) return;
    
    // Confirmación requerida según regla de negocio
    const confirmJoin = confirm(`¿Estás seguro de que deseas enviar una solicitud para unirte a "${team.name}"?`);
    if (confirmJoin) {
      requestJoinTeam(currentUser.email, team.id);
      router.push('/dashboard');
    }
  };

  if (!currentUser || !team) return null;

  return (
    <div className="min-h-screen bg-[#1A3834] text-[#FBFAF4] font-sans antialiased">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex items-center gap-2 text-[#FBFAF4]/60 text-xs font-semibold uppercase tracking-[1.68px] font-display">
            <Compass className="w-4 h-4" />
            Explorar
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-white font-display uppercase leading-none">Equipos Disponibles</h1>
          <p className="text-body-md text-[#FBFAF4]/80 font-sans">
            Encuentra tu grupo de entrenamiento ideal en montaña y postula para unirte.
          </p>
        </div>

        {/* LISTADO DE EQUIPOS (VISTA LIMPIA SIN IMÁGENES EXTRA) */}
        <div className="space-y-6">
          <div className="bg-[#FBFAF4] text-[#1A3834] border border-[#1A3834]/10 rounded-[16px] p-6 sm:p-8 hover:border-[#FF5A1F]/30 transition-all duration-300 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_100%_0%,rgba(255,90,31,0.06),transparent_70%)]"></div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide group-hover:text-[#FF5A1F] transition-colors duration-200">
                    {team.name}
                  </h2>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A3834]/10 text-[#1A3834] text-[10px] font-semibold font-display uppercase tracking-wider mt-2.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    Director: {team.coach}
                  </div>
                </div>

                <p className="text-body-md text-[#1A3834]/70 font-sans max-w-2xl">
                  {team.description}
                </p>

                <div className="flex flex-wrap gap-4 text-xs text-[#1A3834]/60 pt-2 border-t border-[#1A3834]/10">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#FF5A1F]" />
                    <span className="font-sans">Días: {team.trainingDays}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#FF5A1F]" />
                    <span className="font-sans">Nivel: Todos los niveles</span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 sm:self-center">
                {currentUser.teamId === team.id ? (
                  currentUser.teamStatus === 'pendiente' ? (
                    <div className="px-5 py-3 rounded-full bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 text-[#FF5A1F] font-semibold font-display text-[10px] uppercase tracking-wider text-center">
                      Solicitud Pendiente
                    </div>
                  ) : (
                    <div className="px-5 py-3 rounded-full bg-[#1A3834]/10 border border-[#1A3834]/20 text-[#1A3834] font-semibold font-display text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Ya eres miembro
                    </div>
                  )
                ) : (
                  <button
                    onClick={handleJoinRequest}
                    className="w-full sm:w-auto px-6 py-3.5 bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white font-display text-[12px] font-semibold leading-[16px] tracking-[1.68px] uppercase rounded-full shadow-lg shadow-[#FF5A1F]/10 hover:shadow-[#FF5A1F]/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer"
                  >
                    Solicitar unirse
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
