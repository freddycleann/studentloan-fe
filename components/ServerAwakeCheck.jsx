'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

export default function ServerAwakeCheck({ children }) {
  const [isAwake, setIsAwake] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    let mounted = true;

    async function checkServer() {
      try {
        await api.health();
        if (mounted) setIsAwake(true);
      } catch (err) {
        // If it fails, retry after 2 seconds
        if (mounted) {
          setTimeout(checkServer, 2000);
        }
      }
    }

    checkServer();

    return () => {
      mounted = false;
    };
  }, []);

  if (isAwake) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink-950/95 backdrop-blur-md">
      <div className="flex flex-col items-center max-w-sm text-center px-6">
        <div className="relative flex items-center justify-center w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-gold-400/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-gold-400 border-t-transparent animate-spin"></div>
          <span className="text-3xl">✨</span>
        </div>
        <h2 className="font-display text-3xl gold-text mb-4">Waking up the Server</h2>
        <p className="text-gold-100/80 mb-6">
          Since we are using a free Render instance, the backend goes to sleep after 15 minutes of inactivity. It takes about 30-50 seconds to wake up. 
        </p>
        <p className="text-sm text-gold-200/60 uppercase tracking-widest animate-pulse">
          Please hold on...
        </p>
      </div>
    </div>
  );
}
