'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Admin {
  id: number
  email: string
  must_change_password: boolean
  created_at: string
}

interface AdminsListProps {
  admins: Admin[]
  currentUserEmail: string
}

export function AdminsList({ admins, currentUserEmail }: AdminsListProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [deleteModal, setDeleteModal] = useState<Admin | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleDeleteAdmin() {
    if (!deleteModal) return
    setDeleteLoading(true)
    const res = await fetch(`/api/admin/create-admin?id=${deleteModal.id}`, {
      method: 'DELETE',
    })
    setDeleteLoading(false)
    if (!res.ok) {
      const data = await res.json()
      alert(data.error || 'Error al eliminar administrador')
      return
    }
    setDeleteModal(null)
    startTransition(() => router.refresh())
  }

  if (admins.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-sm py-12 text-center text-sm text-muted-foreground">
        No hay administradores registrados.
      </div>
    )
  }

  return (
    <>
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground">Administradores Registrados</h2>
          <p className="text-xs text-muted-foreground">{admins.length} usuario{admins.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Correo</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Creado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin, i) => (
                <tr key={admin.id} className={`border-b border-border last:border-0 ${i % 2 !== 0 ? 'bg-secondary/30' : ''}`}>
                  <td className="px-4 py-3 text-xs">
                    <span className="font-medium text-foreground">{admin.email}</span>
                    {admin.email === currentUserEmail && (
                      <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Tú</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    {admin.must_change_password ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Pendiente</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Activo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                    {new Date(admin.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {admin.email !== currentUserEmail ? (
                      <button
                        onClick={() => setDeleteModal(admin)}
                        className="text-xs text-red-600 hover:underline"
                        title="Eliminar administrador"
                      >
                        Eliminar
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="text-sm font-semibold text-foreground mb-1">Eliminar administrador</h3>
            <p className="text-xs text-muted-foreground mb-4">
              ¿Estás seguro de que deseas eliminar este administrador?
            </p>
            <p className="text-xs text-pretty mb-4">
              <span className="font-mono text-accent">{deleteModal.email}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 border border-border text-foreground text-sm py-2 rounded hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAdmin}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 text-white text-sm py-2 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
