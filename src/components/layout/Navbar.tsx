import React, { useState } from 'react';
import {
  Recycle,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { getRoleDisplayName, getRoleDashboardPath, loginUser, logoutUser } from '../../services/auth';

interface NavbarProps {
  currentUser: User | null;
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenWhatsApp: () => void;
  onOpenInteractiveFace: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentPath,
  onNavigate,
  onOpenWhatsApp,
  onOpenInteractiveFace,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const handleQuickRoleSwitch = (role: UserRole) => {
    setDemoMenuOpen(false);
    setMobileMenuOpen(false);
    let email = 'priya@citizen.reloop.eco';
    if (role === 'collector') email = 'rajesh@collector.reloop.eco';
    if (role === 'recycler') email = 'contact@greentech.eco';
    if (role === 'brand_cpcb') email = 'compliance@ecocorp.com';

    loginUser(email, role);
    onNavigate(getRoleDashboardPath(role));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            id="nav-logo"
            onClick={() => onNavigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700 transition-colors">
              <Recycle className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-display">
                  Re<span className="text-emerald-600">Loop</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  EPR Chain
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block leading-none mt-0.5">
                Offline-First E-Waste Digital Ledger
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Interactive Bot & WhatsApp Buttons */}
            <button
              id="nav-btn-whatsapp"
              onClick={onOpenWhatsApp}
              title="WhatsApp Chatbot Redirector"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">WhatsApp Bot</span>
            </button>

            <button
              id="nav-btn-face-ai"
              onClick={onOpenInteractiveFace}
              title="Interactive AI Avatar"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span className="hidden md:inline">Eco Avatar</span>
            </button>

            {/* If logged in */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  id="nav-btn-dashboard"
                  onClick={() => onNavigate(getRoleDashboardPath(currentUser.role))}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">My Dashboard</span>
                </button>

                {/* Role Switcher Demo Dropdown */}
                <div className="relative">
                  <button
                    id="nav-btn-switch-role"
                    onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-semibold max-w-[90px] truncate">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {demoMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-3 py-1.5 border-b border-slate-100 text-xs text-slate-500">
                        Logged in as: <strong className="text-slate-800">{currentUser.email}</strong>
                        <div className="mt-0.5 text-emerald-600 font-semibold">
                          Role: {getRoleDisplayName(currentUser.role)}
                        </div>
                      </div>
                      <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                        Switch Test Role:
                      </div>
                      <button
                        onClick={() => handleQuickRoleSwitch('user')}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span>Citizen / User</span>
                        {currentUser.role === 'user' && <span className="text-emerald-600 font-bold">Active</span>}
                      </button>
                      <button
                        onClick={() => handleQuickRoleSwitch('collector')}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span>Informal Collector</span>
                        {currentUser.role === 'collector' && <span className="text-emerald-600 font-bold">Active</span>}
                      </button>
                      <button
                        onClick={() => handleQuickRoleSwitch('recycler')}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span>Recycler / Refurbisher</span>
                        {currentUser.role === 'recycler' && <span className="text-emerald-600 font-bold">Active</span>}
                      </button>
                      <button
                        onClick={() => handleQuickRoleSwitch('brand_cpcb')}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span>Brand / CPCB (PRO)</span>
                        {currentUser.role === 'brand_cpcb' && <span className="text-emerald-600 font-bold">Active</span>}
                      </button>
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setDemoMenuOpen(false);
                            logoutUser();
                            onNavigate('/');
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* If not logged in: Login & Register */
              <div className="flex items-center gap-2">
                <button
                  id="nav-btn-login"
                  onClick={() => onNavigate('/login')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
                <button
                  id="nav-btn-register"
                  onClick={() => onNavigate('/register')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              id="nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenWhatsApp();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              <Smartphone className="w-4 h-4" />
              Open WhatsApp Bot Redirector
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenInteractiveFace();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200"
            >
              <Sparkles className="w-4 h-4" />
              Open Eco Avatar Assistant
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
