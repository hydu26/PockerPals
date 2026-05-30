import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        background: 'linear-gradient(135deg, #2d1b69, #07050f)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 22,
          height: 27,
          background: 'linear-gradient(145deg, #ffffff, #f0e8ff)',
          borderRadius: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(167,139,250,0.6)',
          border: '1px solid rgba(167,139,250,0.8)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 1,
            left: 2,
            fontSize: 7,
            fontWeight: 900,
            color: '#7c3aed',
            lineHeight: 1,
          }}
        >
          J
        </div>
        <div style={{ fontSize: 12, color: '#7c3aed', lineHeight: 1 }}>♠</div>
        <div
          style={{
            position: 'absolute',
            bottom: 1,
            right: 2,
            fontSize: 7,
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
