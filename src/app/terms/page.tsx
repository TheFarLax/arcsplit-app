'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, Zap, Scale, HardDrive, Construction } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[48px] border border-slate-100 shadow-premium p-12 md:p-20"
        >
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 text-slate-900">
            <FileText size={32} strokeWidth={1.5} />
          </div>
          
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Terms of Service</h1>
          <p className="text-slate-500 text-lg mb-12">Standard operating terms for the ArcSplit settlement infrastructure.</p>
          
          <div className="space-y-12">
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <Scale size={20} className="text-slate-400" />
                <h2 className="text-xl font-bold">Platform Provided "As-Is"</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                ArcSplit is a programmable settlement tool provided without any warranties, express or implied. We do not guarantee 100% uptime or error-free operation. Users utilize the infrastructure at their own risk.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <Zap size={20} className="text-slate-400" />
                <h2 className="text-xl font-bold">Blockchain Risks</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                By using ArcSplit, you acknowledge the inherent risks of blockchain transactions, including but not limited to network congestion, gas price volatility, and potential protocol vulnerabilities on the Arc network.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <AlertTriangle size={20} className="text-slate-400" />
                <h2 className="text-xl font-bold">Smart Contract Risk</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                While our contracts are designed for security and atomicity, all smart contracts carry technical risk. Users should verify their distribution configurations (recipients and percentages) before finalizing settlement rails.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <Construction size={20} className="text-slate-400" />
                <h2 className="text-xl font-bold">Testnet Disclaimer</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                ArcSplit currently operates on the Arc Testnet. Testnet tokens have no real-world value. Do not attempt to send mainnet assets to testnet addresses. We are not responsible for assets lost due to network mismatch.
              </p>
            </section>

            <section className="space-y-4 p-8 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-3 text-slate-900">
                <HardDrive size={20} className="text-slate-400" />
                <h2 className="text-lg font-bold">No Financial Guarantees</h2>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                ArcSplit is a technical distribution tool, not a financial advisor. We do not guarantee any financial outcomes, revenue generation, or profit from the use of our settlement rails.
              </p>
            </section>
          </div>

          <div className="mt-20 pt-12 border-t border-slate-100 text-slate-400 text-sm">
            Last Updated: May 2026
          </div>
        </motion.div>
      </main>
    </div>
  );
}
