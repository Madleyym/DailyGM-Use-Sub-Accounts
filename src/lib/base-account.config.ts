"use client";

import { createBaseAccountSDK } from "@base-org/account";
import { base } from "viem/chains";

let sdkInstance: ReturnType<typeof createBaseAccountSDK> | null = null;

const PAYMASTER_URL =
  "https://api.developer.coinbase.com/rpc/v1/base/eK10bG0wJG6WBtTlGAUUHckrF2CqqOtp";

// Logo as Data URI
const LOGO_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cdefs%3E%3ClinearGradient id='sunGradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23FFD93D;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23FF6B35;stop-opacity:1' /%3E%3C/linearGradient%3E%3ClinearGradient id='skyGradient' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667EEA;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23764BA2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='100' cy='100' r='95' fill='url(%23skyGradient)'/%3E%3Ccircle cx='100' cy='65' r='25' fill='url(%23sunGradient)'/%3E%3Ctext x='100' y='150' font-family='Arial, sans-serif' font-size='48' font-weight='bold' fill='white' text-anchor='middle'%3EGM%3C/text%3E%3C/svg%3E`;

export const getBaseAccountSDK = () => {
  if (typeof window === "undefined") return null;

  if (!sdkInstance) {
    sdkInstance = createBaseAccountSDK({
      appName: "Daily GM - Base Quest",
      appLogoUrl: LOGO_SVG, 
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
