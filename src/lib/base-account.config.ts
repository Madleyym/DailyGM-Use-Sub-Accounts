"use client";

import { createBaseAccountSDK } from "@base-org/account";
import { base } from "viem/chains";

let sdkInstance: ReturnType<typeof createBaseAccountSDK> | null = null;

export const getBaseAccountSDK = () => {
  if (typeof window === "undefined") return null;

  if (!sdkInstance) {
    sdkInstance = createBaseAccountSDK({
      appName: "Daily GM",
      appLogoUrl: "https://base.org/logo.png",
      appChainIds: [base.id],
      subAccounts: {
        creation: "on-connect",
        defaultAccount: "sub",
      },
    });
  }

  return sdkInstance;
};

export const getBaseAccountProvider = () => {
  const sdk = getBaseAccountSDK();
  return sdk?.getProvider() ?? null;
};
