'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import { CheckCircle2, ExternalLink, ArrowRight, Share2, Printer, Copy } from 'lucide-react';
import { arcTestnet } from '@/lib/chains';
import { supabase } from '@/lib/supabase';

function ReceiptContent() {
  const { hash } = useParams();
  const searchParams = useSearchParams();
  const splitId = searchParams.get('splitId');
  const amount = searchParams.get('amount');
  
  const [split, setSplit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (splitId) {
      fetchSplitDetails();
    }
  }, [splitId]);

  const fetchSplitDetails = async () => {
    const { data, error } = await supabase
      .from('splits')
      .select('*, recipients(*)')
      .eq('id', splitId)
      .single();
    
    if (!error && data) {
      setSplit(data);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: 'ArcSplit Receipt',
      text: `Payment of ${amount} USDC settled on Arc Testnet.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  return (
    <main className="max-w-2xl mx-auto px-6 py-16 print:py-0 print:px-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden print:border-none print:shadow-none"
      >
        {/* Header */}
        <div className="bg-slate-900 p-12 text-center text-white relative overflow-hidden print:bg-white print:text-black print:border-b print:border-slate-200">
          <div className="absolute top-0 right-0 p-8 opacity-10 print:hidden">
              <CheckCircle2 size={120} />
          </div>
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20 print:hidden"
          >
            <CheckCircle2 size={40} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Settlement Finalized</h1>
          <p className="text-slate-400 font-medium tracking-tight">Arc Testnet Programmable Payout Complete</p>
          <div className="mt-8 text-5xl font-bold tracking-tighter">{amount} <span className="text-xl text-slate-500 font-medium">USDC</span></div>
        </div>

        {/* Details */}
        <div className="p-12 space-y-10">
          <section>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Settlement Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-bold text-slate-900">Finalized & Distributed</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Network</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">Arc Testnet</div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Timestamp</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">{mounted ? new Date().toLocaleString() : 'Loading...'}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Tx Hash</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-mono text-slate-600 truncate max-w-[120px]">{hash?.toString().slice(0, 12)}...</span>
                    <button onClick={() => { navigator.clipboard.writeText(hash as string); alert('Hash copied'); }} className="text-slate-400 hover:text-black print:hidden">
                      <Copy size={14} />
                    </button>
                    <a href={`${arcTestnet.blockExplorers.default.url}/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-black print:hidden">
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payout Breakdown</h3>
              <span className="text-xs font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded">Atomic Split</span>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <div className="h-20 bg-slate-50 animate-pulse rounded-2xl" />
              ) : split?.recipients?.map((r: any, i: number) => (
                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-slate-400 text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-mono text-slate-900 flex items-center gap-2">
                        {r.address.slice(0, 6)}...{r.address.slice(-4)}
                        <button onClick={() => { navigator.clipboard.writeText(r.address); alert('Address copied'); }} className="text-slate-300 hover:text-slate-600 print:hidden">
                          <Copy size={12} />
                        </button>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Recipient Address</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{((parseFloat(amount || '0') * r.percentage) / 10000).toFixed(2)} USDC</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase bg-white px-1.5 py-0.5 rounded inline-block mt-1">
                      {r.percentage / 100}% Share
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="pt-8 border-t border-slate-100 print:hidden">
            <div className="flex gap-4">
              <button 
                onClick={handleShare}
                className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                 <Share2 size={16} /> Share
              </button>
              <button 
                onClick={handlePrint}
                className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                 <Printer size={16} /> Print Receipt
              </button>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="w-full py-5 bg-black text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all print:hidden"
          >
            Back to Dashboard <ArrowRight size={20} />
          </Link>
        </div>
      </motion.div>
      
      <p className="mt-8 text-center text-slate-400 text-sm print:text-black">
          Settlement powered by Arc Testnet Smart Contracts. <br/>
          USDC Contract: 0x3600...0000
      </p>
    </main>
  );
}

export default function ReceiptPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <ReceiptContent />
      </Suspense>
    </div>
  );
}
