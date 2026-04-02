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

const REQ = 'Este campo es obligatorio';

const validStep1 = {
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@example.com',
  phone: '+5959912345678',
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

