import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'RepVote Governance Poll';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { address: string } }) {
  console.log('🖼️ Generating OG Image for:', params.address);
  
  const pollAddress = params.address;
  
  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 60,
              fontSize: 32,
              fontWeight: 700,
              color: '#10b981',
              display: 'flex',
            }}
          >
            RepVote
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Label */}
            <div
              style={{
                fontSize: 36,
                color: '#94a3b8',
                marginBottom: 30,
                fontWeight: 500,
                display: 'flex',
              }}
            >
              GOVERNANCE POLL
            </div>

            {/* Poll Address */}
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: '#10b981',
                marginBottom: 40,
                display: 'flex',
              }}
            >
              {pollAddress.slice(0, 6)}...{pollAddress.slice(-4)}
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: 24,
                color: '#64748b',
                maxWidth: 700,
                display: 'flex',
              }}
            >
              Cast your vote with reputation-weighted quadratic voting
            </div>
          </div>

          {/* Footer Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: 60,
              display: 'flex',
              backgroundColor: '#064e3b',
              borderRadius: 50,
              padding: '15px 40px',
            }}
          >
            <div
              style={{
                fontSize: 28,
                color: '#10b981',
                fontWeight: 600,
                display: 'flex',
              }}
            >
              ✅ Verified Sybil Resistant
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      }
    );
  } catch (error) {
    console.error('❌ OG Image generation failed:', error);
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            color: 'white',
            fontSize: 48,
          }}
        >
          <div style={{ display: 'flex' }}>RepVote Poll</div>
        </div>
      ),
      { ...size }
    );
  }
}
