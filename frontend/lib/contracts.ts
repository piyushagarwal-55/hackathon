/**
 * Contract addresses and ABIs for RepVote system
 * Update these after deploying contracts to Sepolia
 */

// Deployed contract addresses (Local Anvil)
export const REPUTATION_REGISTRY_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3" as `0x${string}`;
export const POLL_FACTORY_ADDRESS =
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" as `0x${string}`;

// ABIs - Essential functions only
export const REPUTATION_REGISTRY_ABI = [
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getRepMultiplier",
    outputs: [{ name: "multiplier", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getDecayedReputation",
    outputs: [{ name: "decayedRep", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getUserStats",
    outputs: [
      { name: "effectiveRep", type: "uint256" },
      { name: "multiplier", type: "uint256" },
      { name: "lastVote", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "reputation",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const POLL_FACTORY_ABI = [
  {
    inputs: [
      { name: "question", type: "string" },
      { name: "options", type: "string[]" },
      { name: "duration", type: "uint256" },
      { name: "maxWeightCap", type: "uint256" },
    ],
    name: "createPoll",
    outputs: [{ name: "pollAddress", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getPollCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "count", type: "uint256" }],
    name: "getRecentPolls",
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "pollAddress", type: "address" }],
    name: "getPollInfo",
    outputs: [
      { name: "question", type: "string" },
      { name: "options", type: "string[]" },
      { name: "endTime", type: "uint256" },
      { name: "isActive", type: "bool" },
      { name: "totalVoters", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const POLL_ABI = [
  {
    inputs: [
      { name: "optionId", type: "uint256" },
      { name: "credits", type: "uint256" },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getResults",
    outputs: [{ name: "results", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getWinner",
    outputs: [
      { name: "winningOption", type: "uint256" },
      { name: "winningVotes", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "user", type: "address" },
      { name: "credits", type: "uint256" },
    ],
    name: "previewVoteWeight",
    outputs: [{ name: "expectedVotes", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "question",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getOptions",
    outputs: [{ name: "", type: "string[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getOptionCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "endTime",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isActive",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalVoters",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalWeightedVotes",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address" }],
    name: "votes",
    outputs: [
      { name: "option", type: "uint256" },
      { name: "creditsSpent", type: "uint256" },
      { name: "weightedVotes", type: "uint256" },
      { name: "timestamp", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "voter", type: "address" },
      { indexed: true, name: "option", type: "uint256" },
      { indexed: false, name: "creditsSpent", type: "uint256" },
      { indexed: false, name: "weightedVotes", type: "uint256" },
    ],
    name: "VoteCast",
    type: "event",
  },
] as const;
