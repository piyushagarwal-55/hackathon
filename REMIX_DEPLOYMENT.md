# 🎨 Deploy with Remix IDE (No Foundry Required!)

## Why Remix?
- ✅ **Browser-based** - No installation needed
- ✅ **Visual interface** - See what you're doing
- ✅ **Beginner-friendly** - No command line
- ✅ **MetaMask integration** - One-click deployment

---

## 🚀 Step-by-Step Deployment

### 1. Get Testnet ETH (5 min)
- Visit: https://www.alchemy.com/faucets/arbitrum-sepolia
- Enter your MetaMask address
- Get 0.1 free Sepolia ETH

### 2. Add Arbitrum Sepolia to MetaMask
Click "Add to MetaMask" or manually:
- **Network Name:** Arbitrum Sepolia
- **RPC URL:** `https://sepolia-rollup.arbitrum.io/rpc`
- **Chain ID:** `421614`
- **Symbol:** ETH
- **Block Explorer:** `https://sepolia.arbiscan.io/`

### 3. Open Remix IDE
Visit: **https://remix.ethereum.org**

### 4. Create Contract Files

#### 📄 **ReputationRegistry.sol**
Click "contracts" folder → "New File" → Name: `ReputationRegistry.sol`

Paste this code:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ReputationRegistry {
    mapping(address => uint256) public reputations;
    mapping(address => bool) public authorizedPolls;
    address public owner;
    address public factory;

    event ReputationUpdated(address indexed user, uint256 newReputation);
    event PollAuthorized(address indexed poll);

    constructor() {
        owner = msg.sender;
        reputations[msg.sender] = 1000; // Bootstrap deployer with reputation
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "Not factory");
        _;
    }

    modifier onlyAuthorizedPoll() {
        require(authorizedPolls[msg.sender], "Not authorized poll");
        _;
    }

    function setFactory(address _factory) external onlyOwner {
        require(factory == address(0), "Factory already set");
        factory = _factory;
    }

    function authorizePoll(address poll) external onlyFactory {
        authorizedPolls[poll] = true;
        emit PollAuthorized(poll);
    }

    function updateReputation(address user, uint256 amount) external onlyAuthorizedPoll {
        reputations[user] += amount;
        emit ReputationUpdated(user, reputations[user]);
    }

    function getReputation(address user) external view returns (uint256) {
        return reputations[user];
    }
}
```

#### 📄 **Poll.sol**
New File → Name: `Poll.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IReputationRegistry {
    function updateReputation(address user, uint256 amount) external;
    function getReputation(address user) external view returns (uint256);
}

contract Poll {
    struct Vote {
        uint8 option;
        uint256 timestamp;
        uint256 weight;
    }

    string public question;
    string[] public options;
    mapping(address => Vote) public votes;
    address[] public voters;
    mapping(uint8 => uint256) public optionVotes;
    IReputationRegistry public reputationRegistry;
    uint256 public totalVoters;

    event VoteCast(address indexed voter, uint8 option, uint256 weight);

    constructor(
        string memory _question,
        string[] memory _options,
        address _reputationRegistry
    ) {
        question = _question;
        options = _options;
        reputationRegistry = IReputationRegistry(_reputationRegistry);
    }

    function vote(uint8 option) external {
        require(option < options.length, "Invalid option");

        uint256 reputation = reputationRegistry.getReputation(msg.sender);
        uint256 voteWeight = sqrt(reputation);

        bool isNewVoter = votes[msg.sender].timestamp == 0;

        if (isNewVoter) {
            voters.push(msg.sender);
            totalVoters++;
        } else {
            optionVotes[votes[msg.sender].option] -= votes[msg.sender].weight;
        }

        votes[msg.sender] = Vote({
            option: option,
            timestamp: block.timestamp,
            weight: voteWeight
        });

        optionVotes[option] += voteWeight;

        reputationRegistry.updateReputation(msg.sender, 1);

        emit VoteCast(msg.sender, option, voteWeight);
    }

    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }

    function getResults() external view returns (uint256[] memory) {
        uint256[] memory results = new uint256[](options.length);
        for (uint8 i = 0; i < options.length; i++) {
            results[i] = optionVotes[i];
        }
        return results;
    }

    function getVote(address voter) external view returns (uint8, uint256, uint256) {
        Vote memory v = votes[voter];
        return (v.option, v.timestamp, v.weight);
    }

    function getVoters() external view returns (address[] memory) {
        return voters;
    }
}
```

#### 📄 **PollFactory.sol**
New File → Name: `PollFactory.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Poll.sol";

interface IReputationRegistry {
    function authorizePoll(address poll) external;
}

