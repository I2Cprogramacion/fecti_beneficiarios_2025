'use client'

import { useEffect, useRef, useState } from 'react'

interface LuckysheetViewerProps {
  projectId: number
}

declare global {
  interface Window {
    luckysheet: any
  }
}

export function LuckysheetViewer({ projectId }: LuckysheetViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initLuckysheet = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load Luckysheet CSS if not already loaded
        if (!document.getElementById('luckysheet-css')) {
          const link = document.createElement('link')
          link.id = 'luckysheet-css'
          link.rel = 'stylesheet'
          link.href = 'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/luckysheet.css'
          document.head.appendChild(link)
        }

        // Load Luckysheet JS if not already loaded
        if (typeof window.luckysheet === 'undefined') {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/luckysheet.umd.js'
          script.async = true
          script.onload = async () => {
            await loadExcelData()
          }
          document.body.appendChild(script)
        } else {
          await loadExcelData()
        }

        async function loadExcelData() {
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

          // Convert workbook to Luckysheet format
          const luckysheetData: any[] = []
          
          workbook.SheetNames.forEach((sheetName, index) => {
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = utils.sheet_to_json(worksheet, { header: 1 })
            
            // Convert to Luckysheet cell format
            const cells: Record<string, any> = {}
            ;(jsonData as any[]).forEach((row: any, rowIndex: number) => {
              if (Array.isArray(row)) {
                row.forEach((cell: any, colIndex: number) => {
                  if (cell !== undefined && cell !== null && cell !== '') {
                    const colLetter = String.fromCharCode(65 + (colIndex % 26))
                    const cellAddress = `${colLetter}${rowIndex + 1}`
                    cells[cellAddress] = {
                      v: cell,
                      m: String(cell)
                    }
                  }
                })
              }
            })

            luckysheetData.push({
              name: sheetName,
              index: index,
              status: 1,
              order: index,
              hide: 0,
              data: cells,
              config: {
                merge: {},
                rowlen: {},
                colWidth: {}
              },
              scrollLeft: 0,
              scrollTop: 0,
              selectItem: []
            })
          })

          // Initialize Luckysheet
          if (containerRef.current && window.luckysheet) {
            containerRef.current.innerHTML = ''
            
            window.luckysheet.create({
              container: containerRef.current,
              title: 'Sheet Preview',
              data: luckysheetData,
              plugins: []
            })
          }

          setLoading(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setLoading(false)
      }
    }

    initLuckysheet()
  }, [projectId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">Cargando archivo...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-destructive">Error: {error}</div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-white"
      style={{ minHeight: '500px' }}
    />
  )
}
