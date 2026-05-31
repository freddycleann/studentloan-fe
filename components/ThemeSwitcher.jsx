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
    setTheme(newTheme);
    localStorage.setItem('sl_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="btn-ghost !px-3 !py-1 text-sm flex items-center gap-2"
        title="Change Theme"
      >
        ✨ <span className="hidden sm:inline opacity-80">Theme</span>
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
