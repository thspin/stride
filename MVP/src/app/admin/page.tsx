'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCurrentUser,
  getAthletes,
  getTeam,
  processRequest,
  processPayment,
  processCertificate,
  expelAthlete,
  updateTeamInstructions,
  Athlete,
  Team,
  initializeDB
} from '@/lib/db';
import Navbar from '@/components/Navbar';
import {
  Users,
  UserPlus,
  DollarSign,
  Heart,
  FileText,
  Check,
  X,
  CreditCard,
  Trash2,
  Calendar,
  AlertCircle,
  Save,
  MessageSquare
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<Athlete | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [activeTab, setActiveTab] = useState<'solicitudes' | 'atletas' | 'aptos' | 'planificacion'>('solicitudes');

  // Input states
  const [instructions, setInstructions] = useState('');
  const [paymentRejectionReason, setPaymentRejectionReason] = useState('');
  const [certRejectionReason, setCertRejectionReason] = useState('');
  const [certMonths, setCertMonths] = useState<number>(6);

  // Modal / Prompt states
  const [selectedAthleteForPayment, setSelectedAthleteForPayment] = useState<Athlete | null>(null);
  const [selectedAthleteForCert, setSelectedAthleteForCert] = useState<Athlete | null>(null);

  const loadData = () => {
    initializeDB();
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/');
      return;
    }
    if (currentUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    setUser(currentUser);
    setTeam(getTeam());
    setAthletes(getAthletes());
  };

  useEffect(() => {
    loadData();
  }, [router]);

  useEffect(() => {
    if (team) {
      setInstructions(team.instructions || '');
    }
  }, [team]);

  // Handler: Admisión
  const handleAdmission = (email: string, approve: boolean) => {
    const actionText = approve ? 'admitir' : 'rechazar';
    const confirmAction = confirm(`¿Estás seguro de que deseas ${actionText} a este postulante?`);
    if (confirmAction) {
      processRequest(email, approve);
      loadData();
      alert(`Solicitud procesada con éxito.`);
    }
  };

  // Handler: Pago Directo
  const handleManualPayment = (email: string) => {
    const confirmAction = confirm('¿Registrar pago manual en efectivo para este atleta?');
    if (confirmAction) {
      processPayment(email, true, 'Efectivo/Manual');
      loadData();
      alert('Pago registrado con éxito.');
    }
  };

  // Handler: Aprobación de Pago
  const handleApprovePayment = (email: string, method: string) => {
    processPayment(email, true, method);
    setSelectedAthleteForPayment(null);
    loadData();
    alert('Comprobante de pago aprobado.');
  };

  // Handler: Rechazo de Pago
  const handleRejectPayment = (email: string) => {
    if (!paymentRejectionReason.trim()) {
      alert('Debes ingresar un motivo de rechazo.');
      return;
    }
    processPayment(email, false, undefined, paymentRejectionReason.trim());
    setSelectedAthleteForPayment(null);
    setPaymentRejectionReason('');
    loadData();
    alert('Comprobante de pago rechazado.');
  };

  // Handler: Aprobación de Certificado
  const handleApproveCert = (email: string) => {
    processCertificate(email, true, certMonths);
    setSelectedAthleteForCert(null);
    loadData();
    alert(`Certificado médico aprobado con vigencia de ${certMonths} meses.`);
  };

  // Handler: Rechazo de Certificado
  const handleRejectCert = (email: string) => {
    if (!certRejectionReason.trim()) {
      alert('Debes ingresar un motivo de rechazo.');
      return;
    }
    processCertificate(email, false, undefined, certRejectionReason.trim());
    setSelectedAthleteForCert(null);
    setCertRejectionReason('');
    loadData();
    alert('Certificado médico rechazado.');
  };

  // Handler: Expulsar Atleta
  const handleExpel = (email: string) => {
    const confirmExpel = confirm('¿Estás seguro de que deseas dar de baja (expulsar) a este atleta de "RV equipo de montaña"?');
    if (confirmExpel) {
      expelAthlete(email);
      loadData();
      alert('Atleta dado de baja del equipo.');
    }
  };

  // Handler: Guardar Planificación
  const handleSaveInstructions = () => {
    updateTeamInstructions(instructions.trim());
    loadData();
    alert('Planificación de entrenamiento publicada.');
  };

  if (!user || !team) return null;

  // Filtrar atletas de la DB correspondientes a este equipo
  const teamAthletes = athletes.filter(a => a.teamId === team.id);
  const pendingRequests = teamAthletes.filter(a => a.teamStatus === 'pendiente');
  const activeMembers = teamAthletes.filter(a => a.teamStatus === 'activo');
  
  const pendingPayments = activeMembers.filter(a => a.paymentStatus === 'Pendiente_Verificacion');
  const pendingCerts = activeMembers.filter(a => a.aptoMedicoStatus === 'pendiente_verificacion');

  return (
    <div className="min-h-screen bg-[#1A3834] text-[#FBFAF4] font-sans antialiased">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* TITULAR Y MÉTRICAS */}
        <div className="mb-8">
          <h1 className="text-5xl font-extrabold tracking-tight text-white mb-6 font-display uppercase leading-none">
            Administración: {team.name}
          </h1>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#FBFAF4] text-[#1A3834] border border-[#1A3834]/10 rounded-[16px] p-4 sm:p-5 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-[16px] bg-[#1A3834]/5 border border-[#1A3834]/15 flex items-center justify-center text-[#1A3834]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-[#1A3834] font-display">{activeMembers.length}</div>
                <div className="text-[10px] text-[#1A3834]/60 font-bold uppercase tracking-wider font-display">Atletas Activos</div>
              </div>
            </div>

            <div className="bg-[#FBFAF4] text-[#1A3834] border border-[#1A3834]/10 rounded-[16px] p-4 sm:p-5 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-[16px] bg-[#1A3834]/5 border border-[#1A3834]/15 flex items-center justify-center text-[#1A3834]">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-[#1A3834] font-display">{pendingRequests.length}</div>
                <div className="text-[10px] text-[#1A3834]/60 font-bold uppercase tracking-wider font-display">Solicitudes</div>
              </div>
            </div>

            <div className="bg-[#FBFAF4] text-[#1A3834] border border-[#1A3834]/10 rounded-[16px] p-4 sm:p-5 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-[16px] bg-[#1A3834]/5 border border-[#1A3834]/15 flex items-center justify-center text-[#1A3834]">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-[#1A3834] font-display">{pendingPayments.length}</div>
                <div className="text-[10px] text-[#1A3834]/60 font-bold uppercase tracking-wider font-display">Pagos a Validar</div>
              </div>
            </div>

            <div className="bg-[#FBFAF4] text-[#1A3834] border border-[#1A3834]/10 rounded-[16px] p-4 sm:p-5 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-[16px] bg-[#1A3834]/5 border border-[#1A3834]/15 flex items-center justify-center text-[#1A3834]">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-[#1A3834] font-display">{pendingCerts.length}</div>
                <div className="text-[10px] text-[#1A3834]/60 font-bold uppercase tracking-wider font-display">Aptos a Validar</div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENEDOR TABS */}
        <div className="flex flex-wrap gap-2 border-b border-[#FBFAF4]/10 pb-px mb-6">
          <button
            onClick={() => setActiveTab('solicitudes')}
            className={`px-5 py-3 text-[12px] font-bold font-display uppercase tracking-[1.68px] border-b-2 transition-all duration-150 cursor-pointer ${
              activeTab === 'solicitudes'
                ? 'border-[#FF5A1F] text-white bg-[#FBFAF4]/10'
                : 'border-transparent text-[#FBFAF4]/70 hover:text-white'
            }`}
          >
            Solicitudes de Ingreso ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('atletas')}
            className={`px-5 py-3 text-[12px] font-bold font-display uppercase tracking-[1.68px] border-b-2 transition-all duration-150 cursor-pointer ${
              activeTab === 'atletas'
                ? 'border-[#FF5A1F] text-white bg-[#FBFAF4]/10'
                : 'border-transparent text-[#FBFAF4]/70 hover:text-white'
            }`}
          >
            Atletas & Cuotas ({activeMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('aptos')}
            className={`px-5 py-3 text-[12px] font-bold font-display uppercase tracking-[1.68px] border-b-2 transition-all duration-150 cursor-pointer ${
              activeTab === 'aptos'
                ? 'border-[#FF5A1F] text-white bg-[#FBFAF4]/10'
                : 'border-transparent text-[#FBFAF4]/70 hover:text-white'
            }`}
          >
            Auditoría de Aptos ({pendingCerts.length})
          </button>
          <button
            onClick={() => setActiveTab('planificacion')}
            className={`px-5 py-3 text-[12px] font-bold font-display uppercase tracking-[1.68px] border-b-2 transition-all duration-150 cursor-pointer ${
              activeTab === 'planificacion'
                ? 'border-[#FF5A1F] text-white bg-[#FBFAF4]/10'
                : 'border-transparent text-[#FBFAF4]/70 hover:text-white'
            }`}
          >
            Planificación
          </button>
        </div>

        {/* CONTENIDO TAB ACTIVO */}
        <div className="bg-[#FBFAF4] text-[#1A3834] border border-[#1A3834]/10 rounded-[16px] p-6 shadow-xl min-h-[300px]">
          
          {/* TAB 1: SOLICITUDES DE INGRESO */}
          {activeTab === 'solicitudes' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide mb-4">Postulantes Pendientes</h2>
              
              {pendingRequests.length === 0 ? (
                <p className="text-sm text-[#1A3834]/70 italic font-sans">No hay solicitudes de admisión pendientes en este momento.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs sm:text-sm font-sans">
                    <thead className="bg-[#F5F3EB] text-[#1A3834]/80 font-display uppercase font-semibold text-[12px] tracking-[1.68px]">
                      <tr>
                        <th className="p-4 rounded-tl-xl">Nombre / Email</th>
                        <th className="p-4">DNI</th>
                        <th className="p-4">Contacto de Emergencia</th>
                        <th className="p-4">Talle Remera</th>
                        <th className="p-4 rounded-tr-xl text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A3834]/5">
                      {pendingRequests.map(athlete => (
                        <tr key={athlete.email} className="hover:bg-[#1A3834]/[0.01]">
                          <td className="p-4">
                            <div className="font-bold text-[#1A3834]">{athlete.name}</div>
                            <div className="text-[10px] text-[#1A3834]/60">{athlete.email}</div>
                          </td>
                          <td className="p-4 text-[#1A3834] font-medium">{athlete.dni || '-'}</td>
                          <td className="p-4">
                            <div className="text-[#1A3834]">{athlete.contactoEmergenciaName || '-'}</div>
                            <div className="text-[10px] text-[#1A3834]/60">{athlete.contactoEmergenciaPhone || ''}</div>
                          </td>
                          <td className="p-4 text-[#1A3834]">{athlete.talleRemera || '-'}</td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleAdmission(athlete.email, true)}
                              className="p-2 rounded-full bg-[#1A3834]/10 hover:bg-[#1A3834] text-[#1A3834] hover:text-[#FBFAF4] border border-[#1A3834]/20 hover:border-[#1A3834] transition-all duration-150 cursor-pointer inline-flex items-center justify-center"
                              title="Admitir Atleta"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAdmission(athlete.email, false)}
                              className="p-2 rounded-full bg-rose-500/10 hover:bg-rose-500 text-rose-700 hover:text-white border border-rose-500/20 hover:border-rose-500 transition-all duration-150 cursor-pointer inline-flex items-center justify-center"
                              title="Rechazar Solicitud"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ATLETAS Y CUOTAS */}
          {activeTab === 'atletas' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide mb-4">Miembros del Equipo</h2>
              
              {activeMembers.length === 0 ? (
                <p className="text-sm text-[#1A3834]/70 italic font-sans">Aún no hay atletas registrados en este equipo.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs sm:text-sm font-sans">
                    <thead className="bg-[#F5F3EB] text-[#1A3834]/80 font-display uppercase font-semibold text-[12px] tracking-[1.68px]">
                      <tr>
                        <th className="p-4 rounded-tl-xl">Nombre / Email</th>
                        <th className="p-4">DNI</th>
                        <th className="p-4">Estado Cuota</th>
                        <th className="p-4">Apto Médico</th>
                        <th className="p-4 rounded-tr-xl text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A3834]/5">
                      {activeMembers.map(athlete => {
                        const paymentStatus = athlete.paymentStatus || 'Pendiente_Pago';
                        
                        return (
                          <tr key={athlete.email} className="hover:bg-[#1A3834]/[0.01]">
                            <td className="p-4">
                              <div className="font-bold text-[#1A3834]">{athlete.name}</div>
                              <div className="text-[10px] text-[#1A3834]/60">{athlete.email}</div>
                            </td>
                            <td className="p-4 text-[#1A3834] font-medium">{athlete.dni || '-'}</td>
                            <td className="p-4">
                              {paymentStatus === 'Pagado' && (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-bold uppercase tracking-wide font-display">
                                  Pagado
                                </span>
                              )}
                              {paymentStatus === 'Pendiente_Pago' && (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 font-bold uppercase tracking-wide font-display">
                                  Impago
                                </span>
                              )}
                              {paymentStatus === 'Pendiente_Verificacion' && (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 border border-blue-500/20 font-bold uppercase tracking-wide animate-pulse font-display">
                                  Por Validar
                                </span>
                              )}
                              {paymentStatus === 'Vencido' && (
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 border border-rose-500/20 font-bold uppercase tracking-wide font-display">
                                  Vencido
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              {athlete.aptoMedicoStatus === 'vigente' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-semibold font-display uppercase">
                                  Vigente
                                </span>
                              )}
                              {athlete.aptoMedicoStatus === 'pendiente_verificacion' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 border border-blue-500/20 font-semibold animate-pulse font-display uppercase">
                                  Revisar
                                </span>
                              )}
                              {athlete.aptoMedicoStatus === 'rechazado' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 border border-rose-500/20 font-semibold font-display uppercase">
                                  Rechazado
                                </span>
                              )}
                              {athlete.aptoMedicoStatus === 'no_entregado' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 border border-rose-500/20 font-semibold flex items-center gap-1 max-w-fit font-display uppercase">
                                  <AlertCircle className="w-3 h-3" /> Faltante
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right space-x-2">
                              {paymentStatus === 'Pendiente_Verificacion' ? (
                                <button
                                  onClick={() => setSelectedAthleteForPayment(athlete)}
                                  className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-full bg-[#1A3834] text-white hover:bg-[#1A3834]/90 transition-colors duration-150 cursor-pointer font-display"
                                >
                                  Validar Pago
                                </button>
                              ) : paymentStatus !== 'Pagado' ? (
                                <button
                                  onClick={() => handleManualPayment(athlete.email)}
                                  className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-full text-[#1A3834] border border-[#1A3834]/20 hover:bg-[#1A3834]/5 transition-all duration-150 cursor-pointer font-display"
                                  title="Registrar pago manual"
                                >
                                  Pago Efectivo
                                </button>
                              ) : null}

                              <button
                                onClick={() => handleExpel(athlete.email)}
                                className="p-2 rounded-full bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-700 transition-all duration-150 cursor-pointer inline-flex items-center justify-center"
                                title="Dar de baja / Expulsar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUDITORÍA DE APTOS */}
          {activeTab === 'aptos' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide mb-4">Aptos Médicos Cargados</h2>
              
              {pendingCerts.length === 0 ? (
                <p className="text-sm text-[#1A3834]/70 italic font-sans">No hay certificados médicos pendientes de validación.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs sm:text-sm font-sans">
                    <thead className="bg-[#F5F3EB] text-[#1A3834]/80 font-display uppercase font-semibold text-[12px] tracking-[1.68px]">
                      <tr>
                        <th className="p-4 rounded-tl-xl">Nombre / Email</th>
                        <th className="p-4">DNI</th>
                        <th className="p-4">Nombre del Archivo</th>
                        <th className="p-4 rounded-tr-xl text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A3834]/5">
                      {pendingCerts.map(athlete => (
                        <tr key={athlete.email} className="hover:bg-[#1A3834]/[0.01]">
                          <td className="p-4">
                            <div className="font-bold text-[#1A3834]">{athlete.name}</div>
                            <div className="text-[10px] text-[#1A3834]/60">{athlete.email}</div>
                          </td>
                          <td className="p-4 text-[#1A3834] font-medium">{athlete.dni || '-'}</td>
                          <td className="p-4 font-mono text-xs text-[#1A3834]/70">{athlete.aptoMedicoUrl}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedAthleteForCert(athlete)}
                              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-full bg-[#1A3834] text-white hover:bg-[#1A3834]/90 transition-colors duration-150 cursor-pointer font-display"
                            >
                              Auditar Certificado
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PLANIFICACIÓN */}
          {activeTab === 'planificacion' && (
            <div className="space-y-4 max-w-3xl">
              <div className="space-y-1.5">
                <h2 className="text-2xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide">Instrucciones de Entrenamiento</h2>
                <p className="text-xs text-[#1A3834]/60 font-sans">
                  Escribe la rutina semanal, horarios especiales o recomendaciones. Se verá de inmediato en los paneles de los atletas.
                </p>
              </div>

              <div className="space-y-4 pt-3">
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Ej. Martes pasadas de 1000m en parque..."
                  rows={6}
                  className="w-full bg-white border border-[#1A3834]/20 focus:border-[#1A3834] rounded-[4px] p-4 text-sm text-[#1A3834] placeholder-[#1A3834]/40 outline-none transition-all duration-200 resize-none font-sans"
                />

                <button
                  onClick={handleSaveInstructions}
                  className="px-5 py-3 bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white font-display text-[12px] font-semibold leading-[16px] tracking-[1.68px] uppercase rounded-full shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Publicar Planificación
                </button>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* MODAL: VALIDAR PAGO */}
      {selectedAthleteForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="gradient-border-shell w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full bg-[#FBFAF4] text-[#1A3834] rounded-[16px] overflow-hidden">
              <div className="p-6 bg-[#F5F3EB] border-b border-[#1A3834]/10">
                <h3 className="text-2xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide leading-none">Validar comprobante</h3>
                <p className="text-xs text-[#1A3834]/70 mt-1 font-sans">Atleta: {selectedAthleteForPayment.name}</p>
              </div>

              <div className="p-6 space-y-4 text-xs sm:text-sm bg-[#FBFAF4]">
                <div className="p-3 bg-[#F5F3EB] border border-[#1A3834]/10 rounded-[16px] space-y-1">
                  <div className="text-[10px] font-bold text-[#1A3834]/60 uppercase tracking-wider font-display">Archivo cargado por atleta:</div>
                  <div className="font-mono text-[#1A3834] font-semibold text-xs">{selectedAthleteForPayment.paymentReceiptUrl}</div>
                </div>

                {/* APROBACIÓN */}
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold text-[#1A3834]/60 uppercase tracking-wider block font-display">Método de pago (para registrar):</label>
                  <div className="flex gap-2">
                    {['Transferencia', 'Efectivo', 'Tarjeta'].map(method => (
                      <button
                        key={method}
                        onClick={() => handleApprovePayment(selectedAthleteForPayment.email, method)}
                        className="flex-1 py-2 bg-[#1A3834]/5 hover:bg-[#1A3834] border border-[#1A3834]/10 hover:border-[#1A3834] text-[#1A3834] hover:text-white font-display text-[11px] font-bold uppercase tracking-wider rounded-full transition-colors duration-150 cursor-pointer"
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-[#1A3834]/10"></div>
                  <span className="flex-shrink mx-4 font-display text-[12px] font-semibold text-[#1A3834]/60 uppercase tracking-[1.68px]">Ó rechaza el comprobante</span>
                  <div className="flex-grow border-t border-[#1A3834]/10"></div>
                </div>

                {/* RECHAZO */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block font-display">Motivo de rechazo:</label>
                  <input
                    type="text"
                    placeholder="Ej. Comprobante ilegible, importe incorrecto..."
                    value={paymentRejectionReason}
                    onChange={(e) => setPaymentRejectionReason(e.target.value)}
                    className="w-full bg-white border border-rose-500/25 focus:border-rose-500 rounded-[4px] px-4 py-2.5 text-[#1A3834] placeholder-rose-950/40 text-xs outline-none transition-all duration-200 font-sans"
                  />
                  <button
                    onClick={() => handleRejectPayment(selectedAthleteForPayment.email)}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-display text-[12px] font-semibold uppercase tracking-wider rounded-full transition-all duration-150 cursor-pointer"
                  >
                    Confirmar Rechazo
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#F5F3EB] border-t border-[#1A3834]/10 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedAthleteForPayment(null);
                    setPaymentRejectionReason('');
                  }}
                  className="px-4 py-2 font-display text-[12px] font-semibold uppercase tracking-wider text-[#1A3834]/60 hover:text-[#1A3834] transition-colors duration-150 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AUDITAR CERTIFICADO */}
      {selectedAthleteForCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="gradient-border-shell w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full bg-[#FBFAF4] text-[#1A3834] rounded-[16px] overflow-hidden">
              <div className="p-6 bg-[#F5F3EB] border-b border-[#1A3834]/10">
                <h3 className="text-2xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide leading-none">Auditar Apto Físico</h3>
                <p className="text-xs text-[#1A3834]/70 mt-1 font-sans">Atleta: {selectedAthleteForCert.name}</p>
              </div>

              <div className="p-6 space-y-4 text-xs sm:text-sm bg-[#FBFAF4]">
                <div className="p-3 bg-[#F5F3EB] border border-[#1A3834]/10 rounded-[16px] space-y-1">
                  <div className="text-[10px] font-bold text-[#1A3834]/60 uppercase tracking-wider font-display">Archivo cargado por atleta:</div>
                  <div className="font-mono text-[#1A3834] font-semibold text-xs">{selectedAthleteForCert.aptoMedicoUrl}</div>
                </div>

                {/* APROBACIÓN */}
                <div className="space-y-3 pt-2">
                  <label className="text-[10px] font-bold text-[#1A3834]/60 uppercase tracking-wider block font-display">Establecer meses de vigencia:</label>
                  <div className="flex gap-2">
                    <select
                      value={certMonths}
                      onChange={(e) => setCertMonths(parseInt(e.target.value))}
                      className="flex-grow bg-white border border-[#1A3834]/20 rounded-[4px] px-3 py-2 text-[#1A3834] outline-none font-sans"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                        <option key={m} value={m}>{m} meses</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleApproveCert(selectedAthleteForCert.email)}
                      className="px-5 py-2 bg-[#1A3834] hover:bg-[#1A3834]/90 text-white font-display text-[12px] font-semibold uppercase tracking-wider rounded-full transition-colors duration-150 cursor-pointer"
                    >
                      Aprobar Apto
                    </button>
                  </div>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-[#1A3834]/10"></div>
                  <span className="flex-shrink mx-4 font-display text-[12px] font-semibold text-[#1A3834]/60 uppercase tracking-[1.68px]">Ó rechaza el certificado</span>
                  <div className="flex-grow border-t border-[#1A3834]/10"></div>
                </div>

                {/* RECHAZO */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block font-display">Motivo de rechazo:</label>
                  <input
                    type="text"
                    placeholder="Ej. Documento borroso, firma médica no legible..."
                    value={certRejectionReason}
                    onChange={(e) => setCertRejectionReason(e.target.value)}
                    className="w-full bg-white border border-rose-500/25 focus:border-rose-500 rounded-[4px] px-4 py-2.5 text-[#1A3834] placeholder-rose-950/40 text-xs outline-none transition-all duration-200 font-sans"
                  />
                  <button
                    onClick={() => handleRejectCert(selectedAthleteForCert.email)}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-display text-[12px] font-semibold uppercase tracking-wider rounded-full transition-all duration-150 cursor-pointer"
                  >
                    Confirmar Rechazo
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#F5F3EB] border-t border-[#1A3834]/10 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedAthleteForCert(null);
                    setCertRejectionReason('');
                  }}
                  className="px-4 py-2 font-display text-[12px] font-semibold uppercase tracking-wider text-[#1A3834]/60 hover:text-[#1A3834] transition-colors duration-150 cursor-pointer"
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

