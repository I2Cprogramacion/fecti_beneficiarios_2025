'use client'

import { useEffect, useState } from 'react'

interface ExcelPreviewClientProps {
  projectId: string
}

export function ExcelPreviewClient({ projectId }: ExcelPreviewClientProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableHtml, setTableHtml] = useState<string>('')

  useEffect(() => {
    async function loadExcel() {
      try {
        setLoading(true)
        setError(null)

        // Fetch the file
        const res = await fetch(`/api/admin/download?projectId=${projectId}`)
        if (!res.ok) {
          throw new Error('No se pudo descargar el archivo')
        }

        const arrayBuffer = await res.arrayBuffer()
        
        // Load SheetJS dynamically
        const XLSX = (await import('xlsx')).default
        
        // Parse the workbook
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convert to HTML and sanitize
        const rawHtml = XLSX.utils.sheet_to_html(worksheet)
        // Strip <script> tags and on* event handlers to prevent XSS
        const sanitized = rawHtml
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
        setTableHtml(sanitized)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    loadExcel()
  }, [projectId])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Cargando archivo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-2">Error al cargar el archivo</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-background">
      <div className="flex-1 overflow-auto">
        <div className="bg-card border border-border rounded-lg shadow-sm p-4 inline-block min-w-full">
          <div 
            dangerouslySetInnerHTML={{ __html: tableHtml }}
            className="text-sm"
            style={{
              fontSize: '0.875rem',
              lineHeight: '1.25rem',
            }}
          />
        </div>
      </div>
    </div>
  )
}
