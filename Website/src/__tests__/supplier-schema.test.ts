import { describe, it, expect } from 'vitest';
import { supplierSchema, validateSupplier } from '../lib/franchise-schema';

const valid = {
  company: 'Distribuidora del Este S.A.',
  ruc: '80012345-6',
  category: 'Carnes y embutidos',
  coverage: 'Gran Asunción',
  contactName: 'María López',
  email: 'maria@distribuidora.com.py',
  phone: '+595981000000',
  message: '',
};

describe('supplierSchema', () => {
  it('accepts a complete supplier proposal', () => {
    expect(supplierSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts an empty optional message', () => {
    expect(supplierSchema.safeParse({ ...valid, message: '' }).success).toBe(true);
  });

  it('rejects a missing company name', () => {
    const result = supplierSchema.safeParse({ ...valid, company: '' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = supplierSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing category with a Spanish message', () => {
    const result = supplierSchema.safeParse({ ...valid, category: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Seleccioná una categoría');
    }
  });
});

describe('validateSupplier', () => {
  it('returns an empty object for valid data', () => {
    expect(validateSupplier(valid)).toEqual({});
  });

  it('returns one Spanish error per invalid field', () => {
    const errors = validateSupplier({ ...valid, ruc: '', email: 'bad', phone: '' });
    expect(errors.ruc).toBe('Este campo es obligatorio');
    expect(errors.email).toBe('Ingresá un email válido');
    expect(errors.phone).toBe('Este campo es obligatorio');
    expect(errors.company).toBeUndefined();
  });
});
