import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { ChangePasswordForm } from '@/components/change-password-form'

export default async function ChangePasswordPage() {
  const session = await getSession()

  if (!session || session.role !== 'admin') redirect('/admin')
  if (!session.mustChangePassword) redirect('/admin/dashboard')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 font-sans px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-4 shadow-lg">
            F
          </div>
          <h1 className="text-2xl font-bold text-foreground">Cambio de contraseña</h1>
          <p className="text-sm text-muted-foreground mt-2 text-balance">
            Por seguridad, debes establecer una nueva contraseña antes de continuar.
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}
