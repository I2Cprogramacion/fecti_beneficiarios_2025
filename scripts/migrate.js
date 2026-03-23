import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

const sql = neon(process.env.DATABASE_URL)

async function migrate() {
  console.log('Running migration...')

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      clave VARCHAR(50) NOT NULL UNIQUE,
      titulo TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      project_id INTEGER REFERENCES projects(id),
      role VARCHAR(20) NOT NULL DEFAULT 'beneficiary',
      must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id) UNIQUE,
      file_pathname TEXT NOT NULL,
      file_name TEXT NOT NULL,
      uploaded_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(100) PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `

  console.log('Tables created.')

  // Seed 62 projects
  const projects = [
    ['FECTI-2024-001', 'Desarrollo de sistemas de energía renovable para comunidades rurales'],
    ['FECTI-2024-002', 'Innovación en procesos de purificación de agua potable'],
    ['FECTI-2024-003', 'Plataforma digital para la gestión de residuos sólidos urbanos'],
    ['FECTI-2024-004', 'Sistema de monitoreo ambiental mediante sensores IoT'],
    ['FECTI-2024-005', 'Desarrollo de biomateriales biodegradables para industria alimentaria'],
    ['FECTI-2024-006', 'Aplicación de inteligencia artificial en diagnóstico médico temprano'],
    ['FECTI-2024-007', 'Tecnología para la producción eficiente de biogás a partir de residuos orgánicos'],
    ['FECTI-2024-008', 'Sistema de agricultura de precisión con drones y sensores remotos'],
    ['FECTI-2024-009', 'Plataforma de telemedicina para zonas de difícil acceso'],
    ['FECTI-2024-010', 'Desarrollo de materiales compuestos ligeros para industria automotriz'],
    ['FECTI-2024-011', 'Innovación en técnicas de conservación y procesamiento de alimentos'],
    ['FECTI-2024-012', 'Sistema de gestión inteligente de redes eléctricas (Smart Grid)'],
    ['FECTI-2024-013', 'Desarrollo de vacunas recombinantes para enfermedades tropicales'],
    ['FECTI-2024-014', 'Plataforma de ciberseguridad para pequeñas y medianas empresas'],
    ['FECTI-2024-015', 'Tecnología de captura y almacenamiento de carbono'],
    ['FECTI-2024-016', 'Sistema de predicción meteorológica de alta resolución'],
    ['FECTI-2024-017', 'Desarrollo de catalizadores para reducción de emisiones industriales'],
    ['FECTI-2024-018', 'Plataforma de aprendizaje adaptativo para educación básica'],
    ['FECTI-2024-019', 'Investigación en materiales semiconductores de nueva generación'],
    ['FECTI-2024-020', 'Sistema de robótica colaborativa para manufactura avanzada'],
    ['FECTI-2024-021', 'Desarrollo de biosensores para detección de contaminantes en agua'],
    ['FECTI-2024-022', 'Tecnología de impresión 3D para prótesis médicas personalizadas'],
    ['FECTI-2024-023', 'Sistema de logística inteligente con optimización por IA'],
    ['FECTI-2024-024', 'Plataforma de análisis genómico para medicina personalizada'],
    ['FECTI-2024-025', 'Desarrollo de recubrimientos anticorrosivos de alta durabilidad'],
    ['FECTI-2024-026', 'Sistema de gestión de residuos peligrosos en hospitales'],
    ['FECTI-2024-027', 'Innovación en técnicas de biorremediación de suelos contaminados'],
    ['FECTI-2024-028', 'Plataforma de monitoreo sísmico en tiempo real'],
    ['FECTI-2024-029', 'Desarrollo de nanomateriales para aplicaciones biomédicas'],
    ['FECTI-2024-030', 'Sistema de gestión eficiente del agua en sectores agrícolas'],
    ['FECTI-2024-031', 'Tecnología de almacenamiento de energía con baterías de nueva generación'],
    ['FECTI-2024-032', 'Plataforma de análisis de datos para detección de fraudes financieros'],
    ['FECTI-2024-033', 'Desarrollo de fármacos antivirales de amplio espectro'],
    ['FECTI-2024-034', 'Sistema de vigilancia epidemiológica basado en big data'],
    ['FECTI-2024-035', 'Tecnología de producción de hidrógeno verde mediante electrólisis'],
    ['FECTI-2024-036', 'Plataforma de simulación para pruebas de materiales estructurales'],
    ['FECTI-2024-037', 'Desarrollo de algoritmos de visión computacional para control de calidad'],
    ['FECTI-2024-038', 'Sistema de reciclaje automatizado con clasificación por IA'],
    ['FECTI-2024-039', 'Innovación en técnicas de fermentación para producción de bioetanol'],
    ['FECTI-2024-040', 'Plataforma de gestión y análisis de datos geoespaciales'],
    ['FECTI-2024-041', 'Desarrollo de terapias celulares para enfermedades autoinmunes'],
    ['FECTI-2024-042', 'Sistema de detección temprana de incendios forestales'],
    ['FECTI-2024-043', 'Tecnología de fabricación aditiva para componentes aeroespaciales'],
    ['FECTI-2024-044', 'Plataforma de realidad aumentada para capacitación industrial'],
    ['FECTI-2024-045', 'Desarrollo de membranas selectivas para desalación de agua de mar'],
    ['FECTI-2024-046', 'Sistema de automatización agrícola para invernaderos inteligentes'],
    ['FECTI-2024-047', 'Investigación en superconductores de alta temperatura'],
    ['FECTI-2024-048', 'Plataforma de comercio electrónico para productores rurales'],
    ['FECTI-2024-049', 'Desarrollo de sistemas de propulsión eléctrica para transporte urbano'],
    ['FECTI-2024-050', 'Sistema de control y reducción de pérdidas en redes de distribución eléctrica'],
    ['FECTI-2024-051', 'Tecnología de producción de proteínas alternativas para alimentación'],
    ['FECTI-2024-052', 'Plataforma de gestión integral de proyectos de construcción sostenible'],
    ['FECTI-2024-053', 'Desarrollo de pigmentos naturales para industria textil'],
    ['FECTI-2024-054', 'Sistema de análisis predictivo para mantenimiento industrial'],
    ['FECTI-2024-055', 'Innovación en técnicas de extracción de minerales con bajo impacto ambiental'],
    ['FECTI-2024-056', 'Plataforma de salud digital para gestión de enfermedades crónicas'],
    ['FECTI-2024-057', 'Desarrollo de lubricantes biodegradables de alto rendimiento'],
    ['FECTI-2024-058', 'Sistema de transporte inteligente para ciudades intermedias'],
    ['FECTI-2024-059', 'Tecnología de valorización de residuos de la industria agroalimentaria'],
    ['FECTI-2024-060', 'Plataforma de gestión de identidad digital segura'],
    ['FECTI-2024-061', 'Desarrollo de sistemas embebidos para automatización de procesos productivos'],
    ['FECTI-2024-062', 'Innovación en técnicas de rehabilitación energética de edificios existentes'],
  ]

  for (const [clave, titulo] of projects) {
    await sql`
      INSERT INTO projects (clave, titulo)
      VALUES (${clave}, ${titulo})
      ON CONFLICT (clave) DO NOTHING
    `
  }
  console.log('62 projects seeded.')

  // Seed admin users
  const adminHash = await bcrypt.hash('12345', 12)
  const admins = [
    ['daron.tarin@i2c.com.mx', adminHash],
    ['fernando.pacheco@i2c.com.mx', adminHash],
  ]
  for (const [email, hash] of admins) {
    await sql`
      INSERT INTO users (email, password_hash, project_id, role, must_change_password)
      VALUES (${email}, ${hash}, NULL, 'admin', TRUE)
      ON CONFLICT (email) DO NOTHING
    `
  }
  console.log('Admin users seeded.')

  console.log('Migration complete.')
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
