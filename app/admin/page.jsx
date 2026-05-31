'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', display_name: '', is_admin: false });
  const [err, setErr] = useState('');

  async function reload() {
    const d = await api.admin.listUsers();
    setUsers(d.users);
  }
  useEffect(() => { if (user?.is_admin) reload(); }, [user]);

  async function create() {
    setErr('');
    try {
      await api.admin.createUser(form);
      setOpen(false);
      setForm({ username: '', password: '', display_name: '', is_admin: false });
      await reload();
    } catch (e) { setErr(e.message); }
  }
  async function removeUser(u) {
    if (!confirm(t('confirm_delete'))) return;
    await api.admin.deleteUser(u.id);
    await reload();
  }

  if (loading || !user) return null;
  if (!user.is_admin) {
    return (
      <main>
        <Header />
        <div className="mx-auto max-w-2xl px-6 py-20 text-center text-gold-100/90">
          Admin only.
        </div>
      </main>
    );
  }

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/" className="text-sm text-gold-200 hover:text-gold-100">← {t('back')}</Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold-200">{t('admin')}</div>
            <h1 className="mt-2 font-display text-5xl gold-text">{t('users')}</h1>
          </div>
          <button onClick={() => setOpen(true)} className="btn-primary">+ {t('create_user')}</button>
        </div>

        <div className="divider-gold my-8" />

        <ul className="space-y-3">
          {users.map(u => (
            <li key={u.id} className="card card-hover p-5 flex items-center gap-4 flex-wrap">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gold-gradient text-ink-950 font-display">
                {u.username.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-display text-xl text-gold-50">
                  {u.display_name || u.username}
                  {u.id === user.id && <span className="ml-2 text-xs text-gold-200">({t('you')})</span>}
                </div>
                <div className="text-xs text-gold-200">@{u.username}</div>
              </div>
              {u.is_admin && <span className="chip">★ {t('admin')}</span>}
              <div className="text-xs text-gold-200/75">
                {t('member_since')} {new Date(u.created_at).toLocaleDateString()}
              </div>
              {u.id !== user.id && (
                <button onClick={() => removeUser(u)} className="btn-danger text-xs">{t('delete')}</button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('create_user')}
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-ghost">{t('cancel')}</button>
            <button onClick={create} className="btn-primary">{t('save')}</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">{t('username')}</label>
            <input className="input" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })} />
          </div>
          <div>
            <label className="label">{t('password')}</label>
            <input type="password" className="input" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="label">{t('display_name')}</label>
            <input className="input" value={form.display_name}
              onChange={e => setForm({ ...form, display_name: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm text-gold-100">
            <input
              type="checkbox"
              checked={form.is_admin}
              onChange={e => setForm({ ...form, is_admin: e.target.checked })}
              className="h-4 w-4 accent-yellow-500"
            />
            {t('is_admin')}
          </label>
          {err && <div className="text-sm text-red-300">{err}</div>}
        </div>
      </Modal>
    </main>
  );
}
