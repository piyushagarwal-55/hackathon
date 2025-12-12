/**
 * RepVote Hunter Bot
 * Monitors blockchain for Sybil attack patterns in real-time
 * 
 * Usage:
 *   node hunter.js
 */

const { ethers } = require('ethers');
require('dotenv').config();

// Configuration
const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
const POLL_ADDRESS = process.env.POLL_ADDRESS || '0x...';
const REP_REGISTRY_ADDRESS = process.env.REP_REGISTRY_ADDRESS || '0x...';

// Poll ABI (VoteCast event only)
const POLL_ABI = [
  'event VoteCast(address indexed voter, uint256 indexed option, uint256 creditsSpent, uint256 weightedVotes)',
  'function votes(address) view returns (uint256 option, uint256 creditsSpent, uint256 weightedVotes, uint256 timestamp)',
];

// ReputationRegistry ABI
const REP_REGISTRY_ABI = [
  'function reputation(address) view returns (uint256)',
  'function getDecayedReputation(address) view returns (uint256)',
  'function getRepMultiplier(address) view returns (uint256)',
];

class HunterBot {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    this.pollContract = new ethers.Contract(POLL_ADDRESS, POLL_ABI, this.provider);
    this.repRegistry = new ethers.Contract(REP_REGISTRY_ADDRESS, REP_REGISTRY_ABI, this.provider);
    
    // Tracking
    this.suspiciousVotes = [];
    this.voteTimestamps = {};
    this.totalVotes = 0;
    this.sybilVotes = 0;
  }

  /**
   * Start monitoring for votes
   */
  async start() {
    console.log('🤖 RepVote Hunter Bot started');
    console.log(`📍 Monitoring poll: ${POLL_ADDRESS}`);
    console.log(`📍 Reputation registry: ${REP_REGISTRY_ADDRESS}`);
    console.log('⏳ Waiting for vote events...\n');

    // Listen to VoteCast events
    this.pollContract.on('VoteCast', async (voter, option, creditsSpent, weightedVotes, event) => {
      await this.handleVote(voter, option, creditsSpent, weightedVotes, event);
    });
  }

  /**
   * Handle incoming vote event
   */
  async handleVote(voter, option, creditsSpent, weightedVotes, event) {
    this.totalVotes++;

    console.log(`\n🗳️  Vote #${this.totalVotes} Detected`);
    console.log(`   Voter: ${voter}`);
    console.log(`   Option: ${option.toString()}`);
    console.log(`   Credits: ${creditsSpent.toString()}`);
    console.log(`   Weight: ${ethers.formatEther(weightedVotes)} votes`);

    // Analyze for Sybil patterns
    const sybilScore = await this.calculateSybilScore(voter);
    
    if (sybilScore > 0.7) {
      this.sybilVotes++;
      this.logSuspicious(voter, option, creditsSpent, weightedVotes, sybilScore);
    } else {
      console.log(`   ✅ Legitimate vote (score: ${sybilScore.toFixed(2)})`);
    }

    // Print statistics
    this.printStats();
  }

  /**
   * Calculate Sybil score (0-1, higher = more suspicious)
   */
  async calculateSybilScore(address) {
    let score = 0;

    try {
      // Check 1: Reputation (40% weight)
      const reputation = await this.repRegistry.reputation(address);
      const rep = Number(reputation);
      
      if (rep === 0) {
        score += 0.4; // Never participated
      } else if (rep < 10) {
        score += 0.35; // Very low reputation
      } else if (rep < 50) {
        score += 0.2; // Low reputation
      }

      // Check 2: Account age (30% weight)
      const txCount = await this.provider.getTransactionCount(address);
      
      if (txCount === 1) {
        score += 0.3; // First transaction ever
      } else if (txCount < 5) {
        score += 0.2; // Very few transactions
      } else if (txCount < 20) {
        score += 0.1; // Few transactions
      }

      // Check 3: Vote timing patterns (30% weight)
      const now = Date.now();
      if (!this.voteTimestamps[address]) {
        this.voteTimestamps[address] = [now];
      } else {
        this.voteTimestamps[address].push(now);
        
        // Check for rapid sequential voting
        const recent = this.voteTimestamps[address].filter(t => now - t < 60000); // Last minute
        if (recent.length > 3) {
          score += 0.3; // Voting too rapidly
        }
      }

    } catch (error) {
      console.error(`   ⚠️  Error analyzing ${address}:`, error.message);
    }

    return Math.min(score, 1.0);
  }

  /**
   * Log suspicious activity
   */
  logSuspicious(voter, option, creditsSpent, weightedVotes, score) {
    console.log(`   🚨 SUSPICIOUS VOTE DETECTED!`);
    console.log(`   Sybil Score: ${(score * 100).toFixed(0)}%`);
    
    const suspiciousVote = {
      voter,
      option: option.toString(),
      creditsSpent: creditsSpent.toString(),
      weightedVotes: ethers.formatEther(weightedVotes),
      score,
      timestamp: new Date().toISOString(),
    };
    
    this.suspiciousVotes.push(suspiciousVote);
  }

  /**
   * Print statistics
   */
  printStats() {
    const sybilPercentage = this.totalVotes > 0 
      ? ((this.sybilVotes / this.totalVotes) * 100).toFixed(1)
      : 0;

    console.log(`\n📊 Statistics:`);
    console.log(`   Total Votes: ${this.totalVotes}`);
    console.log(`   Suspicious: ${this.sybilVotes} (${sybilPercentage}%)`);
    console.log(`   Legitimate: ${this.totalVotes - this.sybilVotes}`);
  }

  /**
   * Generate report
   */
  generateReport() {
    console.log('\n\n📋 Sybil Detection Report');
    console.log('═'.repeat(60));
    
    if (this.suspiciousVotes.length === 0) {
      console.log('✅ No suspicious activity detected!');
    } else {
      console.log(`🚨 Found ${this.suspiciousVotes.length} suspicious votes:\n`);
      
      this.suspiciousVotes.forEach((vote, idx) => {
        console.log(`${idx + 1}. ${vote.voter}`);
        console.log(`   Score: ${(vote.score * 100).toFixed(0)}%`);
        console.log(`   Weight: ${vote.weightedVotes} votes`);
        console.log(`   Time: ${vote.timestamp}\n`);
      });
    }

    console.log('═'.repeat(60));
  }
}

// Main execution
if (require.main === module) {
  const bot = new HunterBot();
  bot.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down Hunter Bot...');
    bot.generateReport();
    process.exit(0);
  });
}

module.exports = HunterBot;
