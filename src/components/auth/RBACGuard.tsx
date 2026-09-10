import React from 'react';
import { ShieldAlert, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';
import { User, UserRole } from '../../types';
import { checkRoleAccess, getRoleDisplayName, getRoleDashboardPath, loginUser } from '../../services/auth';

interface RBACGuardProps {
  currentUser: User | null;
  requiredRole: UserRole | UserRole[];
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const RBACGuard: React.FC<RBACGuardProps> = ({
  currentUser,
  requiredRole,
  onNavigate,
  children,
}) => {
  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-200 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Authentication Required
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Please log in with valid credentials to access this dashboard.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => onNavigate('/login')}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
            >
              Go to Login
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasAccess = checkRoleAccess(requiredRole, currentUser.role);

  if (!hasAccess) {
    const requiredRoleDisplay = Array.isArray(requiredRole)
      ? requiredRole.map(getRoleDisplayName).join(' or ')
      : getRoleDisplayName(requiredRole);

    const targetRole = Array.isArray(requiredRole) ? requiredRole[0] : requiredRole;

    const handleQuickSwitchToRequiredRole = () => {
      let email = 'priya@citizen.reloop.eco';
      if (targetRole === 'collector') email = 'rajesh@collector.reloop.eco';
      if (targetRole === 'recycler') email = 'contact@greentech.eco';
      if (targetRole === 'brand_cpcb') email = 'compliance@ecocorp.com';

      loginUser(email, targetRole);
      onNavigate(getRoleDashboardPath(targetRole));
    };

    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-xl border border-rose-200 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="inline-block px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full border border-rose-200 uppercase tracking-wider mb-2">
            RBAC Middleware Protection Active
          </div>

          <h2 className="text-2xl font-bold text-slate-900 font-display">
            Access Restricted
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            This sensitive view requires <strong className="text-slate-900">{requiredRoleDisplay}</strong> privileges.
          </p>

          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 text-slate-700">
            <div>
              <span className="text-slate-500">Current User:</span>{' '}
              <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.email})
            </div>
            <div>
              <span className="text-slate-500">Current Role:</span>{' '}
              <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-semibold">
                {getRoleDisplayName(currentUser.role)}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Required Role:</span>{' '}
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold">
                {requiredRoleDisplay}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate(getRoleDashboardPath(currentUser.role))}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to My Dashboard
            </button>

            <button
              onClick={handleQuickSwitchToRequiredRole}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Switch to {getRoleDisplayName(targetRole)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
