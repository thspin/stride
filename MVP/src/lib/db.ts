// Simulación de Base de Datos relacional en localStorage para RV

export interface Team {
  id: string;
  name: string;
  description: string;
  whatsappUrl: string;
  trainingDays: string;
  coach: string;
  instructions: string;
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

const DEFAULT_TEAM: Team = {
  id: 'rv-equipo',
  name: 'RV equipo de montaña',
  description: 'Grupo de entrenamiento especializado en Trail Running, ultra maratones y carreras de montaña en todos los niveles. Entrenamientos presenciales guiados por profesionales.',
  whatsappUrl: 'https://chat.whatsapp.com/RVEquipoMontanaSimulado',
  trainingDays: 'Martes y Jueves 19:00 hs, Sábados 8:00 hs',
  coach: 'Ramiro Valenzuela',
  instructions: 'Para el entrenamiento de este martes, traer linterna frontal y mochila de hidratación. Haremos cuestas acumuladas de 400m en el circuito de cerro.',
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
    updateAthleteProfile(email, {
      paymentStatus: 'Pagado',
      paymentMethod: method || 'Transferencia',
      paymentMotivoRechazo: undefined,
    });
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
