'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'

export function CreateAdminForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      let data
      try {
        data = await res.json()
      } catch {
        setError(`Error del servidor: respuesta inválida (${res.status})`)
        setLoading(false)
        return
      }

      if (!res.ok) {
        setError(data.error || 'Error al crear admin')
        setLoading(false)
        return
      }

      setSuccess(`Admin creado: ${data.user.email}`)
      setEmail('')
      setPassword('')
      router.refresh()

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err) {
      setError('Error de conexión: ' + (err instanceof Error ? err.message : 'desconocido'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-bold text-foreground">Nuevo Administrador</h2>
        <p className="text-xs text-muted-foreground">Asigna acceso al panel de administración</p>
      </div>

      <div className="p-5">
        {error && (
          <div className="mb-4 px-3 py-2 rounded bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 px-3 py-2 rounded bg-green-50 border border-green-200">
            <p className="text-xs text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Correo electrónico</label>
            <Input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="off"
              className="text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Contraseña inicial</label>
            <Input
              type="password"
              placeholder="Contraseña temporal"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="off"
              className="text-sm"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              El usuario deberá cambiar la contraseña al primer inicio de sesión
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground text-xs font-medium px-4 py-2.5 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creando...' : 'Crear administrador'}
          </button>
        </form>
      </div>
    </div>
  )
}
