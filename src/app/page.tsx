'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { telemetry } from '@/lib/telemetry';

export default function CybersecurityAwarenessPage() {
  useEffect(() => {
    telemetry.trackPageView('Cybersecurity Awareness Campaign - Phishing Demonstration');
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-red-500 selection:text-white relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-red-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-amber-600/15 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-2xl mx-auto space-y-6 z-10 my-auto">
        {/* Main Alert Card */}
        <div className="bg-slate-900/90 border border-red-900/60 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6 text-center">
          
          {/* White Hacker Mask Image Display */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto rounded-2xl overflow-hidden border-2 border-red-500/40 shadow-2xl group transition-all duration-300 hover:scale-105 hover:border-red-500">
            <Image
              src="/hacker-white-mask.jpg"
              alt="Hacker White Mask"
              fill
              className="object-cover object-center transform transition-transform duration-500 group-hover:scale-110"
              priority
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
          </div>

          {/* Main Headline */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-red-500 uppercase drop-shadow-md">
              YOU'VE BEEN HACKED!
            </h1>
          </div>

          {/* Explanation Text */}
          <div className="space-y-4 text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            <p className="font-medium text-slate-200">
              Don't worry! This was an internal cybersecurity awareness campaign designed to demonstrate how easily a convincing message can make someone share information without first verifying its source.
            </p>
          </div>

          {/* Key Lesson Box */}
          <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-5 sm:p-6 text-left space-y-3 shadow-inner">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs sm:text-sm uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>The Key Lesson</span>
            </div>
            <p className="text-amber-100 font-bold text-lg sm:text-xl leading-snug">
              Stop. Verify. Think before you share information or take action online.
            </p>
          </div>

          {/* Thank You Note */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center space-x-2 text-slate-400 font-medium text-sm sm:text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Thank you for participating.</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-slate-500">
          Internal Information Security & Compliance Awareness Campaign
        </div>
      </div>
    </main>
  );
}
