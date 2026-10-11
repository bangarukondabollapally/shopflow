import Link from "next/link";
import { ArrowLeft, Shield, Sliders, RefreshCw, Database, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-indigo-400" />
          <span className="font-bold text-lg tracking-tight">ShopFlow Admin & Support Console</span>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">RITOS Integration</span>
        </div>
        <Link href="/" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
        </Link>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Console Hub</h1>
          <p className="text-sm text-slate-500 mt-1">
            System of Record operations, order delivery simulation, RITOS human review queue, and refund execution status.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Link
              href="/admin/orders"
              className="p-4 rounded-lg border border-indigo-200 bg-indigo-50/30 hover:border-indigo-400 transition block group"
            >
              <div className="flex items-center gap-2 font-semibold text-slate-800 mb-2 group-hover:text-indigo-600 transition">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Phase 3: Orders & Delivery</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Simulate order fulfillment, mark as DELIVERED N days ago, and view transaction records.
              </p>
              <span className="text-xs font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                Live & Ready →
              </span>
            </Link>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
                <RefreshCw className="w-4 h-4 text-emerald-600" />
                <span>Phase 7: Human Review</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Manage tickets escalated by RITOS with confidence, explanation, and action controls.
              </p>
              <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                Phase 7
              </span>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
                <Database className="w-4 h-4 text-purple-600" />
                <span>Phase 8: RITOS Console</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Live exchange inspection, payload contract verification, and test event replay.
              </p>
              <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                Phase 8
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-900 text-xs">
          <strong>Phase 2 Acceptance Verification:</strong> You can test the storefront catalog, browse products with policy panels, and execute UPI / Card checkouts. Use the top navigation bar to access Products, Cart, and Account.
        </div>
      </main>
    </div>
  );
}
