'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ExcelPreviewPage } from '@/components/excel-preview-page'
import { CloseButton } from '@/components/close-button'

interface Submission {
  clave: string
  titulo: string
}

export default function PreviewPage() {
  const params = useParams()
  const projectId = typeof params?.projectId === 'string' ? params.projectId : ''
  
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!projectId) {
      setError('No project ID provided')
      setLoading(false)
      return
    }

    const fetchSubmission = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('Fetching submission for projectId:', projectId)

        const res = await fetch(`/api/admin/submission?projectId=${projectId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        })

        console.log('Submission API response status:', res.status)
        
        if (!res.ok) {
          const errorData = await res.text()
          console.error('API error:', errorData)
          throw new Error(`HTTP ${res.status}`)
        }

        const data = await res.json()
        console.log('Submission data:', data)
        setSubmission(data)
      } catch (err) {
        console.error('Error fetching submission:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchSubmission()
  }, [projectId])

  if (!projectId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">No hay proyecto especificado</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Error al cargar</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <CloseButton />
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Archivo no encontrado</h1>
          <p className="text-muted-foreground mb-4">No hay archivo subido para este proyecto</p>
          <CloseButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground shadow-md p-4 flex-shrink-0">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">{submission.clave}</h1>
            <p className="text-xs opacity-75">{submission.titulo}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen()
                } else {
                  document.documentElement.requestFullscreen().catch(() => {
                    // Ignore fullscreen errors
                  })
                }
              }}
              className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors"
              title="Pantalla completa (F11)"
            >
              ⛶
            </button>
            <CloseButton />
          </div>
        </div>
      </div>

      {/* Viewer */}
      <ExcelPreviewPage projectId={projectId} />
    </div>
  )
}
