import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 mb-2">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">ShopFlow</h1>
        <p className="text-sm text-slate-600">
          Customer-facing System of Record for RITOS (Refund Intelligence & Orchestration System).
        </p>

        <div className="p-4 bg-slate-50 rounded-lg text-left text-xs font-mono border border-slate-100 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">System Status:</span>
            <span className="text-emerald-600 font-semibold">ONLINE</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Health Endpoint:</span>
            <Link href="/api/health" className="text-indigo-600 hover:underline">/api/health</Link>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">RITOS Integration:</span>
            <span>MOCK_RITOS=true</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/products"
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm text-center transition"
          >
            Explore Catalog
          </Link>
          <Link
            href="/admin"
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm text-center transition"
          >
            Admin Console
          </Link>
        </div>
      </div>
    </main>
  );
}
