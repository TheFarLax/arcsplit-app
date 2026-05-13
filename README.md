# ArcSplit | Programmable Settlement Infrastructure

**Automated USDC Distribution Rails on Arc Network.**

ArcSplit is a professional-grade settlement infrastructure that enables creators and businesses to build programmable payout rails. Built on the Arc Testnet, it provides a trustless, atomic distribution engine for stablecoin revenue splitting.

## 🚀 Infrastructure Features

- **Settlement Rails**: Create reusable payout configurations with up to 100% distribution across multiple wallets.
- **Atomic Settlement**: Funds are routed instantly to recipients in a single, trustless transaction on-chain.
- **Audit Logging**: Dedicated settlement history for professional tracking and auditing of all distributions.
- **Infrastructure Dashboard**: A high-fidelity, fintech-grade interface for managing payout rails and monitoring flow.
- **Payment Terminals**: Polished, QR-ready mobile payment experience for instant USDC settlement.

## 🛠️ Technical Stack

- **Core Framework**: Next.js 16 (App Router) with Turbopack.
- **Styling**: Tailwind CSS, Framer Motion for premium micro-interactions.
- **Web3 Layer**: Wagmi v2, Viem v2, RainbowKit.
- **Database/Storage**: Supabase (PostgreSQL) for meta-data and rail indexing.
- **Smart Contracts**: Solidity 0.8.20 (deployed on Arc Testnet ID: 5042002).

## 🔧 Environment Setup

1. **Configurations**:
   Copy `.env.local.example` to `.env.local`.
   ```bash
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x5F3fF0545c17C2c66ECbd1EbE451aF02a11EEF97
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Installation**:
   ```bash
   npm install
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

## 🏗️ Design Philosophy

ArcSplit rejects "degen" aesthetics in favor of professional fintech depth. Inspired by Stripe and Mercury, the interface uses a minimalist palette (Slate, Graphite, White) with refined shadows and intentional typography to provide a trustworthy environment for financial operations.

---
Built for the **Arc Advanced Agentic Coding** ecosystem.
