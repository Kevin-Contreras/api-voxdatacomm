let express = require('express');
let router = express.Router();
const csv = require('csv-parser');
const PDFDocument = require('pdfkit');
const {query} = require('../db/db.js');
const { Readable } = require('stream');
const { generateToken, verifyToken } = require('./jwt/jwt.js')
const cloudinary = require('../db/cloudinary.js')
const currentDate = new Date();
const formattedDate = currentDate.toISOString().replace(/:/g, '-');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

router.post("/api/register",  function(req, res){
    try{
        const sql = 'INSERT INTO usuariosData (user, password) VALUES (?, ?)';
        bcrypt.hash(req.body.password, 10, async (err, hash) => {
            if (err) {
              console.error('Error al hashear la contraseña:', err);
              return;
            }
            // El hash de la contraseña puede ser almacenado en la base de datos
    
            const result = await query(sql, [req.body.user, hash]);
            
            if(result.error){
                console.error('Error al registrar el usuario:', err);
                res.status(500).json({error: 'Hubo un error al registrar el usuario.',verificar:true})
            }else{
              
                res.json({response:"Usuario creado con exito"})

            }
    
          });

    }catch(err){
        console.error('Error al crear el usuario:', err);
        res.status(500).json({error: 'Hubo un error al crear el usuario.'})
    }
  

})


async function validarCredenciales(username, password) {
    try {
      // Crear una conexión a la base de datos
  
  
      // Definir la consulta SQL para obtener las credenciales del usuario
      const sql = 'SELECT * FROM usuariosData WHERE user = ?';
      // Ejecutar la consulta SQL con el nombre de usuario proporcionado
      const [rows] = await query(sql, [username]);
  
    
      // Si no se encuentra ningún usuario con ese nombre de usuario, devolver falso
      if (rows.length === 0) {
        return false;
      }
  
      // Obtener las credenciales del primer usuario encontrado
      const user = rows[0];
  
      // Comparar la contraseña proporcionada con la contraseña almacenada en la base de datos
      const match = await bcrypt.compare(password, user.password);
      
      // Devolver verdadero si las contraseñas coinciden, falso en caso contrario
      return match;
    } catch (error) {
      console.error('Error al validar las credenciales del usuario:', error);
      throw error; // Reenviar el error para que sea manejado por el código que llama a esta función
    }
  }
  

