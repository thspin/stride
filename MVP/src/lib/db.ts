// Simulación de Base de Datos relacional en localStorage para RV

export interface Team {
  id: string;
  name: string;
  description: string;
  whatsappUrl: string;
  trainingDays: string;
  coach: string;
  instructions: string;
  location: string;
  logoUrl: string;
}

export interface Athlete {
  email: string;
  name: string;
  role: 'atleta' | 'admin' | null;
  onboardingComplete: boolean;
  dni?: string;
  talleRemera?: string;
  contactoEmergenciaName?: string;
  contactoEmergenciaPhone?: string;
  grupoSanguineo?: string;
  alergias?: string;
  afecciones?: string;
  aptoMedicoUrl?: string; // Nombre del archivo o Base64 ficticio
  aptoMedicoStatus?: 'no_entregado' | 'pendiente_verificacion' | 'vigente' | 'rechazado';
  aptoMedicoVencimiento?: string; // ISO String
  aptoMedicoMotivoRechazo?: string;
  teamId?: string | null;
  teamStatus?: 'pendiente' | 'activo' | null; // 'pendiente' = solicitando unirse
  paymentStatus?: 'Pendiente_Pago' | 'Pendiente_Verificacion' | 'Pagado' | 'Vencido' | null;
  paymentReceiptUrl?: string;
  paymentMethod?: string;
  paymentMotivoRechazo?: string;
}

export interface Payment {
  id: string;
  athleteEmail: string;
  athleteName: string;
  amount: number;
  method: string;
  date: string; // ISO String
  status: 'aprobado' | 'rechazado';
}

const DEFAULT_TEAM: Team = {
  id: 'rv-equipo',
  name: 'RV equipo de montaña',
  description: 'Grupo de entrenamiento especializado en Trail Running, ultra maratones y carreras de montaña en todos los niveles. Entrenamientos presenciales guiados por profesionales.',
  whatsappUrl: 'https://chat.whatsapp.com/RVEquipoMontanaSimulado',
  trainingDays: 'Martes y Jueves 19:00 hs, Sábados 8:00 hs',
  coach: 'Ramiro Valenzuela',
  instructions: 'Para el entrenamiento de este martes, traer linterna frontal y mochila de hidratación. Haremos cuestas acumuladas de 400m en el circuito de cerro.',
  location: 'Mendoza, Argentina',
  logoUrl: '/rv-logo.svg',
};

