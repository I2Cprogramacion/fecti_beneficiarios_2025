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
    let isMounted = true
    let loadingScripts = false

    const initHandsontable = async () => {
      try {
        setLoading(true)
        setError(null)

        // Step 1: Ensure CSS is loaded
        if (!document.getElementById('handsontable-css')) {
          const link = document.createElement('link')
          link.id = 'handsontable-css'
          link.rel = 'stylesheet'
          link.href = 'https://cdn.jsdelivr.net/npm/handsontable@12.4.0/dist/handsontable.full.min.css'
          document.head.appendChild(link)
        }

        // Step 2: Ensure JS is loaded
        if (typeof window.Handsontable === 'undefined' && !loadingScripts) {
          loadingScripts = true
          
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/npm/handsontable@12.4.0/dist/handsontable.full.min.js'
            script.async = false
            
            script.onload = () => {
              console.log('Handsontable script loaded')
              if (typeof window.Handsontable !== 'undefined') {
                console.log('Handsontable is available')
                resolve()
              } else {
                reject(new Error('Handsontable not available after script load'))
              }
            }
            
            script.onerror = () => {
              reject(new Error('Failed to load Handsontable script'))
            }
            
            document.body.appendChild(script)
          })
        }

        if (!isMounted) return

        // Step 3: Fetch Excel file
        console.log('Fetching Excel file...')
        const res = await fetch(`/api/admin/download?projectId=${projectId}`)
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: No se pudo descargar el archivo`)
        }

        const blob = await res.blob()
        const arrayBuffer = await blob.arrayBuffer()
        console.log('Excel file fetched, size:', arrayBuffer.byteLength)

        // Step 4: Parse Excel
        const { read, utils } = await import('xlsx')
        const uint8Array = new Uint8Array(arrayBuffer)
        const workbook = read(uint8Array, { type: 'array' })

        if (workbook.SheetNames.length === 0) {
          throw new Error('El archivo Excel está vacío')
        }

        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const data = utils.sheet_to_json(worksheet, { header: 1 }) as any[]

        console.log('Excel data parsed, rows:', data.length)

        if (!isMounted) return

        // Step 5: Initialize Handsontable
        console.log('Initializing Handsontable...')
        if (!containerRef.current) {
          throw new Error('Container not available')
        }

        if (typeof window.Handsontable !== 'function') {
          throw new Error(`Handsontable is not a function: ${typeof window.Handsontable}`)
        }

        containerRef.current.innerHTML = ''

        hotRef.current = new window.Handsontable(containerRef.current, {
          data: data || [],
          rowHeaders: true,
          colHeaders: true,
          height: '100%',
          minRows: 5,
          minCols: 5,
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
          copyPaste: {
            pasteMode: 'overwrite',
          },
          licenseKey: 'non-commercial-and-evaluation',
          fillHandle: {
            autoInsertRow: false,
          },
          outsideClickDeselects: true,
          manualColumnResize: true,
          manualRowResize: true,
        })

        console.log('Handsontable initialized successfully')

        if (isMounted) {
          setLoading(false)
        }
      } catch (err) {
        console.error('Error:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : String(err))
          setLoading(false)
        }
      }
    }

    initHandsontable()

    return () => {
      isMounted = false
      if (hotRef.current) {
        try {
          hotRef.current.destroy()
        } catch (e) {
          console.error('Cleanup error:', e)
        }
      }
    }
  }, [projectId])

  return (
    <div className="flex-1 p-4 overflow-hidden flex flex-col">
      {loading && (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">Cargando archivo editable...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center bg-destructive/10 border border-destructive/50 rounded-lg p-6 max-w-md">
            <p className="text-destructive mb-2 text-sm font-semibold">Error al cargar el archivo</p>
            <p className="text-xs text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div
          ref={containerRef}
          className="w-full flex-1 bg-white rounded border border-border overflow-hidden"
        />
      )}
    </div>
  )
}
