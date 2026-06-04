// Base de datos con Supabase para RV
import { createClient } from '@/lib/supabase/client'

export interface Team {
  id: string;
  name: string;
  description: string;
  whatsapp_url: string;
  training_days: string;
  coach: string;
  instructions: string;
  location: string;
  logo_url: string;
}

export interface Athlete {
  id?: string;
  user_id?: string;
  email: string;
  name: string;
  role: 'atleta' | 'admin' | null;
  onboarding_complete: boolean;
  dni?: string;
  talle_remera?: string;
  contacto_emergencia_name?: string;
  contacto_emergencia_phone?: string;
  grupo_sanguineo?: string;
  alergias?: string;
  afecciones?: string;
  apto_medico_url?: string;
  apto_medico_status?: 'no_entregado' | 'pendiente_verificacion' | 'vigente' | 'rechazado';
  apto_medico_vencimiento?: string;
  apto_medico_motivo_rechazo?: string;
  team_id?: string | null;
  team_status?: 'pendiente' | 'activo' | null;
  payment_status?: 'Pendiente_Pago' | 'Pendiente_Verificacion' | 'Pagado' | 'Vencido' | null;
  payment_receipt_url?: string;
  payment_method?: string;
  payment_motivo_rechazo?: string;
}

export interface Payment {
  id: string;
  athlete_email: string;
  athlete_name: string;
  amount: number;
  method: string;
  created_at: string;
  status: 'aprobado' | 'rechazado';
}

// Mapeo de camelCase a snake_case para la base de datos
function toSnakeCase(athlete: Partial<Athlete>): Record<string, unknown> {
  return {
    email: athlete.email,
    name: athlete.name,
    role: athlete.role,
    onboarding_complete: athlete.onboarding_complete,
    dni: athlete.dni,
    talle_remera: athlete.talle_remera,
    contacto_emergencia_name: athlete.contacto_emergencia_name,
    contacto_emergencia_phone: athlete.contacto_emergencia_phone,
    grupo_sanguineo: athlete.grupo_sanguineo,
    alergias: athlete.alergias,
    afecciones: athlete.afecciones,
    apto_medico_url: athlete.apto_medico_url,
    apto_medico_status: athlete.apto_medico_status,
    apto_medico_vencimiento: athlete.apto_medico_vencimiento,
    apto_medico_motivo_rechazo: athlete.apto_medico_motivo_rechazo,
    team_id: athlete.team_id,
    team_status: athlete.team_status,
    payment_status: athlete.payment_status,
    payment_receipt_url: athlete.payment_receipt_url,
    payment_method: athlete.payment_method,
    payment_motivo_rechazo: athlete.payment_motivo_rechazo,
  }
}

// Mapeo de snake_case a camelCase desde la DB
function fromDbAthlete(row: Record<string, unknown>): Athlete {
  return {
    id: row.id as string,
    user_id: row.user_id as string | undefined,
    email: row.email as string,
    name: row.name as string,
    role: row.role as 'atleta' | 'admin' | null,
    onboarding_complete: row.onboarding_complete as boolean,
    dni: row.dni as string | undefined,
    talle_remera: row.talle_remera as string | undefined,
    contacto_emergencia_name: row.contacto_emergencia_name as string | undefined,
    contacto_emergencia_phone: row.contacto_emergencia_phone as string | undefined,
    grupo_sanguineo: row.grupo_sanguineo as string | undefined,
    alergias: row.alergias as string | undefined,
    afecciones: row.afecciones as string | undefined,
    apto_medico_url: row.apto_medico_url as string | undefined,
    apto_medico_status: row.apto_medico_status as Athlete['apto_medico_status'],
    apto_medico_vencimiento: row.apto_medico_vencimiento as string | undefined,
    apto_medico_motivo_rechazo: row.apto_medico_motivo_rechazo as string | undefined,
    team_id: row.team_id as string | null | undefined,
    team_status: row.team_status as Athlete['team_status'],
    payment_status: row.payment_status as Athlete['payment_status'],
    payment_receipt_url: row.payment_receipt_url as string | undefined,
    payment_method: row.payment_method as string | undefined,
    payment_motivo_rechazo: row.payment_motivo_rechazo as string | undefined,
  }
}

function fromDbTeam(row: Record<string, unknown>): Team {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    whatsapp_url: row.whatsapp_url as string,
    training_days: row.training_days as string,
    coach: row.coach as string,
    instructions: row.instructions as string,
    location: row.location as string,
    logo_url: row.logo_url as string,
  }
}

function fromDbPayment(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    athlete_email: row.athlete_email as string,
    athlete_name: row.athlete_name as string,
    amount: Number(row.amount),
    method: row.method as string,
    created_at: row.created_at as string,
    status: row.status as 'aprobado' | 'rechazado',
  }
}