contract PollFactory {
    address[] public polls;
    address public reputationRegistry;

    event PollCreated(address indexed pollAddress, string question);

    constructor(address _reputationRegistry) {
        reputationRegistry = _reputationRegistry;
    }

    function createPoll(
        string memory question,
        string[] memory options
    ) external returns (address) {
        Poll newPoll = new Poll(question, options, reputationRegistry);
        polls.push(address(newPoll));

        IReputationRegistry(reputationRegistry).authorizePoll(address(newPoll));

        emit PollCreated(address(newPoll), question);
        return address(newPoll);
    }

    function getPolls() external view returns (address[] memory) {
        return polls;
    }

    function getPollCount() external view returns (uint256) {
        return polls.length;
    }
}
```

### 5. Compile Contracts

1. Click **"Solidity Compiler"** tab (left sidebar)
2. Set compiler version: **0.8.19**
3. Click **"Compile ReputationRegistry.sol"**
4. Click **"Compile PollFactory.sol"**
5. ✅ Should see green checkmarks

### 6. Deploy ReputationRegistry

1. Click **"Deploy & Run Transactions"** tab
2. **Environment:** Select "Injected Provider - MetaMask"
3. MetaMask will prompt → **Connect** → **Switch to Arbitrum Sepolia**
4. **Contract:** Select "ReputationRegistry"
5. Click **Deploy** → Confirm in MetaMask
6. Wait ~5 seconds for confirmation
7. **📝 COPY THE ADDRESS** - Look under "Deployed Contracts", click copy icon

### 7. Deploy PollFactory

1. **Contract:** Select "PollFactory"
2. **Constructor parameter** `_REPUTATIONREGISTRY`: Paste the ReputationRegistry address from step 6
3. Click **Deploy** → Confirm in MetaMask
4. **📝 COPY THE ADDRESS**

### 8. Authorize Factory

1. Under "Deployed Contracts", expand **ReputationRegistry**
2. Find `setFactory` function (orange button)
3. Paste the **PollFactory address** into `_factory` field
4. Click **transact** → Confirm in MetaMask

### 9. Create Demo Poll (Optional)

1. Expand **PollFactory** contract
2. Find `createPoll` function
3. Fill in:
   ```
   question: "What feature should we build next?"
   options: ["AI Summaries", "Mobile App", "Gamification"]
   ```
4. Click **transact** → Confirm in MetaMask
5. After confirmation, click `polls` button with index `0` to get poll address
6. **📝 COPY THE POLL ADDRESS**

---

## 🎯 Update Frontend

Now update [frontend/lib/contracts.ts](frontend/lib/contracts.ts):

```typescript
export const REPUTATION_REGISTRY_ADDRESS = '0xYOUR_REPUTATION_REGISTRY_ADDRESS' as `0x${string}`;
export const POLL_FACTORY_ADDRESS = '0xYOUR_POLL_FACTORY_ADDRESS' as `0x${string}`;
export const DEMO_POLL_ADDRESS = '0xYOUR_DEMO_POLL_ADDRESS' as `0x${string}`;
```

---

## ✅ Test Deployment

1. Visit deployed contracts on explorer:
   - **ReputationRegistry:** `https://sepolia.arbiscan.io/address/YOUR_ADDRESS`
   - **PollFactory:** `https://sepolia.arbiscan.io/address/YOUR_ADDRESS`

2. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Connect MetaMask → Arbitrum Sepolia
4. Vote on demo poll
5. Check leaderboard (you should have 1000+ reputation!)

---

## 🐛 Troubleshooting

**MetaMask not connecting?**
- Make sure you're on Arbitrum Sepolia network
- Refresh the Remix page

**Transaction failing?**
- Check you have testnet ETH (balance > 0)
- Verify you're connected to correct network

**Can't find deployed contract?**
- Look under "Deployed Contracts" section (bottom left)
- If closed Remix, you can load it: paste address → "At Address" button

**Constructor parameter error?**
- Make sure you copied the FULL address (starts with 0x)
- No spaces or quotes

---

## 📋 Deployment Checklist

- [ ] Got testnet ETH from Alchemy faucet
- [ ] Added Arbitrum Sepolia to MetaMask
- [ ] Created all 3 contract files in Remix
- [ ] Compiled all contracts (green checkmarks)
- [ ] Connected MetaMask to Remix
- [ ] Deployed ReputationRegistry ✅ Address: `0x...`
- [ ] Deployed PollFactory ✅ Address: `0x...`
- [ ] Called `setFactory()` on ReputationRegistry
- [ ] Created demo poll ✅ Address: `0x...`
- [ ] Updated `contracts.ts` with addresses
- [ ] Tested voting on frontend
- [ ] Shared deployment with teammates!

---

## 🚀 Next Steps

**Share with teammates:**
1. Give them the contract addresses
2. Send them [QUICKSTART_TEAMMATE.md](QUICKSTART_TEAMMATE.md)
3. They just need: MetaMask + testnet ETH + contract addresses

**Create more polls:**
- Use `createPoll` function in Remix
- Or use frontend "Create Poll" button (if implemented)

**Verify contracts (optional):**
- Visit https://sepolia.arbiscan.io
- Find your contract → "Contract" tab → "Verify and Publish"
- Makes code public & readable
