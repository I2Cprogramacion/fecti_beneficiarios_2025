import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { AdminLoginForm } from '@/components/admin-login-form'

export default async function AdminPage() {
  const session = await getSession()

  // Si está autenticado como admin, ir a dashboard o change-password
  if (session?.role === 'admin') {
    if (session.mustChangePassword) {
      return redirect('/admin/change-password')
    }
    return redirect('/admin/dashboard')
  }

  // Mostrar formulario de login
  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-sans px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xl font-bold mx-auto mb-3">
            F
          </div>
          <h1 className="text-xl font-bold text-foreground">Administrador FECTI</h1>
          <p className="text-sm text-muted-foreground mt-1">Acceso restringido</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  )
}
