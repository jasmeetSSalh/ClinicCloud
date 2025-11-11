import oracledb from 'oracledb';

// Initialize thick mode for better compatibility with older Oracle versions
let thickModeInitialized = false;

function initThickMode() {
  if (!thickModeInitialized) {
    try {
      oracledb.initOracleClient();
      thickModeInitialized = true;
      console.log('Oracle Thick mode initialized successfully');
    } catch (error) {
      console.warn('Could not initialize Oracle Thick mode, falling back to Thin mode:', error);
      // Continue with thin mode - don't throw error
    }
  }
}

// Debug environment variables
console.log('Environment variables loaded:', {
  DB_USERNAME: process.env.DB_USERNAME ? 'SET' : 'NOT_SET',
  DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT_SET', 
  DB_HOST: process.env.DB_HOST || 'DEFAULT',
  DB_PORT: process.env.DB_PORT || 'DEFAULT',
  DB_SID: process.env.DB_SID || 'DEFAULT'
});

const dbConfig = {
  user: process.env.DB_USERNAME || 'your_username',
  password: process.env.DB_PASSWORD || 'your_password',
  connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(Host=${process.env.DB_HOST || 'oracle.scs.ryerson.ca'})(Port=${process.env.DB_PORT || '1521'}))(CONNECT_DATA=(SID=${process.env.DB_SID || 'orcl'})))`
};

export async function getConnection() {
  try {
    // Initialize thick mode before attempting connection
    initThickMode();
    
    // Debug: Log connection config (without password)
    console.log('Attempting to connect with config:', {
      user: dbConfig.user,
      connectString: dbConfig.connectString,
      passwordSet: !!dbConfig.password
    });
    
    const connection = await oracledb.getConnection(dbConfig);
    console.log('Database connection successful');
    return connection;
  } catch (error) {
    console.error('Error connecting to Oracle database:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function getAllTables() {
  let connection;
  try {
    connection = await getConnection();
    
    const result = await connection.execute(
      `SELECT table_name FROM user_tables ORDER BY table_name`
    );
    
    return (result.rows as any[][])?.map((row) => row[0]) || [];
  } catch (error) {
    console.error('Error fetching tables:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    }
  }
}