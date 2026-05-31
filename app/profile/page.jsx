'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const { user, loading, checkAuth } = useAuth();
  const { t } = useI18n();
  const [form, setForm] = useState({ username: '', display_name: '', password: '' });
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        display_name: user.display_name || '',
        password: '',
      });
    }
  }, [user]);

  async function saveProfile(e) {
    e.preventDefault();
    setErr('');
    setMsg('');
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await api.updateMe(payload);
      await checkAuth();
      setMsg(t('profile_updated'));
      setForm((f) => ({ ...f, password: '' }));
    } catch (e) {
      setErr(e.message || t('error_generic'));
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) return null;

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="mb-6 font-display text-4xl gold-text">{t('profile')}</h1>

        <div className="card p-8">
          <form onSubmit={saveProfile} className="space-y-6">
            <div>
              <label className="label">{t('username')}</label>
              <input
                className="input"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <label className="label">{t('display_name')} ({t('optional')})</label>
              <input
                className="input"
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              />
            </div>
            <div className="relative">
              <label className="label">{t('password')} ({t('optional')})</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pr-10"
                placeholder={t('leave_blank_password')}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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

            {err && <div className="text-sm text-red-300">⚠ {err}</div>}
            {msg && <div className="text-sm text-gold-200">✓ {msg}</div>}

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full disabled:opacity-50"
              >
                {saving ? '…' : t('update_profile')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
