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
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        // Load JS
        if (typeof window.Handsontable === 'undefined') {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/npm/handsontable@12.4.0/dist/handsontable.full.min.js'
            script.async = true
            script.onload = () => {
              setTimeout(resolve, 100)
            }
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
          throw new Error('No se pudo descargar el archivo')
        }

        const downloadData = await res.json()
        const binaryString = atob(downloadData.data)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        const arrayBuffer = bytes.buffer

        // Parse Excel
        const { read, utils } = await import('xlsx')
        const uint8Array = new Uint8Array(arrayBuffer)
        const workbook = read(uint8Array, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const data = utils.sheet_to_json(worksheet, { header: 1 }) as any[]

        if (!isMounted || !containerRef.current) return

        // Initialize Handsontable
        containerRef.current.innerHTML = ''
        
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
        })

        if (isMounted) {
          setLoading(false)
        }
      } catch (err) {
        console.error('Error:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error desconocido')
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
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive text-sm mb-2">Error: {error}</p>
        </div>
      </div>
    )
  }

  return <div ref={containerRef} className="w-full h-full" />
}
