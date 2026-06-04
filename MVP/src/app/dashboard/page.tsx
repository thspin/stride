'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getTeam, leaveTeam, uploadPaymentReceipt, uploadMedicalCertificate, Team, Athlete, initializeDB } from '@/lib/db';
import Navbar from '@/components/Navbar';
import {
  Users,
  Calendar,
  MessageSquare,
  FileText,
  DollarSign,
  Heart,
  AlertTriangle,
  Upload,
  CheckCircle,
  XCircle,
  ExternalLink,
  Info
} from 'lucide-react';

export default function AthleteDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<Athlete | null>(null);
  const [team, setTeam] = useState<Team | null>(null);

  // Upload simulation states
  const [receiptFile, setReceiptFile] = useState<string>('');
  const [certFile, setCertFile] = useState<string>('');
  const [uploadError, setUploadError] = useState('');
  const [certError, setCertError] = useState('');

  const loadData = () => {
    initializeDB();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/');
      return;
    }
    if (!currentUser.onboardingComplete) {
      router.push('/onboarding');
      return;
    }
    setUser(currentUser);
    if (currentUser.teamId) {
      setTeam(getTeam());
    } else {
      setTeam(null);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  const handleLeaveTeam = () => {
    if (!user) return;
    const confirmLeave = confirm('¿Estás seguro de que deseas darte de baja de este equipo? Se borrarán tus datos de pago asociados al club.');
    if (confirmLeave) {
      leaveTeam(user.email);
      loadData();
    }
  };

  const handleUploadReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!receiptFile) {
      setUploadError('Selecciona un archivo para simular el comprobante.');
      return;
    }
    uploadPaymentReceipt(user.email, receiptFile);
    setReceiptFile('');
    setUploadError('');
    alert('Comprobante subido con éxito. Estado cambiado a "Pendiente de Verificación".');
    loadData();
  };

  const handleUploadCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!certFile) {
      setCertError('Selecciona un archivo de apto físico.');
      return;
    }
    uploadMedicalCertificate(user.email, certFile);
    setCertFile('');
    setCertError('');
    alert('Certificado médico subido con éxito. Queda en revisión por el coordinador.');
    loadData();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#1A3834] text-[#FBFAF4] font-sans antialiased">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* PANEL DINÁMICO */}
        {!user.teamId ? (
          /* CASO A: SIN EQUIPO */
          <div className="bg-[#FBFAF4] text-[#1A3834] border border-[#1A3834]/10 rounded-[16px] p-8 sm:p-12 text-center max-w-2xl mx-auto my-12 shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-[16px] bg-[#1A3834]/5 border border-[#1A3834]/20 flex items-center justify-center mx-auto text-[#1A3834]">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide">No perteneces a ningún equipo</h1>
              <p className="text-[#1A3834]/70 text-sm leading-relaxed">
                Para empezar a entrenar, explora los equipos de montaña disponibles en la plataforma y solicita tu admisión.
              </p>
            </div>
            <button
              onClick={() => router.push('/equipos')}
              className="px-6 py-3.5 bg-[#FF5A1F] text-white hover:bg-[#FF5A1F]/90 font-display text-[12px] font-semibold leading-[16px] tracking-[1.68px] uppercase rounded-full shadow-lg shadow-[#FF5A1F]/20 hover:shadow-[#FF5A1F]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer"
            >
              Explorar Equipos de Montaña
            </button>
          </div>
        ) : user.teamStatus === 'pendiente' && team ? (
          /* CASO B: SOLICITUD PENDIENTE */
          <div className="bg-[#FBFAF4] text-[#1A3834] border border-[#1A3834]/10 rounded-[16px] p-8 max-w-2xl mx-auto my-12 shadow-2xl space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-[#1A3834]/10">
              <div className="w-12 h-12 rounded-[16px] bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 flex items-center justify-center text-[#FF5A1F]">
                <ClockIcon className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide">Solicitud en revisión</h1>
                <p className="text-xs text-[#1A3834]/60">Equipo: {team.name}</p>
              </div>
            </div>

            <div className="bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 rounded-[16px] p-4 text-xs sm:text-sm text-[#1A3834] leading-relaxed">
              <strong>Postulación enviada:</strong> Tu solicitud de ingreso para el equipo <strong>&quot;{team.name}&quot;</strong> está siendo evaluada por el administrador. Una vez aprobado, figurarás como miembro activo para registrar pagos y acceder a las planificaciones.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleLeaveTeam}
                className="w-full py-3 text-[#1A3834] border border-[#1A3834]/20 hover:bg-[#1A3834]/5 font-display text-[12px] font-semibold leading-[16px] tracking-[1.68px] uppercase rounded-full transition-all duration-150 cursor-pointer"
              >
                Cancelar solicitud
              </button>
              <button
                onClick={() => router.push('/equipos')}
                className="w-full py-3 bg-[#1A3834] hover:bg-[#1A3834]/90 text-[#FBFAF4] font-display text-[12px] font-semibold leading-[16px] tracking-[1.68px] uppercase rounded-full transition-all duration-150 cursor-pointer"
              >
                Ver Info del Equipo
              </button>
            </div>
          </div>
        ) : (
          /* CASO C: MIEMBRO ACTIVO */
          team && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* HEADER DE BIENVENIDA AL EQUIPO */}
              <div className="gradient-border-shell shadow-xl">
                <div className="bg-[#FBFAF4] text-[#1A3834] rounded-[16px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle_at_100%_0%,rgba(255,90,31,0.05),transparent_70%)]"></div>
                  
                  <div className="space-y-3">
                    <span className="text-[10px] font-extrabold text-[#1A3834] bg-[#1A3834]/10 border border-[#1A3834]/20 px-2.5 py-1 rounded-full uppercase tracking-wider font-display">
                      Miembro Activo
                    </span>
                    <h1 className="text-4xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide">
                      {team.name}
                    </h1>
                    <p className="text-body-md text-[#1A3834]/70">
                      Entrenador: <strong className="text-[#1A3834]">{team.coach}</strong> • Días: {team.trainingDays}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 z-10">
                    <a
                      href={team.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white font-display text-[12px] font-semibold leading-[16px] tracking-[1.68px] uppercase rounded-full shadow-lg shadow-[#FF5A1F]/15 transition-all duration-150 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 fill-current" />
                      Grupo de WhatsApp
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={handleLeaveTeam}
                      className="px-5 py-3 text-rose-700 hover:text-rose-800 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 rounded-full font-display text-[12px] font-semibold leading-[16px] tracking-[1.68px] uppercase transition-all duration-150 cursor-pointer"
                    >
                      Darse de baja
                    </button>
                  </div>
                </div>
              </div>

              {/* GRID DE ESTADOS: PAGOS, APTO Y PLANIFICACIONES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* COLUMNA 1: GESTIÓN DE SUSCRIPCIÓN (PAGOS) */}
                <div className="bg-[#FBFAF4] text-[#1A3834] border border-[#1A3834]/10 rounded-[16px] p-6 shadow-xl space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-[#1A3834]/10">
                      <div className="flex items-center gap-2.5">
                        <DollarSign className="w-5 h-5 text-[#1A3834]" />
                        <h2 className="text-2xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide">Estado de Cuota</h2>
                      </div>
                      
                      {/* Estado Badge */}
                      {user.paymentStatus === 'Pagado' && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 uppercase tracking-wide font-display">
                          Pagado
                        </span>
                      )}
                      {user.paymentStatus === 'Pendiente_Pago' && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 uppercase tracking-wide font-display">
                          Pago Requerido
                        </span>
                      )}
                      {user.paymentStatus === 'Pendiente_Verificacion' && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 border border-blue-500/20 uppercase tracking-wide font-display">
                          En Revisión
                        </span>
                      )}
                      {user.paymentStatus === 'Vencido' && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 border border-rose-500/20 uppercase tracking-wide font-display">
                          Vencido
                        </span>
                      )}
                    </div>

                    {/* Alertas explicativas */}
                    {user.paymentStatus === 'Pagado' && (
                      <div className="p-4 rounded-[16px] bg-[#1A3834]/5 border border-[#1A3834]/10 text-xs text-[#1A3834]/70 leading-relaxed font-sans">
                        <span className="text-[#1A3834] font-bold">¡Al día!</span> Tu pago fue registrado mediante <span className="font-semibold text-[#1A3834]">{user.paymentMethod}</span>. Habilitado para salidas.
                      </div>
                    )}

                    {user.paymentStatus === 'Pendiente_Verificacion' && (
                      <div className="p-4 rounded-[16px] bg-tertiary/5 border border-tertiary/10 text-xs text-[#1A2B42] leading-relaxed font-sans">
                        Tu comprobante <strong>&quot;{user.paymentReceiptUrl}&quot;</strong> está siendo verificado. Te informaremos una vez el coordinador lo apruebe.
                      </div>
                    )}

                    {user.paymentStatus === 'Vencido' && (
                      <div className="p-4 rounded-[16px] bg-rose-500/5 border border-rose-500/25 text-xs text-rose-700 leading-relaxed font-sans">
                        <strong>Cuota Vencida:</strong> {user.paymentMotivoRechazo || 'Tu último comprobante no fue aprobado. Carga el comprobante correcto.'}
                      </div>
                    )}

                    {user.paymentStatus === 'Pendiente_Pago' && (
                      <div className="p-4 rounded-[16px] bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 text-body-md text-[#1A3834] leading-relaxed font-sans font-medium">
                        <strong>Pago requerido:</strong> Debes reportar el comprobante de transferencia del período actual para regularizar tu cuota mensual.
                      </div>
                    )}
                  </div>

                  {/* Formulario de carga (solo si es necesario pagar) */}
                  {(user.paymentStatus === 'Pendiente_Pago' || user.paymentStatus === 'Vencido') && (
                    <form onSubmit={handleUploadReceipt} className="space-y-3 pt-4 border-t border-[#1A3834]/5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#1A3834]/60 uppercase tracking-wider font-display">Cargar comprobante de pago</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder="Ej. transferencia_mayo.pdf"
                            value={receiptFile}
                            onChange={(e) => {
                              setReceiptFile(e.target.value);
                              setUploadError('');
                            }}
                            className="flex-grow bg-white border border-[#1A3834]/20 focus:border-[#1A3834] rounded-[4px] px-4 py-2 text-xs text-[#1A3834] placeholder-[#1A3834]/40 outline-none transition-all duration-200 font-sans"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#1A3834] hover:bg-[#1A3834]/95 text-white font-display text-[12px] font-semibold leading-[16px] tracking-[1.68px] uppercase rounded-full shadow-lg transition-all duration-150 cursor-pointer flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Enviar
                          </button>
                        </div>
                        {uploadError && <p className="text-[10px] text-rose-600 font-medium font-sans">{uploadError}</p>}
                      </div>
                    </form>
                  )}
                </div>

                {/* COLUMNA 2: APTOS MÉDICOS (SALUD) */}
                <div className="bg-[#FBFAF4] text-[#1A3834] border border-[#1A3834]/10 rounded-[16px] p-6 shadow-xl space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-[#1A3834]/10">
                      <div className="flex items-center gap-2.5">
                        <Heart className="w-5 h-5 text-rose-600" />
                        <h2 className="text-2xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide">Apto Físico</h2>
                      </div>

                      {/* Apto Status Badge */}
                      {user.aptoMedicoStatus === 'vigente' && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 uppercase tracking-wide font-display">
                          Vigente
                        </span>
                      )}
                      {user.aptoMedicoStatus === 'pendiente_verificacion' && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 border border-blue-500/20 uppercase tracking-wide font-display">
                          En Revisión
                        </span>
                      )}
                      {user.aptoMedicoStatus === 'rechazado' && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 border border-rose-500/20 uppercase tracking-wide font-display">
                          Rechazado
                        </span>
                      )}
                      {user.aptoMedicoStatus === 'no_entregado' && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 uppercase tracking-wide font-display">
                          Falta Entregar
                        </span>
                      )}
                    </div>

                    {/* Alertas informativas */}
                    {user.aptoMedicoStatus === 'vigente' && user.aptoMedicoVencimiento && (
                      <div className="p-4 rounded-[16px] bg-[#1A3834]/5 border border-[#1A3834]/10 text-xs text-[#1A3834]/70 leading-relaxed font-sans">
                        Tu certificado es válido. Vence el <strong className="text-[#1A3834]">{new Date(user.aptoMedicoVencimiento).toLocaleDateString()}</strong>.
                      </div>
                    )}

                    {user.aptoMedicoStatus === 'pendiente_verificacion' && (
                      <div className="p-4 rounded-[16px] bg-tertiary/5 border border-tertiary/10 text-xs text-[#1A2B42] leading-relaxed font-sans">
                        El certificado médico <strong>&quot;{user.aptoMedicoUrl}&quot;</strong> está esperando validación de la administración.
                      </div>
                    )}

                    {user.aptoMedicoStatus === 'rechazado' && (
                      <div className="p-4 rounded-[16px] bg-rose-500/5 border border-rose-500/25 text-xs text-rose-700 leading-relaxed font-sans">
                        <strong>Apto médico rechazado:</strong> {user.aptoMedicoMotivoRechazo || 'El documento no cumple con los requisitos legales o está vencido.'}
                      </div>
                    )}

                    {user.aptoMedicoStatus === 'no_entregado' && (
                      <div className="p-4 rounded-[16px] bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 text-body-md text-[#1A3834] leading-relaxed flex items-start gap-2 font-sans font-medium">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#FF5A1F]" />
                        <span><strong>Atención:</strong> No has subido tu apto físico. Es obligatorio estar cargado para participar de las actividades presenciales.</span>
                      </div>
                    )}
                  </div>

                  {/* Formulario de carga de certificado (si es necesario) */}
                  {(user.aptoMedicoStatus === 'no_entregado' || user.aptoMedicoStatus === 'rechazado') && (
                    <form onSubmit={handleUploadCert} className="space-y-3 pt-4 border-t border-[#1A3834]/5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#1A3834]/60 uppercase tracking-wider font-display">Cargar apto médico (PDF/Imagen)</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder="Ej. certificado_medico_2026.jpg"
                            value={certFile}
                            onChange={(e) => {
                              setCertFile(e.target.value);
                              setCertError('');
                            }}
                            className="flex-grow bg-white border border-[#1A3834]/20 focus:border-[#1A3834] rounded-[4px] px-4 py-2 text-xs text-[#1A3834] placeholder-[#1A3834]/40 outline-none transition-all duration-200 font-sans"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[#1A3834] hover:bg-[#1A3834]/95 text-white font-display text-[12px] font-semibold leading-[16px] tracking-[1.68px] uppercase rounded-full shadow-lg transition-all duration-150 cursor-pointer flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Enviar
                          </button>
                        </div>
                        {certError && <p className="text-[10px] text-rose-600 font-medium font-sans">{certError}</p>}
                      </div>
                    </form>
                  )}
                </div>

              </div>

              {/* SECCIÓN PLANIFICACIONES / INSTRUCCIONES DE ENTRENAMIENTO */}
              <div className="bg-[#FBFAF4] text-[#1A3834] border border-[#1A3834]/10 rounded-[16px] p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center gap-2.5 pb-4 border-b border-[#1A3834]/10">
                  <FileText className="w-5 h-5 text-[#1A3834]" />
                  <h2 className="text-2xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide">Planificación de Entrenamiento</h2>
                </div>

                <div className="bg-[#F5F3EB] border border-[#1A3834]/10 p-4 rounded-[16px]">
                  {team.instructions ? (
                    <p className="text-sm text-[#1A3834] leading-relaxed whitespace-pre-line font-sans">
                      {team.instructions}
                    </p>
                  ) : (
                    <p className="text-xs text-[#1A3834]/60 italic font-sans">
                      El coordinador aún no ha publicado instrucciones específicas de entrenamiento.
                    </p>
                  )}
                </div>
              </div>

            </div>
          )
        )}
      </main>
    </div>
  );
}

// Icon helper
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
