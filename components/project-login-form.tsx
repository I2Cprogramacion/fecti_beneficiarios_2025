'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ProjectLoginForm({ projectId }: { projectId: number }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      let data
      try {
        data = await res.json()
      } catch {
        setError('Error del servidor: respuesta inválida')
        setLoading(false)
        return
      }

      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión')
        setLoading(false)
        return
      }

      const user = data.user
      if (user.role !== 'beneficiary' || user.projectId !== projectId) {
        await fetch('/api/auth/logout', { method: 'POST' })
        setError('Las credenciales no corresponden a este proyecto.')
        setLoading(false)
        return
      }

      // Redirect después de login exitoso
      router.push(user.mustChangePassword ? '/admin/change-password' : '/dashboard')
    } catch (error) {
      setError('Error de conexión: ' + (error instanceof Error ? error.message : 'desconocido'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="text-xs font-medium text-foreground block mb-1">Correo electrónico</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-input rounded px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="correo@ejemplo.com"
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
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
    </form>
  )
}
