'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

export default function Header() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useI18n();

  return (
    <header className="sticky top-0 z-20 border-b border-gold-400/40 bg-ink-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-gradient text-ink-950 font-display text-xl shadow-gold">
            ✦
          </span>
          <div className="leading-tight">
            <div className="font-display text-lg tracking-wider gold-text">{t('app_name')}</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-gold-200">
              {t('tagline')}
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 rounded-full border border-gold-400/40 bg-ink-800/90 p-1">
            <button
              onClick={() => setLang('en')}
              className={`rounded-full px-3 py-1 text-xs uppercase tracking-widest transition ${
                lang === 'en' ? 'bg-gold-gradient text-ink-950' : 'text-gold-100 hover:text-gold-50'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('th')}
              className={`rounded-full px-3 py-1 text-xs tracking-widest transition ${
                lang === 'th' ? 'bg-gold-gradient text-ink-950' : 'text-gold-100 hover:text-gold-50'
              }`}
            >
              ไทย
            </button>
          </div>
          {user?.is_admin && (
            <Link href="/admin" className="btn-ghost text-sm">
              {t('admin')}
            </Link>
          )}
          {user && (
            <>
              <Link href="/profile" className="hidden md:inline text-xs text-gold-200 hover:text-gold-50 transition">
                {user.display_name || user.username}
              </Link>
              <button onClick={logout} className="btn-ghost text-sm">
                {t('logout')}
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
