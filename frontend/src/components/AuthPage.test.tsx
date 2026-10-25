import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AuthPage from './AuthPage';

describe('<AuthPage />', () => {
  it('submits login credentials', async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined);
    render(<AuthPage onLogin={onLogin} onRegister={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/e-?mail/i), 'ada@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Passw0rd!');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(onLogin).toHaveBeenCalledWith('ada@example.com', 'Passw0rd!');
  });

  it('switches to the registration form and submits name, e-mail and password', async () => {
    const onRegister = vi.fn().mockResolvedValue(undefined);
    render(<AuthPage onLogin={vi.fn()} onRegister={onRegister} />);
    await userEvent.click(screen.getByRole('tab', { name: /register/i }));
    await userEvent.type(screen.getByLabelText(/name/i), 'Ada');
    await userEvent.type(screen.getByLabelText(/e-?mail/i), 'ada@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'Passw0rd!');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(onRegister).toHaveBeenCalledWith('Ada', 'ada@example.com', 'Passw0rd!');
  });

  it('shows the server error message when login fails', async () => {
    const onLogin = vi.fn().mockRejectedValue(new Error('Invalid e-mail or password'));
    render(<AuthPage onLogin={onLogin} onRegister={vi.fn()} />);
    await userEvent.type(screen.getByLabelText(/e-?mail/i), 'a@b.co');
    await userEvent.type(screen.getByLabelText(/password/i), 'xxxxxxxx');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Invalid e-mail or password'));
  });
});
