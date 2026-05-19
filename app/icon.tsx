import { ImageResponse } from 'next/og'

export const dynamic     = 'force-static'
export const size        = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div style={{
      width: 32, height: 32, borderRadius: 7,
      background: '#030d05',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Trunk */}
      <div style={{
        position: 'absolute', bottom: 1, left: 14,
        width: 4, height: 9, borderRadius: 1,
        background: '#7c4b1a',
      }} />
      {/* Bottom canopy */}
      <div style={{
        position: 'absolute', bottom: 6,
        width: 24, height: 12, borderRadius: '50%',
        background: '#0d3b08',
      }} />
      {/* Mid canopy */}
      <div style={{
        position: 'absolute', bottom: 11,
        width: 20, height: 12, borderRadius: '50%',
        background: '#186614',
      }} />
      {/* Upper canopy */}
      <div style={{
        position: 'absolute', bottom: 15,
        width: 16, height: 11, borderRadius: '50%',
        background: '#1f801a',
      }} />
      {/* Crown */}
      <div style={{
        position: 'absolute', bottom: 19,
        width: 12, height: 10, borderRadius: '50%',
        background: '#289920',
      }} />
      {/* Top tip */}
      <div style={{
        position: 'absolute', top: 1,
        width: 7, height: 7, borderRadius: '50%',
        background: '#32b828',
      }} />
    </div>,
    { ...size },
  )
}
