const router = require('express').Router();
const {
  registro,
  login,
  obtenerPerfil,
  actualizarPerfil,
  cambiarPassword,
} = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

/**
 * @module Auth
 * Rutas de autenticación y gestión de perfil
 */

// POST   /api/auth/registro      → Registrar nuevo usuario
router.post('/registro', registro);

// POST   /api/auth/login         → Iniciar sesión y obtener JWT
router.post('/login', login);

// GET    /api/auth/perfil        → Ver perfil propio (requiere JWT)
router.get('/perfil', verificarToken, obtenerPerfil);

// PUT    /api/auth/perfil        → Actualizar perfil propio (requiere JWT)
router.put('/perfil', verificarToken, actualizarPerfil);

// PUT    /api/auth/cambiar-password → Cambiar contraseña (requiere JWT)
router.put('/cambiar-password', verificarToken, cambiarPassword);

module.exports = router;
