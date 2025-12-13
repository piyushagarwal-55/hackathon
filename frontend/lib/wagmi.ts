import { http, createConfig } from "wagmi";
import { sepolia, arbitrumSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Define local Anvil chain (for development)
const anvil = {
  id: 31337,
  name: "Anvil",
  network: "anvil",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://localhost:8545"],
    },
    public: {
      http: ["http://localhost:8545"],
    },
  },
} as const;

// Define Remix VM chain (for Remix IDE testing)
const remixVM = {
  id: 999999999999,
  name: "Remix VM",
  network: "remix",
  nativeCurrency: {
    decimals: 18,
    name: "Ethereum",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://remix.ethereum.org"],
    },
    public: {
      http: ["https://remix.ethereum.org"],
    },
  },
} as const;

// Use Arbitrum Sepolia for testnet deployment
export const config = createConfig({
  chains: [arbitrumSepolia, anvil, sepolia], // Only include networks we actually use
  connectors: [
    injected(), // MetaMask, Coinbase Wallet, etc.
  ],
  transports: {
    // Use multiple fallback RPC endpoints for Arbitrum Sepolia reliability
    [arbitrumSepolia.id]: http("https://sepolia-rollup.arbitrum.io/rpc", {
      timeout: 30_000, // 30 second timeout
      retryCount: 3,
      retryDelay: 1000,
    }),
    [anvil.id]: http("http://localhost:8545", {
      timeout: 10_000,
      // #region agent log
      onFetchRequest(request) {
        fetch('http://127.0.0.1:7243/ingest/dde02e9d-df2f-4dfa-9c85-6ef3ab021e9a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'wagmi.ts:54',message:'RPC request to Anvil',data:{url:request.url,method:request.method},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      },
      onFetchResponse(response) {
        fetch('http://127.0.0.1:7243/ingest/dde02e9d-df2f-4dfa-9c85-6ef3ab021e9a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'wagmi.ts:57',message:'RPC response from Anvil',data:{status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      },
      onFetchError(error) {
        fetch('http://127.0.0.1:7243/ingest/dde02e9d-df2f-4dfa-9c85-6ef3ab021e9a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'wagmi.ts:60',message:'RPC error from Anvil',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      }
      // #endregion
    }), // Local development
    [sepolia.id]: http(), // Ethereum Sepolia testnet
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
