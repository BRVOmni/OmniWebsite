'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { validateSupplier, type StepErrors } from '@/lib/franchise-schema';

const FORM_ACTION = '/api/suppliers';
const CATEGORY_KEYS = ['meat', 'dairy', 'produce', 'dry', 'beverages', 'packaging', 'equipment', 'tech', 'services', 'other'] as const;

type FormState = 'idle' | 'submitting' | 'success' | 'error';

const inputBase =
  'w-full min-w-0 bg-surface-900 border rounded-[10px] px-3.5 py-3 text-[15px] text-text-primary placeholder:text-text-hint/60 focus:outline-none focus:border-omniprise-500 focus:ring-[3px] focus:ring-omniprise-500/[0.18] transition-[border-color,box-shadow]';

function Field({
  label, name, type = 'text', placeholder, required = false, error, rows,
}: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; error?: string; rows?: number }) {
  const cls = `${inputBase} ${error ? 'border-danger-500/60' : 'border-border-medium'}`;
  return (
    <div>
      <label htmlFor={name} className="block text-[10px] tracking-[0.18em] uppercase text-text-hint font-medium mb-2">
        {label} {required && <span className="text-omniprise-500">*</span>}
      </label>
      {rows ? (
        <textarea id={name} name={name} rows={rows} placeholder={placeholder} className={`${cls} resize-none`} aria-invalid={!!error} />
      ) : (
        <input id={name} name={name} type={type} placeholder={placeholder} className={cls} aria-invalid={!!error} />
      )}
      {error && <p className="text-[12px] text-danger-400 mt-1.5">{error}</p>}
    </div>
  );
}

export function SupplierForm() {
  const [state, setState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<StepErrors>({});
  const t = useTranslations('suppliersPage');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const fieldErrors = validateSupplier(data);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setState('submitting');

    try {
      const res = await fetch(FORM_ACTION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setState(res.ok ? 'success' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center text-center py-12">
        <div className="w-12 h-12 rounded-full bg-success-500/15 flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-display font-bold text-lg uppercase tracking-wide text-text-primary mb-2">{t('successTitle')}</p>
        <p className="text-sm text-text-secondary leading-relaxed">{t('successMessage')}</p>
      </motion.div>
    );
  }

  const selectCls = `${inputBase} ${errors.category ? 'border-danger-500/60' : 'border-border-medium'} appearance-none`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label={t('companyLabel')} name="company" placeholder={t('companyPlaceholder')} required error={errors.company} />
        <Field label={t('rucLabel')} name="ruc" placeholder={t('rucPlaceholder')} required error={errors.ruc} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="category" className="block text-[10px] tracking-[0.18em] uppercase text-text-hint font-medium mb-2">
            {t('categoryLabel')} <span className="text-omniprise-500">*</span>
          </label>
          <select id="category" name="category" defaultValue="" className={selectCls} aria-invalid={!!errors.category}>
            <option value="" disabled>{t('categoryPlaceholder')}</option>
            {CATEGORY_KEYS.map((k) => (
              <option key={k} value={t(`category_${k}`)}>{t(`category_${k}`)}</option>
            ))}
          </select>
          {errors.category && <p className="text-[12px] text-danger-400 mt-1.5">{errors.category}</p>}
        </div>
        <Field label={t('coverageLabel')} name="coverage" placeholder={t('coveragePlaceholder')} required error={errors.coverage} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Field label={t('contactLabel')} name="contactName" placeholder={t('contactPlaceholder')} required error={errors.contactName} />
        <Field label={t('emailLabel')} name="email" type="email" placeholder={t('emailPlaceholder')} required error={errors.email} />
        <Field label={t('phoneLabel')} name="phone" type="tel" placeholder={t('phonePlaceholder')} required error={errors.phone} />
      </div>
      <Field label={t('messageLabel')} name="message" placeholder={t('messagePlaceholder')} rows={4} />

      {state === 'error' && <p className="text-sm text-danger-500">{t('error')}</p>}

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="self-start text-[15px] font-medium text-surface-950 bg-omniprise-500 hover:bg-omniprise-400 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3.5 rounded-full tracking-wide transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
      >
        {state === 'submitting' ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
