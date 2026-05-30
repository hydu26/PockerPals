import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'PokerPals — Theo dõi điểm poker cho nhóm bạn'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        background: 'linear-gradient(135deg, #0d0720 0%, #07050f 40%, #150a2e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 500,
          background:
            'radial-gradient(ellipse, rgba(167,139,250,0.12) 0%, transparent 65%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Decorative corner cards (faded) */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          left: -20,
          width: 80,
          height: 104,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 12,
          border: '1px solid rgba(167,139,250,0.15)',
          transform: 'rotate(-12deg)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -20,
          right: -20,
          width: 80,
          height: 104,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 12,
          border: '1px solid rgba(167,139,250,0.15)',
          transform: 'rotate(168deg)',
        }}
      />

      {/* Main card */}
      <div
        style={{
          width: 160,
          height: 210,
          background: 'linear-gradient(145deg, #ffffff, #f5f0ff)',
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow:
            '0 24px 80px rgba(167,139,250,0.5), 0 0 0 2px rgba(167,139,250,0.8), inset 0 1px 0 rgba(255,255,255,0.9)',
          position: 'relative',
          marginBottom: 48,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 16,
            fontSize: 28,
            fontWeight: 900,
            color: '#7c3aed',
            lineHeight: 1,
          }}
        >
          J
        </div>
        <div
          style={{
            position: 'absolute',
            top: 36,
            left: 16,
            fontSize: 20,
            color: '#a78bfa',
            lineHeight: 1,
          }}
        >
          ♠
        </div>
        <div style={{ fontSize: 88, color: '#7c3aed', lineHeight: 1 }}>♠</div>
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            right: 16,
            fontSize: 28,
            fontWeight: 900,
            color: '#7c3aed',
            lineHeight: 1,
            transform: 'rotate(180deg)',
          }}
        >
          J
        </div>
      </div>

      {/* App name */}
      <div
        style={{
          fontSize: 80,
          fontWeight: 700,
          color: '#e7e3f0',
          letterSpacing: '-2px',
          lineHeight: 1,
        }}
      >
        PokerPals
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 28,
          color: '#b8b0c8',
          marginTop: 16,
          letterSpacing: '0.5px',
        }}
      >
        Theo dõi điểm poker cho nhóm bạn — nhanh, gọn, đẹp.
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, transparent, #a78bfa, #f0abfc, #a78bfa, transparent)',
        }}
      />
    </div>,
    { ...size }
  )
}
