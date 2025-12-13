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
    [arbitrumSepolia.id]: http(), // Arbitrum Sepolia testnet - PRIMARY NETWORK
    [anvil.id]: http("http://localhost:8545"), // Local development
    [sepolia.id]: http(), // Ethereum Sepolia testnet
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
