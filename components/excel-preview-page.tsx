'use client'

import { useEffect, useRef, useState } from 'react'

interface ExcelPreviewPageProps {
  projectId: string
  onClose?: () => void
}

declare global {
  interface Window {
    Handsontable: any
  }
}

export function ExcelPreviewPage({ projectId, onClose }: ExcelPreviewPageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hotRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const initHandsontable = async () => {
      try {
        if (!isMounted) return

        setLoading(true)
        setError(null)

        // Verify container is available
        if (!containerRef.current) {
          throw new Error('Container element not found in DOM')
        }

        // Step 1: Ensure CSS is loaded
        if (!document.getElementById('handsontable-css')) {
          const link = document.createElement('link')
          link.id = 'handsontable-css'
          link.rel = 'stylesheet'
          link.href = 'https://cdn.jsdelivr.net/npm/handsontable@12.4.0/dist/handsontable.full.min.css'
          document.head.appendChild(link)
          
          // Wait for CSS to load
          await new Promise(resolve => {
            link.onload = resolve
            setTimeout(resolve, 500) // Fallback
          })
        }

        // Step 2: Ensure JS is loaded
        if (typeof window.Handsontable === 'undefined') {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/npm/handsontable@12.4.0/dist/handsontable.full.min.js'
            script.async = true
            
            const timeout = setTimeout(() => {
              reject(new Error('Handsontable script loading timeout'))
            }, 10000)
            
            script.onload = () => {
              clearTimeout(timeout)
              setTimeout(() => {
                if (typeof window.Handsontable !== 'undefined') {
                  resolve()
                } else {
                  reject(new Error('Handsontable not available after script load'))
                }
              }, 100)
            }
            
            script.onerror = () => {
              clearTimeout(timeout)
              reject(new Error('Failed to load Handsontable script'))
            }
            
            document.body.appendChild(script)
          })
        }

        if (!isMounted) return

        // Step 3: Fetch Excel file
        const res = await fetch(`/api/admin/download-blob?projectId=${projectId}`, {
          credentials: 'include',
        })
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: No se pudo descargar el archivo`)
        }

        const downloadData = await res.json()
        
        // Convert base64 back to ArrayBuffer
        const binaryString = atob(downloadData.data)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const arrayBuffer = bytes.buffer

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

        if (!isMounted) return

        // Step 5: Initialize Handsontable
        
        // Final container check
        if (!containerRef.current) {
          throw new Error('Container element disappeared during initialization')
        }

        if (typeof window.Handsontable !== 'function') {
          throw new Error(`Handsontable is not a function: ${typeof window.Handsontable}`)
        }

        // Clear any previous content
        containerRef.current.innerHTML = ''

        // Create Handsontable instance
        hotRef.current = new window.Handsontable(containerRef.current, {
          data: data || [],
          rowHeaders: true,
          colHeaders: true,
          height: '100%',
          width: '100%',
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
          stretchH: 'none',
          preventOverflow: 'horizontal',
        })

        if (isMounted) {
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : String(err))
          setLoading(false)
        }
      }
    }

    // Trigger initialization immediately when component mounts
    initHandsontable()

    return () => {
      isMounted = false
      if (hotRef.current) {
        try {
          hotRef.current.destroy()
        } catch {
          // ignore cleanup errors
        }
      }
    }
  }, [projectId])

  const handleUndo = () => {
    if (hotRef.current && hotRef.current.undo) {
      hotRef.current.undo()
    }
  }

  const handleRedo = () => {
    if (hotRef.current && hotRef.current.redo) {
      hotRef.current.redo()
    }
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="bg-secondary border-b border-border p-2 flex items-center gap-1 flex-shrink-0">
        <button
          onClick={handleUndo}
          className="p-2 hover:bg-secondary-foreground/20 rounded transition-colors text-sm"
          title="Deshacer (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          onClick={handleRedo}
          className="p-2 hover:bg-secondary-foreground/20 rounded transition-colors text-sm"
          title="Rehacer (Ctrl+Y)"
        >
          ↷
        </button>
        <div className="w-px h-6 bg-border mx-1"></div>
        <span className="text-xs text-muted-foreground px-2">Edición en tiempo real • Ctrl+Z para deshacer • Ctrl+C/V para copiar/pegar</span>
      </div>

      {/* Main content area - relative positioning for loading overlay */}
      <div className="flex-1 overflow-hidden p-2 bg-background relative">
        {/* Container siempre en DOM y visible para que Handsontable pueda renderizar */}
        <div
          ref={containerRef}
          className="w-full h-full bg-white rounded border border-border overflow-hidden"
        />

        {loading && (
          <div className="absolute inset-2 flex items-center justify-center bg-white/90 rounded">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-sm text-muted-foreground">Cargando archivo editable...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-2 flex items-center justify-center bg-white/90 rounded">
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
      </div>
    </div>
  )
}
