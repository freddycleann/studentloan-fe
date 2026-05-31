'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

export default function CloudinaryBanner() {
  const { cloudinaryConfigured } = useAuth();
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(false);

  if (cloudinaryConfigured || dismissed) return null;

  return (
    <div className="banner-warn mb-6 flex items-start gap-3">
      <span className="text-base">⚠</span>
      <div className="flex-1">
        <div className="font-semibold">{t('cloudinary_missing_title')}</div>
        <div className="mt-1 text-xs text-amber-100/90">{t('cloudinary_missing_body')}</div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-100/70 hover:text-amber-50 text-xs"
      >
        {t('dismiss')}
      </button>
    </div>
  );
}
