'use client';

import React from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg italic">A</span>
        </div>
        <span className="font-semibold text-xl tracking-tight text-slate-900">ArcSplit</span>
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-black">Dashboard</Link>
        <Link href="/history" className="text-sm font-medium text-slate-600 hover:text-black">History</Link>
        <ConnectButton chainStatus="none" showBalance={false} label="Connect" />
      </div>
    </nav>
  );
}
