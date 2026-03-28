'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';

const FORM_ACTION = 'https://formspree.io/f/xpwdjbkg';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const [state, setState] = useState<FormState>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('submitting');

    try {
      const res = await fetch(FORM_ACTION, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(e.currentTarget),
      });

      if (res.ok) {
        setState('success');
      } else {
        setState('error');
      }
    } catch {
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
        <div>
          <label htmlFor="name" className="block text-[10px] tracking-[0.18em] uppercase text-text-hint font-medium mb-2">
            Nombre *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full bg-surface-800 border border-border-medium px-4 py-3 text-sm text-text-primary placeholder:text-text-hint/50 focus:outline-none focus:border-omniprise-500 transition-colors"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-[10px] tracking-[0.18em] uppercase text-text-hint font-medium mb-2">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full bg-surface-800 border border-border-medium px-4 py-3 text-sm text-text-primary placeholder:text-text-hint/50 focus:outline-none focus:border-omniprise-500 transition-colors"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="company" className="block text-[10px] tracking-[0.18em] uppercase text-text-hint font-medium mb-2">
          Empresa
        </label>
        <input
          id="company"
          name="company"
          type="text"
          className="w-full bg-surface-800 border border-border-medium px-4 py-3 text-sm text-text-primary placeholder:text-text-hint/50 focus:outline-none focus:border-omniprise-500 transition-colors"
          placeholder="Nombre de tu empresa (opcional)"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-[10px] tracking-[0.18em] uppercase text-text-hint font-medium mb-2">
          Mensaje *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="w-full bg-surface-800 border border-border-medium px-4 py-3 text-sm text-text-primary placeholder:text-text-hint/50 focus:outline-none focus:border-omniprise-500 transition-colors resize-none"
          placeholder="Contanos cómo podemos trabajar juntos..."
        />
      </div>

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
