import { NextRequest, NextResponse } from 'next/server';

/**
 * RPC Proxy endpoint to bypass CORS restrictions
 * Forwards all RPC requests to local Anvil instance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Forward the request to Anvil with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch('http://127.0.0.1:8545', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`RPC responded with status ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: any) {
    console.error('RPC Proxy Error:', error);
    
    // Provide helpful error messages
    let errorMessage = error.message || 'RPC request failed';
    if (error.name === 'AbortError') {
      errorMessage = 'RPC request timed out - is Anvil running?';
    } else if (error.message?.includes('ECONNREFUSED')) {
      errorMessage = 'Cannot connect to Anvil - ensure it is running on port 8545';
    }
    
    return NextResponse.json(
      { 
        jsonrpc: '2.0',
        id: null,
        error: { 
          code: -32603, 
          message: errorMessage 
        } 
      },
      { 
        status: 200, // Return 200 to avoid CORS issues
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
