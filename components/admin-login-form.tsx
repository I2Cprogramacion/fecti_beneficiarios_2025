// Formulario HTML nativo — el navegador maneja el redirect y guarda la cookie httpOnly correctamente
export function AdminLoginForm({ error }: { error?: string }) {
  return (
    <form action="/api/auth/login" method="POST" className="flex flex-col gap-5">
      <div>
        <label className="text-sm font-semibold text-foreground block mb-2">
          Correo electrónico
        </label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="w-full border border-input rounded-lg px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
          placeholder="admin@ejemplo.com"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-foreground block mb-2">
          Contraseña
        </label>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="w-full border border-input rounded-lg px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        className="bg-primary text-primary-foreground font-semibold px-4 py-3 rounded-lg hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
      >
        Iniciar sesión
      </button>
    </form>
  )
}
