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

// Proyectos sin actividad: usuario asignado hace >7 días sin subir archivo
async function getInactiveProjects() {
  return sql`
    SELECT
      p.clave,
      p.titulo,
      p.componente,
      p.monto,
      u.email AS assigned_email,
      u.created_at AS user_created_at,
      EXTRACT(DAY FROM NOW() - u.created_at)::int AS days_since_assigned
    FROM projects p
    JOIN users u ON u.project_id = p.id AND u.role = 'beneficiary'
    LEFT JOIN submissions s ON s.project_id = p.id
    WHERE s.id IS NULL
    ORDER BY u.created_at ASC
  `
}

// Entregas acumuladas por día
async function getDailySubmissions() {
  return sql`
    SELECT
      TO_CHAR(s.uploaded_at, 'YYYY-MM-DD') AS date,
      COUNT(*)::int AS count
    FROM submissions s
    GROUP BY TO_CHAR(s.uploaded_at, 'YYYY-MM-DD')
    ORDER BY date ASC
  `
}

// Tiempo promedio de respuesta (días entre asignación de usuario y entrega)
async function getResponseTimeMetrics() {
  const rows = await sql`
    SELECT
      ROUND(AVG(EXTRACT(EPOCH FROM (s.uploaded_at - u.created_at)) / 86400), 1) AS avg_days,
      ROUND(MIN(EXTRACT(EPOCH FROM (s.uploaded_at - u.created_at)) / 86400), 1) AS min_days,
      ROUND(MAX(EXTRACT(EPOCH FROM (s.uploaded_at - u.created_at)) / 86400), 1) AS max_days,
      COUNT(*)::int AS total_with_both
    FROM submissions s
    JOIN users u ON u.project_id = s.project_id AND u.role = 'beneficiary'
  `
  return rows[0] || { avg_days: 0, min_days: 0, max_days: 0, total_with_both: 0 }
}

// Distribución por rango de monto
async function getAmountDistribution() {
  return sql`
    SELECT
      CASE
        WHEN p.monto <= 500000 THEN '$0 - $500K'
        WHEN p.monto <= 1000000 THEN '$500K - $1M'
        WHEN p.monto <= 1500000 THEN '$1M - $1.5M'
        ELSE '$1.5M - $2.5M'
      END AS rango,
      CASE
        WHEN p.monto <= 500000 THEN 1
        WHEN p.monto <= 1000000 THEN 2
        WHEN p.monto <= 1500000 THEN 3
        ELSE 4
      END AS sort_order,
      COUNT(*)::int AS total,
      COUNT(s.id)::int AS submitted,
      SUM(p.monto)::numeric AS monto_total
    FROM projects p
    LEFT JOIN submissions s ON s.project_id = p.id
    GROUP BY rango, sort_order
    ORDER BY sort_order
  `
}

export default async function AdminMetricsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/admin')
  if (session.mustChangePassword) redirect('/admin/change-password')

  const [
    componentMetrics,
    userAssignment,
    recentActivity,
    financial,
    inactiveProjects,
    dailySubmissions,
    responseTime,
    amountDistribution,
  ] = await Promise.all([
    getComponentMetrics(),
    getUserAssignmentMetrics(),
    getRecentActivity(),
    getFinancialSummary(),
    getInactiveProjects(),
    getDailySubmissions(),
    getResponseTimeMetrics(),
    getAmountDistribution(),
  ])

  return (
    <AdminMetrics
      componentMetrics={componentMetrics}
      userAssignment={userAssignment[0]}
      recentActivity={recentActivity}
      financial={financial}
      inactiveProjects={inactiveProjects}
      dailySubmissions={dailySubmissions}
      responseTime={responseTime}
      amountDistribution={amountDistribution}
      adminEmail={session.email}
    />
  )
}
