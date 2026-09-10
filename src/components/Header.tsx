'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';

interface HeaderProps {
  currentStep?: number;
}

export function Header({ currentStep }: HeaderProps) {
  return (
    <header className="nb-header">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-red-500 font-bold shadow-md group-hover:scale-105 transition-transform">
          <Heart className="w-5 h-5 fill-red-500 text-red-500" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-sm md:text-base tracking-wider text-slate-900 uppercase">
            FOUNDATION OF HOPE
          </span>
          <span className="text-[10px] tracking-widest text-red-600 font-bold uppercase">
            In Loving Memory of Ahmed Huziefa Unwala
          </span>
        </div>
      </Link>

      <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
        {currentStep !== undefined && (
          <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
            <span className={`w-2 h-2 rounded-full ${currentStep >= 1 ? 'bg-red-600' : 'bg-slate-300'}`} />
            <span className={currentStep === 1 ? 'text-slate-900 font-bold' : 'text-slate-500'}>1. Memorial</span>
            <span className="text-slate-300">•</span>
            <span className={`w-2 h-2 rounded-full ${currentStep >= 2 ? 'bg-red-600' : 'bg-slate-300'}`} />
            <span className={currentStep === 2 ? 'text-slate-900 font-bold' : 'text-slate-500'}>2. Employee Info</span>
            <span className="text-slate-300">•</span>
            <span className={`w-2 h-2 rounded-full ${currentStep >= 3 ? 'bg-red-600' : 'bg-slate-300'}`} />
            <span className={currentStep === 3 ? 'text-slate-900 font-bold' : 'text-slate-500'}>3. Contribution</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
          JHS Memorial Initiative
        </span>
      </div>
    </header>
  );
}
