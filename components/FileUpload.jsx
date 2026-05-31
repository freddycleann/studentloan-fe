'use client';
import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

export default function FileUpload({ folder, onUploaded, accept = '.pdf,image/*', label }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const { t } = useI18n();

  async function handleFile(file) {
    if (!file) return;
    setErr('');
    setBusy(true);
    try {
      const result = await api.upload(file, folder);
      onUploaded?.(result);
    } catch (e) {
      setErr(e.message || t('error_generic'));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div>
      <label
        className={`group flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-gold-400/50 bg-ink-800/80 px-4 py-3 text-sm text-gold-100/80 transition hover:border-gold-400/60 hover:bg-ink-800/70 ${
          busy ? 'opacity-60' : ''
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
          disabled={busy}
        />
        <span className="text-gold-300">⬆</span>
        <span>{busy ? t('uploading') : (label || t('drop_or_pick'))}</span>
      </label>
      {err && <div className="mt-2 text-xs text-red-300">{err}</div>}
    </div>
  );
}
