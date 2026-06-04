'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, updateAthleteProfile, initializeDB } from '@/lib/db';
import { User, Phone, Heart, FileText, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Onboarding() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [step, setStep] = useState(1);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    talleRemera: 'M',
    contactoEmergenciaName: '',
    contactoEmergenciaPhone: '',
    grupoSanguineo: '0+',
    alergias: '',
    afecciones: '',
    aptoMedicoUrl: '',
  });

  const [aptoFile, setAptoFile] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    initializeDB();
    const user = getCurrentUser();
    if (!user) {
      router.push('/');
      return;
    }
    if (user.onboardingComplete) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      return;
    }
    setCurrentUser(user);
    setFormData(prev => ({
      ...prev,
      name: user.name || '',
      dni: user.dni || '',
      talleRemera: user.talleRemera || 'M',
      contactoEmergenciaName: user.contactoEmergenciaName || '',
      contactoEmergenciaPhone: user.contactoEmergenciaPhone || '',
      grupoSanguineo: user.grupoSanguineo || '0+',
      alergias: user.alergias || '',
      afecciones: user.afecciones || '',
      aptoMedicoUrl: user.aptoMedicoUrl || '',
    }));
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setAptoFile(fileName);
      setFormData(prev => ({ ...prev, aptoMedicoUrl: fileName }));
    }
  };

  const nextStep = () => {
    setError('');
    if (step === 1) {
      if (!formData.name.trim() || !formData.dni.trim()) {
        setError('El nombre y el DNI son campos obligatorios.');
        return;
      }
    } else if (step === 2) {
      if (!formData.contactoEmergenciaName.trim() || !formData.contactoEmergenciaPhone.trim()) {
        setError('El nombre y el teléfono de contacto de emergencia son obligatorios.');
        return;
      }
    }

    if (step < 4) {
      setStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    setError('');
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!currentUser) return;
    
    // Guardar en la DB simulada
    const hasApto = formData.aptoMedicoUrl !== '';
    const updated = updateAthleteProfile(currentUser.email, {
      ...formData,
      onboardingComplete: true,
      aptoMedicoStatus: hasApto ? 'pendiente_verificacion' : 'no_entregado',
    });

    router.push('/dashboard');
  };

  if (!currentUser) return null;

  const stepsInfo = [
    { title: 'Identidad', icon: User },
    { title: 'Emergencia', icon: Phone },
    { title: 'Salud', icon: Heart },
    { title: 'Apto Médico', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#1A3834] text-[#FBFAF4] font-sans antialiased py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="gradient-border-shell w-full max-w-xl shadow-2xl relative">
        <div className="w-full bg-[#FBFAF4] text-[#1A3834] rounded-[16px] p-6 sm:p-8 overflow-hidden">
          {/* STEPPER BAR */}
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            {stepsInfo.map((s, idx) => {
              const StepIcon = s.icon;
              const stepNum = idx + 1;
              const isCompleted = stepNum < step;
              const isActive = stepNum === step;

              return (
                <div key={idx} className="flex flex-col items-center flex-1 relative">
                  {/* Line connector */}
                  {idx > 0 && (
                    <div
                      className={`absolute right-1/2 top-4 w-full h-[2px] -z-10 translate-x-[-16px] transition-all duration-300 ${
                        stepNum <= step ? 'bg-[#FF5A1F]' : 'bg-[#1A3834]/10'
                      }`}
                    ></div>
                  )}
                  
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#1A3834] text-white border-[#1A3834]'
                        : isActive
                        ? 'bg-[#FF5A1F] text-white border-[#FF5A1F] scale-110 shadow-lg shadow-[#FF5A1F]/20'
                        : 'bg-[#1A3834]/5 text-[#1A3834]/40 border-[#1A3834]/10'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-white stroke-[2.5]" /> : stepNum}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs mt-2 font-medium tracking-wide transition-colors duration-300 ${
                      isActive ? 'text-[#1A3834] font-bold' : 'text-[#1A3834]/60'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ERROR SUMMARY */}
          {error && (
            <div className="mb-6 p-4 rounded-[16px] bg-rose-500/5 border border-rose-500/25 text-rose-700 text-sm font-medium font-sans">
              {error}
            </div>
          )}

          {/* STEP CONTENT */}
          <div className="min-h-[220px]">
            {/* STEP 1: IDENTIDAD */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <h2 className="text-2xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide">Completa tus datos personales</h2>
                <p className="text-sm text-[#1A3834]/70 mb-6 font-sans">Estos datos son necesarios para que tu equipo te identifique.</p>
                
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#1A3834]/60 uppercase tracking-[1.68px] font-display">Nombre Completo</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Carlos Corredor"
                      className="w-full bg-white border border-[#1A3834]/20 focus:border-[#1A3834] rounded-[4px] px-4 py-3 text-[#1A3834] placeholder-[#1A3834]/40 text-sm outline-none transition-all duration-200 font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#1A3834]/60 uppercase tracking-[1.68px] font-display">Documento de Identidad (DNI)</label>
                    <input
                      type="text"
                      name="dni"
                      value={formData.dni}
                      onChange={handleChange}
                      placeholder="38.123.456"
                      className="w-full bg-white border border-[#1A3834]/20 focus:border-[#1A3834] rounded-[4px] px-4 py-3 text-[#1A3834] placeholder-[#1A3834]/40 text-sm outline-none transition-all duration-200 font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#1A3834]/60 uppercase tracking-[1.68px] font-display">Talle de Remera Oficial del Club</label>
                    <select
                      name="talleRemera"
                      value={formData.talleRemera}
                      onChange={handleChange}
                      className="w-full bg-white border border-[#1A3834]/20 focus:border-[#1A3834] rounded-[4px] px-4 py-3 text-[#1A3834] text-sm outline-none transition-all duration-200 font-sans"
                    >
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CONTACTO DE EMERGENCIA */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <h2 className="text-2xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide">Contacto de Emergencia</h2>
                <p className="text-sm text-[#1A3834]/70 mb-6 font-sans">A quién llamar en caso de sufrir un incidente en un entrenamiento.</p>
                
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#1A3834]/60 uppercase tracking-[1.68px] font-display">Nombre del Contacto y Vínculo</label>
                    <input
                      type="text"
                      name="contactoEmergenciaName"
                      value={formData.contactoEmergenciaName}
                      onChange={handleChange}
                      placeholder="María Corredor (Madre)"
                      className="w-full bg-white border border-[#1A3834]/20 focus:border-[#1A3834] rounded-[4px] px-4 py-3 text-[#1A3834] placeholder-[#1A3834]/40 text-sm outline-none transition-all duration-200 font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#1A3834]/60 uppercase tracking-[1.68px] font-display">Teléfono Celular de Emergencia</label>
                    <input
                      type="text"
                      name="contactoEmergenciaPhone"
                      value={formData.contactoEmergenciaPhone}
                      onChange={handleChange}
                      placeholder="+54 9 11 9876-5432"
                      className="w-full bg-white border border-[#1A3834]/20 focus:border-[#1A3834] rounded-[4px] px-4 py-3 text-[#1A3834] placeholder-[#1A3834]/40 text-sm outline-none transition-all duration-200 font-sans"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SALUD */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <h2 className="text-2xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide">Ficha Médica de Emergencia</h2>
                <p className="text-sm text-[#1A3834]/70 mb-6 font-sans">Esta información vital estará disponible en tu SOS QR para médicos.</p>
                
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#1A3834]/60 uppercase tracking-[1.68px] font-display">Grupo Sanguíneo</label>
                    <select
                      name="grupoSanguineo"
                      value={formData.grupoSanguineo}
                      onChange={handleChange}
                      className="w-full bg-white border border-[#1A3834]/20 focus:border-[#1A3834] rounded-[4px] px-4 py-3 text-[#1A3834] text-sm outline-none transition-all duration-200 font-sans"
                    >
                      <option value="0+">0+</option>
                      <option value="0-">0-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#1A3834]/60 uppercase tracking-[1.68px] font-display">Alergias o Contraindicaciones (Opcional)</label>
                    <input
                      type="text"
                      name="alergias"
                      value={formData.alergias}
                      onChange={handleChange}
                      placeholder="Ej. Penicilina, mariscos, polen... (o dejar en blanco)"
                      className="w-full bg-white border border-[#1A3834]/20 focus:border-[#1A3834] rounded-[4px] px-4 py-3 text-[#1A3834] placeholder-[#1A3834]/40 text-sm outline-none transition-all duration-200 font-sans"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#1A3834]/60 uppercase tracking-[1.68px] font-display">Afecciones Crónicas o Medicación (Opcional)</label>
                    <textarea
                      name="afecciones"
                      value={formData.afecciones}
                      onChange={handleChange}
                      placeholder="Ej. Asma, toma levotiroxina... (o dejar en blanco)"
                      rows={2}
                      className="w-full bg-white border border-[#1A3834]/20 focus:border-[#1A3834] rounded-[4px] px-4 py-3 text-[#1A3834] placeholder-[#1A3834]/40 text-sm outline-none transition-all duration-200 resize-none font-sans"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: APTO MÉDICO */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <h2 className="text-2xl font-extrabold text-[#1A3834] font-display uppercase tracking-wide">Subir Certificado Médico</h2>
                <p className="text-sm text-[#1A3834]/70 mb-6 font-sans">
                  Para entrenar en montaña con el club, es obligatorio tener cargado un apto físico vigente.
                </p>
                
                <div className="space-y-4 py-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#1A3834]/20 hover:border-[#1A3834]/40 rounded-[16px] p-6 bg-[#1A3834]/5 hover:bg-[#1A3834]/10 transition-all duration-200 relative group">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <FileText className="w-12 h-12 text-[#FF5A1F] mb-3 group-hover:scale-105 transition-transform duration-200" />
                    <div className="text-sm font-bold text-[#1A3834] mb-1 font-sans">
                      {aptoFile ? 'Cambiar archivo seleccionado' : 'Selecciona un archivo PDF o Imagen'}
                    </div>
                    <p className="text-xs text-[#1A3834]/70 text-center font-sans">
                      {aptoFile ? `Seleccionado: ${aptoFile}` : 'Formatos soportados: PDF, JPG, PNG. Tamaño máx: 5MB'}
                    </p>
                  </div>

                  <div className="text-xs text-[#1A3834]/70 leading-relaxed flex items-start gap-2 bg-[#F5F3EB] p-3.5 rounded-[16px] border border-[#1A3834]/10 font-sans">
                    <span className="text-[#FF5A1F] font-bold">Nota:</span>
                    <span>
                      Puedes presionar &quot;Finalizar Registro&quot; sin subir un apto ahora y completarlo más tarde desde tu panel. Sin embargo, no figurarás como habilitado para las salidas grupales.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* WIZARD ACTIONS */}
          <div className="flex items-center justify-between mt-8 sm:mt-12 pt-4 border-t border-[#1A3834]/10">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`px-5 py-2.5 rounded-full text-[12px] font-semibold font-display uppercase tracking-[1.68px] flex items-center gap-2 transition-all duration-150 ${
                step === 1
                  ? 'opacity-0 pointer-events-none'
                  : 'text-[#1A3834] hover:bg-[#1A3834]/5 border border-[#1A3834]/20 cursor-pointer'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </button>

            <button
              onClick={nextStep}
              className="px-6 py-2.5 bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white font-display text-[12px] font-semibold leading-[16px] tracking-[1.68px] uppercase rounded-full shadow-lg shadow-[#FF5A1F]/10 hover:shadow-[#FF5A1F]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer flex items-center gap-2"
            >
              {step === 4 ? 'Finalizar Registro' : 'Continuar'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
