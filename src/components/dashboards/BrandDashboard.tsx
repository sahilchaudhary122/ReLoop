import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Search,
  Filter,
  Layers,
  TrendingUp,
  Clock,
  Printer,
  Building,
  UserCheck
} from 'lucide-react';
import { User, EventLedgerItem, RiskAnomaly, EPRObligationStats } from '../../types';
import {
  getStoredEvents,
  getStoredRisks,
  updateRiskStatus,
  INITIAL_EPR_STATS,
  getStoredBatches,
} from '../../services/mockData';

interface BrandDashboardProps {
  currentUser: User;
}

export const BrandDashboard: React.FC<BrandDashboardProps> = ({ currentUser }) => {
  const [events, setEvents] = useState<EventLedgerItem[]>(getStoredEvents());
  const [risks, setRisks] = useState<RiskAnomaly[]>(getStoredRisks());
  const [stats, setStats] = useState<EPRObligationStats>(INITIAL_EPR_STATS);
  const [selectedEvent, setSelectedEvent] = useState<EventLedgerItem | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleResolveRisk = (riskId: string, status: 'cleared' | 'rejected') => {
    const notes = status === 'cleared' ? 'Reviewed and approved by CPCB compliance officer.' : 'Rejected due to weight mismatch verification failure.';
    updateRiskStatus(riskId, status, notes);
    setRisks(getStoredRisks());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-purple-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-xs mb-3 text-purple-200">
            <Building className="w-3.5 h-3.5" />
            <span>Layer 4 • Brand & PRO Compliance Visibility Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            {currentUser.name}
          </h1>
          <p className="text-xs text-purple-200 mt-1 max-w-xl">
            Centralized monitoring of EPR targets, verifiable informal first-mile attribution, tamper-evident audit ledger, and CPCB-ready compliance reporting.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Generate CPCB-Ready Report</span>
          </button>
        </div>
      </div>

      {/* EPR Obligation Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Annual EPR Obligation
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1 font-display">
            {stats.targetKg.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">CPCB Registered Target</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Verified Fulfillment
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-display">
            {stats.verifiedFulfillmentKg.toLocaleString()} <span className="text-xs font-normal text-emerald-600">kg</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            {stats.percentageFulfillment}% of target achieved
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
            Informal First-Mile Channel
          </span>
          <div className="text-2xl font-black text-purple-700 mt-1 font-display">
            {stats.informalChannelKg.toLocaleString()} <span className="text-xs font-normal text-purple-600">kg</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Direct from informal collectors</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            Chain-of-Custody Integrity
          </span>
          <div className="text-2xl font-black text-blue-700 mt-1 font-display">
            100%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Zero unverified entries</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-800">
            EPR Target Fulfillment Progress: {stats.verifiedFulfillmentKg} / {stats.targetKg} kg
          </span>
          <span className="font-black text-emerald-600 text-sm">
            {stats.percentageFulfillment}%
          </span>
        </div>
        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all"
            style={{ width: `${stats.percentageFulfillment}%` }}
          />
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {stats.categoryBreakdown.map((cat, idx) => (
            <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
              <div className="text-slate-500 truncate">{cat.name}</div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                {cat.kg.toLocaleString()} kg
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk and Anomaly Detection Center */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Automated Rule-Based Risk & Anomaly Detection
            </span>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Audit Flags & Discrepancy Queue
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ReLoop detects duplicate photos using perceptual image hashing, unusual weight swings, and GPS trajectory anomalies without complex blackbox ML.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {risks.map((risk) => (
            <div
              key={risk.id}
              className={`p-4 rounded-xl border transition-all ${
                risk.status === 'flagged'
                  ? 'bg-amber-50/60 border-amber-300'
                  : risk.status === 'cleared'
                  ? 'bg-slate-50 border-slate-200 opacity-80'
                  : 'bg-rose-50/60 border-rose-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200">
                    Batch: {risk.batchId}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      risk.status === 'flagged'
                        ? 'bg-amber-200 text-amber-900'
                        : risk.status === 'cleared'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-200 text-rose-900'
                    }`}
                  >
                    {risk.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    {risk.description}
                  </span>
                </div>

                {risk.status === 'flagged' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolveRisk(risk.id, 'cleared')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Clear Flag
                    </button>
                    <button
                      onClick={() => handleResolveRisk(risk.id, 'rejected')}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject Batch
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-2 text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>Recorded Value: <strong className="font-mono text-slate-800">{risk.recordedValue}</strong></div>
                <div>Expected Value: <strong className="font-mono text-slate-800">{risk.expectedValue}</strong></div>
                <div>Detected: {new Date(risk.detectedAt).toLocaleString()}</div>
              </div>

              {risk.notes && (
                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 italic">
                  Resolution Note: {risk.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Immutable Event Ledger Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              Event Ledger (The Heart of ReLoop)
            </span>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Cryptographic Append-Only Audit Trail
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every critical action creates a verifiable digital event answering: Who? What? When? Where? Which batch? Which role?
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-purple-800 bg-purple-100 px-2 py-0.5 rounded text-[11px]">
                    {evt.eventCode}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{evt.title}</span>
                  <span className="font-mono text-[11px] text-slate-500">
                    [{evt.batchId}]
                  </span>
                </div>
                <p className="text-slate-600 text-xs">{evt.details}</p>
                <div className="text-[11px] text-slate-400 flex items-center gap-3">
                  <span>Actor: <strong className="text-slate-700">{evt.actorName}</strong></span>
                  <span>•</span>
                  <span>{new Date(evt.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {evt.metadata && (
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-600 space-y-0.5 shrink-0 sm:max-w-xs">
                  {Object.entries(evt.metadata).map(([k, v]) => (
                    <div key={k} className="truncate">
                      {k}: <strong>{String(v)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CPCB-Ready Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 space-y-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="text-center border-b-2 border-slate-900 pb-5">
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Form 1(A) • Extended Producer Responsibility Audit Verification
              </div>
              <h3 className="text-xl font-black text-slate-900 font-display mt-1">
                COMPLIANCE-READY / CPCB-READY REPORT
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Generated via ReLoop Digital Chain-of-Custody Architecture
              </p>
              <div className="inline-block mt-2 px-3 py-1 bg-slate-100 font-mono text-[11px] text-slate-800 rounded font-semibold">
                Report Reference: RELOOP-EPR-2026-0910-B9
              </div>
            </div>

            {/* Report Content Table */}
            <div className="space-y-4 text-xs text-slate-800">
              <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Brand / PRO Entity</div>
                  <div className="font-bold text-slate-900">EcoCorp Electronics Ltd (PRO-302)</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Reporting Period</div>
                  <div className="font-bold text-slate-900">FY 2025-2026 (Q4 Complete)</div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2">
                  1. Quantitative Fulfillment Summary:
                </span>
                <table className="w-full border border-slate-200 text-left text-xs">
                  <thead className="bg-slate-100 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Material Category</th>
                      <th className="p-2">Obligation (kg)</th>
                      <th className="p-2">Verified Recycled (kg)</th>
                      <th className="p-2">Fulfillment %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    <tr>
                      <td className="p-2">IT & Telecom (ITEW1 to ITEW16)</td>
                      <td className="p-2">5,500</td>
                      <td className="p-2">4,100</td>
                      <td className="p-2 text-emerald-600 font-bold">74.5%</td>
                    </tr>
                    <tr>
                      <td className="p-2">Consumer Electronics (CEEW1 to CEEW5)</td>
                      <td className="p-2">3,000</td>
                      <td className="p-2">2,200</td>
                      <td className="p-2 text-emerald-600 font-bold">73.3%</td>
                    </tr>
                    <tr>
                      <td className="p-2">Batteries & Lead Acid</td>
                      <td className="p-2">1,500</td>
                      <td className="p-2">1,120</td>
                      <td className="p-2 text-emerald-600 font-bold">74.6%</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td className="p-2">Total Verified Fulfillment</td>
                      <td className="p-2">10,000</td>
                      <td className="p-2">7,420</td>
                      <td className="p-2 text-emerald-700">74.2%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2">
                  2. First-Mile Informal Collector Attribution:
                </span>
                <p className="text-slate-600 text-[11px]">
                  <strong>2,850 kg (38.4% of total volume)</strong> was collected directly through certified informal collectors using ReLoop's offline-first mobile app with GPS tagging and tamper-evident digital scales.
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2">
                  3. Circularity Pathways Applied:
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <div className="font-bold text-blue-700">Refurbished</div>
                    <div className="font-mono">1,840 kg</div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <div className="font-bold text-indigo-700">Component Recovery</div>
                    <div className="font-mono">1,210 kg</div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <div className="font-bold text-emerald-700">Materials Recycling</div>
                    <div className="font-mono">4,120 kg</div>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <div className="font-bold text-purple-700">Direct Reuse</div>
                    <div className="font-mono">250 kg</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                <strong>Audit Disclaimer:</strong> This document is labeled as a "Compliance-ready / CPCB-ready report" based on digitally verified chain of custody events. It is designed to be submitted alongside formal CPCB portal filings.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowReportModal(false)}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Download Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
