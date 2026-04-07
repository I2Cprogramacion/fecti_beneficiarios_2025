'use client'

import { useEffect, useRef, useState } from 'react'
import { HotTable } from '@handsontable/react'
import '@handsontable/react/dist/react-handsontable.css'

interface ExcelPreviewInlineProps {
  projectId: number
}

export function ExcelPreviewInline({ projectId }: ExcelPreviewInlineProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any[]>([])
  const hotTableRef = useRef(null)

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
        
        // Dynamically import XLSX
        const { read, utils } = await import('xlsx')
        
        // Parse the workbook
        const uint8Array = new Uint8Array(arrayBuffer)
        const workbook = read(uint8Array, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convert to 2D array
        const jsonData = utils.sheet_to_json(worksheet, { header: 1 })
        setData((jsonData as any[]) || [])
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

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">El archivo está vacío</p>
      </div>
    )
  }

  return (
    <div className="w-full bg-card border border-border rounded p-2">
      <HotTable
        ref={hotTableRef}
        data={data}
        readOnly={false}
        rowHeaders={true}
        colHeaders={true}
        height="auto"
        licenseKey="non-commercial-and-evaluation"
        contextMenu={true}
        copyPaste={true}
        outsideClickDeselects={false}
        className="text-xs"
        stretchH="all"
      />
    </div>
  )
}
