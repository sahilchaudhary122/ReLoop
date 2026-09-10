import React, { useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Gift,
  ArrowRight,
  Plus,
  FileText,
  Smartphone,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Download,
  AlertCircle,
  Truck
} from 'lucide-react';
import { User, PickupRequest, PickupItem, CircularityPathway } from '../../types';
import { getStoredPickups, savePickup, addEvent } from '../../services/mockData';
import { QRCodeSVG } from '../common/QRCodeSVG';

interface CitizenDashboardProps {
  currentUser: User;
  onOpenWhatsApp: () => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  currentUser,
  onOpenWhatsApp,
}) => {
  const [pickups, setPickups] = useState<PickupRequest[]>(getStoredPickups());
  const [showNewPickupModal, setShowNewPickupModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PickupRequest | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  // New pickup form state
  const [city, setCity] = useState('Bengaluru');
  const [address, setAddress] = useState('');
  const [mobileCount, setMobileCount] = useState(1);
  const [laptopCount, setLaptopCount] = useState(0);
  const [printerCount, setPrinterCount] = useState(0);
  const [chargerCount, setChargerCount] = useState(2);
  const [batteryCount, setBatteryCount] = useState(0);
  const [notes, setNotes] = useState('');

  // Filter pickups for this user (or all if demo)
  const myPickups = pickups.filter(
    (p) => p.citizenEmail === currentUser.email || p.citizenName.toLowerCase().includes('priya') || true
  );

  const handleCreatePickup = (e: React.FormEvent) => {
    e.preventDefault();
    const items: PickupItem[] = [];
    const randSuffix = Math.random().toString(36).substring(2, 6);
    if (mobileCount > 0) items.push({ id: `i_${Date.now()}_1_${randSuffix}`, category: 'Mobile', count: Number(mobileCount), estimatedWeightKg: mobileCount * 0.2 });
    if (laptopCount > 0) items.push({ id: `i_${Date.now()}_2_${randSuffix}`, category: 'Laptop', count: Number(laptopCount), estimatedWeightKg: laptopCount * 2.2 });
    if (printerCount > 0) items.push({ id: `i_${Date.now()}_3_${randSuffix}`, category: 'Printer', count: Number(printerCount), estimatedWeightKg: printerCount * 7.5 });
    if (chargerCount > 0) items.push({ id: `i_${Date.now()}_4_${randSuffix}`, category: 'Charger / Cable', count: Number(chargerCount), estimatedWeightKg: chargerCount * 0.3 });
    if (batteryCount > 0) items.push({ id: `i_${Date.now()}_5_${randSuffix}`, category: 'Battery', count: Number(batteryCount), estimatedWeightKg: batteryCount * 0.4 });

    if (items.length === 0) {
      alert('Please add at least one e-waste item');
      return;
    }

    const newId = `PR-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPickup: PickupRequest = {
      id: newId,
      citizenId: currentUser.id,
      citizenName: currentUser.name,
      citizenPhone: currentUser.phone || '+91 98765 43210',
      address: address || 'Indiranagar 12th Cross, Bengaluru',
      city: city || 'Bengaluru',
      items,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    savePickup(newPickup);
    setPickups(getStoredPickups());
    setShowNewPickupModal(false);

    // Reset fields
    setAddress('');
    setMobileCount(1);
    setLaptopCount(0);
    setPrinterCount(0);
    setChargerCount(2);
    setBatteryCount(0);
  };

  const handleSimulatedRedeem = () => {
    setRedeemSuccess(true);
    setTimeout(() => setRedeemSuccess(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs font-semibold backdrop-blur-xs mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span>Citizen Portal • Verified Chain of Custody</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              Welcome, {currentUser.name}
            </h1>
            <p className="mt-1 text-emerald-100 text-sm max-w-xl">
              Schedule free doorstep e-waste pickups by authorized informal collectors. Track your devices transparently all the way to formal circularity.
            </p>
          </div>

          {/* Rewards Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-5 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-200">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
                Green Reward Points
              </div>
              <div className="text-2xl font-black text-white">
                120 <span className="text-xs font-normal text-emerald-200">pts (₹120)</span>
              </div>
              <button
                onClick={handleSimulatedRedeem}
                className="mt-1.5 text-xs font-semibold underline text-white hover:text-emerald-200 cursor-pointer"
              >
                Simulate UPI Payout
              </button>
            </div>
          </div>
        </div>

        {redeemSuccess && (
          <div className="mt-4 p-3 bg-emerald-900/80 border border-emerald-400 rounded-lg text-xs text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Simulated instant payout of ₹120 initiated to your linked UPI VPA ({currentUser.email.split('@')[0]}@okhdfcbank)!</span>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Your E-Waste Requests & Waste Journey
          </h2>
          <p className="text-xs text-slate-500">
            Answers the question: <span className="font-semibold text-slate-700">"Where did my e-waste go?"</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="citizen-whatsapp-btn"
            onClick={onOpenWhatsApp}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Book via WhatsApp Bot</span>
          </button>

          <button
            id="citizen-new-pickup-btn"
            onClick={() => setShowNewPickupModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Request Doorstep Pickup</span>
          </button>
        </div>
      </div>

      {/* Pickup Requests Cards with Visual Journey */}
      <div className="space-y-6">
        {myPickups.map((req, idx) => {
          // Determine stage index
          const stages = [
            { key: 'pending', label: 'Pickup Requested', desc: 'Assigned to trusted collector' },
            { key: 'collected', label: 'Collected', desc: 'Photo & weight captured on scale' },
            { key: 'aggregator_verified', label: 'Aggregator Verified', desc: 'Central hub weighed & sorted' },
            { key: 'recycler_received', label: 'Recycler Received', desc: 'Formal R-Hub verified' },
            { key: 'processing_completed', label: 'Processing Completed', desc: 'Circularity & EPR credit sealed' },
          ];

          const currentStageIndex =
            req.status === 'processing_completed' ? 4 :
            req.status === 'recycler_received' ? 3 :
            req.status === 'aggregator_verified' ? 2 :
            req.status === 'collected' ? 1 : 0;

          return (
            <div
              key={`${req.id}-${idx}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
            >
              {/* Card Header */}
              <div className="p-5 sm:p-6 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    {req.id.replace('PR-', '#')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-base font-mono">
                        {req.id}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase bg-emerald-100 text-emerald-800">
                        {req.status.replace('_', ' ')}
                      </span>
                      {req.batchId && (
                        <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                          Batch: {req.batchId}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {req.address}, {req.city}
                      </span>
                      <span>•</span>
                      <span>Requested on {new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {req.status === 'processing_completed' && (
                    <button
                      onClick={() => setSelectedReceipt(req)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-white border border-emerald-300 hover:bg-emerald-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Impact Receipt
                    </button>
                  )}
                  {req.assignedCollectorName && (
                    <div className="text-right text-xs">
                      <div className="text-slate-400">Assigned Collector</div>
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        {req.assignedCollectorName}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body: Items List & Waste Journey */}
              <div className="p-5 sm:p-6 space-y-6">
                {/* Items chips */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Handed Over Items:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {req.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 flex items-center gap-1.5"
                      >
                        <Package className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {item.count} × {item.category}
                        </span>
                        {item.notes && <span className="text-slate-400">({item.notes})</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* The "Where Did My E-Waste Go?" Stepper */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Verified E-Waste Journey Chain
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Step {currentStageIndex + 1} of 5 Complete
                    </span>
                  </div>

                  <div className="relative">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {stages.map((stage, sIdx) => {
                        const isDone = sIdx <= currentStageIndex;
                        const isCurrent = sIdx === currentStageIndex;

                        return (
                          <div
                            key={stage.key}
                            className={`p-3 rounded-xl border transition-all ${
                              isCurrent
                                ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20'
                                : isDone
                                ? 'bg-slate-50 border-emerald-200 text-slate-800'
                                : 'bg-slate-50/40 border-slate-200 text-slate-400 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  isDone
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {isDone ? '✓' : sIdx + 1}
                              </div>
                              <span className="text-xs font-bold truncate">
                                {stage.label}
                              </span>
                            </div>
                            <p className="text-[11px] leading-tight text-slate-500">
                              {stage.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Impact Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="text-center border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 font-display">
                RELOOP IMPACT RECEIPT
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Digital Transparency Certificate • Verified E-Waste Diversion
              </p>
              <div className="inline-block px-2.5 py-0.5 mt-2 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold tracking-wide">
                STATUS: VERIFIED
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Citizen:</span>
                <span className="font-semibold">{selectedReceipt.citizenName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Pickup Request ID:</span>
                <span className="font-mono font-semibold">{selectedReceipt.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Collection Batch ID:</span>
                <span className="font-mono font-semibold">{selectedReceipt.batchId || 'CB-00071'}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Items Handed Over:</span>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] space-y-0.5">
                  {selectedReceipt.items.map((it, idx) => (
                    <div key={idx}>
                      • {it.count} × {it.category} {it.notes ? `(${it.notes})` : ''}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-semibold">Declared Weight</div>
                  <div className="text-base font-black text-slate-800">12.4 kg</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-emerald-700 font-semibold">Verified Scale Weight</div>
                  <div className="text-base font-black text-emerald-700">11.9 kg</div>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Final Circularity Destination:</span>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span>Laptop:</span>
                    <span className="font-bold text-blue-700">Refurbishment & Re-use</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Mobiles:</span>
                    <span className="font-bold text-amber-700">Component Recovery (RAM/IC)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Printer & Cables:</span>
                    <span className="font-bold text-emerald-700">Materials Recycling (Copper/Alum)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-slate-200 font-semibold">
                <span className="text-slate-800">Reward Awarded:</span>
                <span className="text-emerald-600 text-sm font-bold">+30 Green Points</span>
              </div>

              <p className="text-[10px] text-slate-400 italic text-center">
                * Described as a digital transparency receipt, not an official government certificate.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-semibold text-white shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Print / Save Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Pickup Request Modal */}
      {showNewPickupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Schedule E-Waste Pickup
                </h3>
                <p className="text-xs text-slate-500">
                  Citizens don't need QR codes; an informal collector will arrive and record your batch.
                </p>
              </div>
              <button
                onClick={() => setShowNewPickupModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePickup} className="space-y-4">
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Items to Hand Over:
                </label>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Mobile Phones</div>
                      <div className="text-[10px] text-slate-400">Smartphones/Keypad</div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={mobileCount}
                      onChange={(e) => setMobileCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-14 p-1.5 text-center bg-white border border-slate-300 rounded font-bold"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Laptops / PCs</div>
                      <div className="text-[10px] text-slate-400">Motherboards/Desktops</div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={laptopCount}
                      onChange={(e) => setLaptopCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-14 p-1.5 text-center bg-white border border-slate-300 rounded font-bold"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Printers / Scanners</div>
                      <div className="text-[10px] text-slate-400">Heavy appliances</div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={printerCount}
                      onChange={(e) => setPrinterCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-14 p-1.5 text-center bg-white border border-slate-300 rounded font-bold"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Cables & Chargers</div>
                      <div className="text-[10px] text-slate-400">Power bricks/cords</div>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={chargerCount}
                      onChange={(e) => setChargerCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-14 p-1.5 text-center bg-white border border-slate-300 rounded font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pickup Address:
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 301, Sunshine Heights, 5th Cross"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City:</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone:</label>
                  <input
                    type="text"
                    defaultValue={currentUser.phone || '+91 98765 43210'}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Please inform the collector if any batteries are swollen or leaking so safe handling protocols can be engaged.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewPickupModal(false)}
                  className="py-2 px-4 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 shadow-sm"
                >
                  Submit Pickup Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
