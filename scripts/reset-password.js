const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not configured');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function resetPassword() {
  try {
    const newPassword = process.env.DEFAULT_ADMIN_PASSWORD;
    if (!newPassword) throw new Error('DEFAULT_ADMIN_PASSWORD env var required');
    const hash = await bcrypt.hash(newPassword, 12);

    const result = await sql`
      UPDATE users 
      SET password_hash = ${hash}, must_change_password = true
      WHERE email = 'daron.tarin@i2c.com.mx'
      RETURNING id, email
    `;

    if (result.length === 0) {
      console.error('❌ Usuario no encontrado');
      process.exit(1);
    }

    console.log('✅ Contraseña actualizada correctamente');
    console.log(`   Email: ${result[0].email}`);
    console.log(`   Nueva contraseña: ${newPassword}`);
    console.log(`   Debe cambiar contraseña: Sí`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();
