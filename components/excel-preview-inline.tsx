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
    let isMounted = true

    const initHandsontable = async () => {
      try {
        if (!isMounted) return
        setLoading(true)
        setError(null)

        // Load CSS
        if (!document.getElementById('handsontable-css')) {
          const link = document.createElement('link')
          link.id = 'handsontable-css'
          link.rel = 'stylesheet'
          link.href = 'https://cdn.jsdelivr.net/npm/handsontable@12.4.0/dist/handsontable.full.min.css'
          document.head.appendChild(link)
          await new Promise(resolve => setTimeout(resolve, 200))
        }

        // Load JS
        if (typeof window.Handsontable === 'undefined') {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/npm/handsontable@12.4.0/dist/handsontable.full.min.js'
            script.async = true
            script.onload = () => setTimeout(resolve, 200)
            script.onerror = () => reject(new Error('Failed to load Handsontable'))
            document.body.appendChild(script)
          })
        }

        if (!isMounted) return

        // Fetch Excel
        const res = await fetch(`/api/admin/download-blob?projectId=${projectId}`, {
          credentials: 'include',
        })
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`HTTP ${res.status}: ${errorText}`)
        }

        const downloadData = await res.json()
        const binaryString = atob(downloadData.data)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }

        // Parse Excel
        const { read, utils } = await import('xlsx')
        const workbook = read(new Uint8Array(bytes.buffer), { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const data = utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

        if (!isMounted || !containerRef.current) return

        containerRef.current.innerHTML = ''

        if (typeof window.Handsontable !== 'function') {
          throw new Error('Handsontable not available')
        }

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
          autoColumnSize: { samplingRatio: 23 },
        })

        // Force resize after overlay is removed
        setTimeout(() => {
          if (hotRef.current) {
            hotRef.current.render()
            hotRef.current.updateSettings({})
          }
        }, 150)

        if (isMounted) setLoading(false)
      } catch (err) {
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
        try { hotRef.current.destroy() } catch (_) {}
      }
    }
  }, [projectId])

  return (
    <div className="w-full h-full" style={{ position: 'relative' }}>
      {/* Container siempre montado, Handsontable se monta aquí */}
      <div ref={containerRef} className="w-full h-full overflow-hidden" />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="text-center">
            <p className="text-destructive text-sm mb-2">Error: {error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
