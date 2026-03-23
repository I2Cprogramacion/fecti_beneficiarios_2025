'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Error al iniciar sesión.')
      return
    }

    const user = data.user
    if (user.role !== 'admin') {
      await fetch('/api/auth/logout', { method: 'POST' })
      setError('Acceso no autorizado.')
      return
    }

    // Navegar después del delay para asegurar que la cookie se guardó
    setTimeout(() => {
      if (user.mustChangePassword) {
        router.push('/admin/change-password')
      } else {
        router.push('/admin/dashboard')
      }
    }, 300)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-medium text-foreground block mb-1">Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-input rounded px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="admin@ejemplo.com"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-foreground block mb-1">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-input rounded px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 rounded px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? 'Iniciando sesión...' : 'Entrar'}
      </button>
    </form>
  )
}
