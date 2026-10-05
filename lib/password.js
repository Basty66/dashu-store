import crypto from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(crypto.scrypt)

// scrypt con los parámetros mínimos que recomienda OWASP (N = 2^17, r = 8, p = 1).
// Formato guardado: scrypt$17$8$1$<sal base64>$<hash base64>
const COST = 17
const BLOCK = 8
const PARALLEL = 1
const KEYLEN = 64
const MAXMEM = 256 * 1024 * 1024

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16)
  const hash = await scrypt(String(password).normalize('NFKC'), salt, KEYLEN, { N: 2 ** COST, r: BLOCK, p: PARALLEL, maxmem: MAXMEM })
  return ['scrypt', COST, BLOCK, PARALLEL, salt.toString('base64'), hash.toString('base64')].join('$')
}

export async function verifyPassword(password, stored) {
  const [algo, cost, block, parallel, salt, hash] = String(stored || '').split('$')
  if (algo !== 'scrypt' || !salt || !hash) return false
  const expected = Buffer.from(hash, 'base64')
  const actual = await scrypt(String(password).normalize('NFKC'), Buffer.from(salt, 'base64'), expected.length, {
    N: 2 ** Number(cost),
    r: Number(block),
    p: Number(parallel),
    maxmem: MAXMEM,
  })
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
}

// Hash de relleno: cuando el correo no existe igual se calcula un hash, para que la respuesta
// tarde lo mismo y no delate qué correos tienen cuenta.
let dummy = null
export async function dummyVerify(password) {
  dummy ??= await hashPassword(crypto.randomBytes(16).toString('hex'))
  await verifyPassword(password, dummy)
  return false
}