router.post('/api/login', async (req, res) => {
    // En un sistema real, aquí validarías las credenciales del usuario
    try {
        // Obtener el nombre de usuario y la contraseña del cuerpo de la solicitud
        const { user, password } = req.body;
    
        // Validar las credenciales del usuario
        const isValid = await validarCredenciales(user, password);
        (password)
        // Si las credenciales no son válidas, enviar un error de autenticación
        if (!isValid) {
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }
    
        // Si las credenciales son válidas, generar un token JWT y enviarlo como respuesta
        const token = generateToken({ user }); // Podrías incluir más información del usuario aquí si lo deseas
        res.json({ token ,user});
      } catch (error) {
        console.error('Error al procesar la solicitud de inicio de sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
      }
});

router.options('/api/upload', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});
router.post('/api/upload', verifyToken, (req, res) => {
    try {
        const results = [];
        const row = []
        const sql = 'INSERT INTO dataDocs SET ?';
        let { data } = req.body;
    
       (data,"kein")
                const csvContent = Buffer.from(data, 'base64').toString('utf8');
                // Convertir el contenido CSV a un flujo de lectura
                    Readable.from(csvContent)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                    const insertPromises = results.map(async (result)  => {
                      (result)
                        let data = {id:result.ID,
                            latitud: result.Latitud,
                            Longitud:result.Longitud,
                            Titulo: result.Titulo,
                            Anunciante: result.Anunciante,
                            Descripcion: result.Descripcion,
                            Reformado: result.Reformado,
                            Telefonos: result.Telefonos,
                            Tipo:result.Tipo,
                            Precio:result.Precio,
                            PrecioPorMetro: result["Precio por metro"],
                            Direccion: result.Direccion,
                            Provincia: result.Provincia,
                            Ciudad: result.Ciudad,
                            MetrosCuadrados: result["Metros cuadrados"],
                            Habitaciones: result.Habitaciones,
                            Banios: result.Banios,
                            Parking: result.Parking,
                            SegundaMano: result["Segunda mano"],
                            ArmariosEmpotrados: result["Armarios Empotrados"],
                            ConstruidoEn: result["Construido en"],
                            Amueblado: result.Amueblado,
                            CalefaccionIndividual: result["Calefacción individual"],
                            CertificacionEnergetica: result["Certificación energética"],
                            Planta: result.Planta,
                            Exterior: result.Exterior,
                            Interior: result.Interior,
                            Ascensor :result.Ascensor,
                            Fecha: result.Fecha,
                            Calle: result.Calle,
                            Barrio: result.Barrio,
                            Distrito: result.Distrito,
                            Terraza: result.Terraza,
                            Trastero: result.Trastero,
                            CocinaEquipada: result["Cocina Equipada"],
                            AireAcondicionado: result["Aire acondicionado"],
                            Piscina: result.Piscina,
                            Jardin: result.Jardin,
                            MetrosCuadradosUtiles: result["Metros cuadrados útiles"],
                            AptoParaPersonasConMovilidadReducida: result["Apto para personas con movilidad reducida"],
                            Plantas: result.Plantas,
                            SeAdmitenMascotas: result["Se admiten mascotas"],
                            Balcon: result["Balcón"]
                      }
                        let resultado = await query(sql,data)
                        row.push(data)
    
    
        
                    }
    
                    )
                    await Promise.all(insertPromises);
    
                    // En este punto, 'results' contendrá los datos del archivo CSV
                    // Puedes hacer lo que quieras con los datos aquí
                    res.json(row);
                });
    }catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
   
        

  
});
router.options('/api/generar-reporte', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});
// Endpoint POST para generar y guardar un reporte en formato PDF o CSV
router.post('/api/generar-reporte', verifyToken , async (req, res) => {
    try {
  
      // Obtener los parámetros de filtro, coordenadas y tipo de reporte
      const { precioMinimo, precioMaximo,tipoReporte,Balcon,Piscina,jardin,friendly,MetrosCuadrados,habitaciones, } = req.body;
      // Construir la consulta SQL dinámicamente basada en los parámetros proporcionados
      let sql = 'SELECT * FROM dataDocs WHERE 1=1';
      let sqlFind = 'SELECT * FROM dataDocs';

      const params = [];
      if(Balcon){
      sql += ` AND Balcon = ${"'"+Balcon+"'"}`;
    }
    if(Piscina){
      sql += ` AND Piscina = ${"'"+Piscina+"'"}`;
    }
    if(jardin){
      sql += ` AND Jardin = ${"'"+jardin+"'"}`;
    }
    if(friendly){
      sql += ` AND SeAdmitenMascotas = ${"'"+friendly+"'"}`;
    }
    if(MetrosCuadrados){
      sql += ` AND MetrosCuadrados = ?`;
      params.push(parseInt(MetrosCuadrados))
    }
    if (habitaciones) {
      sql += ` AND Habitaciones = ?`;
      params.push(habitaciones)
    }

    if (precioMinimo) {
      sql += ` AND Precio >= ?`;
      params.push(parseInt(precioMinimo) );
    }

    if (precioMaximo) {
      sql += ` AND Precio <= ?`;
      params.push(parseInt(precioMaximo) );
    }
  
      // Ejecutar la consulta SQL con los parámetros proporcionados
      const [rows] = await query(sql,  params);
      const [rowsFind] = await query(sqlFind);

      // Generar el reporte según el tipo especificado
      if (tipoReporte === 'PDF') {
        (rows)
        if(rows.length!=0){
          let buffer = Buffer.alloc(0);

          // Crear el documento PDF
          const pdfDoc = new PDFDocument({ bufferPages: true });
          
          // Establecer el título del documento
          pdfDoc.fontSize(10).text('Reporte de Propiedades', { align: 'center' });
          pdfDoc.moveDown();
          
          // Escribir los datos en el documento PDF
          rows.forEach(row => {
            Object.keys(row).forEach(key => {
              pdfDoc.text(`${key}: ${row[key]}`);
            });
            pdfDoc.moveDown();
          });
          
          // Finalizar el documento PDF
          pdfDoc.end();
          
          // Escuchar el evento 'data' para almacenar los datos del PDF en el buffer
          pdfDoc.on('data', chunk => {
            buffer = Buffer.concat([buffer, chunk]);
          });
          
          // Escuchar el evento 'end' para convertir los datos del PDF a base64
          pdfDoc.on('end', () => {
            // Convertir los datos del PDF a base64
            const uniqueFileName = `${uuidv4()}`;
  
            const base64Data = buffer.toString('base64');
            cloudinary.uploader.upload(`data:image/png;base64,${base64Data}`, {
              folder:"files",
              public_id: uniqueFileName,
          
          },(error, result) => {

            
              res.json({file:result,data:rows})

          })
          
            // Utilizar el contenido base64 según sea necesario (por ejemplo, enviarlo como respuesta HTTP)
          });
        }else{

          res.json({data:rows})
        }
        
      } else if (tipoReporte === 'CSV') {
        if(rows.length!=0){
          const uniqueFileName = `${uuidv4()}.csv`;


            const header = Object.keys(rows[0]).join(';') + '\n';
    
    // Crea el cuerpo del CSV
    
    const body = rows.map(row => {
        // Obtén los pares clave-valor del objeto en el orden en que están definidos
        const keysInOrder = Object.keys(row);
        // Mapea los valores en el mismo orden que las claves
        const valuesInOrder = keysInOrder.map(key => row[key]);
        // Une los valores con comas para obtener la fila del CSV
        (valuesInOrder)
        return keysInOrder.map(key => row[key]).join(';');
    }).join('\n');
    
    // Concatena el encabezado y el cuerpo para obtener el contenido completo del CSV
    const csvContent = header + body;
    
    // Convierte el contenido del CSV a base64
    const base64Data = Buffer.from(csvContent).toString('base64');
    // Ahora puedes usar base64Data como necesites, por ejemplo, subirlo a Cloudinary
    cloudinary.uploader.upload(`data:text/csv;base64,${base64Data}`, {
        folder: "files",
        public_id: uniqueFileName,
        resource_type: "auto"
    }, (error, result) => {
        if (error) {
            console.error('Error al subir el archivo CSV a Cloudinary:', error);
            res.status(500).json({ error: 'Error al subir el archivo CSV a Cloudinary' });
        } else {
            res.json({file:result,data:rows})

           
        }
    });

        }else{
          res.json({data:rows})
        }

      } else {
        
        res.json({data:rows})
      
      }
  
    } catch (error) {
      res.status(500).json({ error: 'Hubo un error al generar el reporte.' });
    }
  });
  

module.exports = router;