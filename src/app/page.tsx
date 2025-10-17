"use client";

import React from "react";
import {
  Calendar,
  Zap,
  Trophy,
  TrendingUp,
  Flame,
  CheckCircle,
  Sparkles,
  Wallet,
  LogOut,
  AlertCircle,
} from "lucide-react";
import { useDailyGM } from "@/hooks/useDailyGM";

// Types
interface SubAccount {
  address: `0x${string}`;
}

interface GMRecord {
  lastGM: bigint;
  currentStreak: bigint;
  longestStreak: bigint;
  totalGMs: bigint;
  canGMToday: boolean;
}

interface QuestComplianceBannerProps {
  subAccount: SubAccount;
  universalAddress: string;
  onDisconnect: () => void;
  onFundAccount: () => void;
  needsFunding?: boolean;
}

const QuestComplianceBanner: React.FC<QuestComplianceBannerProps> = ({
  subAccount,
  universalAddress,
  onDisconnect,
  onFundAccount,
  needsFunding,
}) => {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-white text-sm mb-0.5">Base Quest</h3>
          <p className="text-xs text-blue-100">Sub Accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onFundAccount}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50"
          >
            <Wallet className="w-3.5 h-3.5" />
            Fund
          </button>
          <button
            onClick={onDisconnect}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white bg-opacity-20 text-white rounded-lg text-xs font-medium hover:bg-opacity-30"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-blue-100">Universal:</span>
          <span className="font-mono text-white bg-white bg-opacity-20 px-2 py-1 rounded">
            {formatAddress(universalAddress)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-blue-100">Sub Account:</span>
          <span className="font-mono text-white bg-purple-500 bg-opacity-40 px-2 py-1 rounded">
            {formatAddress(subAccount.address)}
          </span>
        </div>
      </div>
      {needsFunding && (
        <div className="mt-3 bg-yellow-400 bg-opacity-20 border border-yellow-300 border-opacity-30 rounded-lg p-2.5">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-200 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white text-xs mb-1">
                Fund Required
              </p>
              <p className="text-xs text-yellow-100">
                Add ~$5-$10 ETH for gas. Base is cheap!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function DailyGMPage() {
  const {
    connected,
    universalAddress,
    subAccount,
    gmRecord,
    loading,
    status,
    txHash,
    connect,
    disconnect,
    fundAccount,
    sayGM,
  } = useDailyGM();
  const [needsFunding] = React.useState(false);

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Daily GM
            </h1>
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-blue-200 text-sm">Build your onchain streak</p>
        </div>

        {connected && subAccount && (
          <QuestComplianceBanner
            subAccount={subAccount}
            universalAddress={universalAddress}
            onDisconnect={disconnect}
            onFundAccount={fundAccount}
            needsFunding={needsFunding}
          />
        )}

        <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connected ? "bg-green-500" : "bg-gray-500"
              }`}
            />
            <h2 className="text-sm font-semibold text-white">Status</h2>
          </div>
          <p className="text-xs text-gray-300">{status}</p>
          {txHash && (
            <div className="mt-3 p-2.5 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg">
              <a
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline"
              >
                View on BaseScan →
              </a>
            </div>
          )}
        </div>

        {!connected ? (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-center mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Start Your GM Streak
            </h2>
            <p className="text-white text-sm opacity-90 mb-4">
              Connect your Base Account
            </p>
            <button
              onClick={connect}
              disabled={loading}
              className="w-full bg-white text-purple-700 px-6 py-3 rounded-lg font-bold"
            >
              {loading ? "Connecting..." : "Connect Base Account"}
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-6 text-center mb-4">
            <button
              onClick={sayGM}
              disabled={loading || !gmRecord?.canGMToday}
              className="w-full bg-white text-orange-600 px-8 py-4 rounded-lg font-bold text-lg"
            >
              {loading
                ? "Sending..."
                : gmRecord?.canGMToday
                ? "Say GM"
                : "GM Sent"}
            </button>
          </div>
        )}

        {gmRecord && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-800 bg-opacity-50 rounded-xl border border-slate-700 p-3 text-center">
              <Flame className="w-5 h-5 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {gmRecord.currentStreak.toString()}
              </p>
              <p className="text-xs text-gray-400">Streak</p>
            </div>
            <div className="bg-slate-800 bg-opacity-50 rounded-xl border border-slate-700 p-3 text-center">
              <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {gmRecord.longestStreak.toString()}
              </p>
              <p className="text-xs text-gray-400">Best</p>
            </div>
            <div className="bg-slate-800 bg-opacity-50 rounded-xl border border-slate-700 p-3 text-center">
              <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {gmRecord.totalGMs.toString()}
              </p>
              <p className="text-xs text-gray-400">Total</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
