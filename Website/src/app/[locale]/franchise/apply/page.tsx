'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { track } from '@vercel/analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Send, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { BRANDS } from '@/lib/brands';
import { useScrollDepth } from '@/lib/use-scroll-depth';
import { validateStep, type StepErrors } from '@/lib/franchise-schema';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  preferredBrand: string;
  hasExperience: string;
  currentBusiness: string;
  yearsExperience: string;
  investmentRange: string;
  hasLocation: string;
  locationCity: string;
  timeline: string;
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

function Step1Personal({ data, onChange, errors, t }: { data: FormData; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; errors: StepErrors; t: ReturnType<typeof useTranslations<'franchiseApply'>> }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-display font-bold text-2xl uppercase tracking-wide text-text-primary mb-2">
        {t('step1Title')}
      </h2>
      <p className="text-[14px] text-text-secondary mb-8">
        {t('step1Subtitle')}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <InputField label={t('firstNameLabel')} name="firstName" value={data.firstName} onChange={onChange} placeholder={t('firstNamePlaceholder')} required error={errors.firstName} />
        <InputField label={t('lastNameLabel')} name="lastName" value={data.lastName} onChange={onChange} placeholder={t('lastNamePlaceholder')} required error={errors.lastName} />
        <InputField label={t('emailLabel')} name="email" type="email" value={data.email} onChange={onChange} placeholder={t('emailPlaceholder')} required error={errors.email} />
        <InputField label={t('phoneLabel')} name="phone" type="tel" value={data.phone} onChange={onChange} placeholder={t('phonePlaceholder')} required error={errors.phone} />
        <InputField label={t('cityLabel')} name="city" value={data.city} onChange={onChange} placeholder={t('cityPlaceholder')} required error={errors.city} />
        <InputField label={t('countryLabel')} name="country" value={data.country} onChange={onChange} placeholder={t('countryPlaceholder')} />
      </div>
    </motion.div>
  );
}

function Step2Brand({ data, onChange, errors, t }: { data: FormData; onChange: (field: string, value: string) => void; errors: StepErrors; t: ReturnType<typeof useTranslations<'franchiseApply'>> }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-display font-bold text-2xl uppercase tracking-wide text-text-primary mb-2">
        {t('step2Title')}
      </h2>
      <p className="text-[14px] text-text-secondary mb-8">
        {t('step2Subtitle')}
      </p>
      <div className="flex flex-col gap-6">
        <RadioGroup
          label={t('preferredBrandLabel')}
          name="preferredBrand"
          options={BRANDS.map(b => b.name)}
          value={data.preferredBrand}
          onChange={(v) => onChange('preferredBrand', v)}
          required
          error={errors.preferredBrand}
        />
        <RadioGroup
          label={t('experienceLabel')}
          name="hasExperience"
          options={[t('experienceYes'), t('experienceNo')]}
          value={data.hasExperience}
          onChange={(v) => onChange('hasExperience', v)}
          required
          error={errors.hasExperience}
        />
        <InputField
          label={t('currentBusinessLabel')}
          name="currentBusiness"
          value={data.currentBusiness}
          onChange={(e) => onChange('currentBusiness', (e.target as HTMLInputElement).value)}
          placeholder={t('currentBusinessPlaceholder')}
        />
        <InputField
          label={t('yearsLabel')}
          name="yearsExperience"
          value={data.yearsExperience}
          onChange={(e) => onChange('yearsExperience', (e.target as HTMLInputElement).value)}
          placeholder={t('yearsPlaceholder')}
        />
      </div>
    </motion.div>
  );
}

