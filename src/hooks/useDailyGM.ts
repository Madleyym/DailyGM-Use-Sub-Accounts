import { useState, useCallback, useEffect } from "react";
import { CONTRACTS } from "@/lib/contracts.config";
import { createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";
import { getBaseAccountProvider } from "@/lib/base-account.config";

interface SubAccount {
  address: `0x${string}`;
  factory?: `0x${string}`;
  factoryData?: `0x${string}`;
}

interface GMRecord {
  lastGM: bigint;
  currentStreak: bigint;
  longestStreak: bigint;
  totalGMs: bigint;
  canGMToday: boolean;
}

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export const useDailyGM = () => {
  const [connected, setConnected] = useState(false);
  const [universalAddress, setUniversalAddress] = useState<string>("");
  const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
  const [gmRecord, setGmRecord] = useState<GMRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready to connect");
  const [txHash, setTxHash] = useState("");

  const fetchGMRecord = useCallback(async (address: string) => {
    try {
      setStatus("Loading stats...");

      const data = await publicClient.readContract({
        address: CONTRACTS.GM as `0x${string}`,
        abi: parseAbi([
          "function getGMRecord(address user) view returns (uint256 lastGM, uint256 currentStreak, uint256 longestStreak, uint256 totalGMs, bool canGMToday)",
        ]),
        functionName: "getGMRecord",
        args: [address as `0x${string}`],
      });

      const [lastGM, currentStreak, longestStreak, totalGMs, canGMToday] =
        data as [bigint, bigint, bigint, bigint, boolean];

      setGmRecord({
        lastGM,
        currentStreak,
        longestStreak,
        totalGMs,
        canGMToday,
      });

      setStatus("Connected");
    } catch (error) {
      console.error("Error:", error);
      setStatus("Could not load stats");

      setGmRecord({
        lastGM: BigInt(0),
        currentStreak: BigInt(0),
        longestStreak: BigInt(0),
        totalGMs: BigInt(0),
        canGMToday: true,
      });
    }
  }, []);

  const connect = useCallback(async () => {
    const provider = getBaseAccountProvider();

    if (!provider) {
      setStatus("Provider not initialized");
      return;
    }

    setLoading(true);
    setStatus("Connecting...");

    try {
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
        params: [],
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned");
      }

      const universal = accounts[0];
      setUniversalAddress(universal);
      setConnected(true);

      if (accounts.length > 1 && accounts[1]) {
        const subAcc = {
          address: accounts[1] as `0x${string}`,
        };
        setSubAccount(subAcc);
        await fetchGMRecord(accounts[1]);
      } else {
        setStatus("Creating sub account...");
        try {
          const newSubAccount = (await provider.request({
            method: "wallet_addSubAccount",
            params: [
              {
                account: {
                  type: "create",
                },
              },
            ],
          })) as SubAccount;

          setSubAccount(newSubAccount);
          await fetchGMRecord(newSubAccount.address);
        } catch (subError: any) {
          console.error("Sub account error:", subError);
          const mainSubAccount = {
            address: universal as `0x${string}`,
          };
          setSubAccount(mainSubAccount);
          await fetchGMRecord(universal);
        }
      }
    } catch (error: any) {
      console.error("Connection error:", error);
      setStatus(error?.message || "Connection failed");
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, [fetchGMRecord]);

  const sayGM = useCallback(async () => {
    const provider = getBaseAccountProvider();

    if (!provider || !subAccount) {
      setStatus("Please connect first");
      return;
    }

    if (!gmRecord?.canGMToday) {
      setStatus("Already sent today");
      return;
    }

    setLoading(true);
    setStatus("Sending...");

    try {
      const txHash = (await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: subAccount.address,
            to: CONTRACTS.GM,
            data: "0x9846cd9e",
          },
        ],
      })) as string;

      setTxHash(txHash);
      setStatus("Transaction submitted");

      setTimeout(async () => {
        await fetchGMRecord(subAccount.address);
        setStatus("Success");
      }, 5000);
    } catch (error: any) {
      console.error("Error:", error);
      setStatus(error?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }, [subAccount, gmRecord, fetchGMRecord]);

  useEffect(() => {
    const checkConnection = async () => {
      const provider = getBaseAccountProvider();
      if (!provider) return;

      try {
        const accounts = (await provider.request({
          method: "eth_accounts",
          params: [],
        })) as string[];

        if (accounts && accounts.length > 0) {
          setUniversalAddress(accounts[0]);
          setConnected(true);

          if (accounts.length > 1 && accounts[1]) {
            const subAcc = {
              address: accounts[1] as `0x${string}`,
            };
            setSubAccount(subAcc);
            await fetchGMRecord(accounts[1]);
            setStatus("Ready");
          }
        }
      } catch (error) {
        console.error("Check error:", error);
      }
    };

    checkConnection();
  }, [fetchGMRecord]);

  return {
    connected,
    universalAddress,
    subAccount,
    gmRecord,
    loading,
    status,
    txHash,
    connect,
    sayGM,
    refetchRecord: () => subAccount && fetchGMRecord(subAccount.address),
  };
};
