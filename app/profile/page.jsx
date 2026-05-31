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
            <div>
              <label className="label">{t('password')} ({t('optional')})</label>
              <input
                type="password"
                className="input"
                placeholder={t('leave_blank_password')}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
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
