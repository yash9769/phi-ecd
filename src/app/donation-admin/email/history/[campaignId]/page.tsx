'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/AdminHeader';
import { 
  ArrowLeft, 
  Copy, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Filter, 
  User, 
  RefreshCw,
  FileText
} from 'lucide-react';
import { EmailCampaign, EmailCampaignRecipient } from '@/lib/types';

interface CampaignDetailPageProps {
  params: Promise<{
    campaignId: string;
  }>;
}

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const resolvedParams = use(params);
  const campaignId = resolvedParams.campaignId;
  const router = useRouter();

  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
  const [recipients, setRecipients] = useState<EmailCampaignRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [duplicating, setDuplicating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'recipients' | 'preview'>('recipients');

  useEffect(() => {
    fetchCampaignDetails();
  }, [campaignId]);

  const fetchCampaignDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/admin/email/campaigns/${campaignId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch campaign details');
      }

      setCampaign(data.campaign);
      setRecipients(data.recipients || []);
    } catch (err: any) {
      setError(err.message || 'Error loading campaign details');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!campaign) return;
    try {
      setDuplicating(true);
      const res = await fetch('/api/admin/email/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaign.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to duplicate campaign');
      }

      router.push(`/donation-admin/email/compose?draftId=${data.draft.id}`);
    } catch (err: any) {
      alert(`Error duplicating campaign: ${err.message}`);
      setDuplicating(false);
    }
  };

  const filteredRecipients = recipients.filter(r => {
    const name = r.employee?.full_name || r.email || '';
    const matchesSearch = 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.employee_id && r.employee_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Sent</span>;
      case 'delivered':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800"><CheckCircle className="w-3.5 h-3.5 mr-1" /> Delivered</span>;
      case 'sending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"><RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" /> Sending</span>;
      case 'failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Failed</span>;
      case 'draft':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><FileText className="w-3.5 h-3.5 mr-1" /> Draft</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getRecipientStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Delivered</span>;
      case 'sent':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Sent</span>;
      case 'failed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Failed</span>;
      case 'bounced':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Bounced</span>;
      case 'skipped':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">Skipped</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Pending</span>;
    }
  };

  const deliveredCount = recipients.filter(r => r.status === 'delivered' || r.status === 'sent').length;
  const failedCount = recipients.filter(r => r.status === 'failed' || r.status === 'bounced').length;
  const successRate = recipients.length > 0 ? Math.round((deliveredCount / recipients.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Link
            href="/donation-admin/email/history"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Campaign History
          </Link>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchCampaignDetails}
              className="inline-flex items-center px-3 py-1.5 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh Status
            </button>
            <button
              onClick={handleDuplicate}
              disabled={duplicating || !campaign}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow transition-colors disabled:opacity-50"
            >
              <Copy className="w-4 h-4 mr-2" />
              {duplicating ? 'Creating Draft...' : 'Duplicate as New Draft'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-slate-200">
            <RefreshCw className="w-8 h-8 mx-auto text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Loading campaign metrics and recipient logs...</p>
          </div>
        ) : error || !campaign ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-red-200">
            <AlertTriangle className="w-10 h-10 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Error Loading Campaign</h3>
            <p className="text-slate-600 mb-6">{error || 'Campaign not found'}</p>
            <Link
              href="/donation-admin/email/history"
              className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium"
            >
              Return to History
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Campaign Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusBadge(campaign.status)}
                    <span className="text-xs text-slate-400 font-mono">ID: {campaign.id}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">{campaign.subject}</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    From: <span className="font-medium text-slate-700">{campaign.from_email}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-left sm:text-right">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Created</span>
                    <span className="text-sm font-medium text-slate-700">
                      {new Date(campaign.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Sent / Completed</span>
                    <span className="text-sm font-medium text-slate-700">
                      {campaign.completed_at || campaign.started_at 
                        ? new Date(campaign.completed_at || campaign.started_at!).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Created By</span>
                    <span className="text-sm font-medium text-slate-700">{campaign.created_by || 'Admin'}</span>
                  </div>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-semibold uppercase">Total Targeted</span>
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{campaign.total_recipients}</div>
                  <span className="text-xs text-slate-500">Employees in recipient list</span>
                </div>

                <div className="bg-emerald-50/50 rounded-lg p-4 border border-emerald-100">
                  <div className="flex items-center justify-between text-emerald-700 mb-1">
                    <span className="text-xs font-semibold uppercase">Successful</span>
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-900">{deliveredCount}</div>
                  <span className="text-xs text-emerald-700">Sent & Delivered via Resend</span>
                </div>

                <div className="bg-red-50/50 rounded-lg p-4 border border-red-100">
                  <div className="flex items-center justify-between text-red-700 mb-1">
                    <span className="text-xs font-semibold uppercase">Failed</span>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-red-900">{failedCount}</div>
                  <span className="text-xs text-red-700">Bounced or failed emails</span>
                </div>

                <div className="bg-indigo-50/50 rounded-lg p-4 border border-indigo-100">
                  <div className="flex items-center justify-between text-indigo-700 mb-1">
                    <span className="text-xs font-semibold uppercase">Delivery Rate</span>
                    <Send className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold text-indigo-900">{successRate}%</div>
                  <span className="text-xs text-indigo-700">Overall success percentage</span>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50/50 px-6 flex items-center justify-between">
                <div className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('recipients')}
                    className={`py-4 text-sm font-semibold border-b-2 transition-colors ${
                      activeTab === 'recipients'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Recipient Logs ({recipients.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`py-4 text-sm font-semibold border-b-2 transition-colors ${
                      activeTab === 'preview'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Email Message Content
                  </button>
                </div>
              </div>

              {activeTab === 'recipients' ? (
                <div className="p-6">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by name, email, or employee ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-slate-200 rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="all">All Delivery Statuses</option>
                        <option value="sent">Sent</option>
                        <option value="delivered">Delivered</option>
                        <option value="failed">Failed</option>
                        <option value="bounced">Bounced</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  {/* Recipients Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Email Address
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Resend Message ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Sent Time / Log
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {filteredRecipients.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">
                              No recipients found matching your filter parameters.
                            </td>
                          </tr>
                        ) : (
                          filteredRecipients.map((rec) => (
                            <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-slate-900">
                                  {rec.employee?.full_name || rec.email}
                                </div>
                                {rec.employee_id && (
                                  <div className="text-xs text-slate-500">ID: {rec.employee_id}</div>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 font-mono">
                                {rec.email}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {getRecipientStatusBadge(rec.status)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-slate-500">
                                {rec.resend_message_id || '—'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                                {rec.sent_at
                                  ? new Date(rec.sent_at).toLocaleString('en-IN', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                      day: 'numeric',
                                      month: 'short'
                                    })
                                  : 'Not sent yet'}
                                {rec.error_message && (
                                  <div className="text-xs text-red-600 mt-1 max-w-xs truncate" title={rec.error_message}>
                                    Error: {rec.error_message}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">Subject Header</h3>
                    <p className="text-base text-slate-900 font-medium">{campaign.subject}</p>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-6 bg-white overflow-y-auto max-h-[600px]">
                    <div 
                      className="prose max-w-none text-slate-800"
                      dangerouslySetInnerHTML={{ __html: campaign.body_html }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
