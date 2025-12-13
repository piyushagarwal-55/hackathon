import { http, createConfig } from "wagmi";
import { mainnet, sepolia, polygon, polygonAmoy } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Define local Anvil chain
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
      http: ["http://localhost:3000/api/rpc"], // Use Next.js proxy
    },
    public: {
      http: ["http://localhost:3000/api/rpc"], // Use Next.js proxy
    },
  },
} as const;

// Use local Anvil for development, Sepolia for production
export const config = createConfig({
  chains: [anvil, sepolia, mainnet, polygon, polygonAmoy],
  connectors: [
    injected(), // MetaMask, Coinbase Wallet, etc.
  ],
  transports: {
    [anvil.id]: http("http://localhost:3000/api/rpc"), // Use Next.js proxy
    [sepolia.id]: http(), // Uses public RPC
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
