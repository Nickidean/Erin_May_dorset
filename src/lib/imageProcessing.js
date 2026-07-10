// Client-side crop/resize via the Canvas API. No external dependencies.

async function loadBitmap(file) {
  return createImageBitmap(file)
}

// Center-crops to the given aspect ratio ("cover" style), then scales the
// crop down so its longest edge is at most maxDimension.
export async function cropAndResizeImage(file, { aspectRatio, maxDimension, mimeType = 'image/jpeg', quality = 0.85 }) {
  const bitmap = await loadBitmap(file)
  const srcW = bitmap.width
  const srcH = bitmap.height
  const srcAspect = srcW / srcH

  let cropW, cropH, cropX, cropY
  if (srcAspect > aspectRatio) {
    cropH = srcH
    cropW = srcH * aspectRatio
    cropX = (srcW - cropW) / 2
    cropY = 0
  } else {
    cropW = srcW
    cropH = srcW / aspectRatio
    cropX = 0
    cropY = (srcH - cropH) / 2
  }

  let outW = cropW
  let outH = cropH
  if (Math.max(outW, outH) > maxDimension) {
    const scale = maxDimension / Math.max(outW, outH)
    outW = Math.round(outW * scale)
    outH = Math.round(outH * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, cropX, cropY, cropW, cropH, 0, 0, outW, outH)

  return canvasToBlob(canvas, mimeType, quality)
}

// Scales an image down to fit within maxDimension, preserving aspect ratio
// and transparency. Used for the logo, which isn't forced to a fixed ratio.
export async function resizeImage(file, { maxDimension, mimeType = 'image/png', quality = 0.9 }) {
  const bitmap = await loadBitmap(file)
  let outW = bitmap.width
  let outH = bitmap.height
  if (Math.max(outW, outH) > maxDimension) {
    const scale = maxDimension / Math.max(outW, outH)
    outW = Math.round(outW * scale)
    outH = Math.round(outH * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, outW, outH)

  return canvasToBlob(canvas, mimeType, quality)
}

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Could not export image'))
    }, mimeType, quality)
  })
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
