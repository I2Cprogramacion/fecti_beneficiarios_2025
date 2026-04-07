'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

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
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Crear nuevo administrador</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email</label>
          <Input
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Contraseña inicial</label>
          <Input
            type="password"
            placeholder="Contraseña temporal"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            El usuario deberá cambiar la contraseña al primer login
          </p>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creando...' : 'Crear administrador'}
        </Button>
      </form>
    </Card>
  )
}
