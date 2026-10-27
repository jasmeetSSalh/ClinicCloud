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

export async function deleteAllTables() {
   let connection;
  try {
    connection = await getConnection();
    
    const dropStatements = [
      'DROP TABLE hosp_personnel_pat_assign CASCADE CONSTRAINTS',
      'DROP TABLE patient_med_order CASCADE CONSTRAINTS',
      'DROP TABLE hosp_med_order CASCADE CONSTRAINTS',
      'DROP TABLE hosp_supply_order CASCADE CONSTRAINTS',
      'DROP TABLE hosp_med_inventory CASCADE CONSTRAINTS',
      'DROP TABLE hosp_supply_inventory CASCADE CONSTRAINTS',
      'DROP TABLE hospital_personnel CASCADE CONSTRAINTS',
      'DROP TABLE patient_list CASCADE CONSTRAINTS',
      'DROP TABLE pharm_med_inventory CASCADE CONSTRAINTS',
      'DROP TABLE pharm_supply_inventory CASCADE CONSTRAINTS'
    ];
    
    for (const statement of dropStatements) {
      try {
        await connection.execute(statement);
      } catch (error: any) {
        if (error.errorNum !== 942) {
          console.error(`Error dropping table with statement "${statement}":`, error);
        }
      }
    }
    
    return { success: true, message: 'All tables deleted successfully' };
  } catch (error) {
    console.error('Error deleting tables:', error);
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

export async function getTableData(tableName: string) {
  let connection;
  try {
    assertKnownTable(tableName);
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT * FROM ${tableName}`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    return result.rows;
  } catch (error) {
    console.error(`Error fetching data from table ${tableName}:`, error);
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

export async function populateAllTables() {
  let connection;
  try {
    connection = await getConnection();
    
    const insertStatements = [
      // Hospital Personnel
      `INSERT INTO hospital_personnel (PERSONNEL_ID, PERSONNEL_NAME, DEPARTMENT, PERSONNEL_ROLE, ACCESS_LEVEL) VALUES (1, 'Dr. Sarah Johnson', 'Cardiology', 'Doctor', 5)`,
      `INSERT INTO hospital_personnel (PERSONNEL_ID, PERSONNEL_NAME, DEPARTMENT, PERSONNEL_ROLE, ACCESS_LEVEL) VALUES (2, 'Nurse Mark Williams', 'Emergency', 'Nurse', 3)`,
      `INSERT INTO hospital_personnel (PERSONNEL_ID, PERSONNEL_NAME, DEPARTMENT, PERSONNEL_ROLE, ACCESS_LEVEL) VALUES (3, 'Dr. Emily Chen', 'Pediatrics', 'Doctor', 5)`,
      
      // Patients
      `INSERT INTO patient_list (PATIENT_ID, PATIENT_NAME, ADMITTED_TIME, DIAGNOSIS, DISCHARGE_TIME) VALUES (101, 'John Smith', TO_DATE('2025-09-20', 'YYYY-MM-DD'), 'Acute Myocardial Infarction', NULL)`,
      `INSERT INTO patient_list (PATIENT_ID, PATIENT_NAME, ADMITTED_TIME, DIAGNOSIS, DISCHARGE_TIME) VALUES (102, 'Maria Garcia', TO_DATE('2025-09-22', 'YYYY-MM-DD'), 'Pneumonia', NULL)`,
      `INSERT INTO patient_list (PATIENT_ID, PATIENT_NAME, ADMITTED_TIME, DIAGNOSIS, DISCHARGE_TIME) VALUES (103, 'Robert Lee', TO_DATE('2025-09-15', 'YYYY-MM-DD'), 'Appendicitis', TO_DATE('2025-09-18', 'YYYY-MM-DD'))`,
      
      // Personnel-Patient Assignments
      `INSERT INTO hosp_personnel_pat_assign (PATIENT_ID, PERSONNEL_ID) VALUES (101, 1)`,
      `INSERT INTO hosp_personnel_pat_assign (PATIENT_ID, PERSONNEL_ID) VALUES (102, 2)`,
      `INSERT INTO hosp_personnel_pat_assign (PATIENT_ID, PERSONNEL_ID) VALUES (102, 3)`,
      
      // Pharmacy Medicine Inventory
      `INSERT INTO pharm_med_inventory (MEDICINE_ID, DRUG_NAME, DOSAGE, DRUG_DESCRIPTION, COMPANY, QUANTITY, DRUG_TYPE, ACCESS_LEVEL, EXPIRY_DATE, DRUG_COST) VALUES (1001, 'Aspirin', '100mg', 'Pain reliever and anti-inflammatory', 'PharmaCorp', 5000, 'Tablet', 1, TO_DATE('2026-12-31', 'YYYY-MM-DD'), 0.50)`,
      `INSERT INTO pharm_med_inventory (MEDICINE_ID, DRUG_NAME, DOSAGE, DRUG_DESCRIPTION, COMPANY, QUANTITY, DRUG_TYPE, ACCESS_LEVEL, EXPIRY_DATE, DRUG_COST) VALUES (1002, 'Morphine Sulfate', '10mg/mL', 'Opioid analgesic for severe pain', 'MedSupply Inc', 200, 'Injectable', 5, TO_DATE('2025-11-30', 'YYYY-MM-DD'), 25.00)`,
      `INSERT INTO pharm_med_inventory (MEDICINE_ID, DRUG_NAME, DOSAGE, DRUG_DESCRIPTION, COMPANY, QUANTITY, DRUG_TYPE, ACCESS_LEVEL, EXPIRY_DATE, DRUG_COST) VALUES (1003, 'Amoxicillin', '500mg', 'Antibiotic for bacterial infections', 'GlobalMed', 3000, 'Capsule', 2, TO_DATE('2026-06-30', 'YYYY-MM-DD'), 1.25)`,
      `INSERT INTO pharm_med_inventory (MEDICINE_ID, DRUG_NAME, DOSAGE, DRUG_DESCRIPTION, COMPANY, QUANTITY, DRUG_TYPE, ACCESS_LEVEL, EXPIRY_DATE, DRUG_COST) VALUES (1004, 'skill issue pills', '200mg', 'For Skill Issues', 'SKINC', 5000, 'Tablet', 1, TO_DATE('2026-06-30', 'YYYY-MM-DD'), 0.01)`,
      
      // Hospital Medicine Inventory
      `INSERT INTO hosp_med_inventory (MEDICINE_ID, QUANTITY) VALUES (1001, 500)`,
      `INSERT INTO hosp_med_inventory (MEDICINE_ID, QUANTITY) VALUES (1002, 50)`,
      `INSERT INTO hosp_med_inventory (MEDICINE_ID, QUANTITY) VALUES (1003, 300)`,
      
      // Pharmacy Supply Inventory
      `INSERT INTO pharm_supply_inventory (SUPPLY_ID, SUPPLY_NAME, SUPPLY_DESCRIPTION, QUANTITY, SUPPLY_COST, COMPANY) VALUES (2001, 'Surgical Gloves', 'Latex-free sterile gloves size M', 10000, 0.35, 'MedicalSupplies Co')`,
      `INSERT INTO pharm_supply_inventory (SUPPLY_ID, SUPPLY_NAME, SUPPLY_DESCRIPTION, QUANTITY, SUPPLY_COST, COMPANY) VALUES (2002, 'IV Catheter 20G', '20 gauge intravenous catheter', 5000, 2.50, 'CareSupply Inc')`,
      `INSERT INTO pharm_supply_inventory (SUPPLY_ID, SUPPLY_NAME, SUPPLY_DESCRIPTION, QUANTITY, SUPPLY_COST, COMPANY) VALUES (2003, 'Syringes 10mL', 'Sterile disposable syringes', 8000, 0.75, 'MedicalSupplies Co')`,
      
      // Hospital Supply Inventory
      `INSERT INTO hosp_supply_inventory (SUPPLY_ID, QUANTITY) VALUES (2001, 1000)`,
      `INSERT INTO hosp_supply_inventory (SUPPLY_ID, QUANTITY) VALUES (2002, 200)`,
      `INSERT INTO hosp_supply_inventory (SUPPLY_ID, QUANTITY) VALUES (2003, 500)`,
      
      // Patient Medicine Orders
      `INSERT INTO patient_med_order (ORDER_ID, PERSONNEL_ID, PATIENT_ID, MEDICINE_ID, QUANTITY, ORDER_DATE, RECEIVED_DATE) VALUES (3001, 1, 101, 1001, 30, TO_DATE('2025-09-20', 'YYYY-MM-DD'), TO_DATE('2025-09-20', 'YYYY-MM-DD'))`,
      `INSERT INTO patient_med_order (ORDER_ID, PERSONNEL_ID, PATIENT_ID, MEDICINE_ID, QUANTITY, ORDER_DATE, RECEIVED_DATE) VALUES (3002, 2, 102, 1003, 20, TO_DATE('2025-09-22', 'YYYY-MM-DD'), TO_DATE('2025-09-22', 'YYYY-MM-DD'))`,
      `INSERT INTO patient_med_order (ORDER_ID, PERSONNEL_ID, PATIENT_ID, MEDICINE_ID, QUANTITY, ORDER_DATE, RECEIVED_DATE) VALUES (3003, 1, 101, 1002, 5, TO_DATE('2025-09-21', 'YYYY-MM-DD'), NULL)`,
      
      // Hospital Medicine Orders
      `INSERT INTO hosp_med_order (ORDER_ID, PERSONNEL_ID, MEDICINE_ID, QUANTITY, ORDER_DATE, RECEIVED_DATE) VALUES (4001, 2, 1001, 1000, TO_DATE('2025-09-18', 'YYYY-MM-DD'), TO_DATE('2025-09-19', 'YYYY-MM-DD'))`,
      `INSERT INTO hosp_med_order (ORDER_ID, PERSONNEL_ID, MEDICINE_ID, QUANTITY, ORDER_DATE, RECEIVED_DATE) VALUES (4002, 1, 1002, 100, TO_DATE('2025-09-20', 'YYYY-MM-DD'), NULL)`,
      `INSERT INTO hosp_med_order (ORDER_ID, PERSONNEL_ID, MEDICINE_ID, QUANTITY, ORDER_DATE, RECEIVED_DATE) VALUES (4003, 3, 1003, 500, TO_DATE('2025-09-23', 'YYYY-MM-DD'), TO_DATE('2025-09-24', 'YYYY-MM-DD'))`,
      `INSERT INTO hosp_med_order (ORDER_ID, PERSONNEL_ID, MEDICINE_ID, QUANTITY, ORDER_DATE, RECEIVED_DATE) VALUES (4004, 3, 1001, 100, TO_DATE('2025-09-23', 'YYYY-MM-DD'), NULL)`,
      
      // Hospital Supply Orders
      `INSERT INTO hosp_supply_order (ORDER_ID, PERSONNEL_ID, SUPPLY_ID, QUANTITY, ORDER_DATE, RECEIVED_DATE) VALUES (5001, 2, 2001, 2000, TO_DATE('2025-09-19', 'YYYY-MM-DD'), TO_DATE('2025-09-20', 'YYYY-MM-DD'))`,
      `INSERT INTO hosp_supply_order (ORDER_ID, PERSONNEL_ID, SUPPLY_ID, QUANTITY, ORDER_DATE, RECEIVED_DATE) VALUES (5002, 1, 2002, 500, TO_DATE('2025-09-21', 'YYYY-MM-DD'), NULL)`,
      `INSERT INTO hosp_supply_order (ORDER_ID, PERSONNEL_ID, SUPPLY_ID, QUANTITY, ORDER_DATE, RECEIVED_DATE) VALUES (5003, 3, 2003, 1000, TO_DATE('2025-09-22', 'YYYY-MM-DD'), TO_DATE('2025-09-23', 'YYYY-MM-DD'))`
    ];
    
    for (const statement of insertStatements) {
      try {
        await connection.execute(statement);
      } catch (error: any) {
        // Log individual insert errors but continue with other inserts
        console.error(`Error executing insert statement: ${statement}`, error);
      }
    }
    
    // Commit all changes
    await connection.commit();
    
    return { success: true, message: 'All tables populated with sample data successfully' };
  } catch (error) {
    console.error('Error populating tables:', error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }
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

// Table and column names can't be passed as bind variables, so they are checked
// against the real schema before they are written into a statement. Every value
// is passed as a bind variable.
const TABLES = new Set([
  'hospital_personnel',
  'patient_list',
  'pharm_med_inventory',
  'pharm_supply_inventory',
  'hosp_personnel_pat_assign',
  'hosp_med_inventory',
  'hosp_supply_inventory',
  'patient_med_order',
  'hosp_med_order',
  'hosp_supply_order',
]);

type Row = Record<string, unknown>;
type Binds = Record<string, string | number | null>;
type WriteResult = { success: boolean; message: string };

export function isKnownTable(tableName: string) {
  return TABLES.has(tableName.toLowerCase());
}

function assertKnownTable(tableName: string) {
  if (!isKnownTable(tableName)) {
    throw new Error(`Unknown table: ${tableName}`);
  }
}

// Column name -> Oracle data type, e.g. PATIENT_NAME -> VARCHAR2.
type Columns = Map<string, string>;

async function getColumns(connection: oracledb.Connection, tableName: string): Promise<Columns> {
  const result = await connection.execute<[string, string]>(
    `SELECT column_name, data_type FROM user_tab_columns WHERE table_name = :tableName`,
    { tableName: tableName.toUpperCase() }
  );
  return new Map((result.rows ?? []).map(([name, type]) => [name, type]));
}

async function getPrimaryKeyColumns(connection: oracledb.Connection, tableName: string) {
  const result = await connection.execute<[string]>(
    `SELECT cols.column_name
       FROM user_constraints cons
       JOIN user_cons_columns cols ON cols.constraint_name = cons.constraint_name
      WHERE cons.constraint_type = 'P' AND cons.table_name = :tableName
      ORDER BY cols.position`,
    { tableName: tableName.toUpperCase() }
  );
  return (result.rows ?? []).map((row) => row[0]);
}

// Upper-cases the keys and rejects any column the table doesn't have.
function toColumnRow(columns: Columns, row: Row) {
  const normalized: Row = {};
  for (const [key, value] of Object.entries(row)) {
    const column = key.toUpperCase();
    if (!columns.has(column)) {
      throw new Error(`Unknown column: ${key}`);
    }
    normalized[column] = value;
  }
  return normalized;
}

// Adds a value to the binds and returns the placeholder to use for it in the SQL.
// DATE columns take YYYY-MM-DD strings from the form's date inputs.
function bindValue(binds: Binds, columns: Columns, column: string, value: unknown) {
  if (value !== null && value !== undefined && typeof value !== 'string' && typeof value !== 'number') {
    throw new Error(`Invalid value for ${column}`);
  }
  const name = `b${Object.keys(binds).length}`;
  binds[name] = value === '' || value === undefined ? null : value;
  return columns.get(column) === 'DATE' ? `TO_DATE(:${name}, 'YYYY-MM-DD')` : `:${name}`;
}

// Matches a row on its primary key. Composite keys use every key column, so
// deleting one patient assignment doesn't delete the patient's other assignments.
async function buildWhereClause(
  connection: oracledb.Connection,
  tableName: string,
  columns: Columns,
  row: Row,
  binds: Binds
) {
  const primaryKey = await getPrimaryKeyColumns(connection, tableName);
  const keyColumns = primaryKey.length > 0 ? primaryKey : [Object.keys(row)[0]];

  const conditions = keyColumns.map((column) => {
    if (row[column] === undefined || row[column] === '') {
      throw new Error(`Missing value for key column ${column}`);
    }
    return `${column} = ${bindValue(binds, columns, column, row[column])}`;
  });

  return conditions.join(' AND ');
}

async function runWrite(
  tableName: string,
  successMessage: string,
  buildStatement: (connection: oracledb.Connection) => Promise<{ sql: string; binds: Binds }>
): Promise<WriteResult> {
  let connection;
  try {
    assertKnownTable(tableName);
    connection = await getConnection();

    const { sql, binds } = await buildStatement(connection);
    const result = await connection.execute(sql, binds);

    if (result.rowsAffected === 0) {
      return { success: false, message: 'No row matched the selected entry.' };
    }

    await connection.commit();
    return { success: true, message: successMessage };
  } catch (error) {
    console.error(`Error writing to ${tableName}:`, error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }
    return { success: false, message: error instanceof Error ? error.message : 'An unknown error occurred' };
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

export async function addEntry(tableName: string, entry: Row) {
  return runWrite(tableName, 'New Entry Successfully Created', async (connection) => {
    const columns = await getColumns(connection, tableName);
    const row = toColumnRow(columns, entry);
    const names = Object.keys(row);
    if (names.length === 0) {
      throw new Error('No values to insert');
    }

    const binds: Binds = {};
    const values = names.map((column) => bindValue(binds, columns, column, row[column]));

    return {
      sql: `INSERT INTO ${tableName} (${names.join(', ')}) VALUES (${values.join(', ')})`,
      binds,
    };
  });
}

export async function editEntry(tableName: string, existingEntry: Row, replacementEntry: Row) {
  return runWrite(tableName, 'Entry updated successfully.', async (connection) => {
    const columns = await getColumns(connection, tableName);
    const existing = toColumnRow(columns, existingEntry);
    const replacement = toColumnRow(columns, replacementEntry);
    if (Object.keys(replacement).length === 0) {
      throw new Error('No values to update');
    }

    const binds: Binds = {};
    const setParts = Object.entries(replacement).map(
      ([column, value]) => `${column} = ${bindValue(binds, columns, column, value)}`
    );
    const where = await buildWhereClause(connection, tableName, columns, existing, binds);

    return { sql: `UPDATE ${tableName} SET ${setParts.join(', ')} WHERE ${where}`, binds };
  });
}

export async function deleteEntry(tableName: string, entry: Row) {
  return runWrite(tableName, 'Successfully Deleted Entry', async (connection) => {
    const columns = await getColumns(connection, tableName);
    const row = toColumnRow(columns, entry);

    const binds: Binds = {};
    const where = await buildWhereClause(connection, tableName, columns, row, binds);

    return { sql: `DELETE FROM ${tableName} WHERE ${where}`, binds };
  });
}

export async function createAllTables() {
   let connection;
  try {
    connection = await getConnection();
    
    const createStatements = [
      `CREATE TABLE hospital_personnel 
      (
        PERSONNEL_ID NUMBER NOT NULL,
        PERSONNEL_NAME VARCHAR2(50) NOT NULL,
        DEPARTMENT VARCHAR2(50) NOT NULL,
        PERSONNEL_ROLE VARCHAR2(20) NOT NULL,
        ACCESS_LEVEL NUMBER NOT NULL CHECK (ACCESS_LEVEL BETWEEN 1 AND 5),
        CONSTRAINT HOSP_PERSONNEL_PK PRIMARY KEY (PERSONNEL_ID)
      )`,
      
      `CREATE TABLE patient_list
      (
        PATIENT_ID NUMBER NOT NULL,
        PATIENT_NAME VARCHAR2(50) NOT NULL,
        ADMITTED_TIME DATE NOT NULL,
        DIAGNOSIS VARCHAR2(200) NOT NULL,
        DISCHARGE_TIME DATE,
        CONSTRAINT patient_list_PK PRIMARY KEY (PATIENT_ID),
        CONSTRAINT CHK_PAT_DISCHARGE CHECK (DISCHARGE_TIME IS NULL OR DISCHARGE_TIME > ADMITTED_TIME)
      )`,
      
      `CREATE TABLE PHARM_MED_INVENTORY
      (
        MEDICINE_ID NUMBER NOT NULL,
        DRUG_NAME VARCHAR2(100) NOT NULL,
        DOSAGE VARCHAR2(50) NOT NULL,
        DRUG_DESCRIPTION VARCHAR2(500),
        COMPANY VARCHAR2(100) NOT NULL,
        QUANTITY NUMBER NOT NULL CHECK (QUANTITY >= 0),
        DRUG_TYPE VARCHAR2(50) NOT NULL,
        ACCESS_LEVEL NUMBER NOT NULL CHECK (ACCESS_LEVEL BETWEEN 1 AND 5),
        EXPIRY_DATE DATE NOT NULL,
        DRUG_COST NUMBER(10,2) NOT NULL CHECK (DRUG_COST >= 0),
        CONSTRAINT PHARM_MED_INV_PK PRIMARY KEY (MEDICINE_ID)
      )`,
      
      `CREATE TABLE pharm_supply_inventory 
      (
        SUPPLY_ID NUMBER NOT NULL,
        SUPPLY_NAME VARCHAR2(100) NOT NULL,
        SUPPLY_DESCRIPTION VARCHAR2(500),
        QUANTITY NUMBER NOT NULL CHECK (QUANTITY >= 0),
        SUPPLY_COST NUMBER(10,2) NOT NULL CHECK (SUPPLY_COST >= 0),
        COMPANY VARCHAR2(100) NOT NULL,
        CONSTRAINT PHARM_SUPPLY_INV_PK PRIMARY KEY (SUPPLY_ID)
      )`,
      
      `CREATE TABLE hosp_personnel_pat_assign 
      (
        PATIENT_ID NUMBER NOT NULL,
        PERSONNEL_ID NUMBER NOT NULL,
        CONSTRAINT H_PER_PAT_ASSGN_PK PRIMARY KEY (PATIENT_ID, PERSONNEL_ID),
        CONSTRAINT FK_PAT_ASSIGN FOREIGN KEY (PATIENT_ID) REFERENCES patient_list(PATIENT_ID) ON DELETE CASCADE,
        CONSTRAINT FK_PER_ASSIGN FOREIGN KEY (PERSONNEL_ID) REFERENCES hospital_personnel(PERSONNEL_ID) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE hosp_med_inventory 
      (
        MEDICINE_ID NUMBER NOT NULL,
        QUANTITY NUMBER NOT NULL CHECK (QUANTITY >= 0),
        CONSTRAINT HOSP_MED_INV_PK PRIMARY KEY (MEDICINE_ID),
        CONSTRAINT FK_HOSP_MED FOREIGN KEY (MEDICINE_ID) REFERENCES PHARM_MED_INVENTORY(MEDICINE_ID) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE hosp_supply_inventory
      (
        SUPPLY_ID NUMBER NOT NULL,
        QUANTITY NUMBER NOT NULL CHECK (QUANTITY >= 0),
        CONSTRAINT HOSP_SUPPLY_INV_PK PRIMARY KEY (SUPPLY_ID),
        CONSTRAINT FK_HOSP_SUPPLY FOREIGN KEY (SUPPLY_ID) REFERENCES pharm_supply_inventory(SUPPLY_ID) ON DELETE CASCADE
      )`,
      
      `CREATE TABLE patient_med_order
      (
        ORDER_ID NUMBER NOT NULL,
        PERSONNEL_ID NUMBER NOT NULL,
        PATIENT_ID NUMBER NOT NULL,
        MEDICINE_ID NUMBER NOT NULL,
        QUANTITY NUMBER NOT NULL CHECK (QUANTITY > 0),
        ORDER_DATE DATE NOT NULL,
        RECEIVED_DATE DATE,
        CONSTRAINT PAT_MED_ORD_PK PRIMARY KEY (ORDER_ID),
        CONSTRAINT FK_PAT_MED_PER FOREIGN KEY (PERSONNEL_ID) REFERENCES hospital_personnel(PERSONNEL_ID) ON DELETE CASCADE,
        CONSTRAINT FK_PAT_MED_PAT FOREIGN KEY (PATIENT_ID) REFERENCES patient_list(PATIENT_ID) ON DELETE CASCADE,
        CONSTRAINT FK_PAT_MED_MED FOREIGN KEY (MEDICINE_ID) REFERENCES PHARM_MED_INVENTORY(MEDICINE_ID) ON DELETE CASCADE,
        CONSTRAINT CHK_PAT_MED_RECV CHECK (RECEIVED_DATE IS NULL OR RECEIVED_DATE >= ORDER_DATE)
      )`,
      
      `CREATE TABLE hosp_med_order
      (
        ORDER_ID NUMBER NOT NULL,
        PERSONNEL_ID NUMBER NOT NULL,
        MEDICINE_ID NUMBER NOT NULL,
        QUANTITY NUMBER NOT NULL CHECK (QUANTITY > 0),
        ORDER_DATE DATE NOT NULL,
        RECEIVED_DATE DATE,
        CONSTRAINT HOSP_MED_ORD_PK PRIMARY KEY (ORDER_ID),
        CONSTRAINT FK_HOSP_MED_PER FOREIGN KEY (PERSONNEL_ID) REFERENCES hospital_personnel(PERSONNEL_ID) ON DELETE CASCADE,
        CONSTRAINT FK_HOSP_MED_MED FOREIGN KEY (MEDICINE_ID) REFERENCES PHARM_MED_INVENTORY(MEDICINE_ID) ON DELETE CASCADE,
        CONSTRAINT CHK_HOSP_MED_RECV CHECK (RECEIVED_DATE IS NULL OR RECEIVED_DATE >= ORDER_DATE)
      )`,
      
      `CREATE TABLE hosp_supply_order 
      (
        ORDER_ID NUMBER NOT NULL,
        PERSONNEL_ID NUMBER NOT NULL,
        SUPPLY_ID NUMBER NOT NULL,
        QUANTITY NUMBER NOT NULL CHECK (QUANTITY > 0),
        ORDER_DATE DATE NOT NULL,
        RECEIVED_DATE DATE,
        CONSTRAINT HOSP_SUP_ORD_PK PRIMARY KEY (ORDER_ID),
        CONSTRAINT FK_HOSP_SUP_PER FOREIGN KEY (PERSONNEL_ID) REFERENCES hospital_personnel(PERSONNEL_ID) ON DELETE CASCADE,
        CONSTRAINT FK_HOSP_SUP_SUP FOREIGN KEY (SUPPLY_ID) REFERENCES pharm_supply_inventory(SUPPLY_ID) ON DELETE CASCADE,
        CONSTRAINT CHK_HOSP_SUP_RECV CHECK (RECEIVED_DATE IS NULL OR RECEIVED_DATE >= ORDER_DATE)
      )`
    ];
    
    for (const statement of createStatements) {
      await connection.execute(statement);
    }
    
    return { success: true, message: 'All tables created successfully' };
  } catch (error) {
    console.error('Error creating tables:', error);
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