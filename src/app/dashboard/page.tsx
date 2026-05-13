'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Plus, Copy, ExternalLink, Trash2, Users, ReceiptText, Wallet, ArrowUpRight, Activity, TrendingUp, Layers, Search, ChevronDown, ChevronUp, Filter, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { supabase } from '@/lib/supabase';
import { parseUnits, parseEventLogs } from 'viem';

const CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "address[]", "name": "recipients", "type": "address[]" },
      { "internalType": "uint256[]", "name": "percentages", "type": "uint256[]" }
    ],
    "name": "createSplit",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "splitId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" }
    ],
    "name": "SplitCreated",
    "type": "event"
  }
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [splits, setSplits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Form State
  const [splitName, setSplitName] = useState('');
  const [recipients, setRecipients] = useState([{ address: '', percentage: '' }]);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { data: receipt, isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConnected && address) {
      fetchSplits();
      fetchRecentPayments();
    }
  }, [isConnected, address]);

  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  const fetchRecentPayments = async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*, splits(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setRecentPayments(data);
    }
  };

  useEffect(() => {
    if (isConfirmed && receipt) {
      console.log('Transaction confirmed. Receipt:', receipt);
      
      const logs = parseEventLogs({
        abi: CONTRACT_ABI,
        eventName: 'SplitCreated',
        logs: receipt.logs,
      });

      console.log('Parsed logs:', logs);
      const splitId = logs.length > 0 ? Number((logs[0].args as any).splitId) : 0;
      console.log('Extracted splitId:', splitId);

      handleSaveToSupabase(splitId);
      setIsModalOpen(false);
      resetForm();
    }
  }, [isConfirmed, receipt]);

  const fetchSplits = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('splits')
      .select('*, recipients(*), payments(*)')
      .eq('creator_address', address)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const processedSplits = data.map(split => {
        const totalAmount = split.payments?.reduce((acc: number, p: any) => acc + parseFloat(p.amount), 0) || 0;
        const paymentCount = split.payments?.length || 0;
        return { ...split, totalAmount, paymentCount };
      });
      setSplits(processedSplits);
    }
    setIsLoading(false);
  };

  const addRecipient = () => {
    setRecipients([...recipients, { address: '', percentage: '' }]);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (index: number, field: string, value: string) => {
    const newRecipients = [...recipients];
    (newRecipients[index] as any)[field] = value;
    setRecipients(newRecipients);
  };

  const resetForm = () => {
    setSplitName('');
    setRecipients([{ address: '', percentage: '' }]);
  };

  const onCreateSplit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const addresses = recipients.map(r => r.address);
    const percentages = recipients.map(r => BigInt(Math.round(parseFloat(r.percentage) * 100))); // Convert to basis points (e.g. 70.00 -> 7000)

    console.log('--- DEBUG: CREATING SPLIT ---');
    console.log('Name:', splitName);
    console.log('Recipients:', addresses);
    console.log('Percentages (Basis Points):', percentages.map(p => p.toString()));
    console.log('-----------------------------');

    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: 'createSplit',
      args: [splitName, addresses, percentages],
    });
  };

  const handleSaveToSupabase = async (onChainId: number) => {
    const { data: splitData, error: splitError } = await supabase
      .from('splits')
      .insert({
        name: splitName,
        creator_address: address,
        on_chain_id: onChainId,
      })
      .select()
      .single();

    if (splitData) {
      const recipientInserts = recipients.map(r => ({
        split_id: splitData.id,
        address: r.address,
        percentage: parseFloat(r.percentage) * 100,
      }));

      await supabase.from('recipients').insert(recipientInserts);
      fetchSplits();
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Navbar />
        
        {/* Hero Onboarding */}
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="max-w-3xl mb-24">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-full text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-8 shadow-sm"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Infrastructure Live on Arc Testnet
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[0.95] mb-8"
            >
              Programmable USDC <br/>
              <span className="text-slate-400">Revenue Splitting.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-500 mb-12 max-w-xl leading-relaxed"
            >
              Create reusable settlement rails to route stablecoin payments instantly and automatically to multiple recipient wallets.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ConnectButton.Custom>
                {({ openConnectModal, mounted }) => (
                  <button
                    onClick={openConnectModal}
                    className="px-10 py-5 bg-black text-white font-bold rounded-2xl hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-black/20 text-lg"
                  >
                    <Wallet size={24} /> Connect to Infrastructure
                  </button>
                )}
              </ConnectButton.Custom>
            </motion.div>
          </div>

          {/* Product Preview / Demo Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {[
              { label: 'Distributed', value: '142.50', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Payments Routed', value: '14', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Active Rails', value: '5', icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-4 right-6 text-[9px] font-bold text-slate-300 uppercase tracking-widest">Demo Data</div>
                <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <stat.icon size={28} />
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
                <div className="text-3xl font-bold text-slate-900">{stat.value} {i === 0 && <span className="text-sm font-medium text-slate-400">USDC</span>}</div>
              </motion.div>
            ))}
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { title: 'Instant Splitting', desc: 'Distribute funds across multiple wallets in a single atomic transaction.' },
              { title: 'Reusable Links', desc: 'Create permanent settlement rails that accept multiple incoming payments.' },
              { title: 'Arc-Native', desc: 'Built directly on the Arc Testnet for lightning-fast programmable settlement.' },
              { title: 'Full Transparency', desc: 'Historical receipts show the exact payout breakdown for every transaction.' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 + (i * 0.1) }}
              >
                <h3 className="font-bold text-slate-900 mb-3 text-lg">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating Sample Cards (Background/Blurred) */}
        <div className="fixed bottom-0 right-0 p-12 opacity-20 blur-[2px] pointer-events-none hidden xl:block">
           <div className="w-[400px] bg-white p-8 rounded-[40px] border border-slate-200 shadow-2xl rotate-3 translate-y-20">
              <div className="w-12 h-12 bg-black rounded-2xl mb-6" />
              <div className="h-6 w-32 bg-slate-100 rounded-full mb-4" />
              <div className="h-4 w-48 bg-slate-50 rounded-full mb-8" />
              <div className="h-20 w-full bg-slate-50 rounded-[24px]" />
           </div>
        </div>
      </div>
    );
  }

  const totalDistributed = splits.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalSettlements = splits.reduce((acc, s) => acc + s.paymentCount, 0);
  const totalRecipients = splits.reduce((acc, s) => acc + (s.recipients?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Settlement Rails</h1>
            <p className="text-slate-500 mt-2 text-lg">Programmable infrastructure for automated stablecoin distribution.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10"
          >
            <Plus size={24} /> New Settlement Rail
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search rails by name..."
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
              <option value="active">Recently Active</option>
              <option value="payments">Most Payments</option>
              <option value="distributed">Highest Distributed</option>
              <option value="oldest">Oldest First</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp size={24} />
            </div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Distributed</div>
            <div className="text-2xl font-bold text-slate-900">{totalDistributed.toFixed(2)} <span className="text-sm font-medium text-slate-400">USDC</span></div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
              <Activity size={24} />
            </div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Settlements</div>
            <div className="text-2xl font-bold text-slate-900">{totalSettlements} <span className="text-sm font-medium text-slate-400">Transactions</span></div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <Layers size={24} />
            </div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Active Rails</div>
            <div className="text-2xl font-bold text-slate-900">{splits.length} <span className="text-sm font-medium text-slate-400">Infrastructures</span></div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Recipients</div>
            <div className="text-2xl font-bold text-slate-900">{totalRecipients} <span className="text-sm font-medium text-slate-400">Wallets</span></div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : splits.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-[40px] p-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mx-auto mb-8 text-slate-300">
              <Layers size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No settlement rails yet</h3>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto text-lg leading-relaxed">Create your first programmable payout flow to start receiving and distributing USDC automatically.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2 mx-auto"
            >
              <Plus size={20} /> Deploy First Rail
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {splits
              .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .sort((a, b) => {
                if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                if (sortBy === 'active') {
                  const aLast = a.payments?.length > 0 ? new Date(a.payments[a.payments.length-1].created_at).getTime() : 0;
                  const bLast = b.payments?.length > 0 ? new Date(b.payments[b.payments.length-1].created_at).getTime() : 0;
                  return bLast - aLast;
                }
                if (sortBy === 'payments') return b.paymentCount - a.paymentCount;
                if (sortBy === 'distributed') return b.totalAmount - a.totalAmount;
                return 0;
              })
              .map((split) => (
                <SplitCard key={split.id} split={split} />
              ))}
          </div>
        )}

        {recentPayments.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                    <Activity size={20} />
                 </div>
                 Recent Settlement Activity
              </h2>
              <Link href="/history" className="text-sm font-bold text-slate-900 hover:text-slate-600 flex items-center gap-2 group">
                View All History <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-50">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{payment.splits?.name || 'Unknown Split'}</div>
                        <div className="text-xs font-medium text-slate-400">
                          {new Date(payment.created_at).toLocaleString()} • 
                          <span className="font-mono ml-1">{payment.tx_hash.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">+{payment.amount} USDC</div>
                      <div className="text-[10px] font-bold text-green-500 uppercase bg-green-50 px-2 py-0.5 rounded inline-block mt-1">
                        Distributed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Split Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isPending && setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <form onSubmit={onCreateSplit}>
                <div className="p-8 border-b border-slate-100">
                  <h2 className="text-2xl font-bold text-slate-900">Create Split Configuration</h2>
                  <p className="text-slate-500">Define how incoming USDC should be distributed.</p>
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto space-y-8">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Split Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Project Revenue"
                      value={splitName}
                      onChange={(e) => setSplitName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-semibold text-slate-700">Recipients & Percentages</label>
                      <button
                        type="button"
                        onClick={addRecipient}
                        className="text-sm font-bold text-slate-600 hover:text-black flex items-center gap-1"
                      >
                        <Plus size={16} /> Add Recipient
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {recipients.map((r, index) => (
                        <div key={index} className="flex gap-4 items-start">
                          <div className="flex-1">
                            <input
                              required
                              type="text"
                              placeholder="Wallet Address (0x...)"
                              value={r.address}
                              onChange={(e) => updateRecipient(index, 'address', e.target.value)}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm font-mono"
                            />
                          </div>
                          <div className="w-24">
                            <div className="relative">
                              <input
                                required
                                type="number"
                                placeholder="%"
                                value={r.percentage}
                                onChange={(e) => updateRecipient(index, 'percentage', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm"
                              />
                              <span className="absolute right-3 top-3.5 text-slate-400 text-xs font-bold">%</span>
                            </div>
                          </div>
                          {recipients.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRecipient(index)}
                              className="p-3 text-slate-300 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center px-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</span>
                      <span className={`text-sm font-bold ${
                        recipients.reduce((acc, r) => acc + (parseFloat(r.percentage) || 0), 0) === 100 
                        ? 'text-green-600' 
                        : 'text-red-500'
                      }`}>
                        {recipients.reduce((acc, r) => acc + (parseFloat(r.percentage) || 0), 0)}% / 100%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 flex gap-4">
                  <button
                    type="button"
                    onClick={() => !isPending && setIsModalOpen(false)}
                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isPending || isConfirming || recipients.reduce((acc, r) => acc + (parseFloat(r.percentage) || 0), 0) !== 100}
                    type="submit"
                    className="flex-[2] py-4 bg-black text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isPending ? 'Check Wallet...' : isConfirming ? 'Confirming...' : 'Create on Arc'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SplitCard({ split }: { split: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-[32px] border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/10">
          <ReceiptText size={24} />
        </div>
        <div className="flex gap-2 items-center">
          <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Active Rail</span>
          <button 
            onClick={() => {
              const url = `${window.location.origin}/pay/${split.id}`;
              navigator.clipboard.writeText(url);
              alert('Link copied to clipboard');
            }}
            className="p-2.5 text-slate-400 hover:text-black hover:bg-slate-100 rounded-xl transition-all"
            title="Copy Payment Link"
          >
            <Copy size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-bold text-slate-900 mb-1 leading-tight">{split.name}</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{split.recipients?.length || 0} Recipients</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">{split.paymentCount} Settlements</span>
          </div>
        </div>
        
        <div className="bg-slate-50 p-5 rounded-[24px] mb-6 flex justify-between items-center border border-slate-100">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Settled</div>
            <div className="text-xl font-bold text-slate-900">{split.totalAmount.toFixed(2)} <span className="text-sm font-medium text-slate-400">USDC</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Activity</div>
            <div className="text-sm font-bold text-slate-600">
              {split.payments?.length > 0 
                ? new Date(split.payments[split.payments.length - 1].created_at).toLocaleDateString() 
                : 'No Activity'}
            </div>
          </div>
        </div>

        {/* Recipients Accordion */}
        <div className="mb-6">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between py-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-black transition-colors"
          >
            <span>{isExpanded ? 'Hide Recipients' : 'View Recipients'}</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <AnimatePresence>
            {(isExpanded || (split.recipients?.length <= 2)) && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-3 mt-3"
              >
                {split.recipients?.map((r: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-slate-50/50 p-2.5 rounded-xl border border-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono text-xs">{r.address.slice(0, 6)}...{r.address.slice(-4)}</span>
                      <button onClick={() => { navigator.clipboard.writeText(r.address); alert('Address copied'); }} className="text-slate-300 hover:text-slate-600 transition-colors">
                        <Copy size={12} />
                      </button>
                    </div>
                    <span className="font-bold text-slate-900">{r.percentage / 100}%</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          {!isExpanded && split.recipients?.length > 2 && (
            <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-5 h-5 rounded-full bg-slate-100 border-2 border-white" />
                ))}
              </div>
              <span>+{split.recipients.length - 2} More Wallets</span>
            </div>
          )}
        </div>
      </div>

      <Link
        href={`/pay/${split.id}`}
        className="w-full py-4 bg-slate-900 text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg shadow-black/5"
      >
        Access Settlement Rail <ExternalLink size={18} />
      </Link>
    </motion.div>
  );
}
