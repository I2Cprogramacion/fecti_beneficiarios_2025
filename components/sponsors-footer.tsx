export function SponsorsFooter() {
  return (
    <div className="border-t border-border py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-8 text-center">
          Instituciones Participantes
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 flex-wrap">
          {/* Gobierno del Estado + Instituto */}
          <a
            href="#"
            className="flex items-center opacity-70 hover:opacity-100 transition-opacity"
            title="Gobierno del Estado de Chihuahua - Instituto de Innovación y Competitividad"
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-efgcxvA6Tzn2AXBkPMtgRkIJ3MhDfE.png"
              alt="Gobierno del Estado de Chihuahua"
              className="h-16 object-contain"
            />
          </a>

          {/* Cuenta Conmigo */}
          <a
            href="#"
            className="flex items-center opacity-70 hover:opacity-100 transition-opacity"
            title="Programa Cuenta Conmigo"
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-KFQuEdIzwHKvQWX6n6RiORoriw3CHH.png"
              alt="Cuenta Conmigo"
              className="h-16 object-contain"
            />
          </a>
        </div>
      </div>
    </div>
  )
}
