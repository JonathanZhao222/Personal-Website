import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Jonathan Zhao'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 96px',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 400,
            color: '#000000',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 24,
          }}
        >
          Jonathan Zhao
        </div>
        <div
          style={{
            fontSize: 24,
            color: '#000000',
            opacity: 0.45,
            fontFamily: 'sans-serif',
            fontWeight: 400,
            lineHeight: 1.5,
            maxWidth: 680,
          }}
        >
          Stanford — computational biology & neuroscience
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 64,
            right: 96,
            fontSize: 16,
            color: '#000000',
            opacity: 0.25,
            fontFamily: 'sans-serif',
          }}
        >
          jonathanzhao.com
        </div>
      </div>
    ),
    { ...size }
  )
}