// Estado local para demo (fallback si no hay auth)
let currentDemoEmail: string | null = null;

export function initializeDB() {
  // No-op: La base de datos está en Supabase
}

// =========== Team Operations ===========

export async function getTeamAsync(): Promise<Team | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .limit(1)
    .single()
  
  if (error || !data) return null
  return fromDbTeam(data)
}

// Sync version for compatibility (returns default team)
export function getTeam(): Team {
  return {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'RV equipo de montana',
    description: 'Grupo de entrenamiento especializado en Trail Running, ultra maratones y carreras de montana en todos los niveles.',
    whatsapp_url: 'https://chat.whatsapp.com/RVEquipoMontanaSimulado',
    training_days: 'Martes y Jueves 19:00 hs, Sabados 8:00 hs',
    coach: 'Ramiro Valenzuela',
    instructions: 'Para el entrenamiento de este martes, traer linterna frontal y mochila de hidratacion.',
    location: 'Mendoza, Argentina',
    logo_url: '/rv-logo.svg',
  }
}

export async function updateTeamInstructionsAsync(instructions: string): Promise<void> {
  const supabase = createClient()
  await supabase
    .from('teams')
    .update({ instructions })
    .eq('id', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
}

export function updateTeamInstructions(instructions: string) {
  updateTeamInstructionsAsync(instructions)
}

// =========== Athletes Operations ===========

export async function getAthletesAsync(): Promise<Athlete[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('athletes')
    .select('*')
    .order('name')
  
  if (error || !data) return []
  return data.map(fromDbAthlete)
}

export function getAthletes(): Athlete[] {
  // Sync fallback - will be populated by useEffect
  return []
}

export async function getCurrentUserAsync(): Promise<Athlete | null> {
  const supabase = createClient()
  
  // First check if there's a Supabase auth user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user?.email) {
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('email', user.email)
      .single()
    
    if (!error && data) {
      return fromDbAthlete(data)
    }
    
    // If no athlete record exists, create one
    const newAthlete = {
      user_id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email.split('@')[0],
      role: 'atleta',
      onboarding_complete: false,
      apto_medico_status: 'no_entregado',
    }
    
    const { data: created, error: createError } = await supabase
      .from('athletes')
      .insert(newAthlete)
      .select()
      .single()
    
    if (!createError && created) {
      return fromDbAthlete(created)
    }
  }
  
  // Fallback to demo mode
  if (currentDemoEmail) {
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('email', currentDemoEmail)
      .single()
    
    if (!error && data) {
      return fromDbAthlete(data)
    }
  }
  
  return null
}

// Sync version for compatibility
export function getCurrentUser(): Athlete | null {
  return null // Must use async version
}

export function setCurrentUserEmail(email: string | null) {
  currentDemoEmail = email
}

export async function updateAthleteProfileAsync(email: string, updates: Partial<Athlete>): Promise<Athlete | null> {
  const supabase = createClient()
  
  // Filter out undefined values and convert to snake_case
  const dbUpdates: Record<string, unknown> = {}
  const snakeCaseData = toSnakeCase(updates)
  
  for (const [key, value] of Object.entries(snakeCaseData)) {
    if (value !== undefined) {
      dbUpdates[key] = value
    }
  }
  
  const { data, error } = await supabase
    .from('athletes')
    .update(dbUpdates)
    .eq('email', email)
    .select()
    .single()
  
  if (error || !data) return null
  return fromDbAthlete(data)
}

export function updateAthleteProfile(email: string, updates: Partial<Athlete>): Athlete | null {
  updateAthleteProfileAsync(email, updates)
  return null
}

export async function requestJoinTeamAsync(email: string, teamId: string): Promise<void> {
  await updateAthleteProfileAsync(email, {
    team_id: teamId,
    team_status: 'pendiente',
  })
}

export function requestJoinTeam(email: string, teamId: string) {
  requestJoinTeamAsync(email, teamId)
}

export async function leaveTeamAsync(email: string): Promise<void> {
  await updateAthleteProfileAsync(email, {
    team_id: null,
    team_status: null,
    payment_status: null,
    payment_receipt_url: undefined,
    payment_method: undefined,
    payment_motivo_rechazo: undefined,
  })
}

export function leaveTeam(email: string) {
  leaveTeamAsync(email)
}

export async function uploadPaymentReceiptAsync(email: string, receiptName: string): Promise<void> {
  await updateAthleteProfileAsync(email, {
    payment_status: 'Pendiente_Verificacion',
    payment_receipt_url: receiptName,
    payment_motivo_rechazo: undefined,
  })
}

export function uploadPaymentReceipt(email: string, receiptName: string) {
  uploadPaymentReceiptAsync(email, receiptName)
}

