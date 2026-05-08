import { ImageResponse } from 'next/og'

export const dynamic     = 'force-static'
export const size        = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: 180, height: 180,
        background: '#0b1e0d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Outer bark */}
      <div style={{
        position: 'absolute',
        width: 160, height: 160,
        borderRadius: '50%',
        border: '6px solid #1a3d10',
        top: 10, left: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 126, height: 126,
          borderRadius: '50%',
          border: '5px solid #1e4a14',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 96, height: 96,
            borderRadius: '50%',
            border: '4px solid #2a6320',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 68, height: 68,
              borderRadius: '50%',
              border: '3px solid #3a8030',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 44, height: 44,
                borderRadius: '50%',
                border: '2.5px solid #52a840',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {/* Heartwood */}
                <div style={{
                  width: 30, height: 30,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #d4a055 0%, #9c6228 55%, #7c4b1a 100%)',
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaf sprout at top */}
      <div style={{
        position: 'absolute',
        top: 6, left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 22,
        lineHeight: 1,
      }}>🌿</div>
    </div>,
    { ...size },
  )
}
