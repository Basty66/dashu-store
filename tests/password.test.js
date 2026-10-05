import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword, verifyPassword } from '../lib/password.js'

test('contraseñas: se guardan con scrypt y sal única, y solo valida la correcta', async () => {
  const hash = await hashPassword('Clave-segura-2026')
  assert.match(hash, /^scrypt\$17\$8\$1\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/)
  assert.ok(!hash.includes('Clave-segura-2026'))
  assert.equal(await verifyPassword('Clave-segura-2026', hash), true)
  assert.equal(await verifyPassword('clave-segura-2026', hash), false)
  assert.equal(await verifyPassword('', hash), false)
  assert.equal(await verifyPassword('Clave-segura-2026', 'texto-plano'), false)
  // Misma clave, distinta sal: hashes distintos.
  assert.notEqual(await hashPassword('Clave-segura-2026'), hash)
})
