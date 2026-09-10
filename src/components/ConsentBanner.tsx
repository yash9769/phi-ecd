'use client';

import { useState, useEffect } from 'react';
import { telemetry } from '@/lib/telemetry';
import { ShieldCheck, Check, X } from 'lucide-react';

export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const status = telemetry.getConsentStatus();
    if (status === 'pending') {
      setShow(true);
    } else if (status === 'accepted') {
      // Trigger session start on server
      telemetry.startSessionOnServer();
    }
  }, []);

  const handleAccept = () => {
    telemetry.setConsent('accepted');
    setShow(false);
  };

  const handleDecline = () => {
    telemetry.setConsent('declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 animate-fade-up">
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-2xl border border-slate-800 backdrop-blur-md bg-opacity-95">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-800 text-red-400 rounded-xl flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-white mb-1">
              Privacy & Analytics Notice
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              We collect anonymous interaction analytics (page views, button clicks, form focus) to understand how employees use the Foundation of Hope portal. No passwords or form field values are recorded.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <Check className="w-3.5 h-3.5" /> Accept Analytics
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <X className="w-3.5 h-3.5" /> Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
