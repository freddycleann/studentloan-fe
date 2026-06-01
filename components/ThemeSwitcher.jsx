'use client';
import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';

const THEMES = [
  { id: 'default', label: 'Ink & Gold' },
  { id: 'blue-rose-gold', label: 'Blue & Rose Gold' },
  { id: 'pastel', label: 'Soft Pastel' },
  { id: 'light', label: 'Light Professional' },
  { id: 'black-professional', label: 'Black Professional' },
];

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState('default');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sl_theme');
    if (saved && THEMES.some(t => t.id === saved)) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  function handleSwitch(newTheme) {
    if (theme === newTheme) return;
    
    // Add transitioning class for 1.5s crossfade
    document.documentElement.classList.add('theme-transitioning');
    
    setTheme(newTheme);
    localStorage.setItem('sl_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    setOpen(false);

    // Remove class after transition completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 1500);
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="btn-ghost !px-3 !py-1 text-sm flex items-center gap-2"
        title="Change Theme"
      >
        <svg className="w-4 h-4 text-gold-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
        <span className="hidden sm:inline opacity-80">Theme</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-gold-400/40 bg-ink-900/95 shadow-gold-strong p-2 backdrop-blur-md z-50">
          <div className="space-y-1">
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => handleSwitch(t.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  theme === t.id 
                    ? 'bg-gold-gradient text-ink-950 font-semibold' 
                    : 'text-gold-100 hover:bg-ink-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
