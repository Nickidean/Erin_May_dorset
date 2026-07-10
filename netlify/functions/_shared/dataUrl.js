const EXT_BY_TYPE = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export function parseDataUrl(dataUrl) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl || '')
  if (!match) throw new Error('Invalid or unsupported image data URL')
  const [, contentType, base64] = match
  return {
    buffer: Buffer.from(base64, 'base64'),
    contentType,
    ext: EXT_BY_TYPE[contentType],
  }
}
