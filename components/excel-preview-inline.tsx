'use client'

import { useEffect, useRef, useState } from 'react'

interface ExcelPreviewInlineProps {
  projectId: number
}

declare global {
  interface Window {
    Handsontable: any
  }
}

export function ExcelPreviewInline({ projectId }: ExcelPreviewInlineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hotRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initHandsontable = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load Handsontable CSS
        if (!document.getElementById('handsontable-css')) {
          const link = document.createElement('link')
          link.id = 'handsontable-css'
          link.rel = 'stylesheet'
          link.href = 'https://cdn.jsdelivr.net/npm/handsontable@12.4.0/dist/handsontable.full.min.css'
          document.head.appendChild(link)
        }

        // Load Handsontable JS
        if (typeof window.Handsontable === 'undefined') {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/npm/handsontable@12.4.0/dist/handsontable.full.min.js'
          script.async = true
          script.onload = async () => {
            await loadExcelData()
          }
          document.body.appendChild(script)
        } else {
          await loadExcelData()
        }

        async function loadExcelData() {
          // Fetch the Excel file using base64 endpoint
          const res = await fetch(`/api/admin/download-blob?projectId=${projectId}`, {
            credentials: 'include',
          })
          if (!res.ok) {
            throw new Error('No se pudo descargar el archivo')
          }

          const downloadData = await res.json()
          
          // Convert base64 back to ArrayBuffer
          const binaryString = atob(downloadData.data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          const arrayBuffer = bytes.buffer

          // Import XLSX to parse the file
          const { read, utils } = await import('xlsx')
          const uint8Array = new Uint8Array(arrayBuffer)
          const workbook = read(uint8Array, { type: 'array' })

          // Get first sheet
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          
          // Convert to 2D array
          const data = utils.sheet_to_json(worksheet, { header: 1 }) as any[]

          // Initialize Handsontable in the container
          if (containerRef.current && window.Handsontable) {
            // Clear any existing content
            containerRef.current.innerHTML = ''
            
            hotRef.current = new window.Handsontable(containerRef.current, {
              data: data || [],
              rowHeaders: true,
              colHeaders: true,
              height: 'auto',
              minRows: 10,
              minCols: 10,
              contextMenu: [
                'row_above',
                'row_below',
                'hsep_above',
                'hsep_below',
                'col_left',
                'col_right',
                'hsep_left',
                'hsep_right',
                '---------',
                'remove_row',
                'remove_col',
                '---------',
                'undo',
                'redo',
              ],
              copyPaste: true,
              fixedRowsTop: 0,
              fixedColumnsLeft: 0,
              licenseKey: 'non-commercial-and-evaluation',
              fillHandle: {
                autoInsertRow: false,
              },
              stretchH: 'none',
              preventOverflow: 'horizontal',
            })
          }

          setLoading(false)
        }
      } catch (err) {
        console.error('Error loading Excel:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setLoading(false)
      }
    }

    initHandsontable()

    return () => {
      // Cleanup
      if (hotRef.current) {
        hotRef.current.destroy()
      }
    }
  }, [projectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Cargando archivo editable...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center">
          <p className="text-destructive mb-2 text-sm">Error al cargar el archivo</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-white"
    />
  )
}
