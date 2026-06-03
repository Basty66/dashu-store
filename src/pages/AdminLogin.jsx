import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ADMIN_TOKEN_KEY = 'dashu_admin_token'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e?.preventDefault()
    if (!password.trim()) return
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Contraseña incorrecta')
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token)
      navigate('/admin', { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#fff8f5' }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #0F2038 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #755841 0%, transparent 70%)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm mx-4">
        <div className="glass rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center mx-auto">
              <Lock size={20} className="text-cream" />
            </div>
            <h1 className="h-lg text-xl text-navy">Admin Dashboard</h1>
            <p className="text-sm text-stone">Ingresa la contraseña para acceder</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} autoFocus
                className="input-minimal w-full pr-10" placeholder="Contraseña"
                value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 text-outline-v hover:text-navy transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-600 text-center">{error}</motion.p>
            )}

            <motion.button type="submit" className="btn-primary w-full justify-center"
              disabled={loading || !password.trim()}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              {loading ? 'Verificando...' : 'Ingresar'}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-xs text-outline-v mt-6">
          © {new Date().getFullYear()} DASHU FOR MEN
        </p>
      </motion.div>
    </div>
  )
}
