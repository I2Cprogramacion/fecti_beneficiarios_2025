'use client'

import { useEffect, useState } from 'react'

interface ExcelPreviewInlineProps {
  projectId: number
}

export function ExcelPreviewInline({ projectId }: ExcelPreviewInlineProps) {
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

        const blob = await res.blob()
        const arrayBuffer = await blob.arrayBuffer()
        
        // Dynamically import XLSX to avoid build issues
        const { read, utils } = await import('xlsx')
        
        // Parse the workbook with the buffer as Uint8Array
        const uint8Array = new Uint8Array(arrayBuffer)
        const workbook = read(uint8Array, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convert to HTML
        const html = utils.sheet_to_html(worksheet)
        setTableHtml(html)
      } catch (err) {
        console.error('Error loading Excel:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    loadExcel()
  }, [projectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Cargando archivo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive mb-2 text-sm">Error al cargar el archivo</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto bg-card border border-border rounded-lg p-4">
      <div 
        dangerouslySetInnerHTML={{ __html: tableHtml }}
        className="text-xs"
        style={{
          fontSize: '0.75rem',
          lineHeight: '1rem',
        }}
      />
    </div>
  )
}
