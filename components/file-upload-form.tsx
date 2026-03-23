'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface FileUploadFormProps {
  projectId: number
  onComplete: () => void
}

export default function FileUploadForm({ projectId, onComplete }: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState<'template' | 'report' | 'excel'>('template')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Selecciona un archivo')
      return
    }

    setError('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', String(projectId))
      formData.append('fileType', fileType)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al subir el archivo')
        return
      }

      setSuccess(true)
      setFile(null)
      setTimeout(() => {
        setSuccess(false)
        onComplete()
      }, 2000)
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Tipo de archivo
        </label>
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value as any)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-slate-900"
          disabled={loading}
        >
          <option value="template">Plantilla</option>
          <option value="report">Reporte</option>
          <option value="excel">Excel</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Selecciona archivo
        </label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={loading}
          className="w-full"
          required
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          ¡Archivo subido exitosamente!
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading || !file} className="flex-1">
          {loading ? 'Subiendo...' : 'Subir archivo'}
        </Button>
        <Button type="button" variant="outline" onClick={onComplete} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
