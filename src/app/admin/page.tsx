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
  initializeDB,
  getPayments,
  Payment
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
  MessageSquare,
  TrendingUp,
  BarChart3,
  Filter,
  Eye
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<Athlete | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<'solicitudes' | 'atletas' | 'aptos' | 'planificacion' | 'analytics'>('solicitudes');

  // Input states
  const [instructions, setInstructions] = useState('');
  const [paymentRejectionReason, setPaymentRejectionReason] = useState('');
  const [certRejectionReason, setCertRejectionReason] = useState('');
  const [certMonths, setCertMonths] = useState<number>(6);

  // Modal / Prompt states
  const [selectedAthleteForPayment, setSelectedAthleteForPayment] = useState<Athlete | null>(null);
  const [selectedAthleteForCert, setSelectedAthleteForCert] = useState<Athlete | null>(null);
  const [selectedAthleteForView, setSelectedAthleteForView] = useState<Athlete | null>(null);

  // Analytics states
  const [selectedMonth, setSelectedMonth] = useState<string>('todos');
  const [isMounted, setIsMounted] = useState(false);

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
    setPayments(getPayments());
  };

  useEffect(() => {
    loadData();
    setIsMounted(true);
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

          {/* Cómputo de Datos Analíticos */}
          {(() => {
            // Meses únicos con cobros
            const uniqueMonths = Array.from(
              new Set(
                payments
                  .filter(p => p.status === 'aprobado')
                  .map(p => {
                    const d = new Date(p.date);
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                  })
              )
            ).sort().reverse();

            const approvedPayments = payments.filter(p => p.status === 'aprobado');
            const filteredPayments = selectedMonth === 'todos'
              ? approvedPayments
              : approvedPayments.filter(p => {
                  const d = new Date(p.date);
                  const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                  return m === selectedMonth;
                });

            const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
            const activeMembersCount = activeMembers.length;
            const unpaidCount = activeMembers.filter(a => a.paymentStatus !== 'Pagado').length;
            const morosityRate = activeMembersCount > 0 ? Math.round((unpaidCount / activeMembersCount) * 100) : 0;
            const averageTicket = filteredPayments.length > 0 ? Math.round(totalRevenue / filteredPayments.length) : 0;

            // Datos temporales últimos 6 meses para gráficos
            const monthlyChartData = (() => {
              const dataMap: { [key: string]: { revenue: number; athletes: number; monthLabel: string } } = {};
              const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
              
              const now = new Date();
              for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                dataMap[key] = {
                  revenue: 0,
                  athletes: 0,
                  monthLabel: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`
                };
              }

              approvedPayments.forEach(p => {
                const d = new Date(p.date);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                if (dataMap[key]) {
                  dataMap[key].revenue += p.amount;
                }
              });

              const keys = Object.keys(dataMap).sort();
              keys.forEach((key, idx) => {
                const baseAthletes = activeMembersCount;
                const diff = keys.length - 1 - idx;
                dataMap[key].athletes = Math.max(1, baseAthletes - Math.floor(diff * 0.5));
              });

              return keys.map(key => ({
                month: key,
                ...dataMap[key]
              }));
            })();

            return (
              <div className="hidden" data-analytics-computed="true"></div>
            );
          })()}
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
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-3 text-[12px] font-bold font-display uppercase tracking-[1.68px] border-b-2 transition-all duration-150 cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-[#FF5A1F] text-white bg-[#FBFAF4]/10'
                : 'border-transparent text-[#FBFAF4]/70 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 inline mr-1.5 align-middle" />
            Análisis & Gráficos
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
                            <button
                              onClick={() => setSelectedAthleteForView(athlete)}
                              className="text-left font-bold text-[#1A3834] hover:text-[#FF5A1F] transition-colors cursor-pointer block focus:outline-none"
                              title="Ver ficha completa"
                            >
                              {athlete.name}
                            </button>
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
                              <button
                                onClick={() => setSelectedAthleteForView(athlete)}
                                className="text-left font-bold text-[#1A3834] hover:text-[#FF5A1F] transition-colors cursor-pointer block focus:outline-none"
                                title="Ver ficha completa"
                              >
                                {athlete.name}
                              </button>
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
                            <button
                              onClick={() => setSelectedAthleteForView(athlete)}
                              className="text-left font-bold text-[#1A3834] hover:text-[#FF5A1F] transition-colors cursor-pointer block focus:outline-none"
                              title="Ver ficha completa"
                            >
                              {athlete.name}
                            </button>
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

          {/* TAB 5: ANALÍTICAS Y GRÁFICOS */}
          {activeTab === 'analytics' && (() => {
            const uniqueMonths = Array.from(
              new Set(
                payments
                  .filter(p => p.status === 'aprobado')
                  .map(p => {
                    const d = new Date(p.date);
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                  })
              )
            ).sort().reverse();

            const approvedPayments = payments.filter(p => p.status === 'aprobado');
            const filteredPayments = selectedMonth === 'todos'
              ? approvedPayments
              : approvedPayments.filter(p => {
                  const d = new Date(p.date);
                  const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                  return m === selectedMonth;
                });

            const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
            const activeMembersCount = activeMembers.length;
            const unpaidCount = activeMembers.filter(a => a.paymentStatus !== 'Pagado').length;
            const morosityRate = activeMembersCount > 0 ? Math.round((unpaidCount / activeMembersCount) * 100) : 0;
            const averageTicket = filteredPayments.length > 0 ? Math.round(totalRevenue / filteredPayments.length) : 0;

            const monthlyChartData = (() => {
              const dataMap: { [key: string]: { revenue: number; athletes: number; monthLabel: string } } = {};
              const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
              
              const now = new Date();
              for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                dataMap[key] = {
                  revenue: 0,
                  athletes: 0,
                  monthLabel: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`
                };
              }

              approvedPayments.forEach(p => {
                const d = new Date(p.date);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                if (dataMap[key]) {
                  dataMap[key].revenue += p.amount;
                }
              });

              const keys = Object.keys(dataMap).sort();
              keys.forEach((key, idx) => {
                const baseAthletes = activeMembersCount;
                const diff = keys.length - 1 - idx;
                dataMap[key].athletes = Math.max(1, baseAthletes - Math.floor(diff * 0.5));
              });

              return keys.map(key => ({
                month: key,
                ...dataMap[key]
              }));
            })();

            return (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A3834]/10">
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide">
                      Estadísticas y Análisis
                    </h2>
                    <p className="text-xs text-[#1A3834]/60 font-sans">
                      Monitoreo de ingresos, atletas y métricas del club.
                    </p>
                  </div>
                  
                  {/* Selector de Mes */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1A3834]/70 uppercase tracking-wider font-display flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5" />
                      Filtrar período:
                    </span>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="bg-white border border-[#1A3834]/20 rounded-full px-4 py-2 text-xs text-[#1A3834] outline-none font-sans font-medium focus:border-[#1A3834] cursor-pointer"
                    >
                      <option value="todos">Todos los meses (Histórico)</option>
                      {uniqueMonths.map(m => {
                        const [year, month] = m.split('-');
                        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                        const label = `${monthNames[parseInt(month) - 1]} ${year}`;
                        return (
                          <option key={m} value={m}>{label}</option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#1A3834] text-white rounded-[16px] p-5 space-y-1 shadow-md">
                    <div className="text-[10px] text-[#FBFAF4]/60 font-bold uppercase tracking-wider font-display">Recaudación</div>
                    <div className="text-3xl font-black font-display text-[#FF5A1F]">${totalRevenue.toLocaleString()}</div>
                    <div className="text-[9px] text-[#FBFAF4]/40 font-medium font-sans">Cobros procesados</div>
                  </div>

                  <div className="bg-[#1A3834] text-white rounded-[16px] p-5 space-y-1 shadow-md">
                    <div className="text-[10px] text-[#FBFAF4]/60 font-bold uppercase tracking-wider font-display">Tasa Morosidad</div>
                    <div className="text-3xl font-black font-display text-rose-400">{morosityRate}%</div>
                    <div className="text-[9px] text-[#FBFAF4]/40 font-medium font-sans">{unpaidCount} atletas sin cuota al día</div>
                  </div>

                  <div className="bg-[#1A3834] text-white rounded-[16px] p-5 space-y-1 shadow-md">
                    <div className="text-[10px] text-[#FBFAF4]/60 font-bold uppercase tracking-wider font-display">Ticket Promedio</div>
                    <div className="text-3xl font-black font-display text-emerald-400">${averageTicket.toLocaleString()}</div>
                    <div className="text-[9px] text-[#FBFAF4]/40 font-medium font-sans">Por pago mensual</div>
                  </div>

                  <div className="bg-[#1A3834] text-white rounded-[16px] p-5 space-y-1 shadow-md">
                    <div className="text-[10px] text-[#FBFAF4]/60 font-bold uppercase tracking-wider font-display">Atletas Activos</div>
                    <div className="text-3xl font-black font-display text-[#FBFAF4]">{activeMembersCount}</div>
                    <div className="text-[9px] text-[#FBFAF4]/40 font-medium font-sans">Miembros registrados</div>
                  </div>
                </div>

                {/* GRÁFICOS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Gráfico 1: Recaudación */}
                  <div className="bg-[#F5F3EB] border border-[#1A3834]/10 rounded-[16px] p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-[#1A3834] uppercase tracking-wider flex items-center gap-1.5 font-display">
                      <TrendingUp className="w-4 h-4 text-[#FF5A1F]" />
                      Ingresos Mensuales (ARS)
                    </h3>
                    <div className="h-64 w-full">
                      {isMounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a383415" vertical={false} />
                            <XAxis dataKey="monthLabel" stroke="#1A3834" fontSize={11} tickLine={false} />
                            <YAxis stroke="#1A3834" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                            <Tooltip 
                              formatter={(value: any) => [`$${value.toLocaleString()}`, 'Ingresos']}
                              contentStyle={{ backgroundColor: '#FBFAF4', borderColor: '#1A3834', borderRadius: '8px' }}
                              labelStyle={{ fontWeight: 'bold', color: '#1A3834' }}
                            />
                            <Bar dataKey="revenue" fill="#FF5A1F" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-[#1A3834]/40 italic">Cargando gráfico...</div>
                      )}
                    </div>
                  </div>

                  {/* Gráfico 2: Atletas */}
                  <div className="bg-[#F5F3EB] border border-[#1A3834]/10 rounded-[16px] p-5 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-[#1A3834] uppercase tracking-wider flex items-center gap-1.5 font-display">
                      <Users className="w-4 h-4 text-[#1A3834]" />
                      Evolución de Atletas
                    </h3>
                    <div className="h-64 w-full">
                      {isMounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={monthlyChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a383415" vertical={false} />
                            <XAxis dataKey="monthLabel" stroke="#1A3834" fontSize={11} tickLine={false} />
                            <YAxis stroke="#1A3834" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip 
                              formatter={(value: any) => [value, 'Atletas']}
                              contentStyle={{ backgroundColor: '#FBFAF4', borderColor: '#1A3834', borderRadius: '8px' }}
                              labelStyle={{ fontWeight: 'bold', color: '#1A3834' }}
                            />
                            <Line type="monotone" dataKey="athletes" stroke="#1A3834" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2, r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-[#1A3834]/40 italic">Cargando gráfico...</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* DETALLE DE TRANSACCIONES */}
                <div className="space-y-4 pt-4 border-t border-[#1A3834]/10">
                  <h3 className="text-lg font-bold text-[#1A3834] font-display uppercase tracking-wide">
                    Detalle de Cobros Registrados ({filteredPayments.length})
                  </h3>
                  
                  {filteredPayments.length === 0 ? (
                    <p className="text-xs text-[#1A3834]/60 italic font-sans">No se registran cobros en este período.</p>
                  ) : (
                    <div className="overflow-x-auto border border-[#1A3834]/10 rounded-[12px]">
                      <table className="min-w-full text-left text-xs sm:text-sm font-sans">
                        <thead className="bg-[#F5F3EB] text-[#1A3834]/80 font-display uppercase font-semibold text-[11px] tracking-wider">
                          <tr>
                            <th className="p-3">Atleta</th>
                            <th className="p-3">Fecha</th>
                            <th className="p-3">Método</th>
                            <th className="p-3 text-right">Monto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1A3834]/5 bg-white">
                          {filteredPayments.map(p => (
                            <tr key={p.id} className="hover:bg-[#1A3834]/[0.01]">
                              <td className="p-3">
                                <button
                                  onClick={() => {
                                    const ath = athletes.find(a => a.email === p.athleteEmail);
                                    if (ath) setSelectedAthleteForView(ath);
                                  }}
                                  className="text-left font-bold text-[#1A3834] hover:text-[#FF5A1F] transition-colors cursor-pointer"
                                  title="Ver ficha de atleta"
                                >
                                  {p.athleteName}
                                </button>
                                <div className="text-[9px] text-[#1A3834]/60">{p.athleteEmail}</div>
                              </td>
                              <td className="p-3 text-[#1A3834]/70">{new Date(p.date).toLocaleDateString()}</td>
                              <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-[#1A3834]/5 text-[#1A3834] font-medium text-[10px] uppercase border border-[#1A3834]/10">{p.method}</span></td>
                              <td className="p-3 text-right font-bold text-[#1A3834]">${p.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
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

      {/* MODAL: VER PERFIL COMPLETO DE ATLETA */}
      {selectedAthleteForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="gradient-border-shell w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-full bg-[#FBFAF4] text-[#1A3834] rounded-[16px] overflow-hidden">
              <div className="p-6 bg-[#F5F3EB] border-b border-[#1A3834]/10 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide leading-none">Perfil del Atleta</h3>
                  <p className="text-xs text-[#1A3834]/70 mt-1 font-sans">Ficha técnica y estado de salud</p>
                </div>
                <button
                  onClick={() => setSelectedAthleteForView(null)}
                  className="p-1 rounded-full hover:bg-[#1A3834]/5 text-[#1A3834]/60 hover:text-[#1A3834] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto bg-[#FBFAF4] text-[#1A3834] font-sans">
                {/* Cabecera / Info Básica */}
                <div className="flex items-center gap-4 pb-4 border-b border-[#1A3834]/10">
                  <div className="w-14 h-14 rounded-full bg-[#1A3834]/10 border border-[#1A3834]/20 flex items-center justify-center text-xl font-bold text-[#1A3834]">
                    {selectedAthleteForView.name ? selectedAthleteForView.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="text-xl font-extrabold font-display uppercase tracking-wide">{selectedAthleteForView.name}</div>
                    <div className="text-xs text-[#1A3834]/60">{selectedAthleteForView.email}</div>
                    <div className="flex gap-1.5 mt-1.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1A3834]/5 text-[#1A3834] border border-[#1A3834]/10 uppercase tracking-wider font-display">
                        {selectedAthleteForView.teamStatus === 'activo' ? 'Miembro Activo' : 'Postulante'}
                      </span>
                      {selectedAthleteForView.role === 'admin' && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 uppercase tracking-wider font-display">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Datos Personales y Ficha Médica */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A3834]/50 font-display">Ficha de Datos e Historial Clínico</h4>
                  
                  <div className="grid grid-cols-2 gap-4 bg-[#F5F3EB]/50 p-4 rounded-[16px] border border-[#1A3834]/5">
                    <div>
                      <div className="text-[9px] font-bold text-[#1A3834]/50 uppercase tracking-wider">DNI</div>
                      <div className="text-sm font-semibold">{selectedAthleteForView.dni || 'Sin registrar'}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-[#1A3834]/50 uppercase tracking-wider">Talle de Remera</div>
                      <div className="text-sm font-semibold">{selectedAthleteForView.talleRemera || 'Sin registrar'}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-[#1A3834]/50 uppercase tracking-wider">Grupo Sanguíneo</div>
                      <div className="text-sm font-semibold">{selectedAthleteForView.grupoSanguineo || 'Sin registrar'}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-[#1A3834]/50 uppercase tracking-wider">Alergias</div>
                      <div className="text-sm font-semibold text-rose-700">{selectedAthleteForView.alergias || 'Ninguna reportada'}</div>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-[#1A3834]/5">
                      <div className="text-[9px] font-bold text-[#1A3834]/50 uppercase tracking-wider">Afecciones Médicas</div>
                      <div className="text-sm font-semibold text-rose-700">{selectedAthleteForView.afecciones || 'Ninguna reportada'}</div>
                    </div>
                  </div>
                </div>

                {/* Contacto de Emergencia */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A3834]/50 font-display">Contacto de Emergencia</h4>
                  <div className="bg-[#F5F3EB]/50 p-4 rounded-[16px] border border-[#1A3834]/5 grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[9px] font-bold text-[#1A3834]/50 uppercase tracking-wider">Nombre del Contacto</div>
                      <div className="text-sm font-semibold">{selectedAthleteForView.contactoEmergenciaName || 'Sin registrar'}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-[#1A3834]/50 uppercase tracking-wider">Teléfono de Emergencia</div>
                      <div className="text-sm font-semibold">{selectedAthleteForView.contactoEmergenciaPhone || 'Sin registrar'}</div>
                    </div>
                  </div>
                </div>

                {/* Estados Administrativos */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {/* Apto Médico */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A3834]/50 font-display">Apto Médico</h4>
                    <div className="p-3 rounded-[16px] border bg-[#F5F3EB]/30 border-[#1A3834]/10 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                          selectedAthleteForView.aptoMedicoStatus === 'vigente'
                            ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                            : selectedAthleteForView.aptoMedicoStatus === 'pendiente_verificacion'
                            ? 'bg-blue-500/10 text-blue-700 border border-blue-500/20'
                            : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
                        }`}>
                          {selectedAthleteForView.aptoMedicoStatus || 'No Entregado'}
                        </span>
                      </div>
                      {selectedAthleteForView.aptoMedicoVencimiento && (
                        <div className="text-[10px] text-[#1A3834]/60 font-medium">Vence: {new Date(selectedAthleteForView.aptoMedicoVencimiento).toLocaleDateString()}</div>
                      )}
                      {selectedAthleteForView.aptoMedicoUrl && (
                        <div className="text-[9px] font-mono text-[#1A3834]/40 overflow-hidden text-ellipsis whitespace-nowrap">Archivo: {selectedAthleteForView.aptoMedicoUrl}</div>
                      )}
                    </div>
                  </div>

                  {/* Estado Financiero */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A3834]/50 font-display">Estado de Pago</h4>
                    <div className="p-3 rounded-[16px] border bg-[#F5F3EB]/30 border-[#1A3834]/10 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                          selectedAthleteForView.paymentStatus === 'Pagado'
                            ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'
                            : selectedAthleteForView.paymentStatus === 'Pendiente_Verificacion'
                            ? 'bg-blue-500/10 text-blue-700 border border-blue-500/20'
                            : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
                        }`}>
                          {selectedAthleteForView.paymentStatus || 'Impago'}
                        </span>
                      </div>
                      {selectedAthleteForView.paymentMethod && (
                        <div className="text-[10px] text-[#1A3834]/60 font-medium">Método: {selectedAthleteForView.paymentMethod}</div>
                      )}
                      {selectedAthleteForView.paymentReceiptUrl && (
                        <div className="text-[9px] font-mono text-[#1A3834]/40 overflow-hidden text-ellipsis whitespace-nowrap">Recibo: {selectedAthleteForView.paymentReceiptUrl}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#F5F3EB] border-t border-[#1A3834]/10 flex justify-end">
                <button
                  onClick={() => setSelectedAthleteForView(null)}
                  className="px-5 py-2.5 bg-[#1A3834] hover:bg-[#1A3834]/90 text-white font-display text-[12px] font-semibold uppercase tracking-wider rounded-full transition-colors duration-150 cursor-pointer"
                >
                  Cerrar Ficha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

