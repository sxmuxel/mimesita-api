// Manejo centralizado de errores

const manejarErrores = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let mensaje = err.message || 'Error interno del servidor';

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errores = Object.values(err.errors).map((e) => e.message);
    mensaje = errores.join('. ');
  }

  // Error de duplicado (clave única)
  if (err.code === 11000) {
    statusCode = 409;
    const campo = Object.keys(err.keyValue)[0];
    mensaje = `Ya existe un registro con ese ${campo}.`;
  }

  // Error de ID inválido de Mongoose
  if (err.name === 'CastError') {
    statusCode = 400;
    mensaje = `ID inválido: ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    mensaje,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Ruta no encontrada
const rutaNoEncontrada = (req, res) => {
  res.status(404).json({
    success: false,
    mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { manejarErrores, rutaNoEncontrada };
