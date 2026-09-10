import React, { useState } from 'react';
import {
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Wallet,
  Bell,
  CheckCircle2,
  Save,
  RotateCcw,
  Shield,
  ShieldCheck,
  ShieldAlert,
  QrCode,
  Smartphone,
  Building2,
  Info,
  BadgeCheck,
  Fingerprint,
  Clock3,
} from 'lucide-react';
import { User } from '../../../types';
import { updateUserProfile } from '../../../services/auth';

interface CollectorProfileSettingsProps {
  currentUser: User;
  onProfileUpdated: (updatedUser: User) => void;
  onNavigateTab?: (tab: string) => void;
}

export const CollectorProfileSettings: React.FC<CollectorProfileSettingsProps> = ({
  currentUser,
  onProfileUpdated,
  onNavigateTab,
}) => {
  // Personal details
  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '+91 91234 56789');
  const [address, setAddress] = useState(currentUser.address || '');
  const [city, setCity] = useState(currentUser.city || 'Bengaluru');
  const [pincode, setPincode] = useState(currentUser.pincode || '');
  const [operatingTerritory, setOperatingTerritory] = useState(
    currentUser.operatingTerritory || 'Indiranagar & Koramangala, Bengaluru'
  );

  // Verification / identity details
  const [collectorId, setCollectorId] = useState(currentUser.collectorId || '');
  const [memberId, setMemberId] = useState(currentUser.memberId || '');
  const [idProofType, setIdProofType] = useState<User['idProofType']>(currentUser.idProofType || 'Aadhaar');
  const [idProofNumber, setIdProofNumber] = useState(currentUser.idProofNumber || '');
  const [verificationStatus, setVerificationStatus] = useState<User['verificationStatus']>(
    currentUser.verificationStatus || 'unverified'
  );

  // Payout details (used by the Wallet for cashback transfers)
  const [upiId, setUpiId] = useState(currentUser.upiId || '');
  const [bankName, setBankName] = useState(currentUser.bankAccount?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(currentUser.bankAccount?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(currentUser.bankAccount?.ifscCode || '');
  const [accountHolderName, setAccountHolderName] = useState(
    currentUser.bankAccount?.accountHolderName || currentUser.name || ''
  );

  // Notification preferences
  const [notifWhatsApp, setNotifWhatsApp] = useState(currentUser.notifications?.whatsapp ?? true);
  const [notifSms, setNotifSms] = useState(currentUser.notifications?.sms ?? true);
  const [notifEmail, setNotifEmail] = useState(currentUser.notifications?.email ?? false);

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = () => {
    setName(currentUser.name || '');
    setPhone(currentUser.phone || '+91 91234 56789');
    setAddress(currentUser.address || '');
    setCity(currentUser.city || 'Bengaluru');
    setPincode(currentUser.pincode || '');
    setOperatingTerritory(currentUser.operatingTerritory || 'Indiranagar & Koramangala, Bengaluru');
    setCollectorId(currentUser.collectorId || '');
    setMemberId(currentUser.memberId || '');
    setIdProofType(currentUser.idProofType || 'Aadhaar');
    setIdProofNumber(currentUser.idProofNumber || '');
    setVerificationStatus(currentUser.verificationStatus || 'unverified');
    setUpiId(currentUser.upiId || '');
    setBankName(currentUser.bankAccount?.bankName || '');
    setAccountNumber(currentUser.bankAccount?.accountNumber || '');
    setIfscCode(currentUser.bankAccount?.ifscCode || '');
    setAccountHolderName(currentUser.bankAccount?.accountHolderName || currentUser.name || '');
    setNotifWhatsApp(currentUser.notifications?.whatsapp ?? true);
    setNotifSms(currentUser.notifications?.sms ?? true);
    setNotifEmail(currentUser.notifications?.email ?? false);
    setErrorMessage('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Full name is required');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Contact phone is required so citizens & the dispatch system can reach you');
      return;
    }
    if (!collectorId.trim() || !memberId.trim()) {
      setErrorMessage('Collector ID and Member ID are required to remain an active pickup partner');
      return;
    }
    if (!idProofNumber.trim()) {
      setErrorMessage('Please provide an ID proof number for verification');
      return;
    }

    // If any verification-critical field changed and the account was previously verified,
    // it must be re-submitted for verification before it is trusted again.
    const verificationFieldsChanged =
      collectorId.trim() !== (currentUser.collectorId || '') ||
      memberId.trim() !== (currentUser.memberId || '') ||
      idProofNumber.trim() !== (currentUser.idProofNumber || '') ||
      idProofType !== currentUser.idProofType;

    const nextVerificationStatus: User['verificationStatus'] =
      verificationStatus === 'verified' && verificationFieldsChanged ? 'pending' : verificationStatus;

    setIsSaving(true);

    setTimeout(() => {
      const updated = updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        operatingTerritory: operatingTerritory.trim(),
        collectorId: collectorId.trim(),
        memberId: memberId.trim(),
        idProofType,
        idProofNumber: idProofNumber.trim(),
        verificationStatus: nextVerificationStatus,
        upiId: upiId.trim(),
        bankAccount: {
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim(),
          accountHolderName: accountHolderName.trim() || name.trim(),
        },
        notifications: {
          whatsapp: notifWhatsApp,
          sms: notifSms,
          email: notifEmail,
        },
      });

      setIsSaving(false);

      if (updated) {
        setVerificationStatus(nextVerificationStatus);
        onProfileUpdated(updated);
        setShowSuccessBanner(true);
        setTimeout(() => setShowSuccessBanner(false), 4000);
      } else {
        setErrorMessage('Could not save profile changes. Please try again.');
      }
    }, 600);
  };

  // Demo-only helper: simulates the back-office admin approving a pending verification
  const handleSimulateAdminVerification = () => {
    const updated = updateUserProfile({ verificationStatus: 'verified' });
    if (updated) {
      setVerificationStatus('verified');
      onProfileUpdated(updated);
    }
  };

  const verificationTheme =
    verificationStatus === 'verified'
      ? { bg: 'bg-emerald-50 border-emerald-300 text-emerald-900', icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />, label: 'Verified Collector' }
      : verificationStatus === 'pending'
      ? { bg: 'bg-amber-50 border-amber-300 text-amber-900', icon: <Clock3 className="w-4 h-4 text-amber-600" />, label: 'Verification Pending Review' }
      : { bg: 'bg-rose-50 border-rose-300 text-rose-900', icon: <ShieldAlert className="w-4 h-4 text-rose-600" />, label: 'Not Yet Verified' };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Info Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <UserCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Collector Account & Identity
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display mt-1">
            Profile & Verification Details
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Keep your contact details, coverage territory, and Collector / Member ID verification current so citizens and the dispatch system can trust and route pickups to you.
          </p>
        </div>

        <div className={`border rounded-xl p-3 text-right shrink-0 flex items-center gap-2 ${verificationTheme.bg}`}>
          {verificationTheme.icon}
          <div className="text-left">
            <div className="text-[10px] uppercase font-bold opacity-75">Status</div>
            <div className="text-xs font-extrabold">{verificationTheme.label}</div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccessBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold">Profile Details Successfully Updated!</div>
              <div className="text-[11px] text-emerald-800">
                Your contact, coverage, and payout details are now synced across the dispatch network.
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowSuccessBanner(false)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded-lg"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-3 text-rose-900 text-xs">
          <Info className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SECTION 1: Personal & Contact Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <UserCheck className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900 font-display">
                1. Personal & Contact Information
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Registered Email (Login ID)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs cursor-not-allowed font-mono"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Contact Telephone / WhatsApp Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 91234 56789"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs transition-all"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Home / Hub Address
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 5th Main Road, Indiranagar"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="560038"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Operating Territory / Coverage Zone</span>
                </label>
                <input
                  type="text"
                  value={operatingTerritory}
                  onChange={(e) => setOperatingTerritory(e.target.value)}
                  placeholder="e.g. Indiranagar & Koramangala, Bengaluru"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs transition-all"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Citizen pickup requests in this zone are prioritized in your Collection Queue.
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Collector ID Verification */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  2. Collector & Member ID Verification
                </h3>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${verificationTheme.bg}`}>
                {verificationTheme.icon}
                <div>
                  <div className="font-bold">{verificationTheme.label}</div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    {verificationStatus === 'verified'
                      ? 'Your identity has been cross-checked against the ReLoop informal collector registry.'
                      : verificationStatus === 'pending'
                      ? 'Submitted for back-office review. This usually clears within 24-48 hours.'
                      : 'Complete and save the fields below to submit your details for verification.'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Collector ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={collectorId}
                    onChange={(e) => setCollectorId(e.target.value)}
                    placeholder="COL-9021"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs font-mono transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">
                    Member ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    placeholder="RELOOP-MEM-4471"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs font-mono transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1 flex items-center gap-1">
                  <Fingerprint className="w-3.5 h-3.5 text-amber-600" />
                  <span>Government ID Proof Type</span>
                </label>
                <select
                  value={idProofType}
                  onChange={(e) => setIdProofType(e.target.value as User['idProofType'])}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs transition-all cursor-pointer"
                >
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Driving License">Driving License</option>
                  <option value="PAN Card">PAN Card</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  ID Proof Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={idProofNumber}
                  onChange={(e) => setIdProofNumber(e.target.value)}
                  placeholder="e.g. XXXX-XXXX-8823"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs font-mono transition-all"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Used only to cross-verify your identity with the informal collector registry.
                </span>
              </div>

              {verificationStatus === 'pending' && (
                <button
                  type="button"
                  onClick={handleSimulateAdminVerification}
                  className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>[Demo] Simulate Admin Verification Approval</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Payout Methods for Wallet Transfers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900 font-display">
                3. Wallet Payout Methods (UPI & Direct Bank Transfer)
              </h3>
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
              Used for Wallet Cashout
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* UPI Section */}
            <div className="space-y-3.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                  <span>Primary UPI VPA (Instant Settlement)</span>
                </span>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded">
                  Recommended
                </span>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  UPI ID (Google Pay / PhonePe / Paytm / BHIM)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourname@okhdfcbank"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs font-mono font-medium"
                  />
                  <QrCode className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Transfer Speed:</span>
                  <span className="font-bold text-emerald-700">Instant (&lt; 15 seconds)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Processing Fee:</span>
                  <span className="font-bold text-slate-800">₹0 (Sponsored)</span>
                </div>
              </div>
            </div>

            {/* Direct Bank Account Section */}
            <div className="space-y-3.5 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Direct Bank Account (IMPS / NEFT)</span>
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. State Bank of India"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Bank Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="30987654321098"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="SBIN0001234"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 text-xs font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bell className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 font-display">
              4. Dispatch Alerts & Receipt Preferences
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={notifWhatsApp}
                onChange={(e) => setNotifWhatsApp(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-900 block">New Pickup Alerts (WhatsApp)</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Get notified the moment a citizen requests doorstep pickup in your territory.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={notifSms}
                onChange={(e) => setNotifSms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-900 block">SMS Verification OTPs</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Verification PIN texted at doorstep during physical device hand-off.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={notifEmail}
                onChange={(e) => setNotifEmail(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-900 block">Weekly Wallet Statements</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Emailed summary of earnings, transfers, and trust score changes.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Current</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('wallet')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Go to Wallet
              </button>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile Details</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
