const CLOUD_NAME     = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET  = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

export type UploadResult = { url: string; type: 'image' | 'video' }

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET)
}

export async function uploadMedia(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<UploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary not configured — add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env.local')
  }

  const isVideo      = file.type.startsWith('video/')
  const resourceType = isVideo ? 'video' : 'image'
  const endpoint     = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`

  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('file', file)
    form.append('upload_preset', UPLOAD_PRESET!)
    form.append('folder', 'sylvan/media')

    const xhr = new XMLHttpRequest()
    xhr.open('POST', endpoint)

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText)
        resolve({ url: data.secure_url, type: isVideo ? 'video' : 'image' })
      } else {
        reject(new Error('Upload failed'))
      }
    }
    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(form)
  })
}

export async function uploadAudio(
  blob: Blob,
  onProgress?: (pct: number) => void,
): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) throw new Error('Cloudinary not configured')
  const file     = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type || 'audio/webm' })
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('file', file)
    form.append('upload_preset', UPLOAD_PRESET!)
    form.append('folder', 'sylvan/audio')
    const xhr = new XMLHttpRequest()
    xhr.open('POST', endpoint)
    if (onProgress) {
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)) }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText).secure_url as string)
      } else reject(new Error(`Audio upload failed: ${xhr.status}`))
    }
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(form)
  })
}
