import { ImageResponse } from 'next/og'

export const size        = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32, height: 32,
        borderRadius: '50%',
        background: '#0b1e0d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Bark ring 4 */}
      <div style={{
        position: 'absolute',
        width: 28, height: 28,
        borderRadius: '50%',
        border: '1.5px solid #1e4a14',
        top: 2, left: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Bark ring 3 */}
        <div style={{
          width: 21, height: 21,
          borderRadius: '50%',
          border: '1.5px solid #2a6320',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Bark ring 2 */}
          <div style={{
            width: 15, height: 15,
            borderRadius: '50%',
            border: '1.2px solid #3a8030',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Bark ring 1 */}
            <div style={{
              width: 9, height: 9,
              borderRadius: '50%',
              border: '1px solid #52a840',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Heartwood */}
              <div style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #d4a055 0%, #9c6228 55%, #7c4b1a 100%)',
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>,
    { ...size },
  )
}
