'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
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
        </div>
      </div>
    </main>
  );
}
