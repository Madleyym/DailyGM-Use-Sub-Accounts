# Daily GM ☀️

A simple onchain app for building your daily GM streak on Base - with **zero wallet pop-ups**.

Built for **Base Builder Quest 11** using Sub Accounts with Auto Spend Permissions.

## What is this?

Daily GM lets you send a "Good Morning" onchain once every 6 hours to build your streak and earn points. 

The cool part? **No annoying wallet pop-ups** - transactions just happen in the background thanks to Base Sub Accounts.

## Features

- **Sub Accounts** - Auto-created on connect
- **Auto Spend** - No wallet confirmations needed
- **Streak System** - Build your daily streak
- **Points & Leaderboard** - Compete with others
- **Simple UI** - Clean and easy to use

## Tech Stack

- **Next.js 14** (App Router)
- **Base Account SDK** - For Sub Accounts
- **Viem** - Ethereum interactions
- **Tailwind CSS** - Styling
- **Smart Contract** - Custom GM contract on Base

## How it works

1. **Connect** - Links your Base Account and creates a Sub Account
2. **Fund** - Add ~$5-10 ETH to your Sub Account for gas
3. **Send GM** - Click once, transaction happens automatically (no pop-up!)
4. **Build Streak** - Come back every 6 hours to maintain your streak

## Base Builder Quest 11

This project demonstrates:
- ✅ Sub Accounts integration
- ✅ Auto Spend Permissions
- ✅ No wallet pop-ups during transactions
- ✅ Real onchain interactions (Base Mainnet)

## Live Demo

[Live App Here](https://daily-gm-use-sub-accounts.vercel.app/)

## Contract

Daily GM Contract: `0xA3a6B841B9FE7F8524ddeCD1038301dCF176C122`

[View on BaseScan →](https://basescan.org/address/0xA3a6B841B9FE7F8524ddeCD1038301dCF176C122)

## Setup

```bash
# Clone
git clone [your-repo-url]

# Install
npm install

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment

Create `.env.local`:

```env
# No API keys needed - using public RPC
```

## How to Use

1. Visit the app
2. Click "Connect Base Account"
3. Approve Sub Account creation
4. Click "Fund Account" and add ETH
5. Click "Say GM" - no pop-up! ✨
6. Check BaseScan for your transaction

## Project Structure

```
├── app/
│   └── page.tsx          # Main app page
├── hooks/
│   └── useDailyGM.ts     # Contract interaction hook
├── lib/
│   ├── base-account.config.ts  # Base Account SDK setup
│   └── contracts.config.ts     # Contract addresses & ABIs
└── components/
    └── ui/               # UI components
```

## Why Sub Accounts?

Traditional web3 apps require users to confirm every transaction with a wallet pop-up. 

Sub Accounts change this by:
- Creating a separate account with limited permissions
- Allowing pre-approved spending (auto-spend)
- Making onchain interactions feel like web2

Perfect for apps with frequent transactions like this one!

## Screenshots

[Add 1-2 screenshots of your app here]

## Future Ideas

- Multi-day streak rewards
- NFT badges for milestones  
- Social features (see friends' streaks)
- Mobile app version

## License

MIT

---

Built with ☕ for Base Builder Quest 11