'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminHeader } from '@/components/AdminHeader';
import { EmailCampaign } from '@/lib/types';
import { Send, Eye, Copy, ArrowLeft, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function AdminEmailHistoryPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/email/campaigns')
      .then((res) => {
        if (res.status === 401) {
          router.push('/donation-admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success) {
          setCampaigns(data.campaigns);
        }
      })
      .finally(() => setLoading(false));
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Link href="/donation-admin/email" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Email System
            </Link>
            <h1 className="text-2xl font-extrabold text-white">Campaign History & Delivery Logs</h1>
            <p className="text-xs text-slate-400">Complete historical archive of dispatched Resend email campaigns.</p>
          </div>

          <Link
            href="/donation-admin/email/compose"
            className="btn-jhs-primary text-xs py-2.5 px-6 shadow-lg flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> CREATE NEW CAMPAIGN
          </Link>
        </div>

        {/* Campaign History Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading campaign history...</div>
          ) : campaigns.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No sent campaigns found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6 font-bold">Campaign Name</th>
                    <th className="py-4 px-6 font-bold">Subject</th>
                    <th className="py-4 px-6 font-bold">Date</th>
                    <th className="py-4 px-6 font-bold">Recipients</th>
                    <th className="py-4 px-6 font-bold">Sent</th>
                    <th className="py-4 px-6 font-bold">Delivered</th>
                    <th className="py-4 px-6 font-bold">Failed</th>
                    <th className="py-4 px-6 font-bold">Status</th>
                    <th className="py-4 px-6 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-4 px-6 font-bold text-white">{camp.name}</td>
                      <td className="py-4 px-6 text-slate-300 max-w-xs truncate">{camp.subject}</td>
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(camp.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-300">{camp.total_recipients}</td>
                      <td className="py-4 px-6 font-mono text-emerald-400 font-bold">{camp.sent_count}</td>
                      <td className="py-4 px-6 font-mono text-blue-400 font-bold">{camp.delivered_count}</td>
                      <td className="py-4 px-6 font-mono text-red-400 font-bold">{camp.failed_count}</td>
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
                          <Eye className="w-3.5 h-3.5 text-red-500" /> Details
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
      </main>
    </div>
  );
}
