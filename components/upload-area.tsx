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
    <div className="bg-card border border-border rounded-xl p-6 shadow-md">
      <h2 className="text-base font-bold text-foreground mb-1">Subir reporte</h2>

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
        className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all group"
      >
        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <p className="text-sm text-foreground font-medium">
          {fileName ? 'Haz clic o arrastra para reemplazar el archivo' : 'Haz clic o arrastra tu archivo aquí'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Formatos aceptados: .xls y .xlsx</p>
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
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground">Subiendo archivo...</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-4 py-3 mt-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mt-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
          {success}
        </div>
      )}
    </div>
  )
}
