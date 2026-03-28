'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface WorkModalProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  { num: '01', text: 'Asunto del correo: Tu nombre completo + cargo al que aplicás' },
  { num: '02', text: 'Adjuntá tu currículum en formato PDF' },
  { num: '03', text: 'Podés incluir una breve presentación en el cuerpo del correo' },
  { num: '04', text: 'Nuestro equipo de RRHH revisará tu perfil y se pondrá en contacto' },
];

export function WorkModal({ open, onClose }: WorkModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[999] bg-surface-950/88 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={onClose}
          >
            {/* Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="bg-surface-700 border border-border-medium max-w-[560px] w-full p-10 md:p-14 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-6 text-text-hint hover:text-text-primary transition-colors p-1 cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-px bg-border-strong" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium">
                  Únete al equipo
                </span>
              </div>

              {/* Title */}
              <h2 className="font-display font-black text-[clamp(28px,4vw,42px)] uppercase tracking-wide leading-none text-text-primary mb-7">
                Trabajemos<br />juntos.
              </h2>

              {/* Body */}
              <p className="text-[15px] text-text-secondary leading-relaxed mb-9">
                ¿Querés ser parte de una plataforma gastronómica en plena expansión? Envianos tu currículum
                actualizado y te contactaremos cuando surja una oportunidad que se ajuste a tu perfil.
              </p>

              {/* Email block */}
              <div className="border border-border-medium p-5 mb-8">
                <p className="text-[10px] tracking-[0.18em] uppercase text-text-hint font-medium mb-2">
                  Enviá tu currículum a
                </p>
                <p className="font-display font-bold text-xl tracking-wider text-text-primary">
                  rrhh@omniprise.com.py
                </p>
              </div>

              {/* Steps */}
              <ul className="space-y-0">
                {STEPS.map((step) => (
                  <li
                    key={step.num}
                    className="text-sm text-text-secondary py-3 border-b border-border-subtle flex gap-4 leading-relaxed"
                  >
                    <span className="font-display font-black text-[11px] tracking-[0.12em] text-text-hint min-w-[18px] pt-0.5">
                      {step.num}
                    </span>
                    <span dangerouslySetInnerHTML={{ __html: step.text.replace(/Tu nombre completo \+ cargo al que aplicás/, '<strong class="text-text-primary font-medium">Tu nombre completo + cargo al que aplicás</strong>') }} />
                  </li>
                ))}
              </ul>

              {/* Close button */}
              <button
                onClick={onClose}
                className="mt-8 text-sm font-medium text-surface-900 bg-text-primary hover:bg-omniprise-50 px-7 py-3 rounded-full transition-all duration-200 cursor-pointer"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
