# RepVote Hunter Bot

Real-time Sybil attack detection for RepVote polls.

## Features

- 🔍 Monitors blockchain for vote events in real-time
- 🚨 Detects suspicious voting patterns
- 📊 Tracks statistics and generates reports
- ⚡ Lightweight and efficient

## Installation

```bash
cd bot
npm install
```

## Configuration

1. Copy `.env.example` to `.env`
2. Update with your contract addresses:

```bash
SEPOLIA_RPC_URL=https://rpc.sepolia.org
POLL_ADDRESS=0x... # Your deployed poll address
REP_REGISTRY_ADDRESS=0x... # Your reputation registry address
```

## Usage

### Start the bot

```bash
npm start
```

### Development mode (auto-restart)

```bash
npm run dev
```

## How It Works

The Hunter Bot calculates a "Sybil Score" (0-1) for each vote based on three factors:

### 1. Reputation Check (40% weight)
- 0 reputation: +0.4 score
- < 10 reputation: +0.35 score
- < 50 reputation: +0.2 score

### 2. Account Age (30% weight)
- 1 transaction (first ever): +0.3 score
- < 5 transactions: +0.2 score
- < 20 transactions: +0.1 score

### 3. Voting Patterns (30% weight)
- More than 3 votes in 1 minute: +0.3 score

### Thresholds

- **Score > 0.7**: Flagged as suspicious 🚨
- **Score < 0.7**: Considered legitimate ✅

## Example Output

```
🤖 RepVote Hunter Bot started
📍 Monitoring poll: 0x1234...
📍 Reputation registry: 0x5678...
⏳ Waiting for vote events...

🗳️  Vote #1 Detected
   Voter: 0xabcd...
   Option: 0
   Credits: 9
   Weight: 4.5 votes
   ✅ Legitimate vote (score: 0.20)

📊 Statistics:
   Total Votes: 1
   Suspicious: 0 (0.0%)
   Legitimate: 1

🗳️  Vote #2 Detected
   Voter: 0xefgh...
   Option: 1
   Credits: 1
   Weight: 0.3 votes
   🚨 SUSPICIOUS VOTE DETECTED!
   Sybil Score: 75%

📊 Statistics:
   Total Votes: 2
   Suspicious: 1 (50.0%)
   Legitimate: 1
```

## Generating Reports

Press `Ctrl+C` to stop the bot and generate a summary report.

## Integration with Research Dashboard

The bot data can be exported for the research dashboard to show:

- Real-time Sybil detection rates
- Attack prevention metrics
- Voting pattern analysis

## Troubleshooting

### "Cannot connect to RPC"
- Check your `SEPOLIA_RPC_URL` is valid
- Try a different RPC provider (Alchemy, Infura)

### "No events detected"
- Verify contract addresses are correct
- Ensure the poll is active and receiving votes
- Check RPC provider supports event subscriptions

## Future Enhancements

- [ ] Web dashboard for real-time monitoring
- [ ] Webhook notifications for suspicious activity
- [ ] Machine learning-based pattern recognition
- [ ] Historical analysis and reporting
- [ ] Multi-poll monitoring
