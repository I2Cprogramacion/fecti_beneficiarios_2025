'use client'

export function CloseButton() {
  const handleClose = () => {
    // Intenta cerrar la ventana
    if (window.opener) {
      // Si fue abierta desde otra ventana, la cierra
      window.close()
    } else {
      // Si es una ventana independiente, intenta cerrarla de todas formas
      window.close()
    }
  }

  return (
    <button
      onClick={handleClose}
      className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors"
      title="Cerrar ventana"
    >
      Volver
    </button>
  )
}
