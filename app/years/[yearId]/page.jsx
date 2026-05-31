'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ProgressRing from '@/components/ProgressRing';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';

export default function YearOverview({ params }) {
  const { yearId } = params;
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.years.summary(yearId).then(setData).catch(() => {});
  }, [user, yearId]);

  if (loading || !user) return null;

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/" className="text-sm text-gold-200 hover:text-gold-100">← {t('back')}</Link>

        {!data ? (
          <div className="mt-8 text-gold-200">…</div>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-gold-200">{t('overview')}</div>
                <h1 className="mt-2 font-display text-6xl gold-text">{data.year.year}</h1>
                {data.year.note && <p className="mt-2 text-gold-100">{data.year.note}</p>}
              </div>
              <div className="flex gap-2">
                <Link href={`/years/${yearId}/checklist`} className="btn-ghost">
                  {t('checklist')} →
                </Link>
                <Link href={`/years/${yearId}/volunteer`} className="btn-primary">
                  {t('volunteer')} →
                </Link>
              </div>
            </div>

            <div className="divider-gold my-8" />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="card p-7 flex items-center gap-6">
                <ProgressRing
                  value={data.checklist.done || 0}
                  max={data.checklist.total || 1}
                  label={`${data.checklist.done || 0}/${data.checklist.total || 0}`}
                  sublabel={t('checklist_progress')}
                />
                <div>
                  <div className="font-display text-2xl text-gold-100">{t('checklist')}</div>
                  <div className="mt-3 space-y-1 text-sm text-gold-100">
                    <div>● {t('done')}: <span className="text-gold-100">{data.checklist.done || 0}</span></div>
                    <div>● {t('in_progress')}: <span className="text-gold-100">{data.checklist.in_progress || 0}</span></div>
                    <div>● {t('pending')}: <span className="text-gold-100">{(data.checklist.total || 0) - (data.checklist.done || 0) - (data.checklist.in_progress || 0)}</span></div>
                  </div>
                </div>
              </div>

              <div className="card p-7 flex items-center gap-6">
                <ProgressRing
                  value={data.volunteer.total_hours}
                  max={data.goal}
                  label={`${data.volunteer.total_hours.toFixed(1)}h`}
                  sublabel={`/ ${data.goal}h ${t('goal')}`}
                />
                <div>
                  <div className="font-display text-2xl text-gold-100">{t('volunteer')}</div>
                  <div className="mt-3 space-y-1 text-sm text-gold-100">
                    <div>● {t('type_elearning_short')}: <span className="text-gold-100">{data.volunteer.elearning_hours.toFixed(1)}h</span></div>
                    <div>● {t('type_realworld_short')}: <span className="text-gold-100">{data.volunteer.realworld_hours.toFixed(1)}h</span></div>
                    <div>● {t('daily_cap')}: <span className="text-gold-100">{data.daily_cap}h</span></div>
                  </div>
                </div>
              </div>
            </div>

            {data.byDay && data.byDay.length > 0 && (
              <div className="card mt-6 p-7">
                <div className="font-display text-xl text-gold-100">{t('daily_breakdown')}</div>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
                  {data.byDay.map(d => (
                    <div
                      key={d.entry_date}
                      className={`rounded-xl border px-3 py-3 text-sm ${
                        d.hours > 8
                          ? 'border-red-500/40 bg-red-500/5 text-red-200'
                          : 'border-gold-400/40 bg-ink-800/90 text-gold-100'
                      }`}
                    >
                      <div className="text-xs uppercase tracking-widest opacity-70">{d.entry_date}</div>
                      <div className="mt-1 font-display text-2xl">{d.hours}h</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
