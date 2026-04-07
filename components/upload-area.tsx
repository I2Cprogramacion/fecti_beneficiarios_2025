'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface UploadAreaProps {
  projectId: number
  fileName: string | null
  uploadedAt: string | null
}

export function UploadArea({ projectId, fileName, uploadedAt }: UploadAreaProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleFile(file: File) {
    setError('')
    setSuccess('')
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/submit', { method: 'POST', body: formData })
    
    let data
    try {
      data = await res.json()
    } catch {
      setError('Error: respuesta inválida del servidor')
      setUploading(false)
      return
    }

    setUploading(false)

    if (!res.ok) {
      setError(data.error || 'Error al subir el archivo.')
      return
    }

    setSuccess(`Archivo "${data.fileName}" subido correctamente.`)
    setTimeout(() => router.refresh(), 1000)
  }

  async function handleDelete() {
    if (!confirm('¿Estás seguro de que deseas eliminar el archivo? No podrás recuperarlo.')) {
      return
    }

    setError('')
    setSuccess('')
    setDeleting(true)

    const res = await fetch('/api/submit/delete', { method: 'DELETE' })
    
    let data
    try {
      data = await res.json()
    } catch {
      setError('Error: respuesta inválida del servidor')
      setDeleting(false)
      return
    }

    setDeleting(false)

    if (!res.ok) {
      setError(data.error || 'Error al eliminar el archivo.')
      return
    }

    setSuccess('Archivo eliminado correctamente.')
    setTimeout(() => router.refresh(), 1000)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-foreground mb-1">Subir reporte</h2>

      {/* Current status */}
      <div
        className={`flex items-center justify-between gap-3 text-xs rounded px-3 py-2 mb-4 ${
          fileName
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-amber-50 text-amber-700 border border-amber-200'
        }`}
      >
        <div className="flex items-center gap-2 flex-1">
          <span className={`w-2 h-2 rounded-full shrink-0 ${fileName ? 'bg-green-500' : 'bg-amber-400'}`} />
          {fileName ? (
            <span>
              Archivo actual: <strong>{fileName}</strong>
              {uploadedAt && (
                <span className="ml-1 opacity-70">
                  — {new Date(uploadedAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              )}
            </span>
          ) : (
            <span>Sin archivo — pendiente de entrega</span>
          )}
        </div>
        {fileName && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="shrink-0 px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 font-semibold text-xs"
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
      >
        <p className="text-sm text-muted-foreground">
          {fileName ? 'Haz clic o arrastra para reemplazar el archivo' : 'Haz clic o arrastra tu archivo aquí'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Solo .xls y .xlsx</p>
        <input
          ref={inputRef}
          type="file"
          accept=".xls,.xlsx"
          className="hidden"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>

      {uploading && (
        <p className="text-xs text-muted-foreground mt-3 text-center">Subiendo archivo...</p>
      )}
      {error && (
        <p className="text-xs text-destructive bg-destructive/10 rounded px-3 py-2 mt-3">{error}</p>
      )}
      {success && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 mt-3">{success}</p>
      )}
    </div>
  )
}
