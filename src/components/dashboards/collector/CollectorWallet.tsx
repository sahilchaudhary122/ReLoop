import React, { useState } from 'react';
import {
  Wallet,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  Building2,
  Info,
  History,
  TrendingUp,
  Landmark,
} from 'lucide-react';
import { User, RewardCreditTransaction } from '../../../types';
import { updateUserProfile } from '../../../services/auth';
import { getStoredRewardTransactions, saveRewardTransaction } from '../../../services/mockData';

interface CollectorWalletProps {
  currentUser: User;
  onProfileUpdated: (updatedUser: User) => void;
  onNavigateTab?: (tab: string) => void;
}

export const CollectorWallet: React.FC<CollectorWalletProps> = ({
  currentUser,
  onProfileUpdated,
  onNavigateTab,
}) => {
  const [transferMethod, setTransferMethod] = useState<'upi' | 'bank'>('upi');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState<{ amount: number; ref: string } | null>(null);
  const [transactions, setTransactions] = useState<RewardCreditTransaction[]>(getStoredRewardTransactions());

  const balance = currentUser.walletBalanceINR ?? 0;
  const hasPayoutMethod = Boolean(currentUser.upiId?.trim() || currentUser.bankAccount?.accountNumber?.trim());

  const myTransactions = transactions
    .filter((tx) => tx.actorId === currentUser.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const earnedTotal = myTransactions
    .filter((tx) => tx.type === 'earned')
    .reduce((sum, tx) => sum + tx.amountINR, 0);
  const paidOutTotal = myTransactions
    .filter((tx) => tx.type === 'redeemed')
    .reduce((sum, tx) => sum + tx.amountINR, 0);

  const handleTransfer = () => {
    if (balance <= 0) return;

    if (!hasPayoutMethod) {
      if (onNavigateTab) onNavigateTab('profile');
      return;
    }

    setIsTransferring(true);

    setTimeout(() => {
      const refNumber = `UPI-IMPS-${Math.floor(1000000000 + Math.random() * 8999999999)}`;
      const destination =
        transferMethod === 'upi'
          ? `UPI - ${currentUser.upiId || 'not set'}`
          : `Bank - ${currentUser.bankAccount?.bankName || 'Account'} ••${(currentUser.bankAccount?.accountNumber || '0000').slice(-4)}`;

      const tx: RewardCreditTransaction = {
        id: `RC-${Date.now()}`,
        type: 'redeemed',
        points: balance,
        amountINR: balance,
        productName: `Wallet Cashout to ${destination}`,
        productCategory: 'Cashback Payout',
        date: new Date().toISOString(),
        status: 'redeemed',
        paymentMethod: destination,
        referenceNumber: refNumber,
        notes: 'Instant collector wallet transfer',
        actorId: currentUser.id,
      };

      saveRewardTransaction(tx);
      setTransactions(getStoredRewardTransactions());

      const updated = updateUserProfile({ walletBalanceINR: 0 });
      if (updated) onProfileUpdated(updated);

      setIsTransferring(false);
      setTransferSuccess({ amount: balance, ref: refNumber });
      setTimeout(() => setTransferSuccess(null), 6000);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
            <Wallet className="w-4 h-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Economic Incentives
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display mt-1">
          My ReLoop Wallet
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Cashback from material sales, handover rewards, and accuracy bonuses collects here and can be instantly transferred to your linked UPI or bank account.
        </p>
      </div>

      {transferSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 shadow-xs animate-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold">₹{transferSuccess.amount.toLocaleString('en-IN')} Transferred Successfully!</div>
            <div className="text-[11px] text-emerald-800 font-mono">Reference: {transferSuccess.ref}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance & Transfer Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Available Balance
              </span>
              <h3 className="text-3xl font-black text-slate-900 font-display mt-0.5">
                ₹{balance.toLocaleString('en-IN')}
              </h3>
            </div>
            <TrendingUp className="w-8 h-8 text-emerald-500" />
          </div>

          {!hasPayoutMethod && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                No UPI or bank account linked yet. Add one in{' '}
                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('profile')}
                  className="font-bold underline cursor-pointer"
                >
                  Profile &amp; Verification
                </button>{' '}
                before transferring.
              </span>
            </div>
          )}

          {hasPayoutMethod && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTransferMethod('upi')}
                disabled={!currentUser.upiId?.trim()}
                className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  transferMethod === 'upi'
                    ? 'bg-amber-50 border-amber-500 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>UPI {currentUser.upiId ? `(${currentUser.upiId})` : ''}</span>
              </button>
              <button
                type="button"
                onClick={() => setTransferMethod('bank')}
                disabled={!currentUser.bankAccount?.accountNumber?.trim()}
                className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  transferMethod === 'bank'
                    ? 'bg-amber-50 border-amber-500 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Bank {currentUser.bankAccount?.accountNumber ? `(••${currentUser.bankAccount.accountNumber.slice(-4)})` : ''}</span>
              </button>
            </div>
          )}

          <button
            onClick={handleTransfer}
            disabled={balance <= 0 || isTransferring}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            {isTransferring ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Transfer...</span>
              </>
            ) : balance <= 0 ? (
              <span>No Balance Available</span>
            ) : !hasPayoutMethod ? (
              <>
                <span>Add Payout Method to Transfer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <span>Transfer ₹{balance.toLocaleString('en-IN')} to {transferMethod === 'upi' ? 'UPI' : 'Bank'}</span>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500">Total Earned</div>
              <div className="text-base font-extrabold text-emerald-600 mt-0.5">₹{earnedTotal.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-slate-500">Total Paid Out</div>
              <div className="text-base font-extrabold text-slate-800 mt-0.5">₹{paidOutTotal.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Earnings Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <History className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 font-display">
              Recent Earnings & Transfers
            </h3>
          </div>

          <div className="space-y-2 text-xs max-h-72 overflow-y-auto pr-1">
            {myTransactions.length === 0 && (
              <p className="text-slate-400 text-[11px] italic">No wallet activity recorded yet.</p>
            )}
            {myTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-slate-800 truncate">{tx.productName}</div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {tx.referenceNumber ? ` • ${tx.referenceNumber}` : ''}
                  </div>
                </div>
                <span
                  className={`font-bold shrink-0 ${tx.type === 'earned' ? 'text-emerald-600' : 'text-slate-700'}`}
                >
                  {tx.type === 'earned' ? '+' : '-'}₹{tx.amountINR.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
