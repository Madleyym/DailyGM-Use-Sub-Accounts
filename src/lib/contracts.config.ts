export const CONTRACTS = {
  GM: "0x42A289CB8210005a2F5D0636f9aa90BF43D1593E",
} as const;

export const DEVELOPER_WALLET =
  "0xAeabadae3Cc5f1d1A5De4903a195BF2796dF3481" as const;

  import DailyGMABI from "./abi/DailyGM.json";
export const ABIS = {
  GM: DailyGMABI,
} as const;
