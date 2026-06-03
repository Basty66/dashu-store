import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Send, Mail, Clock, CheckCircle } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!r.ok) throw new Error('Error al enviar')
      setDone(true)
    } catch {
      setError('Error al enviar el mensaje. Intenta de nuevo.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6 md:px-20">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-stone hover:text-navy transition-colors mb-8">
          <ArrowLeft size={14} /> Volver al inicio
        </Link>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="label text-xs text-gold">Contacto</span>
          <h1 className="display-md text-navy mt-2 mb-4">Hablemos</h1>
          <p className="text-sm text-stone mb-10 max-w-lg">¿Tienes dudas sobre nuestros productos, tu pedido o quieres ser distribuidor? Escríbenos y te respondemos a la brevedad.</p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="glass rounded-xl p-5 flex items-start gap-3">
                <Mail size={16} className="text-gold mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-navy">Email</p>
                  <p className="text-xs text-stone">contacto@dashu.store</p>
                </div>
              </div>
              <div className="glass rounded-xl p-5 flex items-start gap-3">
                <Clock size={16} className="text-gold mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-navy">Horario de atención</p>
                  <p className="text-xs text-stone">Lunes a viernes, 10:00 - 18:00</p>
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              {done ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-xl p-8 text-center space-y-3">
                  <CheckCircle size={32} className="mx-auto text-green-600" />
                  <p className="text-sm font-medium text-navy">Mensaje enviado</p>
                  <p className="text-xs text-stone">Te responderemos a la brevedad.</p>
                  <button onClick={() => { setDone(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                    className="text-xs text-gold underline hover:no-underline transition-all">Enviar otro</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-4">
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Tu nombre" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-white text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all" required />
                    <input type="email" placeholder="Tu email" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-white text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all" required />
                  </div>
                  <input type="text" placeholder="Asunto (opcional)" value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-white text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all" />
                  <textarea placeholder="Tu mensaje..." value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-white text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all resize-none h-32" required />
                  <motion.button type="submit" disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    {loading ? 'Enviando...' : 'Enviar Mensaje'} <Send size={14} />
                  </motion.button>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
