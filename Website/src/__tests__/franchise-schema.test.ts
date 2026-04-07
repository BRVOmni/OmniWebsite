import { describe, it, expect } from 'vitest';
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  contactSchema,
  validateStep,
  validateContact,
} from '../lib/franchise-schema';

const validStep1 = {
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@example.com',
  phone: '+595991234567',
  city: 'Asunción',
  country: 'Paraguay',
};

const validStep2 = {
  preferredBrand: 'ufo',
  hasExperience: 'yes',
  currentBusiness: 'Restaurant',
  yearsExperience: '5',
};

const validStep3 = {
  investmentRange: '$50k-$100k',
  hasLocation: 'yes',
  locationCity: 'Asunción',
  timeline: '1-3 months',
};

const validStep4 = {
  motivation: 'I want to grow with Omniprise',
  howHeard: 'Instagram',
  additionalInfo: 'I have restaurant experience',
};

const validContact = {
  name: 'María',
  email: 'maria@example.com',
  company: 'Omniprise',
  message: 'I would like to discuss a partnership opportunity',
};

// --- Step 1: Personal Info ---

describe('step1Schema', () => {
  it('accepts valid personal info', () => {
    expect(step1Schema.safeParse(validStep1).success).toBe(true);
  });

  it('requires firstName', () => {
    const result = step1Schema.safeParse({ ...validStep1, firstName: '' });
    expect(result.success).toBe(false);
  });

  it('requires lastName', () => {
    const result = step1Schema.safeParse({ ...validStep1, lastName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = step1Schema.safeParse({ ...validStep1, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('requires phone', () => {
    const result = step1Schema.safeParse({ ...validStep1, phone: '' });
    expect(result.success).toBe(false);
  });

  it('requires city', () => {
    const result = step1Schema.safeParse({ ...validStep1, city: '' });
    expect(result.success).toBe(false);
  });
});

// --- Step 2: Brand & Experience ---

describe('step2Schema', () => {
  it('accepts valid brand selection', () => {
    expect(step2Schema.safeParse(validStep2).success).toBe(true);
  });

  it('requires preferredBrand', () => {
    const result = step2Schema.safeParse({ ...validStep2, preferredBrand: '' });
    expect(result.success).toBe(false);
  });

  it('requires hasExperience', () => {
    const result = step2Schema.safeParse({ ...validStep2, hasExperience: '' });
    expect(result.success).toBe(false);
  });
});

// --- Step 3: Investment & Location ---

describe('step3Schema', () => {
  it('accepts valid investment info', () => {
    expect(step3Schema.safeParse(validStep3).success).toBe(true);
  });

  it('requires investmentRange', () => {
    const result = step3Schema.safeParse({ ...validStep3, investmentRange: '' });
    expect(result.success).toBe(false);
  });

  it('requires hasLocation', () => {
    const result = step3Schema.safeParse({ ...validStep3, hasLocation: '' });
    expect(result.success).toBe(false);
  });

  it('requires timeline', () => {
    const result = step3Schema.safeParse({ ...validStep3, timeline: '' });
    expect(result.success).toBe(false);
  });
});

// --- Step 4: Motivation ---

describe('step4Schema', () => {
  it('accepts valid motivation', () => {
    expect(step4Schema.safeParse(validStep4).success).toBe(true);
  });

  it('requires motivation', () => {
    const result = step4Schema.safeParse({ ...validStep4, motivation: '' });
    expect(result.success).toBe(false);
  });

  it('requires howHeard', () => {
    const result = step4Schema.safeParse({ ...validStep4, howHeard: '' });
    expect(result.success).toBe(false);
  });
});

// --- Contact Form ---

describe('contactSchema', () => {
  it('accepts valid contact', () => {
    expect(contactSchema.safeParse(validContact).success).toBe(true);
  });

  it('requires name', () => {
    const result = contactSchema.safeParse({ ...validContact, name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = contactSchema.safeParse({ ...validContact, email: 'bad' });
    expect(result.success).toBe(false);
  });

  it('rejects short message', () => {
    const result = contactSchema.safeParse({ ...validContact, message: 'hi' });
    expect(result.success).toBe(false);
  });
});

// --- validateStep helper ---

describe('validateStep', () => {
  it('returns empty errors for valid step 0', () => {
    expect(validateStep(0, validStep1)).toEqual({});
  });

  it('returns error map for invalid step 0', () => {
    const errors = validateStep(0, { ...validStep1, email: 'bad' });
    expect(errors.email).toBe('Ingresá un email válido');
  });

  it('returns empty errors for valid step 1', () => {
    expect(validateStep(1, validStep2)).toEqual({});
  });

  it('returns error map for invalid step 1', () => {
    const errors = validateStep(1, { ...validStep2, preferredBrand: '' });
    expect(errors.preferredBrand).toBe('Seleccioná una marca');
  });

  it('returns empty errors for valid step 2', () => {
    expect(validateStep(2, validStep3)).toEqual({});
  });

  it('returns empty errors for valid step 3', () => {
    expect(validateStep(3, validStep4)).toEqual({});
  });
});

// --- validateContact helper ---

describe('validateContact', () => {
  it('returns empty errors for valid contact', () => {
    expect(validateContact(validContact)).toEqual({});
  });

  it('returns error map for invalid contact', () => {
    const errors = validateContact({ ...validContact, name: '', message: 'short' });
    expect(errors.name).toBe('Ingresá tu nombre');
    expect(errors.message).toBe('El mensaje es muy corto');
  });
});
