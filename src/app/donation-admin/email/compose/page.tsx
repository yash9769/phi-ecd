'use client';

import { useState, useEffect, use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AdminHeader } from '@/components/AdminHeader';
import { Employee } from '@/lib/types';
import { DEFAULT_MEMORIAL_EMAIL_SUBJECT, DEFAULT_MEMORIAL_EMAIL_BODY, personalizeEmail } from '@/lib/resend';
import {
  Mail,
  Send,
  Save,
  Eye,
  CheckCircle2,
  Users,
  Search,
  CheckSquare,
  Square,
  Laptop,
  Smartphone,
  X,
  AlertCircle,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

function ComposerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftIdParam = searchParams.get('draftId');

  // Campaign Form State
  const [draftId, setDraftId] = useState<string | null>(draftIdParam);
  const [campaignName, setCampaignName] = useState('Ahmed Memorial Announcement');
  const [subject, setSubject] = useState(DEFAULT_MEMORIAL_EMAIL_SUBJECT);
  const [fromEmail, setFromEmail] = useState('Foundation of Hope <foundationofhope@jhsassociates.in>');
  const [replyTo, setReplyTo] = useState('huziefa@jhsassociates.in');
  const [bodyHtml, setBodyHtml] = useState(DEFAULT_MEMORIAL_EMAIL_BODY);

  // Employee Selection State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  // Modals
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const [showTestModal, setShowTestModal] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  // Fetch Employees & Draft data
  useEffect(() => {
    fetch('/api/admin/employees')
      .then((res) => {
        if (res.status === 401) {
          router.push('/donation-admin/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success) {
          setEmployees(data.employees);
          // By default, select all employees if creating fresh
          if (!draftIdParam) {
            setSelectedIds(data.employees.map((e: Employee) => e.id));
          }
        }
      })
      .finally(() => setLoadingEmployees(false));

    if (draftIdParam) {
      fetch(`/api/admin/email/drafts/${draftIdParam}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.draft) {
            const d = data.draft;
            setCampaignName(d.name);
            setSubject(d.subject);
            setFromEmail(d.from_email);
            setReplyTo(d.reply_to || '');
            setBodyHtml(d.body_html);
            setSelectedIds(d.selected_recipients || []);
          }
        });
    }
  }, [draftIdParam, router]);

  // Employee Filter & Selection Handlers
  const filteredEmployees = employees.filter((e) => {
    const q = employeeSearch.toLowerCase();
    return (
      e.full_name.toLowerCase().includes(q) ||
      e.employee_id.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q)
    );
  });

  const handleSelectAll = () => {
    setSelectedIds(employees.map((e) => e.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const toggleEmployeeSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Save Draft Handler
  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      if (draftId) {
        const res = await fetch(`/api/admin/email/drafts/${draftId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: campaignName,
            subject,
            fromEmail,
            replyTo,
            bodyHtml,
            selectedRecipients: selectedIds,
          }),
        });
        const data = await res.json();
        if (data.success) {
          alert('Draft updated successfully.');
        }
      } else {
        const res = await fetch('/api/admin/email/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: campaignName,
            subject,
            fromEmail,
            replyTo,
            bodyHtml,
            selectedRecipients: selectedIds,
          }),
        });
        const data = await res.json();
        if (data.success && data.draft) {
          setDraftId(data.draft.id);
          alert('Draft saved successfully.');
        }
      }
    } catch (e) {
      alert('Error saving draft.');
    } finally {
      setSavingDraft(false);
    }
  };

  // Send Test Email Handler
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) return;

    setSendingTest(true);
    try {
      const res = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testRecipient,
          subject,
          bodyHtml,
          fromEmail,
          replyTo,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Test email sent successfully to ${testRecipient}!`);
        setShowTestModal(false);
      } else {
        alert(`Failed to send test email: ${data.error}`);
      }
    } catch (err) {
      alert('Network error sending test email.');
    } finally {
      setSendingTest(false);
    }
  };

  // Confirm & Send Campaign Handler
  const handleSendCampaign = async () => {
    if (selectedIds.length === 0) {
      alert('Please select at least 1 recipient before sending.');
      return;
    }

    setIsSendingCampaign(true);
    try {
      // First ensure draft is saved/updated
      let targetDraftId = draftId;
      if (!targetDraftId) {
        const saveRes = await fetch('/api/admin/email/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: campaignName,
            subject,
            fromEmail,
            replyTo,
            bodyHtml,
            selectedRecipients: selectedIds,
          }),
        });
        const saveData = await saveRes.json();
        targetDraftId = saveData.draft.id;
      } else {
        await fetch(`/api/admin/email/drafts/${targetDraftId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: campaignName,
            subject,
            fromEmail,
            replyTo,
            bodyHtml,
            selectedRecipients: selectedIds,
          }),
        });
      }

      // Execute Campaign Send
      const sendRes = await fetch('/api/admin/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: targetDraftId }),
      });

      const sendData = await sendRes.json();
      if (sendData.success) {
        setShowConfirmModal(false);
        router.push(`/donation-admin/email/history/${targetDraftId}`);
      } else {
        alert(`Campaign send error: ${sendData.error}`);
      }
    } catch (err) {
      alert('Unexpected error dispatching campaign.');
    } finally {
      setIsSendingCampaign(false);
    }
  };

  // Sample employee for preview
  const sampleEmp: Partial<Employee> = {
    full_name: 'Rajesh Sharma',
    employee_id: 'JHS-2024-089',
    email: 'rajesh.sharma@jhsassociates.in',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Link href="/donation-admin/email" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Email Dashboard
            </Link>
            <h1 className="text-2xl font-extrabold text-white">Email Campaign Composer</h1>
            <p className="text-xs text-slate-400">Compose, personalize, and schedule Resend email delivery to JHS staff.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowPreview(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold uppercase tracking-wider border border-slate-700 transition flex items-center gap-2"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" /> Preview Email
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={savingDraft}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold uppercase tracking-wider border border-slate-700 transition flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" /> {savingDraft ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => setShowTestModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider border border-slate-700 transition flex items-center gap-2"
            >
              <Mail className="w-3.5 h-3.5 text-emerald-400" /> Send Test Email
            </button>
            <button
              onClick={() => {
                if (selectedIds.length === 0) {
                  alert('Please select at least 1 employee recipient.');
                  return;
                }
                setShowConfirmModal(true);
              }}
              className="btn-jhs-primary text-xs py-2.5 px-6 flex items-center gap-2 shadow-lg"
            >
              <Send className="w-4 h-4" /> SEND EMAIL CAMPAIGN
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Composer Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Campaign Name */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Campaign Settings</h3>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Campaign Name (Internal Admin Identifier)
                </label>
                <input
                  type="text"
                  required
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Ahmed Huziefa Unwala Memorial Announcement"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-red-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    From Address
                  </label>
                  <input
                    type="text"
                    required
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="Foundation of Hope <foundationofhope@jhsassociates.in>"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-red-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Reply-To Address
                  </label>
                  <input
                    type="email"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                    placeholder="huziefa@jhsassociates.in"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Email Subject Line
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="An Initiative in Memory of Ahmed Huziefa Unwala"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-semibold focus:border-red-500 outline-none"
                />
              </div>
            </div>

            {/* Email Body & Variables */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Email HTML Body Editor</h3>
                <span className="text-[10px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  HTML Supported
                </span>
              </div>

              {/* Variable Helper Pills */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Available Personalization Variables:</span>
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <button type="button" onClick={() => setBodyHtml((prev) => prev + ' {{full_name}}')} className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-0.5 rounded hover:bg-slate-800">
                    {'{{full_name}}'}
                  </button>
                  <button type="button" onClick={() => setBodyHtml((prev) => prev + ' {{employee_id}}')} className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-0.5 rounded hover:bg-slate-800">
                    {'{{employee_id}}'}
                  </button>
                  <button type="button" onClick={() => setBodyHtml((prev) => prev + ' {{email}}')} className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-0.5 rounded hover:bg-slate-800">
                    {'{{email}}'}
                  </button>
                  <button type="button" onClick={() => setBodyHtml((prev) => prev + ' {{foundation_url}}')} className="bg-slate-900 border border-slate-700 text-slate-200 px-2 py-0.5 rounded hover:bg-slate-800">
                    {'{{foundation_url}}'}
                  </button>
                </div>
              </div>

              <textarea
                rows={14}
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-mono focus:border-red-500 outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* RIGHT: Employee Recipient Selector (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-red-500" /> Recipient Selector
                  </h3>
                  <p className="text-[11px] text-slate-400">Select exact JHS staff recipients for this campaign.</p>
                </div>

                <div className="px-3 py-1.5 rounded-full bg-red-950 border border-red-800 text-red-400 font-bold text-xs">
                  Selected: {selectedIds.length}
                </div>
              </div>

              {/* Search & Bulk Select Controls */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-red-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <CheckSquare className="w-3.5 h-3.5" /> Select All ({employees.length})
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="text-slate-400 font-medium hover:text-white flex items-center gap-1"
                  >
                    <Square className="w-3.5 h-3.5" /> Deselect All
                  </button>
                </div>
              </div>

              {/* Employee Checkbox List */}
              <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-800/60 border border-slate-800 rounded-xl bg-slate-950">
                {loadingEmployees ? (
                  <div className="p-6 text-center text-xs text-slate-400">Loading employees list...</div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No employees match search query.</div>
                ) : (
                  filteredEmployees.map((emp) => {
                    const isSelected = selectedIds.includes(emp.id);
                    return (
                      <div
                        key={emp.id}
                        onClick={() => toggleEmployeeSelection(emp.id)}
                        className={`p-3 text-xs flex items-center justify-between cursor-pointer transition select-none ${
                          isSelected ? 'bg-red-950/20 text-white' : 'hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by div click
                            className="rounded border-slate-700 text-red-600 focus:ring-0"
                          />
                          <div>
                            <span className="font-bold text-white block">{emp.full_name}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{emp.employee_id} • {emp.email}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL 1: LIVE EMAIL PREVIEW */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3">
                <span className="jhs-badge bg-blue-600">LIVE PREVIEW</span>
                <span className="text-xs font-bold text-white hidden sm:inline">{subject}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 text-xs">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 ${
                      previewDevice === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" /> Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 ${
                      previewDevice === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                </div>
                <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Frame */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-950 flex items-center justify-center">
              <div
                className={`bg-white text-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-200 transition-all ${
                  previewDevice === 'mobile' ? 'max-w-xs' : 'max-w-2xl w-full'
                }`}
              >
                <div className="border-b border-slate-200 pb-4 mb-6 text-xs text-slate-500 space-y-1">
                  <div><strong>From:</strong> {fromEmail}</div>
                  <div><strong>Subject:</strong> {subject}</div>
                  <div><strong>To:</strong> Rajesh Sharma &lt;rajesh.sharma@jhsassociates.in&gt;</div>
                </div>

                <div
                  className="prose text-xs md:text-sm text-slate-800 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: personalizeEmail(bodyHtml, sampleEmp),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SEND TEST EMAIL */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-sm">Send Test Email</h3>
              </div>
              <button onClick={() => setShowTestModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Test emails send the currently edited HTML template through Resend to a single address. Test emails do <strong>NOT</strong> count toward employee campaign stats.
            </p>

            <form onSubmit={handleSendTest} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Recipient Test Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@jhsassociates.in"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2.5 text-xs text-slate-400 font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingTest}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-xl transition shadow-lg"
                >
                  {sendingTest ? 'Sending...' : 'Dispatch Test Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRM CAMPAIGN SEND */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-red-950 text-red-500 border border-red-800 flex items-center justify-center font-bold">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Confirm Email Campaign</h3>
                <p className="text-xs text-slate-400">Review dispatch parameters before launching campaign.</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block uppercase font-bold text-[10px]">Subject</span>
                <strong className="text-white font-semibold block">{subject}</strong>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[10px]">Target Recipients</span>
                  <strong className="text-emerald-400 font-extrabold text-sm">{selectedIds.length} Employees</strong>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[10px]">From Sender</span>
                  <strong className="text-slate-200 font-semibold block truncate">{fromEmail}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 text-xs text-slate-400 font-bold uppercase hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSendCampaign}
                disabled={isSendingCampaign}
                className="btn-jhs-primary text-xs py-3 px-7 shadow-lg flex items-center gap-2 uppercase tracking-wider"
              >
                {isSendingCampaign ? (
                  'Dispatching Batches...'
                ) : (
                  <>
                    CONFIRM & SEND CAMPAIGN <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminEmailComposerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center max-w-sm w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
            <p className="text-slate-600 font-medium text-sm">Loading Email Composer...</p>
          </div>
        </div>
      }
    >
      <ComposerContent />
    </Suspense>
  );
}
