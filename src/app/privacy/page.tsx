'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Server, Database, Globe } from 'lucide-react';

export default function PrivacyPage() {
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
            <Shield size={32} strokeWidth={1.5} />
          </div>
          
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-slate-500 text-lg mb-12">How ArcSplit handles your data in a decentralized environment.</p>
          
          <div className="space-y-12">
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <Lock size={20} className="text-slate-400" />
                <h2 className="text-xl font-bold">Wallet Connections</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                ArcSplit only interacts with your wallet through secure, industry-standard protocols (Wagmi/RainbowKit). We never have access to your private keys or seed phrases. All transaction signing happens exclusively within your own wallet provider.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <Database size={20} className="text-slate-400" />
                <h2 className="text-xl font-bold">Metadata Storage</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                We store minimal metadata (such as split names and recipient labels) in a secure database to provide a better dashboard experience. This data is linked only to your public wallet address and is used solely for interface indexing.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <Globe size={20} className="text-slate-400" />
                <h2 className="text-xl font-bold">Blockchain Transparency</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                All settlement configurations and payments are recorded on the Arc Testnet. By nature of blockchain technology, these transactions are public and permanent. ArcSplit does not control and cannot retract data once it is written to the blockchain.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-slate-900">
                <Eye size={20} className="text-slate-400" />
                <h2 className="text-xl font-bold">No Data Selling</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                ArcSplit is an infrastructure tool, not a data broker. We do not sell, rent, or trade your wallet activity or metadata to third parties. Your financial routing configurations remain yours.
              </p>
            </section>

            <section className="space-y-4 p-8 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-3 text-slate-900">
                <Server size={20} className="text-slate-400" />
                <h2 className="text-lg font-bold">Wallet Responsibility</h2>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                You are responsible for the security of your own wallet. ArcSplit will never ask you for your private keys. Ensure you are using the official ArcSplit domain before connecting your wallet or signing any transactions.
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
