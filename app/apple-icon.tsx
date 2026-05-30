import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180,
        height: 180,
        background: 'linear-gradient(135deg, #2d1b69 0%, #07050f 100%)',
        borderRadius: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Subtle glow */}
      <div
        style={{
          position: 'absolute',
          width: 120,
          height: 120,
          background: 'radial-gradient(ellipse, rgba(167,139,250,0.2) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* Card */}
      <div
        style={{
          width: 110,
          height: 138,
          background: 'linear-gradient(145deg, #ffffff, #f5f0ff)',
          borderRadius: 14,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(167,139,250,0.5), 0 0 0 2px rgba(167,139,250,0.7)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 10,
            fontSize: 22,
            fontWeight: 900,
            color: '#7c3aed',
            lineHeight: 1,
          }}
        >
          J
        </div>
        <div style={{ fontSize: 52, color: '#7c3aed', lineHeight: 1 }}>♠</div>
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 10,
            fontSize: 22,
            fontWeight: 900,
            color: '#7c3aed',
            lineHeight: 1,
            transform: 'rotate(180deg)',
          }}
        >
          J
        </div>
      </div>
    </div>,
    { ...size }
  )
}
