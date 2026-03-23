import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { ChangePasswordForm } from '@/components/change-password-form'

export default async function ChangePasswordPage() {
  const session = await getSession()
  
  console.log('[v0] Change-password page - session:', session)

  if (!session || session.role !== 'admin') {
    console.log('[v0] Redirecting - no session or not admin')
    redirect('/admin')
  }
  if (!session.mustChangePassword) {
    console.log('[v0] Redirecting to dashboard - mustChangePassword=false')
    redirect('/admin/dashboard')
  }

  console.log('[v0] Showing change-password form')

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-sans px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xl font-bold mx-auto mb-3">
            F
          </div>
          <h1 className="text-xl font-bold text-foreground">Cambio de contraseña</h1>
          <p className="text-sm text-muted-foreground mt-1 text-balance">
            Por seguridad, debes establecer una nueva contraseña antes de continuar.
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  )
}
