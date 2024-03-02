let express = require('express');
let router = express.Router();
const {query} = require('../db/db.js');

const { generateToken, verifyToken } = require('./jwt/jwt.js')

router.options('/api/filtrar-data', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});
router.get('/api/filtrar-data',verifyToken,  async (req, res) => {
    try {
      // Obtener los parámetros de rango de precio mínimo y máximo y número de habitaciones
      const { precioMinimo, precioMaximo, habitaciones } = req.query;
  
      // Construir la consulta SQL dinámicamente basada en los parámetros proporcionados
      let sql = 'SELECT * FROM dataDocs WHERE 1=1';
      const params = [];
  
      if (precioMinimo) {
        sql += ' AND Precio >= ?';
        params.push(precioMinimo);
      }
  
      if (precioMaximo) {
        sql += ' AND Precio <= ?';
        params.push(precioMaximo);
      }
  
      if (habitaciones) {
        sql += ' AND Habitaciones = ?';
        params.push(habitaciones);
      }
  
      // Ejecutar la consulta SQL con los parámetros proporcionados
      const [rows] = await query(sql, params);
      // Enviar la respuesta con los resultados de la consulta
      res.json({ data: rows });
    } catch (error) {
      console.error('Error al filtrar la data:', error);
      res.status(500).json({ error: 'Hubo un error al filtrar la data.' });
    }
  });
  router.options('/api/precio-promedio', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
  });
  router.get('/api/precio-promedio',verifyToken, async (req, res) => {
    try {
        // Obtener los parámetros de latitud, longitud y distancia en kilómetros
        const { latitud, longitud, distancia } = req.query;
    
        // Convertir la distancia a millas
        const distanciaMillas = distancia / 1.60934;
    
        // Consulta SQL para calcular el precio promedio del metro cuadrado dentro del radio especificado
        const sql = `
          SELECT AVG(PrecioPorMetro) AS PrecioPromedio
          FROM dataDocs
          WHERE SQRT(POW(69.1 * (Latitud - ?), 2) + POW(69.1 * (? - Longitud) * COS(Latitud / 57.3), 2)) < ?

        `;
        
        // Ejecutar la consulta SQL con los parámetros proporcionados
        const [rows] = await query(sql, [latitud, longitud, distanciaMillas]);
    
        // Obtener el precio promedio del resultado de la consulta
        const precioPromedio = rows[0].PrecioPromedio;
    
        // Enviar la respuesta con el precio promedio
        res.json({ precioPromedio });
      } catch (error) {
        console.error('Error al calcular el precio promedio:', error);
        res.status(500).json({ error: 'Hubo un error al calcular el precio promedio.' });
      }
  });
  router.options('/api/propiedades-en-area', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
  });
  router.get('/api/propiedades-en-area',verifyToken, async (req, res) => {
    try {
      // Obtener los parámetros de latitud, longitud y distancia en kilómetros
      const { latitud, longitud, distancia } = req.query;
  
      // Convertir la distancia a millas
      const distanciaMillas = distancia / 1.60934;
  
      // Consulta SQL para seleccionar las propiedades dentro del área especificada
      const sql = `
        SELECT *
        FROM dataDocs
        WHERE SQRT(POW(69.1 * (Latitud - ?), 2) + POW(69.1 * (? - Longitud) * COS(Latitud / 57.3), 2)) < ?
      `;
      
      // Ejecutar la consulta SQL con los parámetros proporcionados
      const [rows] = await query(sql, [latitud, longitud, distanciaMillas]);
  
      // Enviar la respuesta con la lista de propiedades en formato JSON
      res.json({ propiedades: rows });
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error al obtener la lista de propiedades.' });
    }
  });
  
module.exports = router;