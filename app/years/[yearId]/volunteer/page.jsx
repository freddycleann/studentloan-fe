'use client';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import FileUpload from '@/components/FileUpload';
import ProgressRing from '@/components/ProgressRing';
import CloudinaryBanner from '@/components/CloudinaryBanner';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';

const PdfViewer = dynamic(() => import('@/components/PdfViewer'), { ssr: false });

const GOAL = 36;
const DAILY_CAP = 8;

export default function VolunteerPage({ params }) {
  const { yearId } = params;
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const [year, setYear] = useState(null);
  const [entries, setEntries] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [viewMode, setViewMode] = useState('folder');
  const [expanded, setExpanded] = useState({});
  const [form, setForm] = useState(emptyForm());
  const [warn, setWarn] = useState('');
  const [saveErr, setSaveErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [merging, setMerging] = useState(false);

  function emptyForm() {
    return {
      entry_date: today(),
      hours: '1',
      kind: 'elearning',
      title: '',
      notes: '',
      cert_url: '',
      cert_public_id: '',
      cert_type: '',
    };
  }

  async function reload() {
    const [y, list] = await Promise.all([api.years.get(yearId), api.volunteer.list(yearId)]);
    setYear(y.year);
    setEntries(list.entries);
  }
  useEffect(() => { if (user) reload(); }, [user, yearId]);

  const totals = useMemo(() => {
    const total = entries.reduce((s, e) => s + e.hours, 0);
    const el = entries.filter(e => e.kind === 'elearning').reduce((s, e) => s + e.hours, 0);
    const rw = entries.filter(e => e.kind === 'realworld').reduce((s, e) => s + e.hours, 0);
    const byDate = {};
    for (const e of entries) byDate[e.entry_date] = (byDate[e.entry_date] || 0) + e.hours;
    return { total, el, rw, byDate };
  }, [entries]);

  const groupedEntries = useMemo(() => {
    const groups = {};
    for (const e of entries) {
      if (!groups[e.entry_date]) groups[e.entry_date] = [];
      groups[e.entry_date].push(e);
    }
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [entries]);

  const toggleFolder = (date) => setExpanded(prev => ({ ...prev, [date]: !prev[date] }));

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setWarn('');
    setOpen(true);
  }
  function openEdit(entry) {
    setEditing(entry);
    setForm({
      entry_date: entry.entry_date,
      hours: String(entry.hours),
      kind: entry.kind,
      title: entry.title,
      notes: entry.notes || '',
      cert_url: entry.cert_url || '',
      cert_public_id: entry.cert_public_id || '',
      cert_type: entry.cert_type || '',
    });
    setWarn('');
    setOpen(true);
  }

  // live daily cap check
  useEffect(() => {
    if (!open) return;
    const h = Number(form.hours) || 0;
    const existing = entries
      .filter(e => e.entry_date === form.entry_date && e.id !== editing?.id)
      .reduce((s, e) => s + e.hours, 0);
    setWarn(existing + h > DAILY_CAP ? t('day_exceeds') : '');
  }, [form.hours, form.entry_date, open, entries, editing, t]);

  async function save() {
    setSaveErr('');
    if (!form.title.trim()) { setSaveErr(t('title_required')); return; }

    if (form.kind === 'elearning') {
      const currentCode = form.cert_url ? extractCertCode(form.cert_url) : null;
      const currentTitle = form.title.trim().toLowerCase();
      
      const isDuplicate = entries.some(e => {
        if (e.id === editing?.id || e.kind !== 'elearning') return false;
        
        const eCode = e.cert_url ? extractCertCode(e.cert_url) : null;
        if (currentCode && eCode && currentCode.toLowerCase() === eCode.toLowerCase()) return true;
        if (e.title.trim().toLowerCase() === currentTitle) return true;
        
        return false;
      });

      if (isDuplicate) {
        setSaveErr(t('duplicate_cert'));
        return;
      }
    }

    const h = Number(form.hours);
    if (!Number.isFinite(h) || h <= 0) { setSaveErr(t('hours_required')); return; }
    const payload = { ...form, title: form.title.trim(), hours: h };
    setSaving(true);
    try {
      if (editing) await api.volunteer.update(editing.id, payload);
      else await api.volunteer.create(yearId, payload);
      setOpen(false);
      await reload();
    } catch (e) {
      setSaveErr(e.message || t('error_generic'));
    } finally {
      setSaving(false);
    }
  }
  async function removeEntry(entry) {
    if (!confirm(t('confirm_delete'))) return;
    await api.volunteer.remove(entry.id);
    await reload();
  }

  async function downloadMergedPdfs() {
    setMerging(true);
    try {
      const blob = await api.volunteer.mergeAndDownload(yearId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificates_${year?.year || yearId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message);
    } finally {
      setMerging(false);
    }
  }

  if (loading || !user) return null;

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link href={`/years/${yearId}`} className="text-sm text-gold-200 hover:text-gold-100">
          ← {t('back')}
        </Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold-200">{t('volunteer')}</div>
            <h1 className="mt-2 font-display text-5xl gold-text">{year?.year}</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={downloadMergedPdfs} 
              disabled={merging || !entries.some(e => e.cert_url)} 
              className="btn-ghost disabled:opacity-50"
            >
              {merging ? t('merging') : t('merge_pdfs')}
            </button>
            <button onClick={openCreate} className="btn-primary">+ {t('add_entry')}</button>
          </div>
        </div>

        <div className="divider-gold my-8" />

        <CloudinaryBanner />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card p-7 lg:col-span-1 flex flex-col items-center gap-4">
            <ProgressRing
              value={totals.total}
              max={GOAL}
              label={`${totals.total.toFixed(1)}h`}
              sublabel={`/ ${GOAL}h ${t('goal')}`}
              size={200}
            />
            <div className="w-full space-y-2 text-sm">
              <Row label={t('type_elearning_short')} value={`${totals.el.toFixed(1)}h`} />
              <Row label={t('type_realworld_short')} value={`${totals.rw.toFixed(1)}h`} />
              <Row label={t('daily_cap')} value={`${DAILY_CAP}h`} />
            </div>
          </div>

          <div className="card p-7 lg:col-span-2">
            <div className="flex flex-wrap gap-4 justify-between items-end mb-4">
              <div className="font-display text-2xl text-gold-100">{t('history')}</div>
              <div className="flex bg-ink-800/80 rounded-xl p-1 border border-gold-400/20">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-1.5 text-sm rounded-lg font-medium transition ${
                    viewMode === 'list' ? 'bg-ink-700 text-gold-50 shadow' : 'text-gold-200/60 hover:text-gold-200'
                  }`}
                >
                  {t('list_view')}
                </button>
                <button
                  onClick={() => setViewMode('folder')}
                  className={`px-4 py-1.5 text-sm rounded-lg font-medium transition ${
                    viewMode === 'folder' ? 'bg-ink-700 text-gold-50 shadow' : 'text-gold-200/60 hover:text-gold-200'
                  }`}
                >
                  {t('folder_view')}
                </button>
              </div>
            </div>
            
            {entries.length === 0 ? (
              <div className="mt-6 text-gold-100/90 text-lg">{t('no_entries')}</div>
            ) : viewMode === 'list' ? (
              <ul className="divide-y divide-gold-400/25">
                {entries.map(e => (
                  <li key={e.id} className="py-4 flex items-center gap-4 flex-wrap">
                    <span className="font-mono text-sm text-gold-200 w-28">{e.entry_date}</span>
                    <span className={`chip ${e.kind === 'elearning' ? '' : 'border-gold-300/60'}`}>
                      {e.kind === 'elearning' ? t('type_elearning_short') : t('type_realworld_short')}
                    </span>
                    <span className="flex-1 min-w-0 truncate text-gold-50 text-base">{e.title}</span>
                    <span className="font-display text-2xl gold-text">{e.hours}h</span>
                    {e.cert_url && (
                      <button onClick={() => setViewing(e)} className="chip hover:border-gold-400/60 p-2" title={t('view_cert')}>
                        <svg className="w-4 h-4 text-gold-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </button>
                    )}
                    <button onClick={() => openEdit(e)} className="btn-ghost px-3 py-1 text-sm">{t('edit')}</button>
                    <button onClick={() => removeEntry(e)} className="btn-danger px-3 py-1 text-sm">{t('delete')}</button>
                    {totals.byDate[e.entry_date] > DAILY_CAP && (
                      <span className="w-full text-sm text-red-300/80 mt-1">⚠ {t('day_exceeds')} ({totals.byDate[e.entry_date]}h)</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-4">
                {groupedEntries.map(([date, dayEntries]) => {
                  const isExpanded = expanded[date] !== false; // default true
                  const dayTotal = totals.byDate[date];
                  const exceed = dayTotal > DAILY_CAP;
                  return (
                    <div key={date} className="rounded-xl border border-gold-400/25 bg-ink-900/50 overflow-hidden">
                      <button 
                        onClick={() => toggleFolder(date)}
                        className="w-full flex items-center justify-between p-4 hover:bg-ink-800/80 transition text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="opacity-80">
                            {isExpanded ? (
                              <svg className="w-6 h-6 text-gold-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 text-gold-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                              </svg>
                            )}
                          </span>
                          <span className="font-mono text-lg text-gold-100">{date}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          {exceed && <span className="text-sm text-red-300">⚠ {t('day_exceeds')}</span>}
                          <span className="font-display text-2xl gold-text">{dayTotal}h</span>
                        </div>
                      </button>
                      {isExpanded && (
                        <ul className="divide-y divide-gold-400/10 px-4 pb-2 bg-ink-950/40">
                          {dayEntries.map(e => (
                            <li key={e.id} className="py-4 flex items-center gap-4 flex-wrap lg:pl-11">
                              <span className={`chip ${e.kind === 'elearning' ? '' : 'border-gold-300/60'}`}>
                                {e.kind === 'elearning' ? t('type_elearning_short') : t('type_realworld_short')}
                              </span>
                              <span className="flex-1 min-w-0 truncate text-gold-50 text-base">{e.title}</span>
                              <span className="font-display text-xl gold-text">{e.hours}h</span>
                              {e.cert_url && (
                                <button onClick={() => setViewing(e)} className="chip hover:border-gold-400/60 p-2" title={t('view_cert')}>
                                  <svg className="w-4 h-4 text-gold-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                  </svg>
                                </button>
                              )}
                              <button onClick={() => openEdit(e)} className="btn-ghost px-3 py-1 text-sm">{t('edit')}</button>
                              <button onClick={() => removeEntry(e)} className="btn-danger px-3 py-1 text-sm">{t('delete')}</button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? t('edit') : t('add_entry')}
        wide
        footer={
          <>
            <button onClick={() => setOpen(false)} className="btn-ghost">{t('cancel')}</button>
            <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? '…' : t('save')}
            </button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">{t('date')}</label>
            <input type="date" className="input" value={form.entry_date}
              onChange={e => setForm({ ...form, entry_date: e.target.value })} />
          </div>
          <div>
            <label className="label">{t('hours_field')}</label>
            <input type="number" step="0.5" min="0.5" max="24" className="input"
              value={form.hours}
              onChange={e => setForm({ ...form, hours: e.target.value })} />
          </div>
          <div>
            <label className="label">{t('kind')}</label>
            <select
              className="input"
              value={form.kind}
              onChange={e => setForm({ ...form, kind: e.target.value })}
            >
              <option value="elearning">{t('elearning')}</option>
              <option value="realworld">{t('realworld')}</option>
            </select>
          </div>
          <div>
            <label className="label">{t('title')}</label>
            <input className="input" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="label">{t('notes')}</label>
            <textarea className="input min-h-[60px]" value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="label">{form.cert_url ? t('replace_file') : t('cert')}</label>
            <FileUpload
              folder={`volunteer/year-${yearId}`}
              onUploaded={(r) => {
                const code = extractCertCode(r.original_name);
                setForm(f => ({
                  ...f,
                  cert_url: r.url,
                  cert_public_id: r.public_id,
                  cert_type: r.type,
                  title: f.title.trim() ? f.title : (code || f.title),
                  // Pre-fill hours from the cert's extracted duration,
                  // unconditionally overriding to ensure the user sees the extracted result.
                  hours: r.hours ? String(r.hours) : f.hours,
                  entry_date: r.date ? r.date : f.entry_date,
                }));
              }}
            />
            {form.cert_url && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="chip">✓ {t('file_attached')}</span>
                <button
                  onClick={() => setForm({ ...form, cert_url: '', cert_public_id: '', cert_type: '' })}
                  className="text-red-300 hover:text-red-200"
                >
                  {t('remove_file')}
                </button>
              </div>
            )}
          </div>
          {warn && (
            <div className="md:col-span-2 rounded-xl border border-amber-300/60 bg-amber-900/30 px-4 py-2.5 text-sm text-amber-100">
              ⚠ {warn}
            </div>
          )}
          {saveErr && (
            <div className="md:col-span-2 rounded-xl border border-red-400/60 bg-red-950/40 px-4 py-2.5 text-sm text-red-100">
              ⚠ {saveErr}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.title}
        wide
      >
        {viewing && <PdfViewer url={viewing.cert_url} />}
      </Modal>
    </main>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-t border-gold-400/25 pt-2 text-gold-100/80">
      <span className="uppercase tracking-widest text-sm text-gold-200 font-medium">{label}</span>
      <span className="font-display text-3xl gold-text">{value}</span>
    </div>
  );
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// SET e-Learning certs are named like:
//   Certificate-EQD1502s-TH.pdf  →  EQD1502s
//   Certificate-FDD1003s-TH.pdf  →  FDD1003s
function extractCertCode(name) {
  if (!name) return null;
  const m = name.match(/certificate[-_\s]+([A-Za-z]{2,5}\d{3,5}[A-Za-z]?)[-_\s]+/i);
  return m ? m[1] : null;
}
