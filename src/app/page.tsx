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

interface GMStats {
  gmCount: bigint;
  points: bigint;
  soulboundTokens: bigint;
  currentStreak: bigint;
}

interface GMExtended {
  longestStreak: bigint;
  puzzleSolved: boolean;
  whitelisted: boolean;
  rank: bigint;
}

interface QuestComplianceBannerProps {
  subAccount: SubAccount;
  universalAddress: string;
  onDisconnect: () => void;
  onFundAccount: () => void;
  needsFunding?: boolean;
}

// Quest Banner Component
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
          <h3 className="font-bold text-white text-sm mb-0.5">
            Base Builder Quest 11
          </h3>
          <p className="text-xs text-blue-100">Sub Accounts Demo</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onFundAccount}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5" />
            Fund
          </button>
          <button
            onClick={onDisconnect}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white bg-opacity-20 text-white rounded-lg text-xs font-medium hover:bg-opacity-30 transition-colors"
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
            <div className="flex-1">
              <p className="font-semibold text-white text-xs mb-1">
                Fund Required
              </p>
              <p className="text-xs text-yellow-100">
                Add ~$5-$10 ETH for gas fees. Base fees are cheap (~$0.01-0.05)!
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
    gmStats,
    gmExtended,
    canSend,
    timeRemaining,
    loading,
    status,
    txHash,
    connect,
    disconnect,
    fundAccount,
    sendGM,
  } = useDailyGM();

  const [needsFunding] = React.useState(false);

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTimeRemaining = (seconds: bigint) => {
    const hours = Number(seconds) / 3600;
    if (hours < 1) {
      const minutes = Math.ceil(Number(seconds) / 60);
      return `${minutes}m`;
    }
    return `${hours.toFixed(1)}h`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
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

        {/* Quest Banner */}
        {connected && subAccount && (
          <QuestComplianceBanner
            subAccount={subAccount}
            universalAddress={universalAddress}
            onDisconnect={disconnect}
            onFundAccount={fundAccount}
            needsFunding={needsFunding}
          />
        )}

        {/* Status Card */}
        <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connected ? "bg-green-500" : "bg-gray-500"
              }`}
            />
            <h2 className="text-sm font-semibold text-white">Status</h2>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                loading ? "bg-blue-500 animate-pulse" : "bg-gray-600"
              }`}
            />
            <p className="text-xs text-gray-300">{status}</p>
          </div>

          {txHash && (
            <div className="mt-3 p-2.5 bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg">
              <p className="text-xs text-green-400 mb-1 font-semibold">
                Transaction Submitted
              </p>
              <a
                href={`https://basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline font-mono break-all"
              >
                View on BaseScan →
              </a>
            </div>
          )}
        </div>

        {/* Main Action Card */}
        {!connected ? (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-center mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Start Your GM Streak
            </h2>
            <p className="text-white text-sm opacity-90 mb-4">
              Connect your Base Account once
            </p>

            <button
              onClick={connect}
              disabled={loading}
              className="w-full bg-white text-purple-700 px-6 py-3 rounded-lg font-bold text-base hover:bg-blue-50 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Connect Base Account
                </>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center gap-4 text-white text-xs opacity-80">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>Sub Accounts</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>Auto Spend</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>Secure</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-6 text-center mb-4">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              {canSend ? (
                <Calendar className="w-10 h-10 text-white" />
              ) : (
                <CheckCircle className="w-10 h-10 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {canSend ? "Good Morning!" : "GM Sent!"}
            </h2>
            <p className="text-white text-sm opacity-90 mb-4">
              {canSend
                ? "Ready to continue your streak?"
                : `Next GM in ${formatTimeRemaining(timeRemaining)}`}
            </p>

            <button
              onClick={sendGM}
              disabled={loading || !canSend || needsFunding}
              className="w-full bg-white text-orange-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-50 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : needsFunding ? (
                <>
                  <Wallet className="w-5 h-5" />
                  Fund Account First
                </>
              ) : canSend ? (
                <>
                  <Zap className="w-5 h-5" />
                  Say GM
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Cooldown Active
                </>
              )}
            </button>

            {gmStats && gmExtended && (
              <div className="mt-4 flex items-center justify-center gap-4 text-white text-xs">
                <div className="flex items-center gap-1">
                  <span className="opacity-70">Points:</span>
                  <span className="font-bold">{gmStats.points.toString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="opacity-70">Rank:</span>
                  <span className="font-bold">
                    {gmExtended.rank > 0 ? `#${gmExtended.rank}` : "N/A"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        {gmStats && gmExtended && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm rounded-xl border border-slate-700 p-3 text-center">
              <Flame className="w-5 h-5 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white mb-0.5">
                {gmStats.currentStreak.toString()}
              </p>
              <p className="text-xs text-gray-400">Streak</p>
            </div>

            <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm rounded-xl border border-slate-700 p-3 text-center">
              <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white mb-0.5">
                {gmExtended.longestStreak.toString()}
              </p>
              <p className="text-xs text-gray-400">Best</p>
            </div>

            <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm rounded-xl border border-slate-700 p-3 text-center">
              <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white mb-0.5">
                {gmStats.gmCount.toString()}
              </p>
              <p className="text-xs text-gray-400">Total</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-gray-400 text-xs">
            Contract:{" "}
            <a
              href={`https://basescan.org/address/0xA3a6B841B9FE7F8524ddeCD1038301dCF176C122`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline font-mono"
            >
              {formatAddress("0xA3a6B841B9FE7F8524ddeCD1038301dCF176C122")}
            </a>
          </p>
          <div className="flex items-center justify-center gap-3 text-xs">
            <a
              href="https://account.base.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Manage Accounts →
            </a>
            <span className="text-gray-600">•</span>
            <a
              href="https://docs.base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Docs →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
