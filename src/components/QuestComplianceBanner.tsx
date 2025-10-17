import React from "react";
import { LogOut, Wallet } from "lucide-react";

interface QuestComplianceBannerProps {
  subAccount: string | null;
  universalAddress: string | null;
  onDisconnect: () => void;
  onFundAccount: () => void;
}

export const QuestComplianceBanner: React.FC<QuestComplianceBannerProps> = ({
  subAccount,
  universalAddress,
  onDisconnect,
  onFundAccount,
}) => {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-6">
      {/* Header with Actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div>
            <h3 className="font-bold text-gray-900 mb-1">
              Base Builder Quest 11
            </h3>
            <p className="text-sm text-gray-700">
              Sub Accounts Demo - Seamless Onchain Experience
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {universalAddress && (
          <div className="flex items-center gap-2">
            <button
              onClick={onFundAccount}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Wallet className="w-4 h-4" />
              Fund Account
            </button>
            <button
              onClick={onDisconnect}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        )}
      </div>

      {/* Account Info */}
      {universalAddress && (
        <div className="space-y-3 pt-4 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Universal:
            </span>
            <span className="font-mono text-sm text-gray-900 bg-white px-3 py-1.5 rounded-md border border-gray-200">
              {formatAddress(universalAddress)}
            </span>
          </div>

          {subAccount && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Sub Account:
              </span>
              <span className="font-mono text-sm text-gray-900 bg-purple-100 px-3 py-1.5 rounded-md border border-purple-200">
                {formatAddress(subAccount)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Status Indicators */}
      <div className="space-y-2 mt-4">
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              subAccount ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <span className="font-medium text-gray-700">Sub Account:</span>
          <span className="text-gray-600">
            {subAccount ? "Active" : "Creating..."}
          </span>
        </div>

        {subAccount && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-green-800">
              <span className="font-medium">
                Sub Account Active! Enjoy seamless transactions.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <details className="mt-4 text-xs text-gray-600">
        <summary className="cursor-pointer font-medium hover:text-blue-600">
          How does this work?
        </summary>
        <div className="mt-3 space-y-2 pl-4 text-gray-600">
          <p>
            • <strong>Sub Account:</strong> Your dedicated account for this app
            (auto-created)
          </p>
          <p>
            • <strong>Seamless UX:</strong> Transactions use sub account
            automatically
          </p>
          <p>
            • <strong>Fund Account:</strong> Add ETH directly to your sub
            account
          </p>
          <p>
            • <strong>Security:</strong> Limited scope, only works with this app
          </p>
        </div>
      </details>
    </div>
  );
};

// Optional: Transaction info box for education
export const TransactionInfoBox: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm mb-4">
      <p className="font-semibold text-blue-900 mb-2">
        Why &ldquo;Transaction preview unavailable&rdquo;?
      </p>
      <p className="text-blue-700 mb-2">
        This contract interaction doesn&apos;t transfer tokens, so there&apos;s
        no asset change to preview. It&apos;s perfectly safe - you&apos;re just
        recording your daily GM onchain!
      </p>
      <p className="text-blue-600 text-xs">
        This is normal for smart contract state changes. Your transaction is
        secure!
      </p>
    </div>
  );
};
