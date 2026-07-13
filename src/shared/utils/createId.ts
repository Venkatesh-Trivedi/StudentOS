export function createId(): string {
  const browserCrypto = globalThis.crypto

  if (browserCrypto === undefined) {
    throw new Error('Secure random number generation is unavailable')
  }

  if (typeof browserCrypto.randomUUID === 'function') {
    try {
      return browserCrypto.randomUUID()
    } catch {
      // Fall through to the browser-compatible Web Crypto fallback.
    }
  }

  if (typeof browserCrypto.getRandomValues !== 'function') {
    throw new Error('Secure random number generation is unavailable')
  }

  const bytes = new Uint8Array(16)

  browserCrypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const value = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')

  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(
    12,
    16,
  )}-${value.slice(16, 20)}-${value.slice(20)}`
}
