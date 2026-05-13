'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ReceiptText, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Clock, 
  Wallet, 
  ArrowRight,
  Filter,
  Copy,
  LayoutDashboard,
  PlusCircle,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function HistoryPage() {
  const { address, isConnected } = useAccount();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (isConnected && address) {
      fetchHistory();
    }
  }, [isConnected, address]);

  const fetchHistory = async () => {
    if (!address) return;
    setIsLoading(true);

    try {
      // 1. Get all splits created by this wallet
      const { data: mySplits, error: splitsError } = await supabase
        .from('splits')
        .select('id')
        .ilike('creator_address', address);

      if (splitsError) throw splitsError;

      const splitIds = mySplits?.map(s => s.id) || [];

      if (splitIds.length === 0) {
        setPayments([]);
        setIsLoading(false);
        return;
      }

      // 2. Fetch payments for those splits
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          splits(
            name,
            creator_address,
            recipients(address, percentage)
          )
        `)
        .in('split_id', splitIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayments = payments
    .filter(p => 
      p.splits.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tx_hash.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'highest') return b.amount - a.amount;
      if (sortBy === 'lowest') return a.amount - b.amount;
      return 0;
    });

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 py-32 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 bg-white p-12 md:p-20 rounded-[48px] border border-slate-100 shadow-premium relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-slate-50 rounded-full blur-3xl -z-10 opacity-50" />
            
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white mx-auto mb-10 shadow-xl shadow-black/20">
              <Clock size={32} strokeWidth={1.5} />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                Programmable USDC <br /> Settlement Infrastructure
              </h1>
              <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
                Connect your wallet to manage payout rails, track settlements, and distribute revenue on Arc.
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <Link href="/dashboard" className="text-slate-400 hover:text-black transition-colors">
                  <LayoutDashboard size={20} />
               </Link>
               <span className="text-slate-300">/</span>
               <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settlement History</h1>
            </div>
            <p className="text-slate-500 text-lg">Detailed audit log of all distributions managed by your rails.</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by split name or transaction hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-black outline-none transition-all"
            />
          </div>
          <div className="relative min-w-[200px]">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-black outline-none transition-all font-bold text-slate-700 pr-10"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-white rounded-3xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-[40px] p-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mx-auto mb-8 text-slate-300">
              <Clock size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No settlement activity yet</h3>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto text-lg leading-relaxed">Payments routed through your rails will appear here as professional audit logs.</p>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-slate-800 transition-all inline-flex items-center gap-2"
            >
              Go to Rails <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <HistoryRow key={payment.id} payment={payment} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function HistoryRow({ payment }: { payment: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
            <ReceiptText size={24} />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{payment.splits.name}</div>
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <Clock size={14} />
              {new Date(payment.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Settlement Amount</div>
            <div className="text-xl font-bold text-slate-900">{payment.amount} <span className="text-sm font-medium text-slate-400">USDC</span></div>
          </div>
          
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Transaction</div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-slate-600">{payment.tx_hash.slice(0, 12)}...</span>
              <a 
                href={`https://explorer.arc.network/tx/${payment.tx_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-black transition-colors"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl transition-all flex items-center gap-2 uppercase tracking-widest"
          >
            {isExpanded ? 'Hide Details' : 'View Payouts'}
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-50 bg-slate-50/30 p-6 md:p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {payment.splits.recipients?.map((r: any, idx: number) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recipient {idx + 1}</div>
                    <div className="flex items-center gap-2 text-sm font-mono text-slate-600">
                      {r.address.slice(0, 6)}...{r.address.slice(-4)}
                      <button onClick={() => { navigator.clipboard.writeText(r.address); alert('Address copied'); }} className="text-slate-200 hover:text-slate-400 transition-colors">
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{((payment.amount * r.percentage) / 10000).toFixed(2)} USDC</div>
                    <div className="text-[10px] font-bold text-slate-500">{r.percentage / 100}% share</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
