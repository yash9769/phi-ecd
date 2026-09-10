'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHeader } from '@/components/AdminHeader';
import { Employee, Payment } from '@/lib/types';
import { Search, Download, CheckCircle2, Clock, XCircle, Filter } from 'lucide-react';

type EmployeeWithPayment = Employee & { payments?: Payment[] };

export default function AdminEmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeWithPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Filter logic
  const filteredEmployees = employees.filter((emp) => {
    const query = search.toLowerCase();
    const matchesSearch =
      emp.full_name.toLowerCase().includes(query) ||
      emp.employee_id.toLowerCase().includes(query) ||
      emp.phone.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query);

    const pay = emp.payments?.[0];
    const status = pay ? pay.status : 'pending';

    let matchesStatus = true;
    if (statusFilter !== 'all') {
      matchesStatus = status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <AdminHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header & Export Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="jhs-badge bg-red-600 mb-1">EMPLOYEE RECORDS</span>
            <h1 className="text-2xl font-extrabold text-white">Registered Employee Contributions</h1>
            <p className="text-xs text-slate-400">Search and audit employee forms and payment statuses.</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/api/admin/export/csv?type=employees"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-700 transition flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-red-500" /> Export CSV
            </a>
            <a
              href="/api/admin/export/excel?type=employees"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" /> Export Excel (.xlsx)
            </a>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Name, Employee ID, Phone, or Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:border-red-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none"
            >
              <option value="all">All Payment Statuses</option>
              <option value="successful">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Employee Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading employee records...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No employee records match search criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6 font-bold">Employee Name</th>
                    <th className="py-4 px-6 font-bold">Employee ID</th>
                    <th className="py-4 px-6 font-bold">Contact Info</th>
                    <th className="py-4 px-6 font-bold">Submission Date</th>
                    <th className="py-4 px-6 font-bold">Contribution</th>
                    <th className="py-4 px-6 font-bold">Status</th>
                    <th className="py-4 px-6 font-bold">Reference Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredEmployees.map((emp) => {
                    const pay = emp.payments?.[0];
                    const status = pay ? pay.status : 'pending';

                    return (
                      <tr key={emp.id} className="hover:bg-slate-800/50 transition">
                        <td className="py-4 px-6 font-semibold text-white">{emp.full_name}</td>
                        <td className="py-4 px-6 font-mono text-slate-300">{emp.employee_id}</td>
                        <td className="py-4 px-6">
                          <div className="font-mono text-slate-300">{emp.phone}</div>
                          <div className="text-slate-400">{emp.email}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-400">
                          {new Date(emp.created_at).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 font-bold text-emerald-400">
                          {pay ? `₹${pay.amount.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="py-4 px-6">
                          {status === 'successful' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3" /> Successful
                            </span>
                          )}
                          {status === 'pending' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950 text-amber-400 border border-amber-800 font-bold text-[10px]">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                          {status === 'failed' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 font-bold text-[10px]">
                              <XCircle className="w-3 h-3" /> Failed
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                          {pay ? pay.transaction_ref : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
