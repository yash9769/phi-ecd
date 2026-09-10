export function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-10 border-t border-slate-800 mt-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white text-xs">
                JHS
              </div>
              <span className="font-bold text-lg tracking-wider text-white">FOUNDATION OF HOPE</span>
            </div>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-md mb-6">
              Foundation of Hope is a memorial contribution initiative created by JHS & Associates LLP in loving memory of <strong>Ahmed Huziefa Unwala</strong>. This portal allows members of the JHS family to contribute in his honor.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              In Memory of Ahmed Huziefa Unwala
            </div>
          </div>

          <div>
            <h4 className="font-bold text-xs tracking-wider uppercase text-slate-300 mb-4 border-b border-slate-800 pb-2">
              Initiative
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href="#memorial" className="hover:text-white transition">Memorial Message</a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition">Contribution Guidance</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs tracking-wider uppercase text-slate-300 mb-4 border-b border-slate-800 pb-2">
              Organization
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              <strong className="text-slate-200 block">JHS & Associates LLP</strong>
              Chartered Accountants & Financial Advisors
            </p>
            <p className="text-xs text-slate-500">
              Internal Memorial Contribution Portal
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} JHS & Associates LLP. Foundation of Hope — In Memory of Ahmed Huziefa Unwala.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 transition cursor-pointer">Privacy Notice</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Employee Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
