import { ImageResponse } from 'next/og'

export const dynamic     = 'force-static'
export const size        = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{
      width: 180, height: 180, borderRadius: 40,
      background: 'linear-gradient(160deg, #041208 0%, #030d05 60%, #060f07 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ground glow */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 50, borderRadius: '0 0 40px 40px',
        background: 'radial-gradient(ellipse at 50% 100%, #0f3b0a 0%, transparent 70%)',
      }} />
      {/* Trunk */}
      <div style={{
        position: 'absolute', bottom: 18, left: 80,
        width: 20, height: 52, borderRadius: 5,
        background: 'linear-gradient(to right, #5c3410, #8a5520, #5c3410)',
      }} />
      {/* Root spread */}
      <div style={{
        position: 'absolute', bottom: 14, left: 55,
        width: 70, height: 12, borderRadius: 6,
        background: '#4a2a0e',
      }} />
      {/* Bottom canopy */}
      <div style={{
        position: 'absolute', bottom: 48,
        width: 130, height: 65, borderRadius: '50%',
        background: 'radial-gradient(ellipse at 40% 40%, #165c10 0%, #0a3006 100%)',
      }} />
      {/* Mid-low canopy */}
      <div style={{
        position: 'absolute', bottom: 72,
        width: 112, height: 60, borderRadius: '50%',
        background: 'radial-gradient(ellipse at 40% 40%, #1e7016 0%, #0e4008 100%)',
      }} />
      {/* Mid canopy */}
      <div style={{
        position: 'absolute', bottom: 94,
        width: 92, height: 56, borderRadius: '50%',
        background: 'radial-gradient(ellipse at 38% 38%, #26861c 0%, #134a0c 100%)',
      }} />
      {/* Upper canopy */}
      <div style={{
        position: 'absolute', bottom: 114,
        width: 72, height: 50, borderRadius: '50%',
        background: 'radial-gradient(ellipse at 38% 38%, #2e9e22 0%, #185810 100%)',
      }} />
      {/* Crown */}
      <div style={{
        position: 'absolute', bottom: 132,
        width: 52, height: 42, borderRadius: '50%',
        background: 'radial-gradient(ellipse at 38% 35%, #38b828 0%, #1e6c14 100%)',
      }} />
      {/* Top tip */}
      <div style={{
        position: 'absolute', top: 10,
        width: 30, height: 30, borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 35%, #4ed438 0%, #28941c 100%)',
      }} />
      {/* Sunlight glints */}
      <div style={{
        position: 'absolute', top: 16, left: 62,
        width: 14, height: 9, borderRadius: '50%',
        background: '#72f055', opacity: 0.45,
      }} />
      <div style={{
        position: 'absolute', bottom: 105, left: 50,
        width: 10, height: 7, borderRadius: '50%',
        background: '#5ee040', opacity: 0.3,
      }} />
    </div>,
    { ...size },
  )
}
