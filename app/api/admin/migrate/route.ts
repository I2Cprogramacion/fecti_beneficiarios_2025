import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

// This endpoint should be called with proper authentication
// It recreates the database schema and seeds the projects

export async function POST(request: NextRequest) {
  // Auth check - can be disabled temporarily for first migration
  const authHeader = request.headers.get('authorization')
  const migrationSecret = process.env.MIGRATION_SECRET
  
  // Log for debugging
  console.log('Auth Header:', authHeader)
  console.log('Secret configured:', !!migrationSecret)
  
  if (migrationSecret && authHeader !== `Bearer ${migrationSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    console.log('Starting migration...')

    // Drop tables if they exist
    await sql`DROP TABLE IF EXISTS submissions`
    await sql`DROP TABLE IF EXISTS users`
    await sql`DROP TABLE IF EXISTS projects`
    await sql`DROP TABLE IF EXISTS settings`

    // Create tables
    await sql`
      CREATE TABLE projects (
        id SERIAL PRIMARY KEY,
        num INTEGER NOT NULL,
        clave VARCHAR(60) NOT NULL UNIQUE,
        componente VARCHAR(20) NOT NULL,
        titulo TEXT NOT NULL,
        monto NUMERIC(14,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE users (
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
      CREATE TABLE submissions (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) UNIQUE,
        file_pathname TEXT NOT NULL,
        file_name TEXT NOT NULL,
        uploaded_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`
      CREATE TABLE settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    console.log('Tables created.')

    // Create admin users
    const hash = await bcrypt.hash('12345', 10)

    await sql`
      INSERT INTO users (email, password_hash, role, must_change_password)
      VALUES ('daron.tarin@i2c.com.mx', ${hash}, 'admin', true)
    `
    await sql`
      INSERT INTO users (email, password_hash, role, must_change_password)
      VALUES ('fernando.pacheco@i2c.com.mx', ${hash}, 'admin', true)
    `

    console.log('Admin users created.')

    // Seed projects
    const projects = [
      [1, 'FECTI/2025/C01-INFRA//029', 'C01-INFRA', 'Laboratorio de tablillas electrónicas SMT', 2453400.00],
      [2, 'FECTI/2025/C01-INFRA//031', 'C01-INFRA', 'Laboratorio de Electromovilidad y Sustentabilidad (LaES)', 2500000.00],
      [3, 'FECTI/2025/C01-INFRA//032', 'C01-INFRA', 'Centro de Robótica, Inteligencia Artificial e IoT para Aplicación Académica e Innovación Tecnológica', 1500000.00],
      [4, 'FECTI/2025/C01-INFRA//053', 'C01-INFRA', 'Desarrollo de una plataforma de validación analítica para la evaluación de calidad de vinos del estado de chihuahua.', 2500000.00],
      [5, 'FECTI/2025/C01-INFRA//090', 'C01-INFRA', 'Centro Certificado de Innovación Agrícola, Análisis de Suelo y Agua', 2500000.00],
      [6, 'FECTI/2025/C01-INFRA//109', 'C01-INFRA', 'Equipamiento de Laboratorio de Fármacos para Investigación y Desarrollo', 2500000.00],
      [7, 'FECTI/2025/C01-INFRA//116', 'C01-INFRA', 'Robustecimiento de infraestructura tecnológica para masificar análisis financiero de MiPyMEs', 2500000.00],
      [8, 'FECTI/2025/C01-INFRA//117', 'C01-INFRA', 'Implementación de Tecnología de Procesamiento para Impulsar el Valor Agregado en el Sector Nogalero en el Municipio de Chihuahua', 2500000.00],
      [9, 'FECTI/2025/C01-INFRA//127', 'C01-INFRA', 'Fortalecimiento de la infraestructura, locaciones y servicios para el ecosistema audiovisual de chihuahua', 2500000.00],
      [10, 'FECTI/2025/C01-INFRA//129', 'C01-INFRA', 'Fortalecimiento de Capacidades Técnicas y Analíticas de un Laboratorio Auxiliar Especializado en Die Casting para las Industrias Automotriz y Aeroespacial en Chihuahua.', 2500000.00],
      [11, 'FECTI/2025/C01-INFRA//135', 'C01-INFRA', 'Tecnología IA de ultima generacion aplicada a la publicidad exterior', 2500000.00],
      [12, 'FECTI/2025/C01-INFRA//137', 'C01-INFRA', 'Fortalecimiento de la infraestructura tecnológica para potenciar el conocimiento científico del plasma frío como una tecnología emergente y sostenible en la conservación poscosecha', 2500000.00],
      [13, 'FECTI/2025/C01-INFRA//138', 'C01-INFRA', 'Complementar Infraestructura en Semiconductores para el Laboratorio: Centro de Investigación en Ciencia y Tecnología Aplicada', 2500000.00],
      [14, 'FECTI/2025/C01-INFRA//142', 'C01-INFRA', 'Integración y uso de nuevas tecnologías para el análisis y tratamiento de residuos orgánicos mediante procesos de compostaje', 1576858.55],
      [15, 'FECTI/2025/C01-INFRA//144', 'C01-INFRA', 'App para suministro a industria restaurantera', 2500000.00],
      [16, 'FECTI/2025/C02-IBA//001', 'C02-IBA', 'Sotol y ciencia: innovación analítica por RMN para control de calidad y proyección regional', 500000.00],
      [17, 'FECTI/2025/C02-IBA//004', 'C02-IBA', 'Revalorización de residuos agrícolas en biocarbones nanoestructurados para la remoción de contaminantes emergentes del agua para riego', 500000.00],
      [18, 'FECTI/2025/C02-IBA//008', 'C02-IBA', 'Caracterización de compuestos con actividad antineoplásica y antiinflamatoria presentes en Rhus trilobata', 500000.00],
      [19, 'FECTI/2025/C02-IBA//010', 'C02-IBA', 'Hacia la Medicina de precisión en espondiloartritis: una estrategia innovadora para el desarrollo de biomarcadores séricos guiada por transcriptómica traslacional', 300000.00],
      [20, 'FECTI/2025/C02-IBA//012', 'C02-IBA', 'Nuevas entidades químicas con potencial antibacteriano: síntesis dirigida y evaluación contra cepas resistentes priorizadas por la OMS', 500000.00],
      [21, 'FECTI/2025/C02-IBA//013', 'C02-IBA', 'Desarrollo de una plataforma 3D in vitro para el estudio de mecanismos de neurodegeneración', 500000.00],
      [22, 'FECTI/2025/C02-IBA//016', 'C02-IBA', 'Desarrollo de abordajes terapéuticos con potencial antioxidante y antiinflamatorio para un modelo in vitro del Síndrome de Takotsubo', 500000.00],
      [23, 'FECTI/2025/C02-IBA//018', 'C02-IBA', 'Sistema micelar dirigido como vehículo portador de fármacos hidrofóbos', 500000.00],
      [24, 'FECTI/2025/C02-IBA//019', 'C02-IBA', 'Modelo de IA para la interpretación automática de imágenes médicas como apoyo clínico en el Estado de Chihuahua', 290420.00],
      [25, 'FECTI/2025/C02-IBA//026', 'C02-IBA', 'Condensador Atmosférico de Agua Subterráneo por Torres de Rocío', 250000.00],
      [26, 'FECTI/2025/C02-IBA//027', 'C02-IBA', 'Estudio Preclínico del Potencial Inmunomodulador de la Lactoferrina y sus Péptidos Bioactivos Contra el Cáncer de Mama y Pulmón Triple Negativo.', 425000.00],
      [27, 'FECTI/2025/C02-IBA//029', 'C02-IBA', 'Compuestos Híbridos de Baja Densidad y Alta Entropía con Refuerzos Nanoestructurados para Aplicaciones Aeroespaciales', 500000.00],
      [28, 'FECTI/2025/C02-IBA//035', 'C02-IBA', 'Rike: Tractor Eléctrico Sustentable para el Campo Chihuahuense', 500000.00],
      [29, 'FECTI/2025/C02-IBA//039', 'C02-IBA', 'Proyecto de implementación de laboratorio de biotecnología para producción de levaduras y control de calidad de cerveza artesanal', 500000.00],
      [30, 'FECTI/2025/C02-IBA//050', 'C02-IBA', 'Fortalecimiento de Estrategias para la Difusión y Divulgación del Conocimiento en Ciencia Básica y de Frontera en el Estado de Chihuahua', 221890.00],
      [31, 'FECTI/2025/C03-FT//001', 'C03-FT', 'CREA+ Ciencia y Tecnología para Todos', 500000.00],
      [32, 'FECTI/2025/C03-FT//004', 'C03-FT', 'IMPULSATEC; Un espacio para explorar, aprender y trasformar tu entorno (https://acortar.link/DdtBIB)', 500000.00],
      [33, 'FECTI/2025/C03-FT//005', 'C03-FT', 'Laboratorio de Innovación y Manufactura Avanzada', 497315.20],
      [34, 'FECTI/2025/C03-FT//007', 'C03-FT', '"Talento que Programa el Futuro: Certificación Arduino para la Innovación Tecnológica en Secundarias de Ciudad Juárez"', 500000.00],
      [35, 'FECTI/2025/C03-FT//009', 'C03-FT', 'Programa Binacional de Formación de Talento en Semiconductores', 500000.00],
      [36, 'FECTI/2025/C03-FT//010', 'C03-FT', 'Diseño y desarrollo de un laboratorio de fabricación digital móvil (Fab Lab Móvil)', 499963.48],
      [37, 'FECTI/2025/C03-FT//011', 'C03-FT', 'Pequeños ingenieros del futuro', 279066.42],
      [38, 'FECTI/2025/C03-FT//018', 'C03-FT', 'Escuelita Maker', 155267.74],
      [39, 'FECTI/2025/C03-FT//025', 'C03-FT', 'Diseño e Implementación de Circuitos Electrónicos.', 323475.00],
      [40, 'FECTI/2025/C03-FT//026', 'C03-FT', 'Chicas ConCiencia', 398129.12],
      [41, 'FECTI/2025/C03-FT//030', 'C03-FT', 'Centro Estatal de Excelencia IPC - UIT', 490000.00],
      [42, 'FECTI/2025/C03-FT//033', 'C03-FT', 'FORMANDO CASTORES: Conectando Jóvenes con la Ciencia y Tecnología', 249331.01],
      [43, 'FECTI/2025/C04-IYE//003', 'C04-IYE', 'Sistema estratégico y de innovación tecnológica para la reducción a los volúmenes de agua y fertilizantes utilizados en la producción alimentaria.', 1307837.68],
      [44, 'FECTI/2025/C04-IYE//006', 'C04-IYE', 'Proyecto Estratégico PELLET CHIHUAHUA: Tecnología Sustentable para el Aprovechamiento de Biomasa y el Impulso al Crecimiento Verde Regional.', 1219819.40],
      [45, 'FECTI/2025/C04-IYE//007', 'C04-IYE', 'Eficiencia e innovación en el cultivo de la vid, mediante inteligencia artificial (IA) e internet de las cosas (IoT)', 1490000.00],
      [46, 'FECTI/2025/C04-IYE//011', 'C04-IYE', 'PolinizIA: IA para salvar polinizadores y potenciar la productividad agrícola', 553242.01],
      [47, 'FECTI/2025/C04-IYE//020', 'C04-IYE', 'Enlatado de vino y sidra para impulsar la industria de bebidas alcohólicas del estado de Chihuahua', 155732.07],
      [48, 'FECTI/2025/C04-IYE//029', 'C04-IYE', 'Neurox: Innovación y Desarrollo en Implantes Craneales 3D Personalizados en Chihuahua', 937600.00],
      [49, 'FECTI/2025/C04-IYE//034', 'C04-IYE', 'Invernadero 4.0 utcj sustentable', 1500000.00],
      [50, 'FECTI/2025/C04-IYE//057', 'C04-IYE', 'Sistema de Cálculos Ambientales', 591209.33],
      [51, 'FECTI/2025/C04-IYE//063', 'C04-IYE', 'Prototipo de desarrollo de vivienda modelo biofílico escalable de alta eficiencia energética', 919300.00],
      [52, 'FECTI/2025/C04-IYE//077', 'C04-IYE', 'Desarrollo de Plásticos de Ingeniería para Mecanizado Industrial a partir de Residuos Textiles Industriales', 1462472.31],
      [53, 'FECTI/2025/C04-IYE//078', 'C04-IYE', 'Parche transdérmico para regeneración de piel y liberación de fármacos. Maduración tecnológica', 1493000.00],
      [54, 'FECTI/2025/C04-IYE//098', 'C04-IYE', 'Desarrollo de materiales microestructurados basados en zeolita clinoptilolita modificada para la formulación de estuco de alta resistencia térmica', 1484798.84],
      [55, 'FECTI/2025/C04-IYE//099', 'C04-IYE', 'Fortalecimiento de las capacidades de DTA-Agrícola para la manufactura de dispositivos de agricultura de precisión y análisis edafoclimático.', 650000.00],
      [56, 'FECTI/2025/C04-IYE//102', 'C04-IYE', 'Desarrollo de un sistema automático de decapado de pinturas y recubrimientos basado en Solvólisis Termoreactiva para la industria automotriz y aeroespacial.', 1490000.00],
      [57, 'FECTI/2025/C04-IYE//113', 'C04-IYE', 'Integración de un modelo de análisis documental para eficientar el proceso aprobación de partes en la industria de manufactura usando inteligencia artificial.', 764645.00],
      [58, 'FECTI/2025/C04-IYE//115', 'C04-IYE', 'Centro Avanzado de Diagnóstico Predictivo, Manufactura Aditiva y Mantenimiento Inteligente para los Sectores Aeroespacial, Automotriz y Tecnológico.', 1500000.00],
      [59, 'FECTI/2025/C04-IYE//117', 'C04-IYE', 'INNOVAGRO 4.0', 1038304.71],
      [60, 'FECTI/2025/C04-IYE//120', 'C04-IYE', 'Treitus Call - Plataforma de automatización telefónica con inteligencia artificial', 1500000.00],
      [61, 'FECTI/2025/C04-IYE//123', 'C04-IYE', 'Centro de Comercio Inteligente', 1500000.00],
      [62, 'FECTI/2025/C04-IYE//125', 'C04-IYE', 'Plataforma de gestión inteligente para la industria manufacturera', 1500000.00],
    ]

    for (const [num, clave, componente, titulo, monto] of projects) {
      await sql`
        INSERT INTO projects (num, clave, componente, titulo, monto)
        VALUES (${num}, ${clave}, ${componente}, ${titulo}, ${monto})
      `
    }

    const count = await sql`SELECT COUNT(*) as total FROM projects`
    console.log(`Seeded ${count[0].total} projects`)

    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      projectsCount: count[0].total,
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: String(error) },
      { status: 500 }
    )
  }
}
