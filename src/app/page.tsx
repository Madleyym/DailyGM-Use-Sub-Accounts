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
} from "lucide-react";
import { useDailyGM } from "@/hooks/useDailyGM";

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
    sayGM,
  } = useDailyGM();

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Daily GM
            </h1>
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
          <p className="text-gray-700 text-lg mb-2 font-medium">
            Build your streak, no pop-ups needed
          </p>
          <p className="text-gray-600 text-base">
            Say Good Morning onchain every day
          </p>
          <div className="mt-6 inline-block bg-indigo-100 text-indigo-800 px-5 py-2.5 rounded-lg text-sm font-semibold">
            Powered by Base Account SDK + Sub Accounts
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  connected ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              Connection Status
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  loading ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
              <p className="text-gray-700 text-sm font-medium">{status}</p>
            </div>

            {universalAddress && (
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm font-medium">
                    Universal Account:
                  </span>
                  <span className="font-mono text-gray-900 text-sm bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200">
                    {formatAddress(universalAddress)}
                  </span>
                </div>
                {subAccount && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm font-medium">
                      Sub Account:
                    </span>
                    <span className="font-mono text-gray-900 text-sm bg-purple-100 px-3 py-1.5 rounded-md border border-purple-200">
                      {formatAddress(subAccount.address)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {txHash && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-900 mb-1.5 font-semibold">
                  Transaction Submitted Successfully
                </p>
                <p className="text-sm text-green-800 font-mono break-all">
                  {formatAddress(txHash)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Action Card */}
        {!connected ? (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-5">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Start Your GM Streak
              </h2>
              <p className="text-white text-base opacity-95 max-w-md mx-auto leading-relaxed">
                Connect your Base Account once and enjoy a seamless experience
                with no wallet pop-ups
              </p>
            </div>

            <button
              onClick={connect}
              disabled={loading}
              className="bg-white text-purple-700 px-8 py-4 rounded-lg font-bold text-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-md inline-flex items-center gap-2.5"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Connect Base Account
                </>
              )}
            </button>

            <div className="mt-6 flex items-center justify-center gap-6 text-white text-sm opacity-90 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>No Pop-ups</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>Auto Setup</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>Secure</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-5">
                {gmRecord?.canGMToday ? (
                  <Calendar className="w-12 h-12 text-white" />
                ) : (
                  <CheckCircle className="w-12 h-12 text-white" />
                )}
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                {gmRecord?.canGMToday ? "Good Morning" : "GM Sent Today"}
              </h2>
              <p className="text-white text-lg opacity-95 font-medium">
                {gmRecord?.canGMToday
                  ? "Ready to continue your streak?"
                  : "Come back tomorrow for another GM"}
              </p>
            </div>

            <button
              onClick={sayGM}
              disabled={loading || !gmRecord?.canGMToday}
              className="bg-white text-orange-600 px-10 py-5 rounded-lg font-bold text-xl active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-md inline-flex items-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : gmRecord?.canGMToday ? (
                <>
                  <Zap className="w-6 h-6" />
                  Say GM
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  GM Sent
                </>
              )}
            </button>

            {gmRecord?.canGMToday && (
              <p className="mt-5 text-white text-sm opacity-90 font-medium">
                No wallet confirmation needed - Auto Spend Permissions enabled
              </p>
            )}
          </div>
        )}

        {/* Stats Grid */}
        {gmRecord && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-base">
                  Current Streak
                </h3>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {gmRecord.currentStreak.toString()}
              </p>
              <p className="text-sm text-gray-600 font-medium">days in a row</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-base">
                  Longest Streak
                </h3>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {gmRecord.longestStreak.toString()}
              </p>
              <p className="text-sm text-gray-600 font-medium">personal best</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 text-base">
                  Total GMs
                </h3>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {gmRecord.totalGMs.toString()}
              </p>
              <p className="text-sm text-gray-600 font-medium">all time</p>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            How Sub Accounts Work
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-700 text-2xl font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 text-base">
                Connect Once
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Connect your Base Account one time. No need to connect again on
                return visits.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-700 text-2xl font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 text-base">
                Auto Sub Account
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                A dedicated sub account is created automatically for this app.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-green-700 text-2xl font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 text-base">
                No Pop-ups
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Transactions execute seamlessly. Auto Spend Permissions handle
                gas.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pb-8 space-y-3">
          <p className="text-gray-600 text-sm font-semibold">
            Daily GM Onchain App
          </p>
          <p className="text-gray-500 text-xs font-mono">
            Contract:{" "}
            {formatAddress("0xf5b0E9cFD956929cFB2F168667CC392c29163535")} on
            Base
          </p>
          <a
            href="https://account.base.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-blue-600 text-sm font-medium"
          >
            Manage your accounts at account.base.app
          </a>
        </div>
      </div>
    </div>
  );
}
