'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminHeader } from '@/components/AdminHeader';
import { Session, TelemetryEvent } from '@/lib/types';
import {
  Activity,
  Clock,
  Laptop,
  Smartphone,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Compass,
  Tag
} from 'lucide-react';

export default function SingleSessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/sessions/${sessionId}`)
      .then((res) => {
        if (res.status === 401) {
          router.push('/donation-admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success) {
          setSession(data.session);
          setEvents(data.events);
        }
      })
      .finally(() => setLoading(false));
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Loading Session Event Stream...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col">
        <AdminHeader />
        <main className="flex-1 max-w-4xl mx-auto px-6 py-16 text-center space-y-4">
          <h2 className="text-2xl font-bold">Session Not Found</h2>
          <p className="text-xs text-slate-400">The requested session ID could not be retrieved.</p>
          <Link href="/donation-admin/sessions" className="btn-jhs-primary text-xs py-2 px-6">
            Back to Sessions Explorer
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <AdminHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top bar navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <Link
            href="/donation-admin/sessions"
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Sessions
          </Link>
          <div className="flex items-center gap-2">
            <span className="jhs-badge bg-emerald-700">CONSENTED SESSION</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Sanitized Telemetry
            </span>
          </div>
        </div>

        {/* Session Metadata Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs text-red-500 font-mono font-bold block mb-1">
                SESSION: {session.id}
              </span>
              <h1 className="text-xl md:text-2xl font-extrabold text-white">Session Detail & Audit</h1>
              <p className="text-xs text-slate-400">Anonymous Visitor ID: {session.visitor_id}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-300">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Conversion Funnel</span>
                <span className="font-bold text-emerald-400 uppercase tracking-wider">{session.conversion_status.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Environment Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              <span className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Device & OS</span>
              <strong className="block text-white font-semibold">{session.device_type} ({session.os})</strong>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              <span className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Browser</span>
              <strong className="block text-white font-semibold">{session.browser}</strong>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              <span className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Screen / Viewport</span>
              <strong className="block text-white font-semibold">
                {session.screen_width}x{session.screen_height} ({session.viewport_width}x{session.viewport_height})
              </strong>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              <span className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Total Duration</span>
              <strong className="block text-white font-semibold">{session.total_duration || 0} seconds</strong>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-400 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
            <div>
              <span className="text-slate-500">Referrer:</span> <strong className="text-slate-200">{session.referrer || 'Direct'}</strong>
            </div>
            {session.utm_source && (
              <div>
                <span className="text-slate-500">UTM Source:</span> <strong className="text-slate-200">{session.utm_source}</strong>
              </div>
            )}
            {session.utm_campaign && (
              <div>
                <span className="text-slate-500">UTM Campaign:</span> <strong className="text-slate-200">{session.utm_campaign}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Chronological Event Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500" />
              Chronological Event Stream ({events.length} Events)
            </h2>
            <span className="text-xs text-slate-400">Strictly no form values displayed</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 relative">
            <div className="absolute left-9 top-10 bottom-10 w-0.5 bg-slate-800" />

            <div className="space-y-6 relative">
              {events.map((evt, idx) => {
                const timeStr = new Date(evt.timestamp).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false,
                });

                let eventLabel = evt.event_type.replace(/_/g, ' ').toUpperCase();
                let detailText = '';

                if (evt.metadata?.fieldName) {
                  detailText = `Field: ${evt.metadata.fieldName}`;
                } else if (evt.metadata?.elementId) {
                  detailText = `Element: ${evt.metadata.elementId}`;
                } else if (evt.metadata?.method) {
                  detailText = `Method: ${evt.metadata.method.toUpperCase()} (₹${evt.metadata?.amount || ''})`;
                } else if (evt.metadata?.transactionRef) {
                  detailText = `Ref: ${evt.metadata.transactionRef}`;
                }

                return (
                  <div key={evt.id || idx} className="flex items-start gap-6 group">
                    <div className="w-6 h-6 rounded-full bg-slate-950 border-2 border-red-500 flex items-center justify-center text-[10px] font-bold text-red-400 relative z-10 group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>

                    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-slate-700 transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-red-400">[{timeStr}]</span>
                          <span className="font-extrabold text-sm text-white tracking-wide">{eventLabel}</span>
                        </div>
                        {detailText && (
                          <p className="text-xs text-slate-400 font-mono">{detailText}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 font-mono">
                          Page: {evt.page}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
