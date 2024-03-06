import pkg from 'pg';
const { Pool } = pkg;
import createTablesIfNotExists from '../models/models.js';
const pool = new Pool({
   user: 'postgres',
   host: 'localhost',
   database: 'test1',
   password: 'root',
   port: 5432,
});
createTablesIfNotExists(pool);
export default pool;