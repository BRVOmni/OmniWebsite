import { z } from 'zod';

const REQ = 'Este campo es obligatorio';

export const step1Schema = z.object({
  firstName: z.string().min(1, REQ),
  lastName: z.string().min(1, REQ),
  email: z.string().min(1, REQ).email('Ingresá un email válido'),
  phone: z.string().min(1, REQ),
  city: z.string().min(1, REQ),
  country: z.string(),
});

export const step2Schema = z.object({
  preferredBrand: z.string().min(1, 'Seleccioná una marca'),
  hasExperience: z.string().min(1, 'Seleccioná una opción'),
  currentBusiness: z.string(),
  yearsExperience: z.string(),
});

export const step3Schema = z.object({
  investmentRange: z.string().min(1, 'Seleccioná un rango'),
  hasLocation: z.string().min(1, 'Seleccioná una opción'),
  locationCity: z.string(),
  timeline: z.string().min(1, 'Seleccioná una opción'),
});

export const step4Schema = z.object({
  motivation: z.string().min(1, REQ),
  howHeard: z.string().min(1, 'Seleccioná una opción'),
  additionalInfo: z.string(),
});

export const contactSchema = z.object({
  name: z.string().min(1, 'Ingresá tu nombre'),
  email: z.string().min(1, 'Ingresá tu email').email('Ingresá un email válido'),
  company: z.string(),
  message: z.string().min(1, 'Escribí tu mensaje').min(10, 'El mensaje es muy corto'),
});

export type StepErrors = Partial<Record<string, string>>;

export function validateStep(step: number, data: Record<string, string>): StepErrors {
  const schemas = [step1Schema, step2Schema, step3Schema, step4Schema];
  const result = schemas[step].safeParse(data);
  if (result.success) return {};
  const errors: StepErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as string;
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export function validateContact(data: Record<string, string>): StepErrors {
  const result = contactSchema.safeParse(data);
  if (result.success) return {};
  const errors: StepErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as string;
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
