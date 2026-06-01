'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import ThemeSwitcher from '@/components/ThemeSwitcher';

import Link from 'next/link';

export default function LoginPage() {
  const { login, loading, user } = useAuth();
  const { t, lang, setLang } = useI18n();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <Link href="/" className="absolute top-6 left-6 text-sm text-gold-200 hover:text-gold-100 flex items-center gap-2 z-50">
        ← {t('back')}
      </Link>
      
      <div className="absolute top-6 right-6 flex items-center gap-2 z-50">
        <ThemeSwitcher />
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
          <div className="relative">
            <label className="label">{t('password')}</label>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input pr-10"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-gold-200/70 hover:text-gold-100 transition-colors"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
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
