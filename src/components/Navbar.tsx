'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { LayoutDashboard, History } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { isConnected } = useAccount();

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg italic">A</span>
        </div>
        <span className="font-semibold text-xl tracking-tight text-slate-900">ArcSplit</span>
      </Link>
      <div className="flex items-center gap-2">
        {isConnected && (
          <>
            <Link 
              href="/dashboard" 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${
                pathname === '/dashboard' ? 'bg-black text-white' : 'text-slate-500 hover:text-black hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link 
              href="/history" 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${
                pathname === '/history' ? 'bg-black text-white' : 'text-slate-500 hover:text-black hover:bg-slate-50'
              }`}
            >
              <History size={18} /> History
            </Link>
          </>
        )}
        <ConnectButton chainStatus="none" showBalance={false} label="Connect" />
      </div>
    </nav>
  );
}
