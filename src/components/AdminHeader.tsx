'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Activity, BarChart3, Mail, LogOut, Heart } from 'lucide-react';

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/donation-admin/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/donation-admin', icon: LayoutDashboard },
    { label: 'Employees', href: '/donation-admin/employees', icon: Users },
    { label: 'Email System', href: '/donation-admin/email', icon: Mail },
    { label: 'Sessions', href: '/donation-admin/sessions', icon: Activity },
    { label: 'Telemetry', href: '/donation-admin/telemetry', icon: BarChart3 },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/donation-admin" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm uppercase tracking-wider text-white block">
                FOUNDATION OF HOPE
              </span>
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest block">
                JHS Admin Portal
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href) && (item.href !== '/donation-admin' || pathname === '/donation-admin');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href) && (item.href !== '/donation-admin' || pathname === '/donation-admin');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`p-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex flex-col items-center gap-1 ${
                  isActive ? 'text-red-500 font-extrabold' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
