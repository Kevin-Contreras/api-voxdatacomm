const jwt = require('jsonwebtoken');
const secretKey = 'secretoSuperSeguro123'; // Cambia esto por una clave secreta segura en producción

// Función para generar un token JWT
function generateToken(user) {
    return jwt.sign({ user }, secretKey, { expiresIn: '24h' });
}

// Función para verificar un token JWT
function verifyToken(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Token de autorización no proporcionado' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token de autorización inválido' });
        }
        req.user = decoded.user;
        next();
    });
}


module.exports = {generateToken, verifyToken}