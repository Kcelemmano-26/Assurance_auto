import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkMySQLConnection() {
  console.log('🔍 Vérification de la connexion MySQL...\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'insurance_platform'
  };
  
  console.log('Configuration utilisée:');
  console.log(`- Host: ${config.host}`);
  console.log(`- User: ${config.user}`);
  console.log(`- Database: ${config.database}`);
  console.log(`- Password: ${config.password ? '***' : 'VIDE'}\n`);
  
  try {
    // Test de connexion
    const connection = await mysql.createConnection(config);
    console.log('✅ Connexion MySQL réussie!');
    
    // Vérifier les tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Tables trouvées: ${tables.length}`);
    
    // Vérifier les données par défaut
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Utilisateurs: ${users[0].count}`);
    
    const [companies] = await connection.execute('SELECT COUNT(*) as count FROM insurance_companies');
    console.log(`✅ Compagnies: ${companies[0].count}`);
    
    await connection.end();
    console.log('\n🎉 MySQL est correctement configuré!');
    
  } catch (error) {
    console.error('❌ Erreur de connexion MySQL:');
    console.error(`   ${error.message}\n`);
    
    console.log('🔧 Solutions possibles:');
    console.log('1. Vérifier que MySQL est démarré:');
    console.log('   sudo systemctl start mysql');
    console.log('');
    console.log('2. Vérifier le mot de passe dans .env');
    console.log('');
    console.log('3. Créer la base de données:');
    console.log('   mysql -u root -p -e "CREATE DATABASE insurance_platform;"');
    console.log('');
    console.log('4. Importer le schéma:');
    console.log('   mysql -u root -p insurance_platform < supabase/migrations/20250703125359_holy_tooth.sql');
    
    process.exit(1);
  }
}

checkMySQLConnection();