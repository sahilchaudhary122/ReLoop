import React, { useState } from 'react';
import {
  QrCode,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Scale,
  RefreshCw,
  AlertCircle,
  FileCheck2,
  Box,
  Sliders
} from 'lucide-react';
import { User, CollectionBatch, CircularityPathway } from '../../types';
import { getStoredBatches, saveBatch, addEvent } from '../../services/mockData';
import { QRCodeSVG } from '../common/QRCodeSVG';

interface RecyclerDashboardProps {
  currentUser: User;
}

export const RecyclerDashboard: React.FC<RecyclerDashboardProps> = ({ currentUser }) => {
  const [batches, setBatches] = useState<CollectionBatch[]>(getStoredBatches());
  const [selectedBatch, setSelectedBatch] = useState<CollectionBatch | null>(batches[0] || null);
  const [searchBatchId, setSearchBatchId] = useState('');
  const [receivedWeight, setReceivedWeight] = useState('11.7');
  const [selectedPathway, setSelectedPathway] = useState<CircularityPathway>('REFURBISH');
  const [processingNotes, setProcessingNotes] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // AI Circularity Assistant state
  const [aiItemType, setAiItemType] = useState('Laptop');
  const [aiCondition, setAiCondition] = useState('Good condition, powers on, minor chassis scratch');
  const [aiAgeYears, setAiAgeYears] = useState('3');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    pathway: CircularityPathway;
    confidence: string;
    reusableComponents: string[];
    notes: string;
  } | null>({
    pathway: 'REFURBISH',
    confidence: '94%',
    reusableComponents: ['RAM (16GB DDR4)', 'NVMe SSD (512GB)', 'IPS FHD Display Panel', 'Keyboard & Chassis'],
    notes: 'Unit meets refurbishment criteria. High secondary market utility. Diverting from material shredding reduces 18.4 kg CO2e.',
  });

  const handleSearchBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = batches.find(
      (b) => b.id.toLowerCase() === searchBatchId.trim().toLowerCase()
    );
    if (found) {
      setSelectedBatch(found);
    } else {
      alert(`Batch ID "${searchBatchId}" not found in local ledger`);
    }
  };

  const handleConfirmProcessing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    const recWeightNum = parseFloat(receivedWeight) || 11.7;

    const updatedBatch: CollectionBatch = {
      ...selectedBatch,
      recyclerWeightKg: recWeightNum,
      circularityPath: selectedPathway,
      status: 'processed',
      notes: processingNotes || `Processed under pathway: ${selectedPathway}`,
    };

    saveBatch(updatedBatch);

    // Event 004 Recycler received batch
    addEvent({
      eventCode: 'EVENT 004',
      title: 'Recycler Received Batch',
      actorRole: 'recycler',
      actorName: currentUser.name,
      batchId: updatedBatch.id,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      details: `Batch received at facility. Digital scale confirmed ${recWeightNum} kg.`,
      metadata: { recyclerWeightKg: recWeightNum, facilityLicense: currentUser.organization || 'REC-884' },
    });

    // Event 005 Recycler processed batch
    addEvent({
      eventCode: 'EVENT 005',
      title: 'Recycler Processed Batch',
      actorRole: 'recycler',
      actorName: currentUser.name,
      batchId: updatedBatch.id,
      timestamp: new Date().toISOString(),
      details: `Circularity pathway selected: ${selectedPathway}. Recovery and dismantling logged.`,
      metadata: { circularityPathway: selectedPathway },
    });

    // Event 006 EPR eligibility created
    addEvent({
      eventCode: 'EVENT 006',
      title: 'EPR Eligibility Created',
      actorRole: 'brand_cpcb',
      actorName: 'CPCB Automated Verification Engine',
      batchId: updatedBatch.id,
      timestamp: new Date().toISOString(),
      details: `${recWeightNum} kg verified credit generated for EPR portal compliance.`,
      metadata: { eprCreditKg: recWeightNum },
    });

    setBatches(getStoredBatches());
    setSelectedBatch(updatedBatch);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  // Run AI Circularity evaluation
  const runAiCircularityCheck = () => {
    setAiLoading(true);
    setTimeout(() => {
      setAiLoading(false);
      if (aiItemType === 'Mobile' || aiItemType === 'Tablet') {
        setAiResult({
          pathway: 'COMPONENT RECOVERY',
          confidence: '89%',
          reusableComponents: ['Camera Module', 'Battery Connector', 'OLED Screen Subassembly', 'Precious Metal PCB Pinouts'],
          notes: 'High precious metal density. Dismantle battery safely before board extraction.',
        });
      } else if (aiItemType === 'Printer' || aiItemType === 'Television / Screen') {
        setAiResult({
          pathway: 'RECYCLE',
          confidence: '96%',
          reusableComponents: ['Stepper Motors', 'Power Supply Board', 'Extruded Copper Wiring', 'High-Impact ABS Plastic'],
          notes: 'Dismantle chassis plastics from steel chassis for maximum clean material recovery.',
        });
      } else {
        setAiResult({
          pathway: 'REFURBISH',
          confidence: '95%',
          reusableComponents: ['RAM (16GB)', 'NVMe SSD', 'Display Panel', 'Chassis Hinges'],
          notes: 'Device condition is prime for second-life educational or commercial deployment.',
        });
      }
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-xs mb-3 text-blue-200">
            <Cpu className="w-3.5 h-3.5" />
            <span>Layer 3 • Authorized Recycler & Refurbisher Facility</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            {currentUser.name}
          </h1>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Downstream partner portal. Scan batch QR codes, record digital receipt scale weights, enforce the circularity hierarchy (Reuse &gt; Refurbish &gt; Component Recovery &gt; Recycle), and release CPCB-compliant audit logs.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-xs space-y-1">
          <div className="text-blue-200 uppercase tracking-wider font-semibold text-[10px]">
            Facility License
          </div>
          <div className="font-bold text-white font-mono">CPCB-REC-2026-BLR-884</div>
          <div className="text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero-Landfill Certified
          </div>
        </div>
      </div>

      {showSuccessToast && (
        <div className="p-4 bg-emerald-500 text-white rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div className="text-xs font-semibold">
            Batch {selectedBatch?.id} successfully verified and circularity outcome recorded! Event 004, 005, and 006 generated on the digital ledger.
          </div>
        </div>
      )}

      {/* Main Grid: QR Scanner / Search & Active Batch Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Batches List & QR Lookup */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900 font-display">
                Batch QR Scanner / ID Lookup
              </h2>
            </div>

            <form onSubmit={handleSearchBatch} className="flex gap-2">
              <input
                type="text"
                value={searchBatchId}
                onChange={(e) => setSearchBatchId(e.target.value)}
                placeholder="Enter Batch ID (e.g. CB-00071)"
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Scan
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Batches in Receiving Queue:
              </span>
              <div className="space-y-2">
                {batches.map((batch) => (
                  <button
                    key={batch.id}
                    onClick={() => setSelectedBatch(batch)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedBatch?.id === batch.id
                        ? 'border-indigo-500 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="font-mono text-slate-900">{batch.id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 uppercase text-slate-700">
                        {batch.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                      <span>Collector: {batch.collectorName}</span>
                      <span className="font-bold text-slate-800">{batch.declaredWeightKg} kg</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recycler Facility Inventory */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Downstream Inventory Breakdown (kg)
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Mobile Phones:</span>
                <span className="font-bold text-slate-900">42 kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Laptops & PCs:</span>
                <span className="font-bold text-slate-900">31 kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">PCBs / Circuit Boards:</span>
                <span className="font-bold text-slate-900">18 kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Lithium Batteries:</span>
                <span className="font-bold text-slate-900">9 kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Copper Cables & Cords:</span>
                <span className="font-bold text-slate-900">27 kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Active Batch Verification & Circularity Selector */}
        <div className="lg:col-span-2 space-y-6">
          {selectedBatch ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold font-mono text-slate-900">
                      {selectedBatch.id}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase bg-blue-100 text-blue-800">
                      {selectedBatch.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Originated from Citizen Request: <strong className="font-mono">{selectedBatch.pickupRequestId}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <QRCodeSVG value={selectedBatch.id} size={50} />
                </div>
              </div>

              {/* Weight Progression Audit Trail */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Chain of Custody Weight Progression (Audit Trail)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-slate-500 text-[11px]">1. Collector Recorded</div>
                    <div className="text-lg font-black text-slate-900">
                      {selectedBatch.declaredWeightKg} kg
                    </div>
                    <div className="text-[10px] text-slate-400">At field pickup</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="text-slate-500 text-[11px]">2. Aggregator Verified</div>
                    <div className="text-lg font-black text-slate-900">
                      {selectedBatch.aggregatorWeightKg || '11.9'} kg
                    </div>
                    <div className="text-[10px] text-slate-400">At aggregation dock</div>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <div className="text-indigo-900 font-semibold text-[11px]">3. Recycler Received</div>
                    <div className="text-lg font-black text-indigo-700">
                      {selectedBatch.recyclerWeightKg || receivedWeight} kg
                    </div>
                    <div className="text-[10px] text-indigo-600">Final verified weight</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  All three weight events are cryptographically recorded on the immutable ledger rather than overwriting with one single number.
                </p>
              </div>

              {/* Circularity Pathways Selector */}
              <div className="pt-2">
                <div className="mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    Select Final Circularity Pathway
                  </span>
                  <p className="text-xs text-slate-500">
                    ReLoop enforces circularity: Not all e-waste should be destroyed or shredded.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['REUSE', 'REFURBISH', 'COMPONENT RECOVERY', 'RECYCLE'] as CircularityPathway[]).map((path) => (
                    <button
                      key={path}
                      type="button"
                      onClick={() => setSelectedPathway(path)}
                      className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        selectedPathway === path
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {path}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recycler Processing Form */}
              <form onSubmit={handleConfirmProcessing} className="space-y-4 pt-3 border-t border-slate-100 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Received Scale Weight (kg):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={receivedWeight}
                      onChange={(e) => setReceivedWeight(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Technician / Line Notes:
                    </label>
                    <input
                      type="text"
                      value={processingNotes}
                      onChange={(e) => setProcessingNotes(e.target.value)}
                      placeholder="e.g. Dismantled RAM/SSD; housing diverted to ABS pelletizer"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Confirm Receipt & Release EPR Credit</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500">
              Select a batch from the queue or search by ID above.
            </div>
          )}

          {/* AI Circularity Assistant */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 p-6 rounded-2xl border border-indigo-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-display">
                    Circularity Pathway Assistant
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Analyzes item condition & recommends REUSE / REFURBISH / COMPONENT RECOVERY / RECYCLE.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1 font-medium">Device Type:</label>
                <select
                  value={aiItemType}
                  onChange={(e) => setAiItemType(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="Laptop">Laptop (e.g. ThinkPad / MacBook)</option>
                  <option value="Mobile">Smartphone (e.g. Pixel / iPhone)</option>
                  <option value="Printer">Laser / Inkjet Printer</option>
                  <option value="Television / Screen">LED Display / Television</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Age (Years):</label>
                <input
                  type="number"
                  value={aiAgeYears}
                  onChange={(e) => setAiAgeYears(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Physical Condition:</label>
                <input
                  type="text"
                  value={aiCondition}
                  onChange={(e) => setAiCondition(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={runAiCircularityCheck}
              disabled={aiLoading}
              className="py-2 px-4 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{aiLoading ? 'Analyzing Specs...' : 'Run Circularity AI Analysis'}</span>
            </button>

            {aiResult && (
              <div className="p-4 bg-white rounded-xl border border-indigo-200 shadow-2xs space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    AI Recommendation:{' '}
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded uppercase font-black">
                      {aiResult.pathway}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400">Confidence: {aiResult.confidence}</span>
                </div>

                <div>
                  <span className="font-medium text-slate-600 block mb-1">
                    Reusable Components Recoverable:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiResult.reusableComponents.map((comp, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-[11px] font-semibold"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  {aiResult.notes}
                </p>

                <p className="text-[10px] text-slate-400 italic">
                  * Note: AI only provides an engineering recommendation. Final EPR eligibility is governed by human verification and digital scale receipts.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
