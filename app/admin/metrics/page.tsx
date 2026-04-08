import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { AdminMetrics } from '@/components/admin-metrics'

// Avance por componente
async function getComponentMetrics() {
  return sql`
    SELECT
      p.componente,
      COUNT(*)::int AS total,
      COUNT(s.id)::int AS submitted,
      (COUNT(*) - COUNT(s.id))::int AS pending,
      ROUND(COUNT(s.id)::numeric / COUNT(*)::numeric * 100, 1) AS progress,
      SUM(p.monto)::numeric AS monto_total,
      SUM(CASE WHEN s.id IS NOT NULL THEN p.monto ELSE 0 END)::numeric AS monto_entregado
    FROM projects p
    LEFT JOIN submissions s ON s.project_id = p.id
    GROUP BY p.componente
    ORDER BY p.componente
  `
}

// Estado de asignación de usuarios
async function getUserAssignmentMetrics() {
  return sql`
    SELECT
      COUNT(*)::int AS total_projects,
      COUNT(u.id)::int AS assigned,
      (COUNT(*) - COUNT(u.id))::int AS unassigned,
      COUNT(CASE WHEN u.must_change_password = TRUE THEN 1 END)::int AS pending_password_change
    FROM projects p
    LEFT JOIN users u ON u.project_id = p.id AND u.role = 'beneficiary'
  `
}

// Actividad reciente (últimos 15 envíos)
async function getRecentActivity() {
  return sql`
    SELECT
      s.uploaded_at,
      s.file_name,
      p.clave,
      p.titulo,
      p.componente
    FROM submissions s
    JOIN projects p ON p.id = s.project_id
    ORDER BY s.uploaded_at DESC
    LIMIT 15
  `
}

// Resumen financiero global
async function getFinancialSummary() {
  const rows = await sql`
    SELECT
      SUM(p.monto)::numeric AS monto_total_aprobado,
      SUM(CASE WHEN s.id IS NOT NULL THEN p.monto ELSE 0 END)::numeric AS monto_con_entrega,
      SUM(CASE WHEN s.id IS NULL THEN p.monto ELSE 0 END)::numeric AS monto_pendiente,
      COUNT(*)::int AS total_projects,
      COUNT(s.id)::int AS total_submitted
    FROM projects p
    LEFT JOIN submissions s ON s.project_id = p.id
  `
  return rows[0]
}

export default async function AdminMetricsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/admin')
  if (session.mustChangePassword) redirect('/admin/change-password')

  const [componentMetrics, userAssignment, recentActivity, financial] = await Promise.all([
    getComponentMetrics(),
    getUserAssignmentMetrics(),
    getRecentActivity(),
    getFinancialSummary(),
  ])

  return (
    <AdminMetrics
      componentMetrics={componentMetrics}
      userAssignment={userAssignment[0]}
      recentActivity={recentActivity}
      financial={financial}
      adminEmail={session.email}
    />
  )
}