function Step3Investment({ data, onChange, errors, t }: { data: FormData; onChange: (field: string, value: string) => void; errors: StepErrors; t: ReturnType<typeof useTranslations<'franchiseApply'>> }) {
  const INVESTMENT_RANGES = [
    t('investment1'),
    t('investment2'),
    t('investment3'),
    t('investment4'),
    t('investment5'),
  ];
  const LOCATIONS = [
    t('location1'),
    t('location2'),
    t('location3'),
    t('location4'),
  ];
  const TIMELINES = [
    t('timeline1'),
    t('timeline2'),
    t('timeline3'),
    t('timeline4'),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-display font-bold text-2xl uppercase tracking-wide text-text-primary mb-2">
        {t('step3Title')}
      </h2>
      <p className="text-[14px] text-text-secondary mb-8">
        {t('step3Subtitle')}
      </p>
      <div className="flex flex-col gap-6">
        <RadioGroup
          label={t('investmentLabel')}
          name="investmentRange"
          options={INVESTMENT_RANGES}
          value={data.investmentRange}
          onChange={(v) => onChange('investmentRange', v)}
          required
          error={errors.investmentRange}
        />
        <RadioGroup
          label={t('locationLabel')}
          name="hasLocation"
          options={LOCATIONS}
          value={data.hasLocation}
          onChange={(v) => onChange('hasLocation', v)}
          required
          error={errors.hasLocation}
        />
        {data.hasLocation && data.hasLocation !== t('location3') && (
          <InputField
            label={t('locationCityLabel')}
            name="locationCity"
            value={data.locationCity}
            onChange={(e) => onChange('locationCity', (e.target as HTMLInputElement).value)}
            placeholder={t('locationCityPlaceholder')}
          />
        )}
        <RadioGroup
          label={t('timelineLabel')}
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

function Step4Motivation({ data, onTextChange, onFieldChange, errors, t }: { data: FormData; onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; onFieldChange: (field: string, value: string) => void; errors: StepErrors; t: ReturnType<typeof useTranslations<'franchiseApply'>> }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-display font-bold text-2xl uppercase tracking-wide text-text-primary mb-2">
        {t('step4Title')}
      </h2>
      <p className="text-[14px] text-text-secondary mb-8">
        {t('step4Subtitle')}
      </p>
      <div className="flex flex-col gap-6">
        <TextArea
          label={t('motivationLabel')}
          name="motivation"
          value={data.motivation}
          onChange={onTextChange}
          placeholder={t('motivationPlaceholder')}
          rows={4}
          required
          error={errors.motivation}
        />
        <RadioGroup
          label={t('howHeardLabel')}
          name="howHeard"
          options={['Instagram', 'Facebook', 'Google', 'Referido', 'Evento', 'Otro']}
          value={data.howHeard}
          onChange={(v) => onFieldChange('howHeard', v)}
          required
          error={errors.howHeard}
        />
        <TextArea
          label={t('additionalLabel')}
          name="additionalInfo"
          value={data.additionalInfo}
          onChange={onTextChange}
          placeholder={t('additionalPlaceholder')}
          rows={3}
        />
      </div>
    </motion.div>
  );
}

function SuccessView({ t }: { t: ReturnType<typeof useTranslations<'franchiseApply'>> }) {
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
        {t('successTitle')}
      </h2>
      <p className="text-base text-text-secondary max-w-md mx-auto leading-relaxed mb-8">
        {t('successMessage')}
      </p>
      <div className="bg-surface-700 border border-border-subtle rounded-xl p-6 max-w-sm mx-auto mb-10">
        <p className="text-[12px] tracking-[0.08em] uppercase text-text-hint mb-2">{t('successNextLabel')}</p>
        <p className="text-[14px] text-text-primary">{t('successNextText')}</p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[15px] font-medium text-text-secondary hover:text-text-primary px-8 py-3 rounded-full border border-border-medium tracking-wide transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('successBackHome')}
      </Link>
    </motion.div>
  );
}

const FRANCHISE_FORM_ACTION = 'https://formspree.io/f/2967703689361358019';

export default function ApplyPage() {
  const searchParams = useSearchParams();
  useScrollDepth('franchise_apply');
  const t = useTranslations('franchiseApply');
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
              {t('backLink')}
            </Link>
            <h1 className="font-display font-black text-[clamp(32px,5vw,48px)] leading-[0.95] uppercase tracking-wide">
              {t('heading1')} <span className="text-omniprise-500">{t('headingHighlight')}</span>
            </h1>
            <p className="text-[14px] text-text-secondary mt-3">
              {t('description')}
            </p>
            <p className="text-[13px] text-text-hint mt-2">
              {t('alsoEmail')}{' '}
              <a href="mailto:franquicias@omniprise.com.py" className="text-text-secondary hover:text-text-primary transition-colors">
                franquicias@omniprise.com.py
              </a>
            </p>
          </div>
        )}

        {submitted ? (
          <SuccessView t={t} />
        ) : (
          <>
            {draftRestored && (
              <div className="flex items-center justify-between bg-omniprise-500/10 border border-omniprise-500/20 rounded-xl px-5 py-3 mb-6">
                <p className="text-[13px] text-omniprise-400">
                  {t('draftRestored')}
                </p>
                <button
                  type="button"
                  onClick={discardDraft}
                  className="text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer ml-4"
                >
                  {t('discardDraft')}
                </button>
              </div>
            )}
            <StepIndicator current={step} total={totalSteps} />

            <div className="bg-surface-900 border border-border-subtle rounded-2xl p-6 md:p-10">
              <AnimatePresence mode="wait">
                {step === 0 && <Step1Personal data={data} onChange={handleInputChange} errors={errors} t={t} />}
                {step === 1 && <Step2Brand data={data} onChange={handleFieldChange} errors={errors} t={t} />}
                {step === 2 && <Step3Investment data={data} onChange={handleFieldChange} errors={errors} t={t} />}
                {step === 3 && (
                  <Step4Motivation data={data} onTextChange={handleTextAreaChange} onFieldChange={handleFieldChange} errors={errors} t={t} />
                )}
              </AnimatePresence>

              {/* Navigation */}
              {submitError && (
                <p className="text-sm text-danger-500 mt-4">
                  {t('submitError')}
                </p>
              )}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-border-subtle">
                <button
                  onClick={goBackStep}
                  disabled={step === 0}
                  className="inline-flex items-center gap-2 text-[14px] text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t('previous')}
                </button>

                {step < totalSteps - 1 ? (
                  <button
                    onClick={advanceStep}
                    disabled={!canProceed()}
                    className="inline-flex items-center gap-2 text-[14px] font-medium text-surface-900 bg-omniprise-500 hover:bg-omniprise-400 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3 rounded-full transition-all duration-200 cursor-pointer"
                  >
                    {t('next')}
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
                        {t('submitting')}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {t('submit')}
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
