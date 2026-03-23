import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { redirect } from 'next/navigation'
import ProjectView from '@/components/project-view'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: Props) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  const projectRows = await sql`
    SELECT * FROM projects WHERE id = ${parseInt(id)}
  `

  if (!projectRows.length) {
    redirect('/dashboard')
  }

  const project = projectRows[0]

  // Check access: admin or beneficiary of this project
  if (
    session.role !== 'admin' &&
    (session.projectId === null || session.projectId !== project.id)
  ) {
    redirect('/dashboard')
  }

  return <ProjectView session={session} project={project} />
}
