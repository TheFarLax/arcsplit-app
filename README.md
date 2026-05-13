# ArcSplit

**Programmable Stablecoin Revenue Splitting on Arc Testnet.**

ArcSplit is a modern fintech-style MVP that enables automatic, multi-wallet USDC distribution. Built for the Arc ecosystem, it demonstrates how programmable payments can simplify revenue sharing for teams, projects, and creators.

## Key Features

- **Multi-Wallet Splits**: Define multiple recipients with custom payout percentages.
- **Atomic Settlement**: Funds are distributed instantly in a single transaction.
- **Programmable Infrastructure**: Built on Arc Testnet via Solidity smart contracts.
- **Modern UX**: Clean dashboard, simple payment links, and detailed receipts.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS 4, Framer Motion.
- **Web3**: Wagmi, Viem, RainbowKit, Reown.
- **Backend**: Supabase.
- **Contracts**: Solidity 0.8.20.
- **Network**: Arc Testnet (Chain ID: 5042002).

## Quick Start

1. **Setup Environment**:
   Copy `.env.local.example` to `.env.local` and fill in your Supabase and Reown credentials.

2. **Deploy Contract**:
   Use Foundry to deploy `contracts/ArcSplit.sol` to the Arc Testnet. Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`.

3. **Install & Run**:
   ```bash
   npm install
   npm run dev
   ```

## Design Philosophy

ArcSplit follows a "Fintech First" design aesthetic, inspired by platforms like Stripe and Mercury. It prioritizes clarity, minimal use of color, and high-quality typography over typical "degen" crypto aesthetics.
