'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/AdminHeader';
import { AnalyticsSummary } from '@/lib/types';
import {
  Users,
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  DollarSign,
  XCircle,
  Download,
  ArrowRight,
  ShieldCheck,
  MousePointerClick
} from 'lucide-react';

export default function AdminDashboardPage() {
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
          <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Loading Portal Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top Title & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="jhs-badge bg-red-600">OVERVIEW METRICS</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Server-side Authenticated
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Foundation of Hope Executive Overview</h1>
            <p className="text-xs text-slate-400">Live analytics and employee contribution metrics for JHS leadership.</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/admin/export/csv?type=employees"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider border border-slate-700 transition flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-red-500" /> Export CSV
            </a>
            <a
              href="/api/admin/export/excel?type=employees"
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" /> Export Excel (.xlsx)
            </a>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Contributions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Contributed</span>
              <div className="p-2 bg-emerald-950 text-emerald-400 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-400">
              ₹{(summary?.totalContributions || 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400">
              From {summary?.successfulContributionsCount || 0} successful employee contributions
            </p>
          </div>

          {/* Form Submissions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Submissions</span>
              <div className="p-2 bg-red-950 text-red-400 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{summary?.totalSubmissions || 0}</div>
            <p className="text-[11px] text-slate-400">Registered JHS employee forms</p>
          </div>

          {/* Completion Rate */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Form Completion</span>
              <div className="p-2 bg-blue-950 text-blue-400 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-blue-400">{summary?.formCompletionRate || 0}%</div>
            <p className="text-[11px] text-slate-400">
              Abandonment rate: {summary?.formAbandonmentRate || 0}%
            </p>
          </div>

          {/* Total Visitors / Sessions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sessions</span>
              <div className="p-2 bg-purple-950 text-purple-400 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-white">{summary?.totalSessions || 0}</div>
            <p className="text-[11px] text-slate-400">
              {summary?.totalVisitors || 0} unique visitors
            </p>
          </div>
        </div>

        {/* Secondary Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Average Session Duration</span>
            <div className="text-xl font-extrabold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-500" />
              {summary?.avgSessionDuration || 0} seconds
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Payment Conversion</span>
            <div className="text-xl font-extrabold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {summary?.paymentConversionRate || 0}% ({summary?.paymentPageVisits || 0} page visits)
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">CTA Interaction Clicks</span>
            <div className="text-xl font-extrabold text-white flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-purple-400" />
              {summary?.ctaClicksCount || 0} CTA clicks recorded
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <button
            onClick={() => router.push('/donation-admin/employees')}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 text-left transition space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Employee Submissions</h3>
              <ArrowRight className="w-5 h-5 text-red-500 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Search, filter, and inspect registered employee records and contribution status.
            </p>
          </button>

          <button
            onClick={() => router.push('/donation-admin/sessions')}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 text-left transition space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Session Event Explorer</h3>
              <ArrowRight className="w-5 h-5 text-red-500 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore individual consented sessions with date filters and inspect chronological timelines.
            </p>
          </button>

          <button
            onClick={() => router.push('/donation-admin/telemetry')}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 text-left transition space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Telemetry & Analytics</h3>
              <ArrowRight className="w-5 h-5 text-red-500 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive breakdowns for device type, browser, scroll depth, and UTM parameters.
            </p>
          </button>
        </div>
      </main>
    </div>
  );
}
