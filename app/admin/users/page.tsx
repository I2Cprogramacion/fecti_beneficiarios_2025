import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { CreateAdminForm } from '@/components/create-admin-form'
import { AdminsList } from '@/components/admins-list'

async function getAdminUsers() {
  try {
    const users = await sql`
      SELECT id, email, role, must_change_password, created_at
      FROM users
      WHERE role = 'admin'
      ORDER BY created_at DESC
    ` as { id: number; email: string; role: string; must_change_password: boolean; created_at: string }[]
    return users
  } catch {
    return []
  }
}

export default async function AdminUsersPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/admin')
  if (session.mustChangePassword) redirect('/admin/change-password')
  if (session.email !== 'daron.tarin@i2c.com.mx') redirect('/admin/dashboard')

  const admins = await getAdminUsers()

  const totalAdmins = admins.length
  const pendingPassword = admins.filter((a: { must_change_password: boolean }) => a.must_change_password).length
  const activeAdmins = totalAdmins - pendingPassword

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Header — mismo patrón que dashboard y métricas */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-xs font-bold text-white">F</div>
            <div>
              <p className="text-sm font-semibold leading-tight">FECTI – Administradores</p>
              <p className="text-xs opacity-70 hidden sm:block">{session.email}</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href="/admin/dashboard"
              className="text-xs font-medium opacity-90 hover:opacity-100 transition-opacity"
            >
              ← Panel principal
            </a>
            <a
              href="/admin/metrics"
              className="text-xs font-medium opacity-90 hover:opacity-100 transition-opacity"
            >
              Métricas
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-primary text-primary-foreground rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold">{totalAdmins}</p>
            <p className="text-xs mt-0.5 opacity-75">Administradores</p>
          </div>
          <div className="bg-accent text-white rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold">{activeAdmins}</p>
            <p className="text-xs mt-0.5 opacity-75">Activos</p>
          </div>
          <div className="bg-secondary text-foreground rounded-lg p-4 shadow-sm">
            <p className="text-2xl font-bold">{pendingPassword}</p>
            <p className="text-xs mt-0.5 opacity-75">Cambio de contraseña pendiente</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Crear nuevo admin — 1 col */}
          <div>
            <CreateAdminForm />
          </div>

          {/* Lista de admins — 2 cols */}
          <div className="lg:col-span-2">
            <AdminsList admins={admins} currentUserEmail={session.email} />
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        FECTI &copy; 2025 &mdash; Panel de administración
      </footer>
    </div>
  )
}