const SEED_ATHLETES: Athlete[] = [
  {
    email: 'admin@rv.com',
    name: 'Juan Admin',
    role: 'admin',
    onboardingComplete: true,
    teamId: 'rv-equipo',
    teamStatus: 'activo',
  },
  {
    email: 'atleta_activo@rv.com',
    name: 'Carlos Corredor',
    role: 'atleta',
    onboardingComplete: true,
    dni: '38123456',
    talleRemera: 'M',
    contactoEmergenciaName: 'María Corredor (Madre)',
    contactoEmergenciaPhone: '+54 9 11 9876-5432',
    grupoSanguineo: '0+',
    alergias: 'Ninguna',
    afecciones: 'Ninguna',
    aptoMedicoUrl: 'apto_carlos.pdf',
    aptoMedicoStatus: 'vigente',
    aptoMedicoVencimiento: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(), // Vence en 90 días
    teamId: 'rv-equipo',
    teamStatus: 'activo',
    paymentStatus: 'Pagado',
    paymentMethod: 'Transferencia Bancaria',
  },
  {
    email: 'atleta_nuevo@rv.com',
    name: 'Ana Novata',
    role: 'atleta',
    onboardingComplete: false,
    teamId: null,
    teamStatus: null,
    aptoMedicoStatus: 'no_entregado',
  },
  // Simulación de más miembros para poblar la vista del Administrador
  {
    email: 'solicitante@rv.com',
    name: 'Esteban Quito',
    role: 'atleta',
    onboardingComplete: true,
    dni: '40123987',
    talleRemera: 'L',
    contactoEmergenciaName: 'Jorge Quito (Hermano)',
    contactoEmergenciaPhone: '+54 9 261 456-7890',
    grupoSanguineo: 'A+',
    alergias: 'Penicilina',
    afecciones: 'Asma leve',
    aptoMedicoUrl: 'certificado_medico.jpg',
    aptoMedicoStatus: 'pendiente_verificacion',
    teamId: 'rv-equipo',
    teamStatus: 'pendiente', // Solicitando ingresar
  },
  {
    email: 'pendiente_pago@rv.com',
    name: 'Paula Mora',
    role: 'atleta',
    onboardingComplete: true,
    dni: '39456789',
    talleRemera: 'S',
    contactoEmergenciaName: 'Roberto Mora (Padre)',
    contactoEmergenciaPhone: '+54 9 261 555-0199',
    grupoSanguineo: 'B-',
    alergias: 'Ninguna',
    afecciones: 'Ninguna',
    aptoMedicoUrl: 'apto_paula.pdf',
    aptoMedicoStatus: 'vigente',
    aptoMedicoVencimiento: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toISOString(),
    teamId: 'rv-equipo',
    teamStatus: 'activo',
    paymentStatus: 'Pendiente_Pago',
  },
  {
    email: 'revision_pago@rv.com',
    name: 'Mariano Recibo',
    role: 'atleta',
    onboardingComplete: true,
    dni: '35123123',
    talleRemera: 'XL',
    contactoEmergenciaName: 'Lucía Recibo (Esposa)',
    contactoEmergenciaPhone: '+54 9 11 2222-3333',
    grupoSanguineo: 'AB+',
    alergias: 'Polen',
    afecciones: 'Ninguna',
    aptoMedicoUrl: 'apto_mariano.png',
    aptoMedicoStatus: 'vigente',
    aptoMedicoVencimiento: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    teamId: 'rv-equipo',
    teamStatus: 'activo',
    paymentStatus: 'Pendiente_Verificacion',
    paymentReceiptUrl: 'comprobante_transferencia_29052026.pdf',
  },
  {
    email: 'revision_apto@rv.com',
    name: 'Sofía Salud',
    role: 'atleta',
    onboardingComplete: true,
    dni: '41987654',
    talleRemera: 'XS',
    contactoEmergenciaName: 'David Salud (Madre)',
    contactoEmergenciaPhone: '+54 9 351 999-8888',
    grupoSanguineo: '0-',
    alergias: 'Polvo de ácaros',
    afecciones: 'Ninguna',
    aptoMedicoUrl: 'apto_sofia.pdf',
    aptoMedicoStatus: 'pendiente_verificacion',
    teamId: 'rv-equipo',
    teamStatus: 'activo',
    paymentStatus: 'Pagado',
    paymentMethod: 'Efectivo',
  }
];

// Datos de seed para el historial de pagos (últimos 6 meses)
function generateSeedPayments(): Payment[] {
  const payments: Payment[] = [];
  const athletes = [
    { email: 'atleta_activo@rv.com', name: 'Carlos Corredor' },
    { email: 'pendiente_pago@rv.com', name: 'Paula Mora' },
    { email: 'revision_pago@rv.com', name: 'Mariano Recibo' },
    { email: 'revision_apto@rv.com', name: 'Sofía Salud' },
  ];
  const methods = ['Transferencia', 'Efectivo', 'Tarjeta'];
  const amount = 15000; // ARS por mes

  const now = new Date();
  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, 15);
    // Cada atleta puede o no haber pagado ese mes
    const athleteCount = monthOffset === 0 ? 2 : Math.min(athletes.length, 2 + monthOffset % 3);
    for (let i = 0; i < athleteCount; i++) {
      const athlete = athletes[i % athletes.length];
      payments.push({
        id: `pay-${monthOffset}-${i}`,
        athleteEmail: athlete.email,
        athleteName: athlete.name,
        amount: amount + (monthOffset * 500), // Simular aumento gradual
        method: methods[i % methods.length],
        date: date.toISOString(),
        status: 'aprobado',
      });
    }
  }
  return payments;
}

