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

  const handleCut = () => {
    document.execCommand('cut')
  }

  const handleCopy = () => {
    document.execCommand('copy')
  }

  const handlePaste = () => {
    document.execCommand('paste')
  }

  const handleClear = () => {
    if (hotRef.current) {
      const selected = hotRef.current.getSelected()
      if (selected) {
        hotRef.current.setDataAtCell(selected[0][0], selected[0][1], '')
      }
    }
  }

  useEffect(() => {
    let isMounted = true

    const initHandsontable = async () => {
      try {
        console.log('1. Starting initialization for projectId:', projectId)
        
        if (!isMounted) return
        
        setLoading(true)
        setError(null)

        // Load CSS
        console.log('2. Loading CSS...')
        if (!document.getElementById('handsontable-css')) {
          const link = document.createElement('link')
          link.id = 'handsontable-css'
          link.rel = 'stylesheet'
          link.href = 'https://cdn.jsdelivr.net/npm/handsontable@12.4.0/dist/handsontable.full.min.css'
          document.head.appendChild(link)
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        console.log('3. CSS loaded')

        // Load JS
        console.log('4. Checking if Handsontable is loaded:', typeof window.Handsontable)
        if (typeof window.Handsontable === 'undefined') {
          console.log('5. Loading Handsontable script...')
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/npm/handsontable@12.4.0/dist/handsontable.full.min.js'
            script.async = true
            
            script.onload = () => {
              console.log('6. Script loaded, waiting for library to be available')
              setTimeout(() => {
                console.log('7. Handsontable available:', typeof window.Handsontable)
                resolve()
              }, 200)
            }
            script.onerror = () => {
              console.error('Script load error')
              reject(new Error('Failed to load Handsontable'))
            }
            document.body.appendChild(script)
          })
        } else {
          console.log('8. Handsontable already loaded')
        }

        if (!isMounted) return

        // Fetch Excel
        console.log('9. Fetching Excel file...')
        const res = await fetch(`/api/admin/download-blob?projectId=${projectId}`, {
          credentials: 'include',
        })
        console.log('10. Response status:', res.status)
        
        if (!res.ok) {
          const errorText = await res.text()
          console.error('API error:', errorText)
          throw new Error(`HTTP ${res.status}: ${errorText}`)
        }

        const downloadData = await res.json()
        console.log('11. Download data received, size:', downloadData.data ? downloadData.data.length : 0)
        
        const binaryString = atob(downloadData.data)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const arrayBuffer = bytes.buffer
        console.log('12. ArrayBuffer created, size:', arrayBuffer.byteLength)

        // Parse Excel
        console.log('13. Importing XLSX...')
        const { read, utils } = await import('xlsx')
        const uint8Array = new Uint8Array(arrayBuffer)
        const workbook = read(uint8Array, { type: 'array' })
        console.log('14. Workbook parsed, sheets:', workbook.SheetNames)
        
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const data = utils.sheet_to_json(worksheet, { header: 1 }) as any[]
        console.log('15. Excel data parsed, rows:', data.length)

        if (!isMounted) {
          console.log('Component unmounted, aborting')
          return
        }

        if (!containerRef.current) {
          console.error('Container ref is null!')
          throw new Error('Container reference not found')
        }

        console.log('16. Container found, initializing Handsontable...')
        console.log('17. Container dimensions:', {
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
        
        containerRef.current.innerHTML = ''
        
        if (typeof window.Handsontable !== 'function') {
          console.error('Handsontable is not a function:', typeof window.Handsontable)
          throw new Error('Handsontable initialization failed')
        }

        console.log('18. Creating Handsontable instance...')
        hotRef.current = new window.Handsontable(containerRef.current, {
          data: data || [],
          rowHeaders: true,
          colHeaders: true,
          height: '100%',
          width: '100%',
          minRows: 10,
          minCols: 10,
          contextMenu: true,
          copyPaste: true,
          licenseKey: 'non-commercial-and-evaluation',
          autoColumnSize: {
            samplingRatio: 23,
          },
        })
        console.log('19. Handsontable instance created successfully')
        
        // Force resize and recalculation
        setTimeout(() => {
          console.log('20. Forcing resize...')
          if (hotRef.current) {
            hotRef.current.updateSettings({})
          }
        }, 100)

        if (isMounted) {
          setLoading(false)
          console.log('21. Loading complete')
        }
      } catch (err) {
        console.error('Error during init:', err)
        if (isMounted) {
          const errorMsg = err instanceof Error ? err.message : String(err)
          setError(errorMsg)
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

  if (loading) {
    return (
      <>
        <div ref={containerRef} className="w-full h-full hidden" />
        <div className="w-full h-full flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <div ref={containerRef} className="w-full h-full hidden" />
        <div className="w-full h-full flex items-center justify-center bg-background">
          <div className="text-center">
            <p className="text-destructive text-sm mb-2">Error: {error}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-secondary border-b border-border p-2 flex items-center gap-0.5 flex-shrink-0 overflow-x-auto">
        {/* Undo/Redo */}
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
        
        <div className="w-px h-6 bg-border mx-0.5"></div>

        {/* Cut/Copy/Paste */}
        <button
          onClick={handleCut}
          className="p-2 hover:bg-secondary-foreground/20 rounded transition-colors text-sm"
          title="Cortar (Ctrl+X)"
        >
          ✂
        </button>
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-secondary-foreground/20 rounded transition-colors text-sm"
          title="Copiar (Ctrl+C)"
        >
          📋
        </button>
        <button
          onClick={handlePaste}
          className="p-2 hover:bg-secondary-foreground/20 rounded transition-colors text-sm"
          title="Pegar (Ctrl+V)"
        >
          📌
        </button>

        <div className="w-px h-6 bg-border mx-0.5"></div>

        {/* Clear */}
        <button
          onClick={handleClear}
          className="p-2 hover:bg-secondary-foreground/20 rounded transition-colors text-sm"
          title="Borrar contenido"
        >
          ⌫
        </button>

        <div className="w-px h-6 bg-border mx-0.5"></div>

        {/* Info */}
        <span className="text-xs text-muted-foreground px-2 whitespace-nowrap">Edición en tiempo real • Ctrl+Z/Y • Ctrl+X/C/V</span>
      </div>

      {/* Excel Container */}
      <div ref={containerRef} className="flex-1 w-full block overflow-hidden" style={{ position: 'relative' }} />
    </div>
  )
}
