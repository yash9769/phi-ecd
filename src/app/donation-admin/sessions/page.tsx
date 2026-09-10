'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminHeader } from '@/components/AdminHeader';
import { Session } from '@/lib/types';
import { Activity, Clock, Calendar, Laptop, Smartphone, Eye, CheckCircle2 } from 'lucide-react';

export default function AdminSessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');

  const fetchSessions = (filter: string) => {
    setLoading(true);
    fetch(`/api/admin/sessions?filter=${filter}`)
      .then((res) => {
        if (res.status === 401) {
          router.push('/donation-admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success) {
          setSessions(data.sessions);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions(dateFilter);
  }, [dateFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="jhs-badge bg-red-600 mb-1">SESSION EXPLORER</span>
            <h1 className="text-2xl font-extrabold text-white">Consented User Sessions</h1>
            <p className="text-xs text-slate-400">Inspect anonymous visitor journeys, funnels, and event streams.</p>
          </div>

          {/* Date Filter Buttons */}
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
            {['all', 'today', 'yesterday', '7days', '30days'].map((f) => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition ${
                  dateFilter === f
                    ? 'bg-red-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All Time' : f === '7days' ? '7 Days' : f === '30days' ? '30 Days' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading session records...</div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No sessions found for selected date filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6 font-bold">Session ID</th>
                    <th className="py-4 px-6 font-bold">Device / OS</th>
                    <th className="py-4 px-6 font-bold">Browser</th>
                    <th className="py-4 px-6 font-bold">Started At</th>
                    <th className="py-4 px-6 font-bold">Duration</th>
                    <th className="py-4 px-6 font-bold">Conversion Funnel</th>
                    <th className="py-4 px-6 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {sessions.map((sess) => (
                    <tr key={sess.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-4 px-6">
                        <span className="font-mono text-slate-200 font-bold block">{sess.id.substring(0, 16)}...</span>
                        <span className="text-[10px] text-slate-500 font-mono">Visitor: {sess.visitor_id.substring(0, 12)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          {sess.device_type === 'Mobile' ? (
                            <Smartphone className="w-4 h-4 text-purple-400" />
                          ) : (
                            <Laptop className="w-4 h-4 text-blue-400" />
                          )}
                          <span className="font-semibold text-white">{sess.device_type || 'Desktop'}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{sess.os || 'Windows'}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-300">{sess.browser || 'Chrome'}</td>
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(sess.started_at).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-300">
                        {sess.total_duration ? `${sess.total_duration}s` : '< 1m'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                          sess.conversion_status === 'contributed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : sess.conversion_status === 'form_completed'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {sess.conversion_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Link
                          href={`/donation-admin/sessions/${sess.id}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition inline-flex items-center gap-1.5 border border-slate-700"
                        >
                          <Eye className="w-3.5 h-3.5 text-red-500" /> Timeline
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
