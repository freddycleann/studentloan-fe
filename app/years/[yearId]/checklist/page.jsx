'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import FileUpload from '@/components/FileUpload';
import CloudinaryBanner from '@/components/CloudinaryBanner';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';

const PdfViewer = dynamic(() => import('@/components/PdfViewer'), { ssr: false });

const STATUS_OPTIONS = ['pending', 'in_progress', 'done'];

export default function ChecklistPage({ params }) {
  const { yearId } = params;
  const { user, loading } = useAuth();
  const { t, lang } = useI18n();
  const [year, setYear] = useState(null);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saveErr, setSaveErr] = useState('');
  const [saving, setSaving] = useState(false);
  const [merging, setMerging] = useState(false);

  function emptyForm() {
    return {
      title: '', title_th: '', description: '', status: 'pending',
      file_url: '', file_public_id: '', file_type: '',
    };
  }

  async function reload() {
    const [y, list] = await Promise.all([api.years.get(yearId), api.checklist.list(yearId)]);
    setYear(y.year);
    setItems(list.items);
  }

  useEffect(() => { if (user) reload(); }, [user, yearId]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setSaveErr('');
    setOpen(true);
  }
  function openEdit(item) {
    setEditing(item);
    setForm({
      title: item.title || '',
      title_th: item.title_th || '',
      description: item.description || '',
      status: item.status || 'pending',
      file_url: item.file_url || '',
      file_public_id: item.file_public_id || '',
      file_type: item.file_type || '',
    });
    setSaveErr('');
    setOpen(true);
  }

  async function save() {
    setSaveErr('');
    if (!form.title.trim() && !form.title_th.trim()) {
      setSaveErr(t('title_required'));
      return;
    }
    const payload = { ...form, title: form.title.trim() || form.title_th.trim() };
    setSaving(true);
    try {
      if (editing) await api.checklist.update(editing.id, payload);
      else await api.checklist.create(yearId, payload);
      setOpen(false);
      await reload();
    } catch (e) {
      setSaveErr(e.message || t('error_generic'));
    } finally {
      setSaving(false);
    }
  }

  async function quickStatus(item, status) {
    await api.checklist.update(item.id, { status });
    await reload();
  }

  async function removeItem(item) {
    if (!confirm(t('confirm_delete'))) return;
    await api.checklist.remove(item.id);
    await reload();
  }

  const [seeding, setSeeding] = useState(false);
  async function seedKMUTNB() {
    setSeeding(true);
    try {
      await api.checklist.seedTemplate(yearId, 'kmutnb');
      await reload();
    } finally { setSeeding(false); }
  }

  async function downloadMergedPdfs() {
    setMerging(true);
    try {
      const blob = await api.checklist.mergeAndDownload(yearId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `checklist_${year?.year || yearId}.pdf`;
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
            <div className="text-xs uppercase tracking-[0.3em] text-gold-200">{t('checklist')}</div>
            <h1 className="mt-2 font-display text-5xl gold-text">{year?.year}</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={downloadMergedPdfs} 
              disabled={merging || !items.some(e => e.file_url && e.file_type === 'pdf')} 
              className="btn-ghost disabled:opacity-50"
            >
              {merging ? t('merging') : t('merge_pdfs')}
            </button>
            <button onClick={openCreate} className="btn-primary">+ {t('add_item')}</button>
          </div>
        </div>

        <div className="divider-gold my-8" />

        <CloudinaryBanner />

        {items.length === 0 ? (
          <div className="card p-10 text-center space-y-5">
            <div className="text-gold-100">{t('no_items')}</div>
            <div>
              <button
                onClick={seedKMUTNB}
                disabled={seeding}
                className="btn-primary disabled:opacity-50"
              >
                {seeding ? t('importing') : `✦ ${t('import_template')}`}
              </button>
              <div className="mt-2 text-xs text-gold-200">{t('import_template_hint')}</div>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map(item => (
              <li
                key={item.id}
                className={`card card-hover p-5 flex gap-4 items-start ${
                  item.status === 'done' ? 'opacity-70' : ''
                }`}
              >
                <StatusButton status={item.status} onChange={(s) => quickStatus(item, s)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <div className={`font-display text-xl ${item.status === 'done' ? 'line-through' : 'text-gold-50'}`}>
                      {lang === 'th' && item.title_th ? item.title_th : item.title}
                    </div>
                    {lang === 'th' && item.title_th && (
                      <div className="text-xs text-gold-200/75">{item.title}</div>
                    )}
                    <StatusChip status={item.status} />
                  </div>
                  {item.description && (
                    <div className="mt-1 text-sm text-gold-100 whitespace-pre-wrap">{item.description}</div>
                  )}
                  {item.file_url && (
                    <button
                      onClick={() => setViewing(item)}
                      className="mt-3 chip hover:border-gold-400/60"
                    >
                      📄 {t('view')}
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => openEdit(item)} className="btn-ghost text-xs">{t('edit')}</button>
                  <button onClick={() => removeItem(item)} className="btn-danger text-xs">{t('delete')}</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? t('edit') : t('add_item')}
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
            <label className="label">{t('title')}</label>
            <input className="input" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder={t('title_placeholder')} />
          </div>
          <div>
            <label className="label">{t('title_th')}</label>
            <input className="input" value={form.title_th}
              onChange={e => setForm({ ...form, title_th: e.target.value })}
              placeholder={t('title_th_placeholder')} />
          </div>
          {saveErr && (
            <div className="md:col-span-2 rounded-xl border border-red-400/60 bg-red-950/40 px-4 py-2.5 text-sm text-red-100">
              ⚠ {saveErr}
            </div>
          )}
          <div className="md:col-span-2">
            <label className="label">{t('description')}</label>
            <textarea
              className="input min-h-[80px]"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label">{t('status')}</label>
            <select
              className="input"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{t(s)}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">{form.file_url ? t('replace_file') : t('attach_file')}</label>
            <FileUpload
              folder={`checklist/year-${yearId}`}
              onUploaded={(r) => setForm({
                ...form, file_url: r.url, file_public_id: r.public_id, file_type: r.type,
              })}
            />
            {form.file_url && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="chip">✓ {t('file_attached')}</span>
                <button
                  onClick={() => setForm({ ...form, file_url: '', file_public_id: '', file_type: '' })}
                  className="text-red-300 hover:text-red-200"
                >
                  {t('remove_file')}
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.title}
        wide
      >
        {viewing && <PdfViewer url={viewing.file_url} />}
      </Modal>
    </main>
  );
}

function StatusButton({ status, onChange }) {
  const next = status === 'pending' ? 'in_progress' : status === 'in_progress' ? 'done' : 'pending';
  const icon = status === 'done' ? '✓' : status === 'in_progress' ? '◐' : '○';
  return (
    <button
      onClick={() => onChange(next)}
      title={status}
      className={`grid h-9 w-9 place-items-center rounded-full border text-lg ${
        status === 'done'
          ? 'border-gold-400 bg-gold-gradient text-ink-950 shadow-gold'
          : status === 'in_progress'
            ? 'border-gold-400/60 text-gold-200'
            : 'border-gold-400/50 text-gold-200 hover:border-gold-400/60'
      }`}
    >
      {icon}
    </button>
  );
}

function StatusChip({ status }) {
  const { t } = useI18n();
  const styles = {
    pending: 'border-gold-400/50 text-gold-200',
    in_progress: 'border-gold-300/50 text-gold-100',
    done: 'border-gold-300/80 text-gold-50 bg-gold-500/10',
  };
  return <span className={`chip ${styles[status] || ''}`}>{t(status)}</span>;
}
