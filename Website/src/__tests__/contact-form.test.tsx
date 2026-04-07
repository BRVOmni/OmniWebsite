import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '@/components/ContactForm';

describe('ContactForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all fields', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/nameLabel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/emailLabel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/companyLabel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/messageLabel/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<ContactForm />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByText('Ingresá tu nombre')).toBeInTheDocument();
    expect(screen.getByText('Ingresá tu email')).toBeInTheDocument();
    expect(screen.getByText('Escribí tu mensaje')).toBeInTheDocument();
  });

  it('shows success state on successful submit', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true } as Response);

    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/nameLabel/i), 'María');
    await user.type(screen.getByLabelText(/emailLabel/i), 'maria@example.com');
    await user.type(screen.getByLabelText(/messageLabel/i), 'I would like to discuss a partnership opportunity');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText('successTitle')).toBeInTheDocument();
    });
  });

  it('shows error state on failed fetch', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false } as Response);

    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/nameLabel/i), 'María');
    await user.type(screen.getByLabelText(/emailLabel/i), 'maria@example.com');
    await user.type(screen.getByLabelText(/messageLabel/i), 'I would like to discuss a partnership opportunity');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText('error')).toBeInTheDocument();
    });
  });

  it('disables submit button during submission', async () => {
    // Use a promise we control to avoid long waits
    let resolveFetch!: (value: unknown) => void;
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise((resolve) => { resolveFetch = resolve; }),
    );

    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/nameLabel/i), 'María');
    await user.type(screen.getByLabelText(/emailLabel/i), 'maria@example.com');
    await user.type(screen.getByLabelText(/messageLabel/i), 'I would like to discuss a partnership opportunity');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // Button should be disabled while fetch is pending
    expect(screen.getByRole('button')).toBeDisabled();

    // Resolve fetch to clean up
    resolveFetch({ ok: true });
  });
});
