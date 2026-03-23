'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ResultPage {
  title: string
  subtitle: string
  url: string
}

const pages: ResultPage[] = [
  {
    title: 'Página 1 de 3',
    subtitle: 'Proyectos 1-19',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BEN1-RCPpynEqeP0d5ylhnKdetBvOVlofQT.png',
  },
  {
    title: 'Página 2 de 3',
    subtitle: 'Proyectos 20-48',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BEN2-FnHG0KIL6ermJAUyhnKv8lDk0wyUFC.png',
  },
  {
    title: 'Página 3 de 3',
    subtitle: 'Proyectos 50-62 + Firma',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BEN3-bDzWHBXbc0yeIiXUfQkAqCxoaZC1ga.png',
  },
]

export function ResultsGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  return (
    <>
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-foreground mb-1">Publicación de Resultados</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Documento oficial con la lista completa de proyectos beneficiarios FECTI 2025. Haz clic para ampliar.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pages.map((page, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className="border border-border rounded-lg overflow-hidden bg-card hover:shadow-lg transition-shadow cursor-pointer group flex flex-col"
            >
              <div className="relative w-full flex-1 bg-muted overflow-hidden">
                <img
                  src={page.url}
                  alt={page.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-foreground">{page.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{page.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal/Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-foreground/5 px-4 py-3 border-b border-foreground/10">
              <div>
                <p className="text-sm font-semibold text-foreground">{pages[selectedIndex].title}</p>
                <p className="text-xs text-muted-foreground">{pages[selectedIndex].subtitle}</p>
              </div>
              <button
                onClick={() => setSelectedIndex(null)}
                className="text-muted-foreground hover:text-foreground transition-colors text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Image */}
            <div className="flex-1 overflow-auto flex items-center justify-center bg-black/20 p-4">
              <img
                src={pages[selectedIndex].url}
                alt={pages[selectedIndex].title}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between bg-foreground/5 px-4 py-3 border-t border-foreground/10">
              <button
                onClick={() => setSelectedIndex((selectedIndex - 1 + pages.length) % pages.length)}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                ← Anterior
              </button>
              <span className="text-xs text-muted-foreground">
                {selectedIndex + 1} de {pages.length}
              </span>
              <button
                onClick={() => setSelectedIndex((selectedIndex + 1) % pages.length)}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
