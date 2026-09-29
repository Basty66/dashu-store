import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Ejecuta las funciones de /api dentro del servidor de Vite, imitando a Vercel
// (mismos rewrites de vercel.json, req.query, req.body, res.status/json/send).
function vercelApiDev() {
  const root = process.cwd()
  const rewrites = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8')).rewrites
    .filter((r) => r.source.startsWith('/api/'))
    .map((r) => {
      const base = path.join(root, r.destination)
      return {
        regex: new RegExp(`^${r.source.replace(':path*', '.*').replace(/\/\.\*$/, '(?:/.*)?')}$`),
        file: fs.existsSync(`${base}.js`) ? `${base}.js` : path.join(base, 'index.js'),
      }
    })

  function resolve(pathname) {
    const rewrite = rewrites.find((r) => r.regex.test(pathname))
    if (rewrite) return { file: rewrite.file, params: {} }
    const segments = pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean)
    const direct = path.join(root, 'api', ...segments)
    if (fs.existsSync(`${direct}.js`)) return { file: `${direct}.js`, params: {} }
    if (fs.existsSync(path.join(direct, 'index.js'))) return { file: path.join(direct, 'index.js'), params: {} }
    const dir = path.join(root, 'api', ...segments.slice(0, -1))
    const dynamic = fs.existsSync(dir) && fs.readdirSync(dir).find((f) => /^\[[^.]+\]\.js$/.test(f))
    if (dynamic) return { file: path.join(dir, dynamic), params: { [dynamic.slice(1, -4)]: segments.at(-1) } }
    return null
  }

  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      Object.assign(process.env, { ...loadEnv('development', root, ''), ...process.env })

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        if (!url.pathname.startsWith('/api/')) return next()
        const route = resolve(url.pathname)
        res.status = (code) => ((res.statusCode = code), res)
        res.json = (data) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(data))
        }
        res.send = (data) => res.end(data)
        if (!route) return res.status(404).json({ error: 'No encontrado' })

        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        const raw = Buffer.concat(chunks).toString('utf8')
        req.query = { ...Object.fromEntries(url.searchParams), ...route.params }
        try {
          req.body = raw && req.headers['content-type']?.includes('application/json') ? JSON.parse(raw) : raw || undefined
          const mod = await server.ssrLoadModule(route.file)
          await mod.default(req, res)
        } catch (error) {
          console.error('[api-dev]', error)
          if (!res.headersSent) res.status(500).json({ error: error.message })
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), vercelApiDev()],
  resolve: { alias: { '@shared': path.resolve(process.cwd(), 'shared') } },
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: { vendor: ['react', 'react-dom', 'react-router-dom'], motion: ['framer-motion'] },
      },
    },
  },
})
