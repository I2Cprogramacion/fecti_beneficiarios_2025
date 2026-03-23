import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { AdminDashboard } from '@/components/admin-dashboard'

async function getAllProjects() {
  return sql`
    SELECT
      p.id,
      p.num,
      p.clave,
      p.componente,
      p.titulo,
      p.monto,
      u.email AS assigned_email,
      s.file_name,
      s.uploaded_at,
      CASE WHEN s.id IS NOT NULL THEN TRUE ELSE FALSE END AS submitted
    FROM projects p
    LEFT JOIN users u ON u.project_id = p.id AND u.role = 'beneficiary'
    LEFT JOIN submissions s ON s.project_id = p.id
    ORDER BY p.num ASC
  `
}

async function getTemplateInfo() {
  const rows = await sql`SELECT value FROM settings WHERE key = 'template_pathname'`
  return rows.length ? rows[0].value : null
}

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/admin')
  if (session.mustChangePassword) redirect('/admin/change-password')

  const [projects, templatePathname] = await Promise.all([
    getAllProjects(),
    getTemplateInfo(),
  ])

  const totalSubmitted = projects.filter((p) => p.submitted).length

  return (
    <AdminDashboard
      projects={projects}
      templatePathname={templatePathname}
      totalSubmitted={totalSubmitted}
      adminEmail={session.email}
    />
  )
}
