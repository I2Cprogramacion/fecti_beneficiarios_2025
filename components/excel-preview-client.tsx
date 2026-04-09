'use client'

import { useEffect, useState } from 'react'

interface ExcelPreviewClientProps {
  projectId: string
}

export function ExcelPreviewClient({ projectId }: ExcelPreviewClientProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])

  useEffect(() => {
    async function loadExcel() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`/api/admin/download?projectId=${projectId}`)
        if (!res.ok) {
          throw new Error('No se pudo descargar el archivo')
        }

        const arrayBuffer = await res.arrayBuffer()
        const XLSX = (await import('xlsx')).default
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // C2-fix: Parse as JSON array (no HTML = no XSS) instead of dangerouslySetInnerHTML
        const data: string[][] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          raw: false,
        })

        if (data.length > 0) {
          setHeaders(data[0].map(String))
          setRows(data.slice(1).map(row => row.map(String)))
        }
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
          <table className="text-sm border-collapse w-full">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="border border-border bg-muted px-3 py-1.5 text-left font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="even:bg-muted/40">
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-border px-3 py-1 whitespace-nowrap">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
