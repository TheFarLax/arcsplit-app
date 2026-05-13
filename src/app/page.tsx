'use client';

import React from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowRight, Shield, Zap, Layout, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg italic">A</span>
          </div>
          <span className="font-semibold text-xl tracking-tight">ArcSplit</span>
        </div>
        <div className="flex items-center gap-4">
          <ConnectButton chainStatus="none" showBalance={false} />
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="px-6 py-24 md:py-32 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-3 py-1 mb-6 text-sm font-medium text-slate-600 bg-slate-100 rounded-full">
              Built on Arc Testnet
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8">
              Programmable <span className="text-slate-500">Revenue Splitting</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Automate multi-wallet USDC distributions with atomic settlement. Create split configurations, generate payment links, and let smart contracts handle the rest.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-black text-white font-semibold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight size={20} />
              </Link>
              <a
                href="https://docs.arc.network"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Read Arc Docs
              </a>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-24 bg-white border-y border-slate-100">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-900">
                <Zap size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Distribution</h3>
              <p className="text-slate-500">Funds are split atomically in the same transaction they are received. No manual payouts required.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-900">
                <Shield size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure & Trustless</h3>
              <p className="text-slate-500">Settled directly on Arc Testnet via smart contracts. Non-custodial and transparent by design.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-900">
                <Layout size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Modular Configs</h3>
              <p className="text-slate-500">Define as many recipients as you need with custom percentages. Total must equal 100%.</p>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="px-6 py-24 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">How ArcSplit works</h2>
          <div className="space-y-8">
            <div className="flex items-start gap-6 p-8 bg-[#F9FAFB] rounded-3xl border border-slate-100">
              <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
              <div>
                <h4 className="text-xl font-bold mb-2">Connect your wallet</h4>
                <p className="text-slate-600">Connect your preferred wallet via RainbowKit to get started on the Arc Testnet.</p>
              </div>
            </div>
            <div className="flex items-start gap-6 p-8 bg-[#F9FAFB] rounded-3xl border border-slate-100">
              <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
              <div>
                <h4 className="text-xl font-bold mb-2">Create a Split Config</h4>
                <p className="text-slate-600">Enter names, addresses, and percentages. Your configuration is stored both on-chain and in our secure database.</p>
              </div>
            </div>
            <div className="flex items-start gap-6 p-8 bg-[#F9FAFB] rounded-3xl border border-slate-100">
              <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
              <div>
                <h4 className="text-xl font-bold mb-2">Share Link & Receive USDC</h4>
                <p className="text-slate-600">Share your custom payment link. When a customer pays, the contract instantly routes funds to all recipients.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-12 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold italic">A</span>
            </div>
            <span className="font-semibold text-slate-900">ArcSplit</span>
            <span>&copy; 2026</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-slate-900">Privacy</a>
            <a href="#" className="hover:text-slate-900">Terms</a>
            <a href="https://testnet.arcscan.app" className="hover:text-slate-900">ArcScan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
