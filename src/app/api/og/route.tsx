import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#1a1a1a',
          padding: '64px',
          position: 'relative',
        }}
      >
        {/* single coral accent glow — no gradients */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            width: '520px',
            height: '520px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(240, 97, 62, 0.18)',
            filter: 'blur(120px)',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '18px',
              backgroundColor: '#171717',
              border: '1px solid #2d2d2f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* pulse waveform mark */}
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#F0613E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h4l3 8 4-16 3 8h6" />
            </svg>
          </div>
          <span
            style={{
              fontSize: '64px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.03em',
            }}
          >
            Pulse Pro
          </span>
        </div>

        <div
          style={{
            fontSize: '32px',
            color: '#a1a1a6',
            textAlign: 'center',
            maxWidth: '760px',
            lineHeight: 1.4,
            marginBottom: '48px',
          }}
        >
          Project management for freelancers and small agencies.
        </div>

        <div style={{ display: 'flex', gap: '14px' }}>
          {['Projects', 'Tasks', 'Invoices', 'Calendar', 'Time Tracking'].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  padding: '12px 26px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(240, 97, 62, 0.4)',
                  color: '#F0613E',
                  fontSize: '20px',
                  fontWeight: 600,
                }}
              >
                {feature}
              </div>
            )
          )}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '44px',
            fontSize: '20px',
            color: '#6b6b70',
            fontWeight: 500,
          }}
        >
          pulsepro.work
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
