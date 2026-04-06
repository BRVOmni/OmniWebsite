'use client';

import { useState, useEffect, useCallback } from 'react';
import { track } from '@vercel/analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BRANDS } from '@/lib/brands';
import { useScrollDepth } from '@/lib/use-scroll-depth';
import { validateStep, type StepErrors } from '@/lib/franchise-schema';

interface FormData {
  // Step 1 - Personal
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  // Step 2 - Brand
  preferredBrand: string;
  hasExperience: string;
  currentBusiness: string;
  yearsExperience: string;
  // Step 3 - Investment
  investmentRange: string;
  hasLocation: string;
  locationCity: string;
  timeline: string;
  // Step 4 - Motivation
  motivation: string;
  howHeard: string;
  additionalInfo: string;
}

const INITIAL_DATA: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  city: '',
  country: 'Paraguay',
  preferredBrand: '',
  hasExperience: '',
  currentBusiness: '',
  yearsExperience: '',
  investmentRange: '',
  hasLocation: '',
  locationCity: '',
  timeline: '',
  motivation: '',
  howHeard: '',
  additionalInfo: '',
};

const INVESTMENT_RANGES = [
  'Menos de ₲100M',
  '₲100M - ₲300M',
  '₲300M - ₲500M',
  '₲500M - ₲1.000M',
  'Más de ₲1.000M',
];

const TIMELINES = [
  'Inmediato (0-3 meses)',
  'Corto plazo (3-6 meses)',
  'Mediano plazo (6-12 meses)',
  'Explorando opciones',
];

const DRAFT_KEY = 'omniprise_franchise_draft';
const DRAFT_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

interface Draft {
  data: FormData;
  step: number;
  savedAt: number;
}

function loadDraft(): Draft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft: Draft = JSON.parse(raw);
    if (Date.now() - draft.savedAt > DRAFT_MAX_AGE) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

