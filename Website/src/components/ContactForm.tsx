'use client';

import { useState, type FormEvent } from 'react';
import { track } from '@vercel/analytics';
import { motion } from 'framer-motion';
import { validateContact, type StepErrors } from '@/lib/franchise-schema';

const FORM_ACTION = 'https://formspree.io/f/2967699696509779106';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

function Field({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  error,
  rows,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  rows?: number;
}) {
  const inputClass = `w-full bg-surface-800 border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-hint/50 focus:outline-none focus:border-omniprise-500/50 focus:ring-1 focus:ring-omniprise-500/20 transition-all ${
    error ? 'border-danger-500/60' : 'border-border-medium'
  }`;

  return (
    <div>
      <label htmlFor={name} className="block text-[10px] tracking-[0.18em] uppercase text-text-hint font-medium mb-2">
        {label} {required && <span className="text-omniprise-500">*</span>}
      </label>
      {rows ? (
        <textarea
          id={name}
          name={name}
          placeholder={placeholder}
          rows={rows}
          className={`${inputClass} resize-none`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
      {error && <p className="text-[12px] text-danger-400 mt-1.5">{error}</p>}
    </div>
  );
}

export function ContactForm() {
  const [state, setState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<StepErrors>({});

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    const fieldErrors = validateContact(data);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setState('submitting');

    try {
      const res = await fetch(FORM_ACTION, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });

      if (res.ok) {
        track('contact_form_submitted', { status: 'success' });
        setState('success');
      } else {
        track('contact_form_submitted', { status: 'error' });
        setState('error');
      }
    } catch {
      track('contact_form_submitted', { status: 'error' });
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center text-center py-12"
      >
        <div className="w-12 h-12 rounded-full bg-success-500/15 flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-display font-bold text-lg uppercase tracking-wide text-text-primary mb-2">
          Mensaje enviado
        </p>
        <p className="text-sm text-text-secondary leading-relaxed">
          Nos pondremos en contacto a la brevedad.
        </p>
        <button
          onClick={() => setState('idle')}
          className="mt-6 text-sm text-text-hint hover:text-text-primary transition-colors cursor-pointer"
        >
          Enviar otro mensaje
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Nombre" name="name" placeholder="Tu nombre" required error={errors.name} />
        <Field label="Email" name="email" type="email" placeholder="tu@email.com" required error={errors.email} />
      </div>

      <Field label="Empresa" name="company" placeholder="Nombre de tu empresa (opcional)" />

      <Field label="Mensaje" name="message" placeholder="Contanos cómo podemos trabajar juntos..." required rows={4} error={errors.message} />

      {state === 'error' && (
        <p className="text-sm text-danger-500">
          Hubo un error al enviar. Intentá de nuevo o escribinos a info@omniprise.com.py
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="self-start text-[15px] font-medium text-surface-900 bg-omniprise-500 hover:bg-omniprise-400 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3.5 rounded-full tracking-wide transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
      >
        {state === 'submitting' ? 'Enviando...' : 'Enviar mensaje'}
      </button>
    </form>
  );
}
