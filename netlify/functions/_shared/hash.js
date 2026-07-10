import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto'

const KEY_LENGTH = 64

export function hashPin(pin, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(pin, salt, KEY_LENGTH).toString('hex')
  return { hash, salt }
}

export function verifyPin(pin, salt, expectedHash) {
  const actual = scryptSync(pin, salt, KEY_LENGTH)
  const expected = Buffer.from(expectedHash, 'hex')
  if (actual.length !== expected.length) return false
  return timingSafeEqual(actual, expected)
}

export function generateSessionToken() {
  return randomBytes(32).toString('hex')
}

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex')
}
