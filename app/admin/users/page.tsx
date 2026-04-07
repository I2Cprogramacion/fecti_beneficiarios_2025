import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { CreateAdminForm } from '@/components/create-admin-form'
import { AdminsList } from '@/components/admins-list'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function getAdminUsers() {
  try {
    const users = await sql`
      SELECT id, email, role, must_change_password, created_at
      FROM users
      WHERE role = 'admin'
      ORDER BY created_at DESC
    `
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Administradores</h1>
            <p className="text-muted-foreground mt-1">Gestiona los usuarios administradores</p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline">Volver al dashboard</Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Crear nuevo admin */}
          <div>
            <CreateAdminForm />
          </div>

          {/* Lista de admins */}
          <div>
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Administradores registrados
              </h2>
              <AdminsList admins={admins} currentUserEmail={session.email} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
