import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = 3001

// Load .env
try {
  const envPath = path.join(__dirname, '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) return
      const key = trimmed.slice(0, eqIdx).trim()
      let value = trimmed.slice(eqIdx + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
        value = value.slice(1, -1)
      if (!process.env[key]) process.env[key] = value
    })
  }
} catch {}

function parseUrl(reqUrl) {
  const url = new URL(reqUrl, 'http://localhost')
  const segments = url.pathname.replace(/^\/api\//, '').split('/').filter(Boolean)
  const params = {}
  const query = Object.fromEntries(url.searchParams)
  return { segments, query, pathname: url.pathname }
}

async function loadHandler(segments) {
  // Try a direct file: api/admin/auth.js
  let filePath = path.join(__dirname, 'api', ...segments) + '.js'
  if (fs.existsSync(filePath)) {
    const mod = await import(pathToFileURL(filePath))
    return mod.default
  }
  // Try index: api/products/index.js
  filePath = path.join(__dirname, 'api', ...segments, 'index.js')
  if (fs.existsSync(filePath)) {
    const mod = await import(pathToFileURL(filePath))
    return mod.default
  }
  return null
}

async function findHandler(segments, query) {
  // Exact match (direct file or index)
  let handler = await loadHandler(segments)
  if (handler) return handler

  if (segments.length >= 1) {
    // Try consolidated parent file: e.g. api/admin.js for /api/admin/orders
    handler = await loadHandler([segments[0]])
    if (handler) return handler

    const parentSegments = segments.slice(0, -1)
    // Check for dynamic param files like [id].js in parent dir
    const parentDir = path.join(__dirname, 'api', ...parentSegments)
    let paramFile = null
    try {
      const files = fs.readdirSync(parentDir)
      paramFile = files.find(f => f.startsWith('[') && f.endsWith('.js'))
    } catch {}
    if (paramFile) {
      const paramName = paramFile.replace(/^\[|\]\.js$/g, '')
      query[paramName] = segments[segments.length - 1]
      handler = await loadHandler([...parentSegments, paramFile.slice(0, -3)])
      if (handler) return handler
    }
    // Fallback: parent/index.js
    handler = await loadHandler(parentSegments)
    if (handler) return handler
  }

  return null
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.end()

  const { segments, query, pathname } = parseUrl(req.url)

  if (!pathname.startsWith('/api/')) {
    res.writeHead(404).end()
    return
  }

  let body = ''
  req.on('data', chunk => body += chunk)
  req.on('end', async () => {
    try {
      req.query = query
      if (body) {
        try { req.body = JSON.parse(body) } catch { req.body = body }
        req.body = { ...req.body, ...query }
      } else {
        req.body = query
      }

      const handler = await findHandler(segments, query)

      if (!handler) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'Not found' }))
      }

      // Wrap res to match Vercel's methods
      res.status = (code) => { res.statusCode = code; return res }
      res.json = (data) => {
        res.writeHead(res.statusCode || 200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(data))
      }

      await handler(req, res)
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: e.message }))
    }
  })
})

server.listen(PORT, () => {
  console.log(`API Dev Server running on http://localhost:${PORT}`)
})

// Graceful shutdown — finish in-flight requests before exiting
let shuttingDown = false
server.on('request', (req, res) => {
  if (shuttingDown) {
    res.writeHead(503, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Server shutting down' }))
    return
  }
})

function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`\n${signal} received — finishing requests...`)
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
  setTimeout(() => { console.log('Forced exit'); process.exit(1) }, 10000)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
