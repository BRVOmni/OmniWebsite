'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface WorkModalProps {
  open: boolean;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function WorkModal({ open, onClose }: WorkModalProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('workModal');

  // Escape key closes modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap: keep Tab cycling inside the modal
      if (e.key === 'Tab' && boxRef.current) {
        const focusable = boxRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose],
  );

  // Lock body scroll + attach keyboard listeners
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    // Move focus into the modal
    requestAnimationFrame(() => {
      const closeBtn = boxRef.current?.querySelector<HTMLElement>(`button[aria-label="${t('close')}"]`);
      closeBtn?.focus();
    });

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleKeyDown, t]);

  const steps = [
    { num: '01', content: <>{t('step1Prefix')} <strong className="text-text-primary font-medium">{t('step1Bold')}</strong></> },
    { num: '02', content: <>{t('step2')}</> },
    { num: '03', content: <>{t('step3')}</> },
    { num: '04', content: <>{t('step4')}</> },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('ariaLabel')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[999] bg-surface-950/88 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={onClose}
          >
            {/* Box */}
            <motion.div
              ref={boxRef}
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
                aria-label={t('close')}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Eyebrow */}
              <div className="flex items-center gap-3 mb-6">
                <span className="w-6 h-px bg-border-strong" />
                <span className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium">
                  {t('eyebrow')}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-display font-black text-[clamp(28px,4vw,42px)] uppercase tracking-wide leading-none text-text-primary mb-7">
                {t('titleLine1')}<br />{t('titleLine2')}
              </h2>

              {/* Body */}
              <p className="text-[15px] text-text-secondary leading-relaxed mb-9">
                {t('body')}
              </p>

              {/* Email block */}
              <div className="border border-border-medium p-5 mb-8">
                <p className="text-[10px] tracking-[0.18em] uppercase text-text-hint font-medium mb-2">
                  {t('emailLabel')}
                </p>
                <p className="font-display font-bold text-xl tracking-wider text-text-primary">
                  rrhh@omniprise.com.py
                </p>
              </div>

              {/* Steps */}
              <ul className="space-y-0">
                {steps.map((step) => (
                  <li
                    key={step.num}
                    className="text-sm text-text-secondary py-3 border-b border-border-subtle flex gap-4 leading-relaxed"
                  >
                    <span className="font-display font-black text-[11px] tracking-[0.12em] text-text-hint min-w-[18px] pt-0.5">
                      {step.num}
                    </span>
                    <span>{step.content}</span>
                  </li>
                ))}
              </ul>

              {/* Close button */}
              <button
                onClick={onClose}
                className="mt-8 text-sm font-medium text-surface-900 bg-text-primary hover:bg-omniprise-50 px-7 py-3 rounded-full transition-all duration-200 cursor-pointer"
              >
                {t('closeButton')}
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
