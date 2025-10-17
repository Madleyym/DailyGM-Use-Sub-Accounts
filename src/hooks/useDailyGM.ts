import { useState, useCallback, useEffect } from "react";
import { CONTRACTS, ABIS } from "@/lib/contracts.config";
import { createPublicClient, http, encodeFunctionData, parseEther } from "viem";
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

// Public client dengan retry mechanism
const publicClient = createPublicClient({
  chain: base,
  transport: http("https://mainnet.base.org", {
    batch: true,
    retryCount: 5,
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
  const [errorDetails, setErrorDetails] = useState<string>("");

  const fetchGMData = useCallback(async (address: string) => {
    try {
      setStatus("Loading stats...");

      // Batch requests untuk efisiensi
      const [stats, extended, canSendData] = await Promise.all([
        publicClient.readContract({
          address: CONTRACTS.GM as `0x${string}`,
          abi: ABIS.GM,
          functionName: "getUserStats",
          args: [address as `0x${string}`],
        }) as Promise<[bigint, bigint, bigint, bigint]>,

        publicClient.readContract({
          address: CONTRACTS.GM as `0x${string}`,
          abi: ABIS.GM,
          functionName: "getUserExtended",
          args: [address as `0x${string}`],
        }) as Promise<[bigint, boolean, boolean, bigint]>,

        publicClient.readContract({
          address: CONTRACTS.GM as `0x${string}`,
          abi: ABIS.GM,
          functionName: "canSendGM",
          args: [address as `0x${string}`],
        }) as Promise<[boolean, bigint]>,
      ]);

      setGmStats({
        gmCount: stats[0],
        points: stats[1],
        soulboundTokens: stats[2],
        currentStreak: stats[3],
      });

      setGmExtended({
        longestStreak: extended[0],
        puzzleSolved: extended[1],
        whitelisted: extended[2],
        rank: extended[3],
      });

      setCanSend(canSendData[0]);
      setTimeRemaining(canSendData[1]);

      setStatus(canSendData[0] ? "Ready to send GM!" : "Cooldown active");
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
      setStatus("Base Account SDK not available. Please refresh the page.");
      return;
    }

    setLoading(true);
    setStatus("Connecting to Base Account...");

    try {
      // Request accounts - ini akan trigger Base Account flow
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
        params: [],
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned from Base Account");
      }

      const universal = accounts[0];
      setUniversalAddress(universal);
      setStatus("Account connected! Setting up Sub Account...");

      // Sub Account akan auto-created karena config "creation: on-connect"
      let subAcc: SubAccount;

      if (accounts.length > 1 && accounts[1]) {
        // Sub account already exists
        subAcc = {
          address: accounts[1] as `0x${string}`,
        };
        setSubAccount(subAcc);
        setStatus("Sub Account ready!");
      } else {
        // Create new sub account WITH spending permissions
        setStatus("Creating Sub Account with auto-spend permissions...");
        try {
          const newSubAccount = (await provider.request({
            method: "wallet_addSubAccount",
            params: [
              {
                account: {
                  type: "create",
                },
                // Set spending permissions untuk GM contract
                permissions: [
                  {
                    type: "contract-call",
                    data: {
                      address: CONTRACTS.GM,
                      abi: ABIS.GM,
                      functionName: "sendGM",
                      // Allow unlimited calls
                      args: [],
                    },
                  },
                ],
              },
            ],
          })) as SubAccount;

          subAcc = newSubAccount;
          setSubAccount(newSubAccount);
          setStatus("Sub Account created with auto-spend! ✨");
        } catch (subError: any) {
          console.error("Sub account creation failed:", subError);

          // Try simpler creation without permissions
          try {
            const simpleSubAccount = (await provider.request({
              method: "wallet_addSubAccount",
              params: [
                {
                  account: {
                    type: "create",
                  },
                },
              ],
            })) as SubAccount;

            subAcc = simpleSubAccount;
            setSubAccount(simpleSubAccount);
            setStatus("Sub Account created (manual approval needed)");
          } catch (fallbackError) {
            console.error(
              "Fallback sub account creation failed:",
              fallbackError
            );
            // Use universal account as last resort
            subAcc = {
              address: universal as `0x${string}`,
            };
            setSubAccount(subAcc);
            setStatus("Using Universal Account");
          }
        }
      }

      setConnected(true);
      await fetchGMData(subAcc.address);
    } catch (error: any) {
      console.error("Connection error:", error);
      let errorMsg = "Connection failed";

      if (error?.message?.includes("User rejected")) {
        errorMsg = "Connection rejected by user";
      } else if (error?.message) {
        errorMsg = error.message;
      }

      setStatus(errorMsg);
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
      setCanSend(true);
      setTimeRemaining(BigInt(0));
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  }, []);

  const fundAccount = useCallback(() => {
    if (!subAccount) {
      alert("Please connect first");
      return;
    }

    // Open Coinbase Keys funding page
    const fundUrl = `https://keys.coinbase.com/fund?address=${subAccount.address}`;
    window.open(fundUrl, "_blank", "noopener,noreferrer");
  }, [subAccount]);

  const sendGM = useCallback(async () => {
    const provider = getBaseAccountProvider();

    if (!provider || !subAccount) {
      setStatus("Please connect your Base Account first");
      return;
    }

    if (!canSend) {
      const hours = Number(timeRemaining) / 3600;
      setStatus(`Cooldown active. Wait ${hours.toFixed(1)} hours`);
      return;
    }

    setLoading(true);
    setStatus("Preparing GM transaction...");
    setTxHash("");

    try {
      // Encode function call
      const data = encodeFunctionData({
        abi: ABIS.GM,
        functionName: "sendGM",
      });

      // Check balance first
      setStatus("Checking balance...");
      const balance = await publicClient.getBalance({
        address: subAccount.address,
      });

      console.log("Sub Account balance:", balance.toString());

      if (balance < parseEther("0.0001")) {
        throw new Error(
          "Insufficient funds. Please fund your Sub Account with at least 0.001 ETH."
        );
      }

      // Verify cooldown BEFORE sending
      setStatus("Verifying cooldown...");
      const canSendCheck = (await publicClient.readContract({
        address: CONTRACTS.GM as `0x${string}`,
        abi: ABIS.GM,
        functionName: "canSendGM",
        args: [subAccount.address],
      })) as [boolean, bigint];

      if (!canSendCheck[0]) {
        const hoursLeft = Number(canSendCheck[1]) / 3600;
        throw new Error(`Cooldown active. Wait ${hoursLeft.toFixed(1)} hours.`);
      }

      setStatus("Sending GM transaction...");

      // Send transaction using wallet_sendCalls
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

      console.log("Transaction submitted:", txHashResult);
      setTxHash(txHashResult);
      setStatus("Transaction submitted! Waiting for confirmation...");

      // Wait longer for Base confirmation
      await new Promise((resolve) => setTimeout(resolve, 12000));

      // Refresh data
      try {
        await fetchGMData(subAccount.address);
        setStatus("GM sent successfully! +10 points 🎉");
      } catch (refreshError) {
        console.error("Error refreshing data:", refreshError);
        setStatus("Transaction sent! Refresh page to see updated stats.");
      }
    } catch (error: any) {
      console.error("Error sending GM:", error);

      // Log full error for debugging
      const errorDetails = JSON.stringify(
        {
          message: error?.message,
          reason: error?.reason,
          code: error?.code,
          data: error?.data,
          error: String(error),
        },
        null,
        2
      );

      console.log("Full error object:", errorDetails);
      setErrorDetails(errorDetails);

      let errorMessage = "Failed to send GM";
      const errorStr = String(error?.message || error?.reason || error);

      if (
        errorStr.includes("insufficient funds") ||
        errorStr.includes("Insufficient")
      ) {
        errorMessage = "Insufficient funds. Click 'Fund Account' to add ETH.";
      } else if (
        errorStr.includes("Cooldown") ||
        errorStr.includes("cooldown") ||
        errorStr.includes("CooldownActive")
      ) {
        errorMessage = "Cooldown active. Wait 6 hours between GMs.";
      } else if (
        errorStr.includes("rejected") ||
        errorStr.includes("denied") ||
        errorStr.includes("User rejected")
      ) {
        errorMessage = "Transaction cancelled by user";
      } else if (errorStr.includes("nonce")) {
        errorMessage = "Transaction error. Please try again.";
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.reason) {
        errorMessage = error.reason;
      }

      setStatus(errorMessage);

      // Refresh data anyway to sync UI
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

  // Auto-check existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const provider = getBaseAccountProvider();
      if (!provider) return;

      try {
        // Check if already connected
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
    errorDetails,
    connect,
    disconnect,
    fundAccount,
    sendGM,
    refetchData: () => subAccount && fetchGMData(subAccount.address),
  };
};
