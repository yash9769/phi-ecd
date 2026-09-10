'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminHeader } from '@/components/AdminHeader';
import { EmailCampaign } from '@/lib/types';
import { Plus, Mail, FileEdit, Send, CheckCircle2, Clock, Trash2, Eye, Copy, AlertCircle } from 'lucide-react';

export default function AdminEmailDashboardPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<EmailCampaign[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [draftsRes, campaignsRes] = await Promise.all([
        fetch('/api/admin/email/drafts'),
        fetch('/api/admin/email/campaigns'),
      ]);

      if (draftsRes.status === 401 || campaignsRes.status === 401) {
        router.push('/donation-admin/login');
        return;
      }

      const draftsData = await draftsRes.json();
      const campaignsData = await campaignsRes.json();

      if (draftsData.success) setDrafts(draftsData.drafts);
      if (campaignsData.success) setCampaigns(campaignsData.campaigns);
    } catch (err) {
      console.error('Failed to load email campaigns data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleDuplicate = async (campaignId: string) => {
    try {
      const res = await fetch('/api/admin/email/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      });
      const data = await res.json();
      if (data.success && data.draft) {
        router.push(`/donation-admin/email/compose?draftId=${data.draft.id}`);
      }
    } catch (e) {
      alert('Failed to duplicate campaign.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Header & Main Create Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="jhs-badge bg-red-600 mb-1">EMAIL MANAGEMENT</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Resend Email Delivery & Campaign Hub</h1>
            <p className="text-xs text-slate-400">Compose personalized memorial emails, select recipients, and track delivery.</p>
          </div>

          <Link
            href="/donation-admin/email/compose"
            className="btn-jhs-primary text-xs py-3 px-6 shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> CREATE EMAIL CAMPAIGN
          </Link>
        </div>

        {/* SECTION 1: DRAFTS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-red-500" />
              Email Drafts ({drafts.length})
            </h2>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading drafts...</div>
            ) : drafts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <p>No saved email drafts.</p>
                <Link
                  href="/donation-admin/email/compose"
                  className="inline-flex items-center gap-1.5 text-red-400 font-bold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Start a new draft
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-4 px-6 font-bold">Campaign Name</th>
                      <th className="py-4 px-6 font-bold">Subject Line</th>
                      <th className="py-4 px-6 font-bold">Recipients</th>
                      <th className="py-4 px-6 font-bold">Last Updated</th>
                      <th className="py-4 px-6 font-bold">Status</th>
                      <th className="py-4 px-6 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {drafts.map((draft) => (
                      <tr key={draft.id} className="hover:bg-slate-800/50 transition">
                        <td className="py-4 px-6 font-bold text-white">{draft.name}</td>
                        <td className="py-4 px-6 text-slate-300 max-w-xs truncate">{draft.subject}</td>
                        <td className="py-4 px-6 font-mono text-slate-300">
                          {draft.selected_recipients?.length || 0} employees
                        </td>
                        <td className="py-4 px-6 text-slate-400">
                          {new Date(draft.updated_at).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold uppercase">
                            <Clock className="w-3 h-3 text-amber-400" /> Draft
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <Link
                            href={`/donation-admin/email/compose?draftId=${draft.id}`}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition inline-flex items-center gap-1 border border-slate-700"
                          >
                            <FileEdit className="w-3.5 h-3.5 text-red-500" /> Edit & Send
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: CAMPAIGN HISTORY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              Campaign History ({campaigns.length})
            </h2>
            <Link
              href="/donation-admin/email/history"
              className="text-xs font-bold text-slate-400 hover:text-white transition"
            >
              View Full History →
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading campaign history...</div>
            ) : campaigns.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No sent campaigns recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-4 px-6 font-bold">Campaign</th>
                      <th className="py-4 px-6 font-bold">Subject</th>
                      <th className="py-4 px-6 font-bold">Recipients</th>
                      <th className="py-4 px-6 font-bold">Sent / Delivered / Failed</th>
                      <th className="py-4 px-6 font-bold">Date</th>
                      <th className="py-4 px-6 font-bold">Status</th>
                      <th className="py-4 px-6 font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {campaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-slate-800/50 transition">
                        <td className="py-4 px-6 font-bold text-white">{camp.name}</td>
                        <td className="py-4 px-6 text-slate-300 max-w-xs truncate">{camp.subject}</td>
                        <td className="py-4 px-6 font-mono text-slate-300">{camp.total_recipients}</td>
                        <td className="py-4 px-6 font-mono text-xs">
                          <span className="text-emerald-400 font-bold">{camp.sent_count} sent</span> •{' '}
                          <span className="text-blue-400">{camp.delivered_count} deliv</span> •{' '}
                          <span className="text-red-400">{camp.failed_count} fail</span>
                        </td>
                        <td className="py-4 px-6 text-slate-400">
                          {new Date(camp.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            camp.status === 'sent'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : camp.status === 'partially_sent'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-red-950 text-red-400 border border-red-800'
                          }`}>
                            {camp.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-6 flex items-center gap-2">
                          <Link
                            href={`/donation-admin/email/history/${camp.id}`}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition inline-flex items-center gap-1 border border-slate-700"
                          >
                            <Eye className="w-3.5 h-3.5 text-red-500" /> Audit
                          </Link>
                          <button
                            onClick={() => handleDuplicate(camp.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition inline-flex items-center gap-1 border border-slate-700"
                            title="Duplicate Campaign as New Draft"
                          >
                            <Copy className="w-3.5 h-3.5 text-slate-400" /> Duplicate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
