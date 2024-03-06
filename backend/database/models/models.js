async function createTablesIfNotExists(pool) {
   try {
      await pool.query(`
           CREATE TABLE IF NOT EXISTS users (
               id SERIAL PRIMARY KEY,
               username VARCHAR(255) UNIQUE NOT NULL,
               name VARCHAR(255),
               password VARCHAR(255) NOT NULL,
               created TIMESTAMPTZ DEFAULT NOW()
           );
       `);

      await pool.query(`
           CREATE TABLE IF NOT EXISTS lists (
               id SERIAL PRIMARY KEY,
               name VARCHAR(255),
               created TIMESTAMPTZ DEFAULT NOW()
           );
       `);

      await pool.query(`
           CREATE TABLE IF NOT EXISTS tasks (
               id SERIAL PRIMARY KEY,
               name VARCHAR(255),
               iscompleted BOOLEAN DEFAULT FALSE,
               list_id INTEGER REFERENCES lists(id)
           );
       `);

      console.log('Tables created successfully (if they did not exist).');
   } catch (error) {
      console.error('Error creating tables:', error);
   }
}

export default createTablesIfNotExists;