export async function uploadMedicalCertificateAsync(email: string, certName: string): Promise<void> {
  await updateAthleteProfileAsync(email, {
    apto_medico_status: 'pendiente_verificacion',
    apto_medico_url: certName,
    apto_medico_motivo_rechazo: undefined,
  })
}

export function uploadMedicalCertificate(email: string, certName: string) {
  uploadMedicalCertificateAsync(email, certName)
}

// =========== Admin Operations ===========

export async function processRequestAsync(email: string, approve: boolean): Promise<void> {
  if (approve) {
    await updateAthleteProfileAsync(email, {
      team_status: 'activo',
      payment_status: 'Pendiente_Pago',
    })
  } else {
    await updateAthleteProfileAsync(email, {
      team_id: null,
      team_status: null,
    })
  }
}

export function processRequest(email: string, approve: boolean) {
  processRequestAsync(email, approve)
}

export async function processPaymentAsync(email: string, approve: boolean, method?: string, reason?: string): Promise<void> {
  const supabase = createClient()
  
  if (approve) {
    await updateAthleteProfileAsync(email, {
      payment_status: 'Pagado',
      payment_method: method || 'Transferencia',
      payment_motivo_rechazo: undefined,
    })
    
    // Add to payment history
    const { data: athlete } = await supabase
      .from('athletes')
      .select('name')
      .eq('email', email)
      .single()
    
    if (athlete) {
      await supabase.from('payments').insert({
        athlete_email: email,
        athlete_name: athlete.name,
        amount: 15000,
        method: method || 'Transferencia',
        status: 'aprobado',
      })
    }
  } else {
    await updateAthleteProfileAsync(email, {
      payment_status: 'Vencido',
      payment_motivo_rechazo: reason || 'Comprobante no valido',
    })
  }
}

export function processPayment(email: string, approve: boolean, method?: string, reason?: string) {
  processPaymentAsync(email, approve, method, reason)
}

export async function processCertificateAsync(email: string, approve: boolean, months?: number, reason?: string): Promise<void> {
  if (approve) {
    const monthsValidity = months || 6
    const expirationDate = new Date()
    expirationDate.setMonth(expirationDate.getMonth() + monthsValidity)

    await updateAthleteProfileAsync(email, {
      apto_medico_status: 'vigente',
      apto_medico_vencimiento: expirationDate.toISOString(),
      apto_medico_motivo_rechazo: undefined,
    })
  } else {
    await updateAthleteProfileAsync(email, {
      apto_medico_status: 'rechazado',
      apto_medico_motivo_rechazo: reason || 'Certificado medico borroso o no legible',
    })
  }
}

export function processCertificate(email: string, approve: boolean, months?: number, reason?: string) {
  processCertificateAsync(email, approve, months, reason)
}

export async function expelAthleteAsync(email: string): Promise<void> {
  await leaveTeamAsync(email)
}

export function expelAthlete(email: string) {
  expelAthleteAsync(email)
}

// =========== Payments Operations ===========

export async function getPaymentsAsync(): Promise<Payment[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error || !data) return []
  return data.map(fromDbPayment)
}

export function getPayments(): Payment[] {
  return []
}

// =========== Analytics ===========

export async function getAnalyticsDataAsync() {
  const payments = await getPaymentsAsync()
  const athletes = await getAthletesAsync()
  const teamAthletes = athletes.filter(a => a.team_id && a.team_status === 'activo')

  const monthlyData: { [key: string]: { revenue: number; paymentCount: number; month: string; monthLabel: string } } = {}

  payments.forEach(p => {
    if (p.status !== 'aprobado') return
    const d = new Date(p.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    if (!monthlyData[key]) {
      monthlyData[key] = {
        revenue: 0,
        paymentCount: 0,
        month: key,
        monthLabel: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      }
    }
    monthlyData[key].revenue += p.amount
    monthlyData[key].paymentCount += 1
  })

  const sortedMonths = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))

  const totalRevenue = payments.filter(p => p.status === 'aprobado').reduce((sum, p) => sum + p.amount, 0)
  const totalActiveAthletes = teamAthletes.length
  const paidAthletes = teamAthletes.filter(a => a.payment_status === 'Pagado').length
  const unpaidAthletes = teamAthletes.filter(a => a.payment_status !== 'Pagado').length
  const morosityRate = totalActiveAthletes > 0 ? Math.round((unpaidAthletes / totalActiveAthletes) * 100) : 0

  return {
    monthlyData: sortedMonths,
    totalRevenue,
    totalActiveAthletes,
    paidAthletes,
    unpaidAthletes,
    morosityRate,
    averagePerAthlete: totalActiveAthletes > 0 ? Math.round(totalRevenue / totalActiveAthletes) : 0,
  }
}
