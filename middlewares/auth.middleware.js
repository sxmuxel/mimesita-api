const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');


const verificarToken = async (req, res, next) => {
  try {
    let token;

    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        mensaje: 'Acceso denegado. Token no proporcionado.',
      });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    const usuario = await Usuario.findById(decoded.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        success: false,
        mensaje: 'Token invalido o usuario inactivo.',
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, mensaje: 'Token inválido.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, mensaje: 'Token expirado. Inicia sesión nuevamente.' });
    }
    res.status(500).json({ success: false, mensaje: 'Error interno del servidor.' });
  }
};


const restringirA = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        mensaje: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}.`,
      });
    }
    next();
  };
};

module.exports = { verificarToken, restringirA };
