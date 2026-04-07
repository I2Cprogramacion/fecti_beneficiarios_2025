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
    return <p className="text-muted-foreground text-sm">No hay administradores registrados</p>
  }

  return (
    <>
      <div className="space-y-3">
        {admins.map((admin) => (
          <div
            key={admin.id}
            className="p-3 bg-muted rounded-lg border border-border flex items-start justify-between"
          >
            <div className="flex-1">
              <p className="font-medium text-foreground">{admin.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Creado: {new Date(admin.created_at).toLocaleDateString('es-MX')}
              </p>
              {admin.must_change_password && (
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠️ Debe cambiar contraseña
                </p>
              )}
            </div>
            {admin.email !== currentUserEmail && (
              <button
                onClick={() => setDeleteModal(admin)}
                className="ml-3 text-xs text-red-600 hover:underline whitespace-nowrap"
                title="Eliminar administrador"
              >
                Eliminar
              </button>
            )}
          </div>
        ))}
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
