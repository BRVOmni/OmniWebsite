'use client';

import { HONEYPOT_FIELD } from '@/lib/form-guard';

interface HoneypotFieldProps {
  /** Controlled mode (franchise form). Leave both out for uncontrolled forms read via FormData. */
  value?: string;
  onChange?: (value: string) => void;
}

/** Anti-spam honeypot. Off-screen, hidden from assistive tech and the tab order; humans never fill it. */
export function HoneypotField({ value, onChange }: HoneypotFieldProps) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
      <input
        type="text"
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        {...(onChange ? { value: value ?? '', onChange: (e) => onChange(e.target.value) } : { defaultValue: '' })}
      />
    </div>
  );
}
