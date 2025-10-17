"use client";

import { createBaseAccountSDK } from "@base-org/account";
import { base } from "viem/chains";

let sdkInstance: ReturnType<typeof createBaseAccountSDK> | null = null;

const PAYMASTER_URL =
  "https://api.developer.coinbase.com/rpc/v1/base/eK10bG0wJG6WBtTlGAUUHckrF2CqqOtp";

export const getBaseAccountSDK = () => {
  if (typeof window === "undefined") return null;

  if (!sdkInstance) {
    sdkInstance = createBaseAccountSDK({
      appName: "Daily GM - Base Builder Quest 11",
      appLogoUrl: "/logo.svg",
      appChainIds: [base.id],
      subAccounts: {
        creation: "on-connect",
        defaultAccount: "sub",
      },
      paymasterUrls: {
        [base.id]: PAYMASTER_URL,
      },
    });
  }

  return sdkInstance;
};

export const getBaseAccountProvider = () => {
  const sdk = getBaseAccountSDK();
  return sdk?.getProvider() ?? null;
};

export const getPaymasterUrl = () => PAYMASTER_URL;
