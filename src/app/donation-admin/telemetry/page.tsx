'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/AdminHeader';
import { AnalyticsSummary } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, Smartphone, Laptop, Globe, Layers, ArrowDown } from 'lucide-react';

export default function AdminTelemetryPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => {
        if (res.status === 401) {
          router.push('/donation-admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success) {
          setSummary(data.summary);
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Loading Telemetry Suite...</p>
        </div>
      </div>
    );
  }

  // Convert Device breakdown to chart format
  const deviceData = Object.entries(summary?.deviceBreakdown || {}).map(([name, value]) => ({
    name,
    value,
  }));

  // Convert Browser breakdown to chart format
  const browserData = Object.entries(summary?.browserBreakdown || {}).map(([name, value]) => ({
    name,
    value,
  }));

  // Funnel Data
  const funnelData = [
    { name: 'Total Sessions', count: summary?.totalSessions || 0 },
    { name: 'CTA Clicks', count: summary?.ctaClicksCount || 0 },
    { name: 'Form Starts', count: summary?.totalSubmissions || 0 },
    { name: 'Form Completed', count: summary?.totalSubmissions || 0 },
    { name: 'Payment Page', count: summary?.paymentPageVisits || 0 },
    { name: 'Contributions', count: summary?.successfulContributionsCount || 0 },
  ];

  // Scroll Depth Data
  const scrollData = Object.entries(summary?.scrollDepthBreakdown || {}).map(([name, value]) => ({
    depth: name,
    users: value,
  }));

  const COLORS = ['#d62049', '#1e3a5f', '#10b981', '#8b5cf6', '#f59e0b'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <span className="jhs-badge bg-red-600 mb-1">ANALYTICS SUITE</span>
          <h1 className="text-2xl font-extrabold text-white">Interaction Telemetry & Conversion Funnel</h1>
          <p className="text-xs text-slate-400">Non-sensitive behavioral telemetry aggregated across consented sessions.</p>
        </div>

        {/* Funnel Metrics Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-500" /> Employee Contribution Conversion Funnel
          </h3>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#d62049" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grid: Device Breakdown & Browser Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Device Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-400" /> Device Distribution
            </h3>

            <div className="h-60 flex items-center justify-center">
              {deviceData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                      {deviceData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-xs text-slate-500">No device telemetry recorded yet.</span>
              )}
            </div>
          </div>

          {/* Scroll Depth Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ArrowDown className="w-4 h-4 text-emerald-400" /> Scroll Depth Analytics
            </h3>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scrollData}>
                  <XAxis dataKey="depth" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="users" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Technical Specs Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Browser Specs</span>
            <div className="space-y-1 text-xs">
              {Object.entries(summary?.browserBreakdown || {}).map(([b, count]) => (
                <div key={b} className="flex items-center justify-between text-slate-300">
                  <span>{b}</span>
                  <span className="font-mono font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Operating Systems</span>
            <div className="space-y-1 text-xs">
              {Object.entries(summary?.osBreakdown || {}).map(([o, count]) => (
                <div key={o} className="flex items-center justify-between text-slate-300">
                  <span>{o}</span>
                  <span className="font-mono font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Referrers & UTM</span>
            <div className="space-y-1 text-xs">
              {Object.entries(summary?.referrerBreakdown || {}).map(([ref, count]) => (
                <div key={ref} className="flex items-center justify-between text-slate-300 truncate">
                  <span className="truncate max-w-[160px]">{ref}</span>
                  <span className="font-mono font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
