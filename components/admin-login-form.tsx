// Formulario HTML nativo — el navegador maneja el redirect y guarda la cookie httpOnly correctamente
export function AdminLoginForm({ error }: { error?: string }) {
  return (
    <form action="/api/auth/login" method="POST" className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-medium text-foreground block mb-1">
          Correo electrónico
        </label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="w-full border border-input rounded px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="admin@ejemplo.com"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-foreground block mb-1">
          Contraseña
        </label>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="w-full border border-input rounded px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 rounded px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded hover:bg-primary/90 transition-colors"
      >
        Entrar
      </button>
    </form>
  )
}