// Helper seguro para localStorage (evita errores SSR)
function isClient() {
  return typeof window !== 'undefined';
}

export function initializeDB() {
  if (!isClient()) return;

  if (!localStorage.getItem('rv_team')) {
    localStorage.setItem('rv_team', JSON.stringify(DEFAULT_TEAM));
  }
  if (!localStorage.getItem('rv_athletes')) {
    localStorage.setItem('rv_athletes', JSON.stringify(SEED_ATHLETES));
  }
  if (!localStorage.getItem('rv_payments')) {
    localStorage.setItem('rv_payments', JSON.stringify(generateSeedPayments()));
  }
}

export function getTeam(): Team {
  if (!isClient()) return DEFAULT_TEAM;
  initializeDB();
  const data = localStorage.getItem('rv_team');
  return data ? JSON.parse(data) : DEFAULT_TEAM;
}

export function saveTeam(team: Team) {
  if (!isClient()) return;
  localStorage.setItem('rv_team', JSON.stringify(team));
}

export function getAthletes(): Athlete[] {
  if (!isClient()) return [];
  initializeDB();
  const data = localStorage.getItem('rv_athletes');
  return data ? JSON.parse(data) : [];
}

export function saveAthletes(athletes: Athlete[]) {
  if (!isClient()) return;
  localStorage.setItem('rv_athletes', JSON.stringify(athletes));
}

// Pagos históricos
export function getPayments(): Payment[] {
  if (!isClient()) return [];
  initializeDB();
  const data = localStorage.getItem('rv_payments');
  return data ? JSON.parse(data) : [];
}

export function savePayments(payments: Payment[]) {
  if (!isClient()) return;
  localStorage.setItem('rv_payments', JSON.stringify(payments));
}

export function addPayment(payment: Payment) {
  const payments = getPayments();
  payments.push(payment);
  savePayments(payments);
}

