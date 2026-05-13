'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  Wallet, 
  Filter, 
  Copy, 
  History as HistoryIcon,
  SearchX,
  CreditCard
} from 'lucide-react';
import { arcTestnet } from '@/lib/chains';

export default function HistoryPage() {
  const { address, isConnected } = useAccount();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterDays, setFilterDays] = useState('all');

  useEffect(() => {
    if (isConnected && address) {
      fetchPaymentHistory();
    }
  }, [isConnected, address]);

  const fetchPaymentHistory = async () => {
    setIsLoading(true);
    // Fetch payments where the user is either the payer OR the creator of the split
    // For now, we'll fetch all payments related to the user's splits
    const { data: userSplits } = await supabase
      .from('splits')
      .select('id')
      .eq('creator_address', address);

    const splitIds = userSplits?.map(s => s.id) || [];

    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        splits (
          name,
          creator_address
        )
      `)
      .in('split_id', splitIds)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPayments(data);
    }
    setIsLoading(false);
  };

  const filteredPayments = payments
    .filter(p => {
      const query = searchQuery.toLowerCase();
      const splitName = p.splits?.name?.toLowerCase() || '';
      const txHash = p.tx_hash?.toLowerCase() || '';
      const payer = p.payer_address?.toLowerCase() || '';
      
      const matchesSearch = splitName.includes(query) || txHash.includes(query) || payer.includes(query);
      
      if (filterDays === 'all') return matchesSearch;
      
      const now = new Date();
      const paymentDate = new Date(p.created_at);
      const diffTime = Math.abs(now.getTime() - paymentDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (filterDays === '7') return matchesSearch && diffDays <= 7;
      if (filterDays === '30') return matchesSearch && diffDays <= 30;
      
      return matchesSearch;
    })
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
        <div className="max-w-5xl mx-auto px-6 py-32 text-center">
          <div className="w-24 h-24 bg-white shadow-xl shadow-slate-200/50 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-slate-900 border border-slate-100">
            <HistoryIcon size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Payment History</h2>
          <p className="text-slate-500 mb-10 max-w-md mx-auto text-lg">Connect your wallet to view all historical settlements and distributions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Payment History</h1>
            <p className="text-slate-500 mt-2 text-lg">Detailed record of all settlements and distributions.</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-4 py-2 bg-slate-50 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Volume</div>
              <div className="text-lg font-bold text-slate-900">
                {payments.reduce((acc, p) => acc + parseFloat(p.amount), 0).toFixed(2)} <span className="text-xs text-slate-400">USDC</span>
              </div>
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Settlements</div>
              <div className="text-lg font-bold text-slate-900">{payments.length}</div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by split, hash, or payer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-black outline-none transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="relative min-w-[160px]">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-black outline-none transition-all font-bold text-slate-700 pr-10"
              >
                <option value="newest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
            <div className="relative min-w-[160px]">
              <select 
                value={filterDays}
                onChange={(e) => setFilterDays(e.target.value)}
                className="w-full appearance-none px-5 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-black outline-none transition-all font-bold text-slate-700 pr-10"
              >
                <option value="all">All Time</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-[40px] p-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mx-auto mb-8 text-slate-300">
              <SearchX size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No payments found</h3>
            <p className="text-slate-500 mb-0 max-w-sm mx-auto text-lg leading-relaxed">Adjust your search or filters to find specific settlements.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function PaymentRow({ payment }: { payment: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:border-slate-200 transition-all"
    >
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Main Info */}
          <div className="md:col-span-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 leading-tight">{payment.splits?.name || 'Unnamed Split'}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Settled</span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock size={12} /> {new Date(payment.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="md:col-span-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Amount</div>
            <div className="text-lg font-bold text-slate-900">{parseFloat(payment.amount).toFixed(2)} <span className="text-xs text-slate-400">USDC</span></div>
          </div>

          {/* Payer */}
          <div className="md:col-span-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payer</div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-slate-500">{payment.payer_address?.slice(0, 6)}...{payment.payer_address?.slice(-4)}</span>
              <button onClick={() => { navigator.clipboard.writeText(payment.payer_address); alert('Address copied'); }} className="text-slate-300 hover:text-slate-600 transition-colors">
                <Copy size={12} />
              </button>
            </div>
          </div>

          {/* Hash */}
          <div className="md:col-span-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Transaction</div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-slate-500">{payment.tx_hash?.slice(0, 6)}...</span>
              <a href={`${arcTestnet.blockExplorers.default.url}/tx/${payment.tx_hash}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-black">
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Toggle */}
          <div className="md:col-span-2 flex justify-end">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-all"
            >
              Details {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-50 bg-slate-50/30 overflow-hidden"
          >
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Distribution Snapshot</h4>
                <div className="space-y-3">
                  {(payment.payout_data || []).map((payout: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-400">
                          {idx + 1}
                        </div>
                        <div className="font-mono text-sm text-slate-600">{payout.address?.slice(0, 8)}...{payout.address?.slice(-6)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">{payout.amount} USDC</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{payout.percentage / 100}%</div>
                      </div>
                    </div>
                  ))}
                  {(!payment.payout_data || payment.payout_data.length === 0) && (
                    <p className="text-sm text-slate-400 italic">No payout snapshot available for this legacy transaction.</p>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Programmable Routing</h4>
                  <div className="p-6 bg-white rounded-3xl border border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      This payment was automatically routed through the <strong>{payment.splits?.name}</strong> infrastructure. 
                      All recipients listed on the left received their funds atomically in the same transaction.
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold">
                      <CheckCircle2 size={14} /> Settlement Confirmed on Arc Testnet
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => { navigator.clipboard.writeText(payment.tx_hash); alert('Tx Hash copied'); }}
                    className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                  >
                    <Copy size={14} /> Copy Hash
                  </button>
                  <a 
                    href={`${arcTestnet.blockExplorers.default.url}/tx/${payment.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-black text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-2"
                  >
                    View on ArcScan <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
