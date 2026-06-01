'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import FileUpload from '@/components/FileUpload';
import CloudinaryBanner from '@/components/CloudinaryBanner';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const [years, setYears] = useState([]);
  const [busy, setBusy] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ year: '', note: '', checklist_url: '', checklist_public_id: '', checklist_type: '' });
  const [err, setErr] = useState('');
  const [uploading, setUploading] = useState(false);
  const [serverAwake, setServerAwake] = useState(false);
  const [checkingServer, setCheckingServer] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      let alive = true;
      setCheckingServer(true);
      api.health()
        .then(() => { if (alive) setServerAwake(true); })
        .catch(() => { if (alive) setServerAwake(false); })
        .finally(() => { if (alive) setCheckingServer(false); });
      return () => { alive = false; };
    }
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    api.years.list()
      .then(d => { if (alive) setYears(d.years); })
      .finally(() => { if (alive) setBusy(false); });
    return () => { alive = false; };
  }, [user]);

  async function createYear(e) {
    e.preventDefault();
    setErr('');
    try {
      await api.years.create(form.year, form.note, form.checklist_url, form.checklist_public_id, form.checklist_type);
      const fresh = await api.years.list();
      setYears(fresh.years);
      setOpen(false);
      setForm({ year: '', note: '', checklist_url: '', checklist_public_id: '', checklist_type: '' });
    } catch (e) { setErr(e.message); }
  }

  async function deleteYear(id) {
    if (!confirm(t('confirm_delete'))) return;
    await api.years.remove(id);
    setYears(prev => prev.filter(y => y.id !== id));
  }

  if (loading) return null;

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-2xl space-y-8">
            <h1 className="font-display text-5xl md:text-6xl gold-text">
              {t('app_name')}
            </h1>
            <p className="text-xl text-gold-100">
              {t('app_desc')}
            </p>
            
            <div className="card p-8 inline-block max-w-md w-full text-left mx-auto">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-3 h-3 rounded-full ${checkingServer ? 'bg-gold-400 animate-pulse' : serverAwake ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="font-medium text-gold-50 text-lg">
                  {checkingServer ? t('server_checking') : serverAwake ? t('server_awake') : t('server_asleep')}
                </span>
              </div>
              
              <p className="text-gold-200/80 mb-6 text-sm">
                {!serverAwake && !checkingServer ? t('server_wake_prompt') : t('server_ready')}
              </p>

              <div className="space-y-4">
                <Link href="/login" className="btn-primary w-full block text-center py-3 text-lg font-medium">
                  {t('login')}
                </Link>
                <div className="text-center text-xs text-red-300/80 pt-4 border-t border-gold-400/20">
                  {t('not_my_friend')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold-200">{t('welcome')}</div>
            <h1 className="mt-2 font-display text-5xl gold-text">{user.display_name || user.username}</h1>
            <p className="mt-2 max-w-xl text-gold-100">{t('tagline')}</p>
          </div>
          <button onClick={() => setOpen(true)} className="btn-primary">
            + {t('new_year')}
          </button>
        </section>

        <div className="divider-gold mb-8" />

        <CloudinaryBanner />

        <section>
          <h2 className="mb-6 font-display text-2xl text-gold-100">{t('years')}</h2>
          {busy ? (
            <div className="text-gold-200">…</div>
          ) : years.length === 0 ? (
            <div className="card p-10 text-center text-gold-100/90">
              {t('no_items')}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {years.map(y => (
                <YearCard key={y.id} year={y} onDelete={() => deleteYear(y.id)} />
              ))}
            </div>
          )}
        </section>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('create_year')}
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-ghost" type="button">{t('cancel')}</button>
            <button onClick={createYear} disabled={uploading} className="btn-primary disabled:opacity-50" type="submit">
              {t('save')}
            </button>
          </>
        }
      >
        <form onSubmit={createYear} className="space-y-4">
          <div>
            <label className="label">{t('year_label')}</label>
            <input
              className="input"
              required
              pattern="[0-9]{3,4}"
              placeholder="2569"
              value={form.year}
              onChange={e => setForm({ ...form, year: e.target.value })}
            />
          </div>
          <div>
            <label className="label">{t('note_optional')}</label>
            <input
              className="input"
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
            />
          </div>
          <div>
            <label className="label">{t('checklist')} (PDF) - {t('optional')}</label>
            <div onClick={() => setUploading(true)}>
              <FileUpload
                folder={`years/checklists`}
                onUploaded={(r) => {
                  setUploading(false);
                  setForm({ ...form, checklist_url: r.url, checklist_public_id: r.public_id, checklist_type: r.type });
                }}
              />
            </div>
            {form.checklist_url && (
              <div className="mt-2 text-xs text-gold-200">
                ✓ {t('file_attached')}
              </div>
            )}
          </div>
          {err && <div className="text-sm text-red-300">{err}</div>}
        </form>
      </Modal>
    </main>
  );
}

function YearCard({ year, onDelete }) {
  const { t } = useI18n();
  const total = year.checklist_total ?? 0;
  const done = year.checklist_done ?? 0;
  const hours = year.volunteer_hours ?? 0;
  const checklistPct = total > 0 ? Math.round((done / total) * 100) : 0;
  const hoursPct = Math.min(100, Math.round((hours / 36) * 100));

  return (
    <div className="card card-hover p-6 relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-2xl"
        style={{ background: 'radial-gradient(circle, rgb(var(--gold-400)), transparent 70%)' }}
      />
      <div className="flex items-center justify-between">
        <div className="font-display text-4xl gold-text">{year.year}</div>
        <button onClick={onDelete} className="text-gold-200/75 hover:text-red-300 text-xs">✕</button>
      </div>
      {year.note && (
        <div className="mt-2 text-sm text-gold-100 line-clamp-2">{year.note}</div>
      )}
      <div className="mt-6 space-y-3">
        <Bar label={t('checklist')} pct={checklistPct} right={`${done}/${total}`} />
        <Bar label={t('volunteer')} pct={hoursPct} right={`${hours.toFixed(1)} / 36h`} />
      </div>
      <div className="mt-6 flex gap-2">
        <Link href={`/years/${year.id}`} className="btn-primary flex-1 text-sm">
          {t('open')} →
        </Link>
      </div>
    </div>
  );
}

function Bar({ label, pct, right }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-gold-200">
        <span>{label}</span>
        <span>{right}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink-700">
        <div
          className="h-full rounded-full bg-gold-gradient transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
