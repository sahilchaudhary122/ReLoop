import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Mic,
  Camera,
  Scale,
  QrCode,
  MapPin,
  Clock,
  ShieldCheck,
  Wallet,
  Compass,
  AlertTriangle,
  CheckCircle,
  Package,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { User, PickupRequest, CollectionBatch, HazardType, PickupItem } from '../../types';
import {
  getStoredBatches,
  getStoredPickups,
  saveBatch,
  savePickup,
  addEvent,
  getStoredPartners,
} from '../../services/mockData';
import { QRCodeSVG } from '../common/QRCodeSVG';

interface CollectorDashboardProps {
  currentUser: User;
}

export const CollectorDashboard: React.FC<CollectorDashboardProps> = ({ currentUser }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'syncing'>('synced');
  const [batches, setBatches] = useState<CollectionBatch[]>(getStoredBatches());
  const [pickups, setPickups] = useState<PickupRequest[]>(getStoredPickups());
  const partners = getStoredPartners();

  // Active collection modal
  const [activePickup, setActivePickup] = useState<PickupRequest | null>(null);
  const [weightKg, setWeightKg] = useState<string>('12.4');
  const [hazardStatus, setHazardStatus] = useState<HazardType>('No Hazard');
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80'
  );
  const [generatedBatch, setGeneratedBatch] = useState<CollectionBatch | null>(null);

  // Voice input simulation
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Handle offline sync transition
  const toggleConnectivity = () => {
    if (isOnline) {
      // Go offline
      setIsOnline(false);
    } else {
      // Go online: trigger auto sync
      setIsOnline(true);
      if (syncStatus === 'pending') {
        setSyncStatus('syncing');
        setTimeout(() => {
          setSyncStatus('synced');
        }, 1500);
      }
    }
  };

  // Simulate Voice input in Hindi / English
  const handleVoiceRecord = () => {
    setIsListening(true);
    setVoiceTranscript('Listening... Speak e-waste count (e.g. "Mobile do, Laptop ek")');
    setTimeout(() => {
      setVoiceTranscript('Recognized: "Mobile × 2, Laptop × 1, Charger × 3"');
      setIsListening(false);
    }, 1800);
  };

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePickup) return;

    const newBatchId = `CB-000${Math.floor(73 + Math.random() * 20)}`;
    const weightNum = parseFloat(weightKg) || 12.4;

    const newBatch: CollectionBatch = {
      id: newBatchId,
      pickupRequestId: activePickup.id,
      collectorId: currentUser.id,
      collectorName: currentUser.name,
      items: activePickup.items,
      declaredWeightKg: weightNum,
      photos: [photoUrl],
      gps: {
        lat: 12.9352,
        lng: 77.6245,
        locationName: `${activePickup.address}, ${activePickup.city}`,
      },
      timestamp: new Date().toISOString(),
      hazardStatus,
      syncStatus: isOnline ? 'synced' : 'pending',
      status: 'collected',
      riskFlagIds: [],
    };

    saveBatch(newBatch);

    // Update pickup status
    activePickup.status = 'collected';
    activePickup.batchId = newBatchId;
    activePickup.assignedCollectorId = currentUser.id;
    activePickup.assignedCollectorName = currentUser.name;
    savePickup(activePickup);

    // Log Event 001
    addEvent({
      eventCode: 'EVENT 001',
      title: 'Collector Collected Batch',
      actorRole: 'collector',
      actorName: `${currentUser.name} (Collector)`,
      batchId: newBatchId,
      timestamp: new Date().toISOString(),
      details: `Collected ${activePickup.items.length} items (${weightNum} kg) at ${activePickup.address}. Hazard status: ${hazardStatus}.`,
      metadata: { declaredWeightKg: weightNum, pickupId: activePickup.id, offlineSync: !isOnline },
    });

    if (!isOnline) {
      setSyncStatus('pending');
    }

    setGeneratedBatch(newBatch);
    setBatches(getStoredBatches());
    setPickups(getStoredPickups());
    setActivePickup(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Offline-First Toggle & Status */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 rounded text-xs font-bold uppercase tracking-wider">
              Collector Mobile App Portal
            </span>
            {/* Sync badge */}
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                syncStatus === 'synced'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : syncStatus === 'syncing'
                  ? 'bg-blue-500/20 text-blue-300 animate-pulse'
                  : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              Sync Queue: {syncStatus}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
            Collector Hub: {currentUser.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Offline-first digital chain of custody. Capture collections, log photos, record digital scale weights, and navigate to verified downstream buyers.
          </p>
        </div>

        {/* Offline Simulation Switcher */}
        <div className="bg-slate-800/90 border border-slate-700 p-3.5 rounded-xl flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-emerald-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-rose-400" />
            )}
            <div>
              <div className="text-xs font-bold">
                Network: {isOnline ? 'Online (Connected)' : 'Offline (SQLite Mode)'}
              </div>
              <div className="text-[10px] text-slate-400">
                {isOnline ? 'Auto-syncing to backend' : 'Saving to local SQLite queue'}
              </div>
            </div>
          </div>

          <button
            id="collector-toggle-offline-btn"
            onClick={toggleConnectivity}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isOnline
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {isOnline ? 'Simulate Disconnect' : 'Reconnect & Sync'}
          </button>
        </div>
      </div>

      {/* Trust Score & Wallet Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Collector Trust Score Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Transparent Reputation
              </span>
              <h2 className="text-lg font-bold text-slate-900 font-display">
                RELOOP TRUST SCORE
              </h2>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-emerald-600 font-display">94</span>
              <span className="text-sm font-bold text-slate-400"> / 100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500">Verified Collections</div>
              <div className="text-base font-extrabold text-slate-800">184</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500">Weight Accuracy</div>
              <div className="text-base font-extrabold text-emerald-600">97%</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500">Successful Handovers</div>
              <div className="text-base font-extrabold text-slate-800">176</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500">Risk Flags</div>
              <div className="text-base font-extrabold text-amber-600">2 (Cleared)</div>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-500">
            Trust Score unlocks priority downstream recycler pricing and citizen pickup matchmaking.
          </p>
        </div>

        {/* Collector Wallet Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Verified Economic Incentives
              </span>
              <h2 className="text-lg font-bold text-slate-900 font-display">
                My ReLoop Wallet
              </h2>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 font-display">
                ₹3,000
              </span>
              <div className="text-[11px] font-medium text-emerald-600">Available to Withdraw</div>
            </div>
          </div>

          <div className="space-y-2 mt-4 text-xs text-slate-700">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Material Sales:</span>
              <span className="font-semibold text-slate-800">₹2,450</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Collection Rewards:</span>
              <span className="font-semibold text-emerald-600">+ ₹320</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Accuracy Bonus (Weight match):</span>
              <span className="font-semibold text-emerald-600">+ ₹80</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Downstream Aggregator Bonus:</span>
              <span className="font-semibold text-emerald-600">+ ₹150</span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => alert('Simulated instant transfer of ₹3,000 sent to Rajesh Kumar UPI Account (rajesh@upi)!')}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs cursor-pointer"
            >
              Transfer to Bank / UPI
            </button>
          </div>
        </div>
      </div>

      {/* Main Workflow: Available Pickups & Collection Recorder */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Step 1 • Accept & Record
            </span>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Doorstep Pickup Requests Waiting for Collection
            </h2>
          </div>

          {/* Voice Input Simulator Button */}
          <button
            onClick={handleVoiceRecord}
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            <Mic className="w-4 h-4 text-indigo-600" />
            <span>{isListening ? 'Listening Voice Input...' : 'Voice Input (Hindi/Regional)'}</span>
          </button>
        </div>

        {voiceTranscript && (
          <div className="mb-4 p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
            <span>{voiceTranscript}</span>
            <button
              onClick={() => setVoiceTranscript('')}
              className="text-xs font-bold text-indigo-500 hover:text-indigo-700"
            >
              Clear
            </button>
          </div>
        )}

        {/* Requests Table/List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pickups.map((req, idx) => (
            <div
              key={`${req.id}-${idx}`}
              className={`p-4 rounded-xl border transition-all ${
                req.status === 'pending'
                  ? 'border-emerald-300 bg-emerald-50/20 hover:shadow-md'
                  : 'border-slate-200 bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-sm text-slate-900">{req.id}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    req.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {req.status}
                </span>
              </div>

              <div className="text-xs space-y-1 mb-3 text-slate-700">
                <div className="font-semibold text-slate-900">{req.citizenName}</div>
                <div className="text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {req.address}
                </div>
                <div className="text-slate-600 pt-1 font-mono">
                  {req.items.map((i) => `${i.count}x ${i.category}`).join(', ')}
                </div>
              </div>

              {req.status === 'pending' ? (
                <button
                  id={`collect-btn-${req.id}`}
                  onClick={() => {
                    setActivePickup(req);
                    setWeightKg('12.4');
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Start Collection Workflow</span>
                </button>
              ) : (
                <div className="text-xs text-slate-500 italic flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Collected in Batch {req.batchId || 'CB-00071'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Smart Route Innovation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Route — AI Collection Optimization
            </span>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Where Should I Take This Collected Material?
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ReLoop compares verified downstream partners based on distance, material compatibility, price/value, trust score, and live capacity.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Recycler Partner</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Indicative Value</th>
                <th className="py-3 px-4">Trust Score</th>
                <th className="py-3 px-4">Status & Capacity</th>
                <th className="py-3 px-4 text-center">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {partners.map((partner) => (
                <tr
                  key={partner.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    partner.isRecommended ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{partner.name}</div>
                    <div className="text-[11px] text-slate-400">{partner.address}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {partner.distanceKm} km
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600 text-sm">
                    ₹{partner.indicativePriceINR.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                      {partner.trustScore} / 100
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                      {partner.status} ({partner.capacity})
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {partner.isRecommended ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 font-extrabold rounded-full text-xs shadow-2xs">
                        🏆 Best Route
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">Alternative</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generated Batch QR Result Banner */}
      {generatedBatch && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Batch Successfully Sealed & Registered
            </div>
            <h3 className="text-2xl font-black text-slate-900 font-mono">
              Batch ID: {generatedBatch.id}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              1 QR Code represents the entire collection batch. Present this QR at the aggregator hub or authorized recycler dock.
            </p>
            <div className="mt-3 text-xs space-y-1 text-slate-700">
              <div>Weight: <strong>{generatedBatch.declaredWeightKg} kg</strong></div>
              <div>Hazard Status: <strong className="text-slate-900">{generatedBatch.hazardStatus}</strong></div>
              <div>GPS Captured: <strong className="font-mono">{generatedBatch.gps.locationName}</strong></div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <QRCodeSVG value={generatedBatch.id} size={130} />
            <button
              onClick={() => setGeneratedBatch(null)}
              className="mt-2 text-xs text-emerald-700 font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Collect Modal (Pickup -> Collect -> Photo -> Weight -> Save) */}
      {activePickup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Layer 1 • Field Collection Form
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-display">
                  Record Collection for {activePickup.id}
                </h3>
              </div>
              <button
                onClick={() => setActivePickup(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} className="space-y-4 text-xs">
              {/* Items summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Declared Items:
                </span>
                <div className="font-mono text-slate-800">
                  {activePickup.items.map((i) => `${i.count} × ${i.category}`).join(', ')}
                </div>
              </div>

              {/* Weight input */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Digital Scale Weight (kg) <strong className="text-rose-500">*</strong></span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 12.4"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-bold">KG</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Accurate weights earn an extra ₹80 accuracy bonus downstream.
                </p>
              </div>

              {/* Photo Evidence */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Photo Evidence (Tamper-Resistant Perceptual Hash)</span>
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={photoUrl}
                    alt="E-waste evidence"
                    className="w-20 h-20 rounded-lg object-cover border border-slate-200 shadow-2xs"
                  />
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 block">
                      Camera snapped at pickup coordinate:
                    </span>
                    <span className="font-mono text-[10px] bg-slate-100 px-2 py-1 rounded block text-slate-700">
                      GPS: 12.9352° N, 77.6245° E (Bengaluru)
                    </span>
                  </div>
                </div>
              </div>

              {/* Hazard Reporting */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hazard Reporting:</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Swollen Battery', 'Leakage', 'Damaged Battery', 'Unknown Hazard', 'No Hazard'] as HazardType[]).map((hazard) => (
                    <button
                      key={hazard}
                      type="button"
                      onClick={() => setHazardStatus(hazard)}
                      className={`p-2 rounded-lg border text-left font-semibold transition-all ${
                        hazardStatus === hazard
                          ? hazard === 'No Hazard'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                            : 'bg-rose-50 border-rose-500 text-rose-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      [ {hazard} ]
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActivePickup(null)}
                  className="py-2 px-4 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Seal Collection & Generate QR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
