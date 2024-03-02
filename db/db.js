const mysql = require('mysql2/promise');

async function createDatabaseConnection() {
  const connection = await mysql.createConnection({
    host: 'viaduct.proxy.rlwy.net',
    user: 'root',
    port: 53548,
    password: 'AGd26BBdafahAeH56fa-f66chBeEgE1f',
    database: 'railway'
  });

  return connection;
}

module.exports = {
    query: async (sql, params) => {
        let connection;

        try {
             connection = await createDatabaseConnection();
             console.log(sql,params)
            return await connection.query(sql, params);
           
        }catch (err) {
            return {error:"No se pudo crear al usuario"}
        }finally {
            if (connection) {
                await connection.end();
            }
        }
     
    }
    
  };

