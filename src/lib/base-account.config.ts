"use client";

import { createBaseAccountSDK } from "@base-org/account";
import { base } from "viem/chains";

let sdkInstance: ReturnType<typeof createBaseAccountSDK> | null = null;

// Logo yang lebih sederhana dan reliable
const LOGO_URL =
  "https://raw.githubusercontent.com/base-org/brand-kit/main/logo/symbol/Base_Symbol_Blue.svg";

export const getBaseAccountSDK = () => {
  if (typeof window === "undefined") return null;

  if (!sdkInstance) {
    try {
      sdkInstance = createBaseAccountSDK({
        appName: "Daily GM - Base Builder Quest 11",
        appLogoUrl: LOGO_URL,
        appChainIds: [base.id],
        subAccounts: {
          creation: "on-connect", // Auto-create sub account on connect
          defaultAccount: "sub", // Use sub account as default
        },
        // {
        //   url: "YOUR_PAYMASTER_URL",
        // },
      });

      console.log("Base Account SDK initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Base Account SDK:", error);
      return null;
    }
  }

  return sdkInstance;
};

export const getBaseAccountProvider = () => {
  const sdk = getBaseAccountSDK();
  if (!sdk) {
    console.error("SDK not initialized");
    return null;
  }
  return sdk.getProvider();
};

// Helper function untuk check apakah provider ready
export const isProviderReady = (): boolean => {
  const provider = getBaseAccountProvider();
  return provider !== null;
};
