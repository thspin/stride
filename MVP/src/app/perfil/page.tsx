'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, updateAthleteProfile, uploadMedicalCertificate, Athlete, initializeDB } from '@/lib/db';
import Navbar from '@/components/Navbar';
import {
  User,
  Mail,
  CreditCard,
  Shirt,
  Phone,
  Droplets,
  AlertTriangle,
  Heart,
  Upload,
  Save,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<Athlete | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [certFile, setCertFile] = useState('');
  const [certError, setCertError] = useState('');

  // Editable fields
  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    talleRemera: '',
    contactoEmergenciaName: '',
    contactoEmergenciaPhone: '',
    grupoSanguineo: '',
    alergias: '',
    afecciones: '',
  });

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
    setFormData({
      name: currentUser.name || '',
      dni: currentUser.dni || '',
      talleRemera: currentUser.talleRemera || '',
      contactoEmergenciaName: currentUser.contactoEmergenciaName || '',
      contactoEmergenciaPhone: currentUser.contactoEmergenciaPhone || '',
      grupoSanguineo: currentUser.grupoSanguineo || '',
      alergias: currentUser.alergias || '',
      afecciones: currentUser.afecciones || '',
    });
  };

  useEffect(() => {
    loadData();
  }, [router]);

  const handleSave = () => {
    if (!user) return;
    updateAthleteProfile(user.email, formData);
    setIsEditing(false);
    loadData();
    alert('Perfil actualizado con éxito.');
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

  const aptoStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    vigente: { label: 'Vigente', color: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20', icon: <CheckCircle className="w-4 h-4" /> },
    pendiente_verificacion: { label: 'En Revisión', color: 'bg-blue-500/10 text-blue-700 border-blue-500/20', icon: <Clock className="w-4 h-4" /> },
    rechazado: { label: 'Rechazado', color: 'bg-rose-500/10 text-rose-700 border-rose-500/20', icon: <XCircle className="w-4 h-4" /> },
    no_entregado: { label: 'No Entregado', color: 'bg-amber-500/10 text-amber-700 border-amber-500/20', icon: <AlertTriangle className="w-4 h-4" /> },
  };

  const aptoStatus = aptoStatusConfig[user.aptoMedicoStatus || 'no_entregado'];

  return (
    <div className="min-h-screen bg-[#1A3834] text-[#FBFAF4] font-sans antialiased">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* HEADER */}
        <div className="bg-[#FBFAF4] text-[#1A3834] border border-[#1A3834]/10 rounded-[16px] p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#1A3834]/10 border-2 border-[#1A3834]/20 flex items-center justify-center text-2xl font-bold text-[#1A3834]">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide">{user.name}</h1>
                <p className="text-sm text-[#1A3834]/60">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#1A3834]/5 text-[#1A3834] border border-[#1A3834]/10 uppercase tracking-wider font-display">
                  {user.role === 'admin' ? 'Administrador' : 'Atleta'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-5 py-2.5 bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white font-display text-[12px] font-semibold tracking-[1.68px] uppercase rounded-full transition-all duration-150 cursor-pointer"
            >
              {isEditing ? 'Cancelar' : 'Editar Perfil'}
            </button>
          </div>
        </div>

        {/* DATOS PERSONALES */}
        <div className="bg-[#FBFAF4] text-[#1A3834] border border-[#1A3834]/10 rounded-[16px] p-6 shadow-xl">
          <h2 className="text-xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide mb-6 flex items-center gap-2">
            <User className="w-5 h-5" />
            Datos Personales
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />

            {isEditing ? (
              <>
                <EditableField icon={<User className="w-4 h-4" />} label="Nombre" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} />
                <EditableField icon={<CreditCard className="w-4 h-4" />} label="DNI" value={formData.dni} onChange={v => setFormData({ ...formData, dni: v })} />
                <EditableField icon={<Shirt className="w-4 h-4" />} label="Talle de Remera" value={formData.talleRemera} onChange={v => setFormData({ ...formData, talleRemera: v })} />
                <EditableField icon={<Droplets className="w-4 h-4" />} label="Grupo Sanguíneo" value={formData.grupoSanguineo} onChange={v => setFormData({ ...formData, grupoSanguineo: v })} />
                <EditableField icon={<AlertTriangle className="w-4 h-4" />} label="Alergias" value={formData.alergias} onChange={v => setFormData({ ...formData, alergias: v })} />
                <EditableField icon={<Heart className="w-4 h-4" />} label="Afecciones" value={formData.afecciones} onChange={v => setFormData({ ...formData, afecciones: v })} />
              </>
            ) : (
              <>
                <FieldRow icon={<CreditCard className="w-4 h-4" />} label="DNI" value={user.dni || 'Sin registrar'} />
                <FieldRow icon={<Shirt className="w-4 h-4" />} label="Talle de Remera" value={user.talleRemera || 'Sin registrar'} />
                <FieldRow icon={<Droplets className="w-4 h-4" />} label="Grupo Sanguíneo" value={user.grupoSanguineo || 'Sin registrar'} />
                <FieldRow icon={<AlertTriangle className="w-4 h-4" />} label="Alergias" value={user.alergias || 'Ninguna reportada'} />
                <FieldRow icon={<Heart className="w-4 h-4" />} label="Afecciones" value={user.afecciones || 'Ninguna reportada'} />
              </>
            )}
          </div>

          {/* CONTACTO DE EMERGENCIA */}
          <div className="mt-6 pt-6 border-t border-[#1A3834]/10">
            <h3 className="text-sm font-bold text-[#1A3834] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contacto de Emergencia
            </h3>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableField icon={<User className="w-4 h-4" />} label="Nombre" value={formData.contactoEmergenciaName} onChange={v => setFormData({ ...formData, contactoEmergenciaName: v })} />
                <EditableField icon={<Phone className="w-4 h-4" />} label="Teléfono" value={formData.contactoEmergenciaPhone} onChange={v => setFormData({ ...formData, contactoEmergenciaPhone: v })} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldRow icon={<User className="w-4 h-4" />} label="Nombre" value={user.contactoEmergenciaName || 'Sin registrar'} />
                <FieldRow icon={<Phone className="w-4 h-4" />} label="Teléfono" value={user.contactoEmergenciaPhone || 'Sin registrar'} />
              </div>
            )}
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white font-display text-[12px] font-semibold tracking-[1.68px] uppercase rounded-full transition-all duration-150 cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
            </div>
          )}
        </div>

        {/* APTO MÉDICO */}
        <div className="bg-[#FBFAF4] text-[#1A3834] border border-[#1A3834]/10 rounded-[16px] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" />
              Apto Médico
            </h2>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${aptoStatus.color} uppercase tracking-wide font-display flex items-center gap-1`}>
              {aptoStatus.icon}
              {aptoStatus.label}
            </span>
          </div>

          {user.aptoMedicoStatus === 'vigente' && user.aptoMedicoVencimiento && (
            <div className="p-4 rounded-[12px] bg-[#1A3834]/5 border border-[#1A3834]/10 text-sm text-[#1A3834]/70 mb-4">
              Tu certificado es válido. Vence el <strong className="text-[#1A3834]">{new Date(user.aptoMedicoVencimiento).toLocaleDateString()}</strong>.
              {user.aptoMedicoUrl && <span className="block text-xs mt-1">Archivo: <span className="font-mono">{user.aptoMedicoUrl}</span></span>}
            </div>
          )}

          {user.aptoMedicoStatus === 'pendiente_verificacion' && (
            <div className="p-4 rounded-[12px] bg-blue-500/5 border border-blue-500/15 text-sm text-[#1A3834] mb-4">
              Tu certificado <strong>&quot;{user.aptoMedicoUrl}&quot;</strong> está siendo verificado por la administración.
            </div>
          )}

          {user.aptoMedicoStatus === 'rechazado' && (
            <div className="p-4 rounded-[12px] bg-rose-500/5 border border-rose-500/15 text-sm text-rose-700 mb-4">
              <strong>Rechazado:</strong> {user.aptoMedicoMotivoRechazo || 'El documento no cumple con los requisitos.'}
            </div>
          )}

          {/* Formulario de carga */}
          {(user.aptoMedicoStatus === 'no_entregado' || user.aptoMedicoStatus === 'rechazado') && (
            <form onSubmit={handleUploadCert} className="space-y-3 pt-4 border-t border-[#1A3834]/5">
              <label className="text-[10px] font-bold text-[#1A3834]/60 uppercase tracking-wider block font-display">Cargar apto médico (PDF/Imagen)</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Ej. certificado_medico_2026.jpg"
                  value={certFile}
                  onChange={(e) => { setCertFile(e.target.value); setCertError(''); }}
                  className="flex-grow bg-white border border-[#1A3834]/20 focus:border-[#1A3834] rounded-[4px] px-4 py-2 text-xs text-[#1A3834] placeholder-[#1A3834]/40 outline-none transition-all duration-200 font-sans"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A3834] hover:bg-[#1A3834]/95 text-white font-display text-[12px] font-semibold tracking-[1.68px] uppercase rounded-full shadow-lg transition-all duration-150 cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Enviar
                </button>
              </div>
              {certError && <p className="text-[10px] text-rose-600 font-medium font-sans">{certError}</p>}
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

// Field display component
function FieldRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-[#1A3834]/40 mt-0.5">{icon}</div>
      <div>
        <div className="text-[10px] font-bold text-[#1A3834]/50 uppercase tracking-wider">{label}</div>
        <div className="text-sm text-[#1A3834] font-medium">{value}</div>
      </div>
    </div>
  );
}

// Editable field component
function EditableField({ icon, label, value, onChange }: { icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-[#1A3834]/40 mt-2.5">{icon}</div>
      <div className="flex-grow">
        <label className="text-[10px] font-bold text-[#1A3834]/50 uppercase tracking-wider block mb-1">{label}</label>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-white border border-[#1A3834]/20 focus:border-[#1A3834] rounded-[4px] px-3 py-2 text-sm text-[#1A3834] outline-none transition-all duration-200 font-sans"
        />
      </div>
    </div>
  );
}
