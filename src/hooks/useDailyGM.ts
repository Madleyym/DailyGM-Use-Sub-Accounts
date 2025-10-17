import { useState, useCallback, useEffect } from "react";
import { CONTRACTS } from "@/lib/contracts.config";
import { createPublicClient, http, parseAbi, encodeFunctionData } from "viem";
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

      setStatus("Connected - Ready to GM!");
    } catch (error) {
      console.error("Error fetching GM record:", error);
      setStatus("Connected");

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

      let subAcc: SubAccount;

      if (accounts.length > 1 && accounts[1]) {
        // Sub account already exists
        subAcc = {
          address: accounts[1] as `0x${string}`,
        };
        setSubAccount(subAcc);
      } else {
        // Create new sub account
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

          subAcc = newSubAccount;
          setSubAccount(newSubAccount);
        } catch (subError: any) {
          console.error("Sub account creation failed:", subError);
          // Fallback to main account
          subAcc = {
            address: universal as `0x${string}`,
          };
          setSubAccount(subAcc);
        }
      }

      await fetchGMRecord(subAcc.address);
    } catch (error: any) {
      console.error("Connection error:", error);
      setStatus(error?.message || "Connection failed");
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, [fetchGMRecord]);

  const disconnect = useCallback(async () => {
    try {
      setConnected(false);
      setUniversalAddress("");
      setSubAccount(null);
      setGmRecord(null);
      setStatus("Disconnected");
      setTxHash("");
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  }, []);

  const fundAccount = useCallback(() => {
    if (!subAccount) {
      alert("Please connect first");
      return;
    }

    const fundUrl = `https://keys.coinbase.com/fund?address=${subAccount.address}`;
    window.open(fundUrl, "_blank");
  }, [subAccount]);

  const sayGM = useCallback(async () => {
    const provider = getBaseAccountProvider();

    if (!provider || !subAccount) {
      setStatus("Please connect first");
      return;
    }

    if (!gmRecord?.canGMToday) {
      setStatus("Already sent GM today. Come back tomorrow.");
      return;
    }

    setLoading(true);
    setStatus("Preparing transaction...");
    setTxHash("");

    try {
      const abi = parseAbi(["function sayGM()"]);
      const data = encodeFunctionData({
        abi,
        functionName: "sayGM",
      });

      setStatus("Validating...");
      try {
        await publicClient.estimateGas({
          account: subAccount.address,
          to: CONTRACTS.GM as `0x${string}`,
          data,
        });
      } catch (estimateError: any) {
        if (estimateError.message.includes("already")) {
          throw new Error("Already sent GM today.");
        }
        if (estimateError.message.includes("insufficient")) {
          throw new Error("Insufficient funds - click Fund Account to add ETH");
        }
        throw estimateError;
      }

      setStatus("Sending GM...");

      const txHashResult = (await provider.request({
        method: "wallet_sendCalls",
        params: [
          {
            version: "1.0",
            chainId: `0x${base.id.toString(16)}`,
            from: subAccount.address,
            calls: [
              {
                to: CONTRACTS.GM,
                data,
              },
            ],
          },
        ],
      })) as string;

      setTxHash(txHashResult);
      setStatus("Transaction submitted! Confirming...");

      setTimeout(async () => {
        await fetchGMRecord(subAccount.address);
        setStatus("GM sent successfully!");
      }, 5000);
    } catch (error: any) {
      console.error("Error sending GM:", error);

      let errorMessage = "Failed to send GM";
      const errorMessageString = error?.message || "";

      if (
        errorMessageString.includes("insufficient funds") ||
        errorMessageString.includes("Insufficient")
      ) {
        errorMessage = "Insufficient funds. Click 'Fund Account' to add ETH.";
      } else if (
        errorMessageString.includes("already") ||
        errorMessageString.includes("Already")
      ) {
        errorMessage = "Already sent GM today.";
      } else if (errorMessageString.includes("user rejected")) {
        errorMessage = "Transaction cancelled";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setStatus(errorMessage);

      if (subAccount) {
        await fetchGMRecord(subAccount.address);
      }
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
          }
        }
      } catch (error) {
        console.error("Check connection error:", error);
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
    disconnect,
    fundAccount,
    sayGM,
    refetchRecord: () => subAccount && fetchGMRecord(subAccount.address),
  };
};
