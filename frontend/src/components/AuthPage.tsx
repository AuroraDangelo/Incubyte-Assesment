import { useState } from 'react';
import type { FormEvent } from 'react';

interface Props {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string) => Promise<void>;
}

type Mode = 'login' | 'register';

export default function AuthPage({ onLogin, onRegister }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (m: Mode) => { setMode(m); setError(null); };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') await onLogin(email, password);
      else await onRegister(name, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="relative flex flex-col justify-between overflow-hidden bg-racing-dark p-8 text-paper sm:p-12">
        <p className="font-display text-lg font-extrabold tracking-tight" style={{ fontStretch: '125%' }}>Bharat Motors</p>
        <div className="my-16 max-w-xl">
          <h1 className="text-4xl font-black leading-[1.05] sm:text-6xl">Every car on the lot, accounted for.</h1>
          <p className="mt-6 max-w-md text-lg text-paper/75">
            Live stock, one-click purchases and a back office that keeps counts honest.
          </p>
        </div>
        {/* Road-marking stripe: a nod to the forecourt, purely decorative */}
        <div aria-hidden className="h-1.5 w-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#F4C430 0 40px,transparent 40px 72px)' }} />
      </section>

      <section className="flex items-center justify-center bg-concrete p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div role="tablist" aria-label="Account" className="mb-8 grid grid-cols-2 rounded-lg bg-asphalt/10 p-1">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                role="tab"
                type="button"
                aria-selected={mode === m}
                onClick={() => switchMode(m)}
                className={`rounded-md py-2 text-sm font-semibold transition-colors ${mode === m ? 'bg-paper shadow-sm' : 'text-asphalt/60 hover:text-asphalt'}`}
              >
                {m === 'login' ? 'Log in' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4" noValidate>
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium">Name</label>
                <input id="name" className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">E-mail</label>
              <input id="email" type="email" className="field" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
              <input
                id="password"
                type="password"
                className="field"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {mode === 'register' && <p className="mt-1 text-xs text-asphalt/60">At least 8 characters.</p>}
            </div>

            {error && (
              <p role="alert" className="rounded-md border border-brake/30 bg-brake/10 px-3 py-2 text-sm text-brake">{error}</p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
