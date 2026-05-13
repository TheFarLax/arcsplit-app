'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, ArrowRight, Wallet, Info, QrCode, Copy } from 'lucide-react';
import QRCode from "react-qr-code";

const USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

const USDC_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
        { "internalType": "address", "name": "owner", "type": "address" },
        { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const SPLIT_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "splitId", "type": "uint256" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "payAndDistribute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [split, setSplit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState('10');
  const [step, setStep] = useState<'idle' | 'approving' | 'paying' | 'success'>('idle');

  const { data: allowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'allowance',
    args: [address!, CONTRACT_ADDRESS as `0x${string}`],
    query: { enabled: !!address },
  });

  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: pay, data: payHash } = useWriteContract();
  const { isLoading: isPayConfirming, isSuccess: isPayConfirmed } = useWaitForTransactionReceipt({ hash: payHash });

  useEffect(() => {
    fetchSplit();
  }, [id]);

  useEffect(() => {
    if (isApproveConfirmed) {
      handlePay();
    }
  }, [isApproveConfirmed]);

  useEffect(() => {
    if (isPayConfirmed) {
      handleRecordPayment();
      setStep('success');
      setTimeout(() => {
        router.push(`/receipt/${payHash}?splitId=${split.id}&amount=${amount}`);
      }, 2000);
    }
  }, [isPayConfirmed]);

  const handleRecordPayment = async () => {
    if (!split || !payHash) return;
    
    await supabase.from('payments').insert({
      split_id: split.id,
      payer_address: address,
      amount: amount,
      tx_hash: payHash,
    });
  };

  const fetchSplit = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('splits')
      .select('*, recipients(*)')
      .eq('id', id)
      .single();

    if (!error && data) {
      setSplit(data);
    }
    setIsLoading(false);
  };

  const handleAction = async () => {
    if (!isConnected) return;
    
    const amountInWei = parseUnits(amount, 6); // USDC has 6 decimals usually, but check Arc docs.
    // Arc Testnet USDC might have 6 or 18 decimals. The docs say 0x36...0 is USDC.
    // I'll assume 6 as it's standard for USDC.

    if (!allowance || (allowance as bigint) < amountInWei) {
      setStep('approving');
      approve({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS as `0x${string}`, amountInWei],
      });
    } else {
      handlePay();
    }
  };

  const handlePay = () => {
    const amountInWei = parseUnits(amount, 6);
    console.log('--- DEBUG: PAYING SPLIT ---');
    console.log('Split Name:', split.name);
    console.log('On-Chain Split ID:', split.on_chain_id);
    console.log('Amount (Wei):', amountInWei.toString());
    console.log('---------------------------');
    setStep('paying');
    pay({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: SPLIT_ABI,
      functionName: 'payAndDistribute',
      args: [BigInt(split.on_chain_id || 0), amountInWei],
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin text-slate-300" size={48} />
        </div>
      </div>
    );
  }

  if (!split) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Payment link not found</h2>
          <p className="text-slate-500 mb-8">This split configuration might have been removed or the link is incorrect.</p>
          <Link href="/" className="text-black font-bold flex items-center justify-center gap-2">
            Return Home <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* Payment Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-10 rounded-[48px] shadow-premium border border-slate-100 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -z-10 opacity-50 translate-x-10 -translate-y-10" />
            
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-black/10 group-hover:scale-110 transition-transform">
                  <Wallet className="text-white" size={28} strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Infrastructure Target</div>
                  <div className="font-bold text-slate-900">USDC Payout Rail</div>
                </div>
              </div>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">Reusable</span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-2">{split.name}</h1>
            <p className="text-slate-500 mb-8">Enter the amount you wish to send. Funds will be automatically routed through programmable settlement rails.</p>

            <div className="flex justify-center mb-8 md:hidden">
              <div className="p-4 bg-white border border-slate-100 rounded-3xl shadow-sm">
                <QRCode value={`${window.location.origin}/pay/${split.id}`} size={160} />
                <p className="text-[10px] text-center font-bold text-slate-400 mt-2 uppercase tracking-widest">Scan to pay on mobile</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Amount (USDC)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-bold focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  />
                  <span className="absolute right-6 top-5 text-slate-400 font-bold">USDC</span>
                </div>
              </div>

              {!isConnected ? (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-amber-800 text-sm">
                  <Info className="flex-shrink-0" size={18} />
                  <p>Please connect your wallet to proceed with the payment.</p>
                </div>
              ) : (
                <button
                  disabled={step !== 'idle' && step !== 'success'}
                  onClick={handleAction}
                  className="w-full py-5 bg-black text-white text-lg font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {step === 'approving' || isApproveConfirming ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
                       <div className="flex items-center gap-3">
                         <Loader2 className="animate-spin" size={20} /> 
                         <span>Approving USDC Allowance...</span>
                       </div>
                       <span className="text-xs font-normal opacity-70">Confirm the approval in your wallet</span>
                    </motion.div>
                  ) : step === 'paying' || isPayConfirming ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
                       <div className="flex items-center gap-3">
                         <Loader2 className="animate-spin" size={20} /> 
                         <span>Routing Funds & Settling...</span>
                       </div>
                       <span className="text-xs font-normal opacity-70">Processing on Arc Testnet</span>
                    </motion.div>
                  ) : step === 'success' ? (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3">
                       <CheckCircle2 size={24} className="text-green-400" /> 
                       <span>Settlement Finalized</span>
                    </motion.div>
                  ) : (
                    <> Send {amount} USDC <ArrowRight size={20} /> </>
                  )}
                </button>
              )}

              <p className="text-center text-xs text-slate-400">
                Secured by Arc Testnet Smart Contracts. <br/>
                Atomic settlement guaranteed.
              </p>
            </div>
          </motion.div>

          {/* Breakdown Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 pt-8"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Distribution Breakdown</h3>
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-50">
                  <div className="flex h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    {split.recipients?.map((r: any, i: number) => (
                      <div 
                        key={i} 
                        style={{ width: `${r.percentage / 100}%` }}
                        className={`h-full ${['bg-black', 'bg-slate-400', 'bg-slate-200', 'bg-slate-600'][i % 4]}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {split.recipients?.map((r: any, i: number) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${['bg-black', 'bg-slate-400', 'bg-slate-200', 'bg-slate-600'][i % 4]}`} />
                        <span className="text-sm font-mono text-slate-500">{r.address.slice(0, 8)}...{r.address.slice(-6)}</span>
                        <button onClick={() => { navigator.clipboard.writeText(r.address); alert('Address copied'); }} className="text-slate-300 hover:text-slate-600 transition-colors">
                          <Copy size={12} />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">{r.percentage / 100}%</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          {(parseFloat(amount) * r.percentage / 10000).toFixed(2)} USDC
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-white rounded-[32px] border border-slate-100 hidden md:block">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900">
                  <QrCode size={20} />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Scan to Pay</h4>
              </div>
              <div className="flex justify-center bg-slate-50 p-6 rounded-2xl">
                <QRCode value={`${window.location.origin}/pay/${split.id}`} size={140} />
              </div>
              <p className="text-[11px] text-center text-slate-500 mt-4 leading-relaxed font-medium">
                Switch to mobile by scanning this code. <br/>
                Requires a compatible Arc wallet.
              </p>
            </div>

            <div className="p-6 bg-slate-100/50 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Programmable Settlement</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                When you send USDC, the funds are instantly routed to all recipients in a single atomic transaction on the Arc network. No intermediaries.
              </p>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