function saveDraft(data: FormData, step: number) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ data, step, savedAt: Date.now() }));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-display font-bold transition-all duration-300 ${
              i < current
                ? 'bg-omniprise-500 text-surface-900'
                : i === current
                  ? 'bg-omniprise-500/20 text-omniprise-500 border border-omniprise-500/40'
                  : 'bg-surface-700 text-text-hint'
            }`}
          >
            {i < current ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={`w-8 h-px transition-colors duration-300 ${
                i < current ? 'bg-omniprise-500' : 'bg-surface-600'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium tracking-[0.08em] uppercase text-text-secondary mb-2">
        {label} {required && <span className="text-omniprise-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-surface-700 border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-hint focus:outline-none focus:border-omniprise-500/50 focus:ring-1 focus:ring-omniprise-500/20 transition-all ${
          error ? 'border-danger-500/60' : 'border-border-subtle'
        }`}
      />
      {error && <p className="text-[12px] text-danger-400 mt-1.5">{error}</p>}
    </div>
  );
}

function RadioGroup({
  label,
  name: _name,
  options,
  value,
  onChange,
  required = false,
  error,
}: {
  label: string;
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium tracking-[0.08em] uppercase text-text-secondary mb-3">
        {label} {required && <span className="text-omniprise-500">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-lg text-[13px] transition-all duration-200 cursor-pointer ${
              value === opt
                ? 'bg-omniprise-500/20 text-omniprise-400 border border-omniprise-500/40'
                : error
                  ? 'bg-surface-700 text-text-secondary border border-danger-500/30 hover:border-danger-500/50'
                  : 'bg-surface-700 text-text-secondary border border-border-subtle hover:border-border-medium'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {error && <p className="text-[12px] text-danger-400 mt-1.5">{error}</p>}
    </div>
  );
}

function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium tracking-[0.08em] uppercase text-text-secondary mb-2">
        {label} {required && <span className="text-omniprise-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`w-full bg-surface-700 border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-hint focus:outline-none focus:border-omniprise-500/50 focus:ring-1 focus:ring-omniprise-500/20 transition-all resize-none ${
          error ? 'border-danger-500/60' : 'border-border-subtle'
        }`}
      />
      {error && <p className="text-[12px] text-danger-400 mt-1.5">{error}</p>}
    </div>
  );
}

function Step1Personal({ data, onChange, errors }: { data: FormData; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; errors: StepErrors }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-display font-bold text-2xl uppercase tracking-wide text-text-primary mb-2">
        Información Personal
      </h2>
      <p className="text-[14px] text-text-secondary mb-8">
        Cuéntanos sobre ti para que podamos contactarte.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <InputField label="Nombre" name="firstName" value={data.firstName} onChange={onChange} placeholder="Juan" required error={errors.firstName} />
        <InputField label="Apellido" name="lastName" value={data.lastName} onChange={onChange} placeholder="Pérez" required error={errors.lastName} />
        <InputField label="Email" name="email" type="email" value={data.email} onChange={onChange} placeholder="juan@email.com" required error={errors.email} />
        <InputField label="Teléfono" name="phone" type="tel" value={data.phone} onChange={onChange} placeholder="+595 991 123456" required error={errors.phone} />
        <InputField label="Ciudad" name="city" value={data.city} onChange={onChange} placeholder="Asunción" required error={errors.city} />
        <InputField label="País" name="country" value={data.country} onChange={onChange} placeholder="Paraguay" />
      </div>
    </motion.div>
  );
}

function Step2Brand({ data, onChange, errors }: { data: FormData; onChange: (field: string, value: string) => void; errors: StepErrors }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-display font-bold text-2xl uppercase tracking-wide text-text-primary mb-2">
        Tu Marca
      </h2>
      <p className="text-[14px] text-text-secondary mb-8">
        ¿Qué marca te interesa y cuál es tu experiencia?
      </p>
      <div className="flex flex-col gap-6">
        <RadioGroup
          label="Marca preferida"
          name="preferredBrand"
          options={BRANDS.map(b => b.name)}
          value={data.preferredBrand}
          onChange={(v) => onChange('preferredBrand', v)}
          required
          error={errors.preferredBrand}
        />
        <RadioGroup
          label="¿Tienes experiencia en gastronomía?"
          name="hasExperience"
          options={['Sí', 'No']}
          value={data.hasExperience}
          onChange={(v) => onChange('hasExperience', v)}
          required
          error={errors.hasExperience}
        />
        <InputField
          label="Negocio actual (si tienes uno)"
          name="currentBusiness"
          value={data.currentBusiness}
          onChange={(e) => onChange('currentBusiness', (e.target as HTMLInputElement).value)}
          placeholder="Nombre de tu negocio o empresa"
        />
        <InputField
          label="Años de experiencia"
          name="yearsExperience"
          value={data.yearsExperience}
          onChange={(e) => onChange('yearsExperience', (e.target as HTMLInputElement).value)}
          placeholder="Ej: 5 años"
        />
      </div>
    </motion.div>
  );
}

function Step3Investment({ data, onChange, errors }: { data: FormData; onChange: (field: string, value: string) => void; errors: StepErrors }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-display font-bold text-2xl uppercase tracking-wide text-text-primary mb-2">
        Inversión y Ubicación
      </h2>
      <p className="text-[14px] text-text-secondary mb-8">
        Ayúdanos a entender tu capacidad de inversión y planes.
      </p>
      <div className="flex flex-col gap-6">
        <RadioGroup
          label="Rango de inversión"
          name="investmentRange"
          options={INVESTMENT_RANGES}
          value={data.investmentRange}
          onChange={(v) => onChange('investmentRange', v)}
          required
          error={errors.investmentRange}
        />
        <RadioGroup
          label="¿Ya tienes un local o terreno?"
          name="hasLocation"
          options={['Sí, tengo local', 'Sí, tengo terreno', 'No, necesito ayuda', 'No, pero tengo ubicación en mente']}
          value={data.hasLocation}
          onChange={(v) => onChange('hasLocation', v)}
          required
          error={errors.hasLocation}
        />
        {data.hasLocation && data.hasLocation !== 'No, necesito ayuda' && (
          <InputField
            label="Ciudad de la ubicación"
            name="locationCity"
            value={data.locationCity}
            onChange={(e) => onChange('locationCity', (e.target as HTMLInputElement).value)}
            placeholder="Asunción, Ciudad del Este, etc."
          />
        )}
        <RadioGroup
          label="Timeline para apertura"
          name="timeline"
          options={TIMELINES}
          value={data.timeline}
          onChange={(v) => onChange('timeline', v)}
          required
          error={errors.timeline}
        />
      </div>
    </motion.div>
  );
}

function Step4Motivation({ data, onTextChange, onFieldChange, errors }: { data: FormData; onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; onFieldChange: (field: string, value: string) => void; errors: StepErrors }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-display font-bold text-2xl uppercase tracking-wide text-text-primary mb-2">
        Motivación
      </h2>
      <p className="text-[14px] text-text-secondary mb-8">
        Cuéntanos por qué quieres ser parte de Omniprise.
      </p>
      <div className="flex flex-col gap-6">
        <TextArea
          label="¿Por qué te interesa una franquicia Omniprise?"
          name="motivation"
          value={data.motivation}
          onChange={onTextChange}
          placeholder="Cuéntanos tu visión y por qué crees que encajas con nuestro modelo..."
          rows={4}
          required
          error={errors.motivation}
        />
        <RadioGroup
          label="¿Cómo nos conociste?"
          name="howHeard"
          options={['Instagram', 'Facebook', 'Google', 'Referido', 'Evento', 'Otro']}
          value={data.howHeard}
          onChange={(v) => onFieldChange('howHeard', v)}
          required
          error={errors.howHeard}
        />
        <TextArea
          label="Información adicional (opcional)"
          name="additionalInfo"
          value={data.additionalInfo}
          onChange={onTextChange}
          placeholder="Cualquier otro detalle que quieras compartir..."
          rows={3}
        />
      </div>
    </motion.div>
  );
}

function SuccessView() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-16"
    >
      <div className="w-20 h-20 bg-omniprise-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
        <Check className="w-10 h-10 text-omniprise-500" />
      </div>
      <h2 className="font-display font-black text-3xl uppercase tracking-wide text-text-primary mb-4">
        ¡Solicitud Enviada!
      </h2>
      <p className="text-base text-text-secondary max-w-md mx-auto leading-relaxed mb-8">
        Gracias por tu interés en Omniprise. Nuestro equipo revisará tu solicitud y te contactará en las próximas 24 horas hábiles.
      </p>
      <div className="bg-surface-700 border border-border-subtle rounded-xl p-6 max-w-sm mx-auto mb-10">
        <p className="text-[12px] tracking-[0.08em] uppercase text-text-hint mb-2">Próximo paso</p>
        <p className="text-[14px] text-text-primary">Revisaremos tu perfil y te enviaremos opciones de marca y condiciones.</p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[15px] font-medium text-text-secondary hover:text-text-primary px-8 py-3 rounded-full border border-border-medium tracking-wide transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al inicio
      </Link>
    </motion.div>
  );
}

const FRANCHISE_FORM_ACTION = 'https://formspree.io/f/2967703689361358019';

export default function ApplyPage() {
  const searchParams = useSearchParams();
  useScrollDepth('franchise_apply');
  const brandParam = searchParams.get('brand');

  const [draftRestored, setDraftRestored] = useState(false);
  const [step, setStep] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const draft = loadDraft();
    return draft ? draft.step : 0;
  });
  const [data, setData] = useState<FormData>(() => {
    if (typeof window === 'undefined') return { ...INITIAL_DATA, preferredBrand: brandParam || '' };
    const draft = loadDraft();
    if (draft) {
      setDraftRestored(true);
      return { ...draft.data, preferredBrand: brandParam || draft.data.preferredBrand };
    }
    return { ...INITIAL_DATA, preferredBrand: brandParam || '' };
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [errors, setErrors] = useState<StepErrors>({});

  // Auto-save on every change
  useEffect(() => {
    if (!submitted) saveDraft(data, step);
  }, [data, step, submitted]);

  const discardDraft = useCallback(() => {
    clearDraft();
    setData({ ...INITIAL_DATA, preferredBrand: brandParam || '' });
    setStep(0);
    setDraftRestored(false);
    setErrors({});
  }, [brandParam]);

  const totalSteps = 4;

  const advanceStep = () => {
    const stepErrors = validateStep(step, data as unknown as Record<string, string>);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    const nextStep = step + 1;
    track('franchise_form_step', { step: nextStep + 1, from: step + 1 });
    setStep(nextStep);
  };

  const goBackStep = () => {
    setErrors({});
    track('franchise_form_back', { step: step + 1, to: step });
    setStep((s) => s - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => { const next = { ...prev }; delete next[e.target.name]; return next; });
  };

  const handleFieldChange = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => { const next = { ...prev }; delete next[e.target.name]; return next; });
  };

  const canProceed = () => {
    const stepErrors = validateStep(step, data as unknown as Record<string, string>);
    return Object.keys(stepErrors).length === 0;
  };

  const handleSubmit = async () => {
    const stepErrors = validateStep(step, data as unknown as Record<string, string>);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setSubmitting(true);
    setSubmitError(false);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const res = await fetch(FRANCHISE_FORM_ACTION, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });

      if (res.ok) {
        track('franchise_form_submitted', { status: 'success', brand: data.preferredBrand || 'none' });
        clearDraft();
        setSubmitted(true);
      } else {
        track('franchise_form_submitted', { status: 'error', brand: data.preferredBrand || 'none' });
        setSubmitError(true);
      }
    } catch {
      track('franchise_form_submitted', { status: 'error', brand: data.preferredBrand || 'none' });
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-surface-800 pt-24 pb-16 px-6 md:px-12">
      <div className="max-w-[680px] mx-auto">
        {/* Header */}
        {!submitted && (
          <div className="mb-8">
            <Link
              href="/franchise"
              className="inline-flex items-center gap-2 text-[13px] text-text-secondary hover:text-text-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Franquicias
            </Link>
            <h1 className="font-display font-black text-[clamp(32px,5vw,48px)] leading-[0.95] uppercase tracking-wide">
              Solicitud de <span className="text-omniprise-500">Franquicia</span>
            </h1>
            <p className="text-[14px] text-text-secondary mt-3">
              Completa el formulario en 4 pasos. Toma menos de 5 minutos.
            </p>
            <p className="text-[13px] text-text-hint mt-2">
              También podés escribirnos directamente a{' '}
              <a href="mailto:franquicias@omniprise.com.py" className="text-text-secondary hover:text-text-primary transition-colors">
                franquicias@omniprise.com.py
              </a>
            </p>
          </div>
        )}

        {submitted ? (
          <SuccessView />
        ) : (
          <>
            {draftRestored && (
              <div className="flex items-center justify-between bg-omniprise-500/10 border border-omniprise-500/20 rounded-xl px-5 py-3 mb-6">
                <p className="text-[13px] text-omniprise-400">
                  Borrador recuperado — tus datos fueron guardados automáticamente.
                </p>
                <button
                  type="button"
                  onClick={discardDraft}
                  className="text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer ml-4"
                >
                  Descartar
                </button>
              </div>
            )}
            <StepIndicator current={step} total={totalSteps} />

            <div className="bg-surface-900 border border-border-subtle rounded-2xl p-6 md:p-10">
              <AnimatePresence mode="wait">
                {step === 0 && <Step1Personal data={data} onChange={handleInputChange} errors={errors} />}
                {step === 1 && <Step2Brand data={data} onChange={handleFieldChange} errors={errors} />}
                {step === 2 && <Step3Investment data={data} onChange={handleFieldChange} errors={errors} />}
                {step === 3 && (
                  <Step4Motivation data={data} onTextChange={handleTextAreaChange} onFieldChange={handleFieldChange} errors={errors} />
                )}
              </AnimatePresence>

              {/* Navigation */}
              {submitError && (
                <p className="text-sm text-danger-500 mt-4">
                  Hubo un error al enviar. Intentá de nuevo o escribinos a{' '}
                  <a href="mailto:franquicias@omniprise.com.py" className="underline">franquicias@omniprise.com.py</a>
                </p>
              )}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-border-subtle">
                <button
                  onClick={goBackStep}
                  disabled={step === 0}
                  className="inline-flex items-center gap-2 text-[14px] text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </button>

                {step < totalSteps - 1 ? (
                  <button
                    onClick={advanceStep}
                    disabled={!canProceed()}
                    className="inline-flex items-center gap-2 text-[14px] font-medium text-surface-900 bg-omniprise-500 hover:bg-omniprise-400 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3 rounded-full transition-all duration-200 cursor-pointer"
                  >
                    Siguiente
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed() || submitting}
                    className="inline-flex items-center gap-2 text-[14px] font-medium text-surface-900 bg-omniprise-500 hover:bg-omniprise-400 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3 rounded-full transition-all duration-200 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar Solicitud
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
