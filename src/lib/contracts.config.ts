// Contract addresses on Base Mainnet
export const CONTRACTS = {
  GM: "0xf5b0E9cFD956929cFB2F168667CC392c29163535",
} as const;

export const DEVELOPER_WALLET =
  "0xAeabadae3Cc5f1d1A5De4903a195BF2796dF3481" as const;
// Import ABIs
import DailyGMABI from "./abi/DailyGM.json";
export const ABIS = {
  GM: DailyGMABI,
} as const;