// Datos agregados para el Dashboard analítico
export function getAnalyticsData() {
  const payments = getPayments();
  const athletes = getAthletes();
  const teamAthletes = athletes.filter(a => a.teamId === 'rv-equipo' && a.teamStatus === 'activo');

  // Agrupar pagos por mes
  const monthlyData: { [key: string]: { revenue: number; paymentCount: number; month: string; monthLabel: string } } = {};

  payments.forEach(p => {
    if (p.status !== 'aprobado') return;
    const d = new Date(p.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    if (!monthlyData[key]) {
      monthlyData[key] = {
        revenue: 0,
        paymentCount: 0,
        month: key,
        monthLabel: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      };
    }
    monthlyData[key].revenue += p.amount;
    monthlyData[key].paymentCount += 1;
  });

  // Ordenar cronológicamente
  const sortedMonths = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  // KPIs
  const totalRevenue = payments.filter(p => p.status === 'aprobado').reduce((sum, p) => sum + p.amount, 0);
  const totalActiveAthletes = teamAthletes.length;
  const paidAthletes = teamAthletes.filter(a => a.paymentStatus === 'Pagado').length;
  const unpaidAthletes = teamAthletes.filter(a => a.paymentStatus !== 'Pagado').length;
  const morosityRate = totalActiveAthletes > 0 ? Math.round((unpaidAthletes / totalActiveAthletes) * 100) : 0;

  return {
    monthlyData: sortedMonths,
    totalRevenue,
    totalActiveAthletes,
    paidAthletes,
    unpaidAthletes,
    morosityRate,
    averagePerAthlete: totalActiveAthletes > 0 ? Math.round(totalRevenue / totalActiveAthletes) : 0,
  };
}

// Sesión Activa del Usuario
export function getCurrentUser(): Athlete | null {
  if (!isClient()) return null;
  const email = localStorage.getItem('rv_current_user_email');
  if (!email) return null;
  const athletes = getAthletes();
  return athletes.find(a => a.email === email) || null;
}

export function setCurrentUserEmail(email: string | null) {
  if (!isClient()) return;
  if (email) {
    localStorage.setItem('rv_current_user_email', email);
    // Si es un email nuevo, agregarlo a la lista de atletas
    const athletes = getAthletes();
    if (!athletes.some(a => a.email === email)) {
      const isDomainAdmin = email.endsWith('@rv.com') && email.startsWith('admin');
      const newAthlete: Athlete = {
        email,
        name: email.split('@')[0],
        role: isDomainAdmin ? 'admin' : 'atleta',
        onboardingComplete: false,
        aptoMedicoStatus: 'no_entregado',
        teamId: null,
        teamStatus: null,
      };
      athletes.push(newAthlete);
      saveAthletes(athletes);
    }
  } else {
    localStorage.removeItem('rv_current_user_email');
  }
}

// Operaciones del Atleta
export function updateAthleteProfile(email: string, updates: Partial<Athlete>): Athlete {
  const athletes = getAthletes();
  const index = athletes.findIndex(a => a.email === email);
  if (index !== -1) {
    athletes[index] = { ...athletes[index], ...updates };
    saveAthletes(athletes);
    return athletes[index];
  }
  throw new Error('Atleta no encontrado');
}

export function requestJoinTeam(email: string, teamId: string) {
  updateAthleteProfile(email, {
    teamId,
    teamStatus: 'pendiente',
  });
}

export function leaveTeam(email: string) {
  updateAthleteProfile(email, {
    teamId: null,
    teamStatus: null,
    paymentStatus: null,
    paymentReceiptUrl: undefined,
    paymentMethod: undefined,
    paymentMotivoRechazo: undefined,
  });
}

export function uploadPaymentReceipt(email: string, receiptName: string) {
  updateAthleteProfile(email, {
    paymentStatus: 'Pendiente_Verificacion',
    paymentReceiptUrl: receiptName,
    paymentMotivoRechazo: undefined,
  });
}

export function uploadMedicalCertificate(email: string, certName: string) {
  updateAthleteProfile(email, {
    aptoMedicoStatus: 'pendiente_verificacion',
    aptoMedicoUrl: certName,
    aptoMedicoMotivoRechazo: undefined,
  });
}

// Operaciones del Administrador
export function processRequest(email: string, approve: boolean) {
  if (approve) {
    updateAthleteProfile(email, {
      teamStatus: 'activo',
      paymentStatus: 'Pendiente_Pago',
    });
  } else {
    updateAthleteProfile(email, {
      teamId: null,
      teamStatus: null,
    });
  }
}

export function processPayment(email: string, approve: boolean, method?: string, reason?: string) {
  if (approve) {
    const athlete = getAthletes().find(a => a.email === email);
    updateAthleteProfile(email, {
      paymentStatus: 'Pagado',
      paymentMethod: method || 'Transferencia',
      paymentMotivoRechazo: undefined,
    });
    // Registrar en historial de pagos
    if (athlete) {
      addPayment({
        id: `pay-${Date.now()}`,
        athleteEmail: email,
        athleteName: athlete.name,
        amount: 15000,
        method: method || 'Transferencia',
        date: new Date().toISOString(),
        status: 'aprobado',
      });
    }
  } else {
    updateAthleteProfile(email, {
      paymentStatus: 'Vencido',
      paymentMotivoRechazo: reason || 'Comprobante no válido',
    });
  }
}

export function processCertificate(email: string, approve: boolean, months?: number, reason?: string) {
  if (approve) {
    const monthsValidity = months || 6;
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + monthsValidity);

    updateAthleteProfile(email, {
      aptoMedicoStatus: 'vigente',
      aptoMedicoVencimiento: expirationDate.toISOString(),
      aptoMedicoMotivoRechazo: undefined,
    });
  } else {
    updateAthleteProfile(email, {
      aptoMedicoStatus: 'rechazado',
      aptoMedicoMotivoRechazo: reason || 'Certificado médico borroso o no legible',
    });
  }
}

export function expelAthlete(email: string) {
  leaveTeam(email);
}

export function updateTeamInstructions(instructions: string) {
  const team = getTeam();
  team.instructions = instructions;
  saveTeam(team);
}
