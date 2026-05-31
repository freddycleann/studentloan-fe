'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

export default function LoginPage() {
  const { login, loading, user } = useAuth();
  const { t, lang, setLang } = useI18n();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading || user) return null;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await login(username, password);
    } catch (e) {
      setErr(e.message || t('error_generic'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-6 py-12 relative">
      <div className="absolute top-6 right-6">
        <div className="flex items-center gap-1 rounded-full border border-gold-400/40 bg-ink-800/90 p-1">
          <button
            onClick={() => setLang('en')}
            className={`rounded-full px-3 py-1 text-xs uppercase tracking-widest ${
              lang === 'en' ? 'bg-gold-gradient text-ink-950' : 'text-gold-100'
            }`}
          >EN</button>
          <button
            onClick={() => setLang('th')}
            className={`rounded-full px-3 py-1 text-xs tracking-widest ${
              lang === 'th' ? 'bg-gold-gradient text-ink-950' : 'text-gold-100'
            }`}
          >ไทย</button>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold-gradient text-ink-950 font-display text-2xl shadow-gold-strong">
            ✦
          </div>
          <h1 className="mt-5 font-display text-4xl gold-text">{t('app_name')}</h1>
          <p className="mt-2 text-sm text-gold-100/90">{t('tagline')}</p>
        </div>

        <form onSubmit={submit} className="card mt-8 p-7 space-y-5">
          <div>
            <label className="label">{t('username')}</label>
            <input
              autoFocus
              className="input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="label">{t('password')}</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {err && <div className="text-sm text-red-300">{err}</div>}
          <button
            type="submit"
            disabled={busy}
            className="btn-primary w-full text-base disabled:opacity-50"
          >
            {busy ? '…' : t('sign_in')}
          </button>
          <p className="text-center text-[11px] uppercase tracking-[0.25em] text-gold-200/85">
            {t('sign_in_only')}
          </p>
        </form>
      </div>
    </main>
  );
}
