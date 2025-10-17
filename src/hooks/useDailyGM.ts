import { useState, useCallback, useEffect } from "react";
import { CONTRACTS, ABIS } from "@/lib/contracts.config";
import { createPublicClient, http, encodeFunctionData } from "viem";
import { base } from "viem/chains";
import { getBaseAccountProvider } from "@/lib/base-account.config";

interface SubAccount {
  address: `0x${string}`;
  factory?: `0x${string}`;
  factoryData?: `0x${string}`;
}

interface GMStats {
  gmCount: bigint;
  points: bigint;
  soulboundTokens: bigint;
  currentStreak: bigint;
}

interface GMExtended {
  longestStreak: bigint;
  puzzleSolved: boolean;
  whitelisted: boolean;
  rank: bigint;
}

const publicClient = createPublicClient({
  chain: base,
  transport: http("https://base.llamarpc.com", {
    batch: true,
    retryCount: 3,
    retryDelay: 1000,
  }),
});

export const useDailyGM = () => {
  const [connected, setConnected] = useState(false);
  const [universalAddress, setUniversalAddress] = useState<string>("");
  const [subAccount, setSubAccount] = useState<SubAccount | null>(null);
  const [gmStats, setGmStats] = useState<GMStats | null>(null);
  const [gmExtended, setGmExtended] = useState<GMExtended | null>(null);
  const [canSend, setCanSend] = useState<boolean>(true);
  const [timeRemaining, setTimeRemaining] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Ready to connect");
  const [txHash, setTxHash] = useState("");

  const fetchGMData = useCallback(async (address: string) => {
    try {
      setStatus("Loading stats...");

      // Get basic stats
      const stats = (await publicClient.readContract({
        address: CONTRACTS.GM as `0x${string}`,
        abi: ABIS.GM,
        functionName: "getUserStats",
        args: [address as `0x${string}`],
      })) as [bigint, bigint, bigint, bigint];

      setGmStats({
        gmCount: stats[0],
        points: stats[1],
        soulboundTokens: stats[2],
        currentStreak: stats[3],
      });

      // Get extended info
      const extended = (await publicClient.readContract({
        address: CONTRACTS.GM as `0x${string}`,
        abi: ABIS.GM,
        functionName: "getUserExtended",
        args: [address as `0x${string}`],
      })) as [bigint, boolean, boolean, bigint];

      setGmExtended({
        longestStreak: extended[0],
        puzzleSolved: extended[1],
        whitelisted: extended[2],
        rank: extended[3],
      });

      // Check if can send GM
      const canSendData = (await publicClient.readContract({
        address: CONTRACTS.GM as `0x${string}`,
        abi: ABIS.GM,
        functionName: "canSendGM",
        args: [address as `0x${string}`],
      })) as [boolean, bigint];

      setCanSend(canSendData[0]);
      setTimeRemaining(canSendData[1]);

      setStatus("Connected - Ready to GM!");
    } catch (error) {
      console.error("Error fetching GM data:", error);
      setStatus("Connected");

      // Set default values
      setGmStats({
        gmCount: BigInt(0),
        points: BigInt(0),
        soulboundTokens: BigInt(0),
        currentStreak: BigInt(0),
      });
      setGmExtended({
        longestStreak: BigInt(0),
        puzzleSolved: false,
        whitelisted: false,
        rank: BigInt(0),
      });
      setCanSend(true);
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
        subAcc = {
          address: accounts[1] as `0x${string}`,
        };
        setSubAccount(subAcc);
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

          subAcc = newSubAccount;
          setSubAccount(newSubAccount);
        } catch (subError: any) {
          console.error("Sub account creation failed:", subError);
          subAcc = {
            address: universal as `0x${string}`,
          };
          setSubAccount(subAcc);
        }
      }

      await fetchGMData(subAcc.address);
    } catch (error: any) {
      console.error("Connection error:", error);
      setStatus(error?.message || "Connection failed");
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, [fetchGMData]);

  const disconnect = useCallback(async () => {
    try {
      setConnected(false);
      setUniversalAddress("");
      setSubAccount(null);
      setGmStats(null);
      setGmExtended(null);
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

  const sendGM = useCallback(async () => {
    const provider = getBaseAccountProvider();

    if (!provider || !subAccount) {
      setStatus("Please connect first");
      return;
    }

    if (!canSend) {
      const hours = Number(timeRemaining) / 3600;
      setStatus(`Please wait ${hours.toFixed(1)} hours before next GM`);
      return;
    }

    setLoading(true);
    setStatus("Preparing transaction...");
    setTxHash("");

    try {
      const data = encodeFunctionData({
        abi: ABIS.GM,
        functionName: "sendGM",
      });

      // Cek cooldown terlebih dahulu
      setStatus("Checking cooldown...");
      try {
        const canSendCheck = (await publicClient.readContract({
          address: CONTRACTS.GM as `0x${string}`,
          abi: ABIS.GM,
          functionName: "canSendGM",
          args: [subAccount.address],
        })) as [boolean, bigint];

        if (!canSendCheck[0]) {
          const hoursLeft = Number(canSendCheck[1]) / 3600;
          throw new Error(
            `Cooldown active. Wait ${hoursLeft.toFixed(1)} hours.`
          );
        }
      } catch (checkError: any) {
        if (checkError.message.includes("Cooldown")) {
          throw checkError;
        }
        console.warn("Cooldown check failed, continuing...", checkError);
      }

      // Estimate gas dengan proper error handling
      setStatus("Estimating gas...");
      try {
        const gasEstimate = await publicClient.estimateGas({
          account: subAccount.address,
          to: CONTRACTS.GM as `0x${string}`,
          data,
        });

        console.log("Gas estimate:", gasEstimate.toString());

        // Gas estimate
      } catch (estimateError: any) {
        console.error("Gas estimation error:", estimateError);

        const errorMsg = estimateError.message || "";

        if (
          errorMsg.includes("CooldownActive") ||
          errorMsg.includes("cooldown")
        ) {
          throw new Error("Cooldown still active. Please wait 6 hours.");
        }
        if (errorMsg.includes("insufficient")) {
          throw new Error(
            "Insufficient funds. Click 'Fund Account' to add ETH."
          );
        }

        console.warn("Continuing despite estimation warning...");
      }

      setStatus("Sending GM transaction...");

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
                value: "0x0",
              },
            ],
          },
        ],
      })) as string;

      setTxHash(txHashResult);
      setStatus("Transaction submitted! Waiting for confirmation...");

      // block confirmation on Base
      setTimeout(async () => {
        try {
          await fetchGMData(subAccount.address);
          setStatus("GM sent successfully! +10 points");
        } catch (refreshError) {
          console.error("Error refreshing data:", refreshError);
          setStatus("Transaction sent! Refresh page to see updated stats.");
        }
      }, 8000);
    } catch (error: any) {
      console.error("Error sending GM:", error);

      let errorMessage = "Failed to send GM";
      const errorMessageString = error?.message || "";

      if (
        errorMessageString.includes("insufficient funds") ||
        errorMessageString.includes("Insufficient")
      ) {
        errorMessage =
          "Insufficient funds. Click 'Fund Account' to add ETH (~$2-5 for gas).";
      } else if (
        errorMessageString.includes("Cooldown") ||
        errorMessageString.includes("cooldown")
      ) {
        errorMessage = "Cooldown active. Wait 6 hours between GMs.";
      } else if (
        errorMessageString.includes("user rejected") ||
        errorMessageString.includes("User rejected")
      ) {
        errorMessage = "Transaction cancelled by user";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setStatus(errorMessage);

      // Refresh data untuk update UI
      if (subAccount) {
        try {
          await fetchGMData(subAccount.address);
        } catch (refreshError) {
          console.error("Error refreshing after failed tx:", refreshError);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [subAccount, canSend, timeRemaining, fetchGMData]);

  // Auto-check connection saat component mount
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
            await fetchGMData(accounts[1]);
          }
        }
      } catch (error) {
        console.error("Check connection error:", error);
      }
    };

    checkConnection();
  }, [fetchGMData]);

  return {
    connected,
    universalAddress,
    subAccount,
    gmStats,
    gmExtended,
    canSend,
    timeRemaining,
    loading,
    status,
    txHash,
    connect,
    disconnect,
    fundAccount,
    sendGM,
    refetchData: () => subAccount && fetchGMData(subAccount.address),
  };
};
