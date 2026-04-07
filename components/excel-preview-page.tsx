'use client'

import { useEffect, useRef, useState } from 'react'

interface ExcelPreviewPageProps {
  projectId: string
}

declare global {
  interface Window {
    Handsontable: any
  }
}

export function ExcelPreviewPage({ projectId }: ExcelPreviewPageProps) {
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
          
          // Wait for CSS to load
          await new Promise(resolve => setTimeout(resolve, 500))
        }

        // Load Handsontable JS
        if (typeof window.Handsontable === 'undefined') {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/npm/handsontable@12.4.0/dist/handsontable.full.min.js'
          script.async = false
          script.onload = async () => {
            await loadExcelData()
          }
          script.onerror = () => {
            setError('No se pudo cargar la librería de visualización')
            setLoading(false)
          }
          document.body.appendChild(script)
        } else {
          await loadExcelData()
        }

        async function loadExcelData() {
          try {
            // Fetch the Excel file
            const res = await fetch(`/api/admin/download?projectId=${projectId}`)
            if (!res.ok) {
              throw new Error('No se pudo descargar el archivo')
            }

            const blob = await res.blob()
            const arrayBuffer = await blob.arrayBuffer()

            // Import XLSX to parse the file
            const { read, utils } = await import('xlsx')
            const uint8Array = new Uint8Array(arrayBuffer)
            const workbook = read(uint8Array, { type: 'array' })

            // Get first sheet
            const firstSheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[firstSheetName]
            
            // Convert to 2D array
            const data = utils.sheet_to_json(worksheet, { header: 1 }) as any[]

            // Wait for Handsontable to be available
            let attempts = 0
            while (typeof window.Handsontable === 'undefined' && attempts < 20) {
              await new Promise(resolve => setTimeout(resolve, 100))
              attempts++
            }

            // Initialize Handsontable in the container
            if (containerRef.current && window.Handsontable) {
              containerRef.current.innerHTML = ''
              
              hotRef.current = new window.Handsontable(containerRef.current, {
                data: data || [],
                rowHeaders: true,
                colHeaders: true,
                height: '100%',
                minRows: 5,
                minCols: 5,
                contextMenu: ['row_above', 'row_below', 'hsep_above', 'hsep_below', 'col_left', 'col_right', 'hsep_left', 'hsep_right', '---------', 'remove_row', 'remove_col', '---------', 'undo', 'redo'],
                copyPaste: {
                  pasteMode: 'overwrite',
                },
                licenseKey: 'non-commercial-and-evaluation',
                fillHandle: {
                  autoInsertRow: true,
                },
              })

              setLoading(false)
            } else {
              throw new Error('Handsontable no está disponible')
            }
          } catch (err) {
            console.error('Error loading Excel data:', err)
            setError(err instanceof Error ? err.message : 'Error al cargar los datos')
            setLoading(false)
          }
        }
      } catch (err) {
        console.error('Error initializing Handsontable:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setLoading(false)
      }
    }

    initHandsontable()

    return () => {
      // Cleanup
      if (hotRef.current) {
        try {
          hotRef.current.destroy()
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }, [projectId])

  return (
    <div className="flex-1 p-4 overflow-auto">
      {loading && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">Cargando archivo editable...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-destructive mb-2 text-sm font-semibold">Error al cargar el archivo</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div
          ref={containerRef}
          className="w-full h-full bg-white rounded border"
          style={{ 
            minHeight: '600px',
            display: loading || error ? 'none' : 'block'
          }}
        />
      )}
    </div>
  )
}
