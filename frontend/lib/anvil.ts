/**
 * Utility to manually trigger block mining on local Anvil network
 * This is needed when Anvil is not configured for auto-mining
 */

export async function mineBlock() {
  try {
    const response = await fetch('http://localhost:8545', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'evm_mine',
        params: [],
        id: 1,
      }),
    });
    
    const data = await response.json();
    console.log('⛏️  Block mined:', data);
    return data;
  } catch (error) {
    console.error('Failed to mine block:', error);
  }
}

export async function mineBlocks(count: number = 1) {
  for (let i = 0; i < count; i++) {
    await mineBlock();
    // Small delay between blocks
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
