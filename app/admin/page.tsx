import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { AdminLoginForm } from '@/components/admin-login-form'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await getSession()
  const params = await searchParams

  if (session?.role === 'admin') {
    if (session.mustChangePassword) return redirect('/admin/change-password')
    return redirect('/admin/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 font-sans px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-4 shadow-lg">
            F
          </div>
          <h1 className="text-2xl font-bold text-foreground">Administrador FECTI</h1>
          <p className="text-sm text-muted-foreground mt-2">Panel de gestión y seguimiento</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          <AdminLoginForm error={params.error} />
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Fondo Estatal de Ciencia, Tecnología e Innovación
        </p>
      </div>
    </div>
  )
}
