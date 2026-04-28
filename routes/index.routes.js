// =====================================
// usuarios.routes.js
// =====================================
const routerUsuarios = require('express').Router();
const {
  obtenerUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} = require('../controllers/usuarios.controller');
const { verificarToken, restringirA } = require('../middlewares/auth.middleware');

routerUsuarios.use(verificarToken);
routerUsuarios.use(restringirA('admin'));

routerUsuarios.get('/', obtenerUsuarios);
routerUsuarios.get('/:id', obtenerUsuario);
routerUsuarios.post('/', crearUsuario);
routerUsuarios.put('/:id', actualizarUsuario);
routerUsuarios.delete('/:id', eliminarUsuario);

// =====================================
// restaurantes.routes.js
// =====================================
const routerRestaurantes = require('express').Router();
const {
  obtenerRestaurantes,
  obtenerRestaurante,
  crearRestaurante,
  actualizarRestaurante,
  eliminarRestaurante,
} = require('../controllers/restaurantes.controller');

// Rutas públicas
routerRestaurantes.get('/', obtenerRestaurantes);
routerRestaurantes.get('/:id', obtenerRestaurante);

// Rutas privadas - Admin
routerRestaurantes.post('/', verificarToken, restringirA('admin'), crearRestaurante);
routerRestaurantes.put('/:id', verificarToken, restringirA('admin'), actualizarRestaurante);
routerRestaurantes.delete('/:id', verificarToken, restringirA('admin'), eliminarRestaurante);

// =====================================
// mesas.routes.js
// =====================================
const routerMesas = require('express').Router();
const {
  obtenerMesas,
  obtenerMesa,
  obtenerMesasDeRestaurante,
  crearMesa,
  actualizarMesa,
  eliminarMesa,
} = require('../controllers/mesas.controller');

// Ruta pública: mesas de un restaurante
routerMesas.get('/restaurante/:restauranteId', obtenerMesasDeRestaurante);

// Rutas privadas
routerMesas.get('/', verificarToken, obtenerMesas);
routerMesas.get('/:id', verificarToken, obtenerMesa);
routerMesas.post('/', verificarToken, restringirA('admin', 'empleado'), crearMesa);
routerMesas.put('/:id', verificarToken, restringirA('admin', 'empleado'), actualizarMesa);
routerMesas.delete('/:id', verificarToken, restringirA('admin'), eliminarMesa);

// =====================================
// reservas.routes.js
// =====================================
const routerReservas = require('express').Router();
const {
  obtenerReservas,
  obtenerReserva,
  obtenerReservaPorCodigo,
  crearReserva,
  actualizarReserva,
  cambiarEstadoReserva,
  eliminarReserva,
} = require('../controllers/reservas.controller');

routerReservas.use(verificarToken);

routerReservas.get('/', obtenerReservas);
routerReservas.get('/codigo/:codigo', obtenerReservaPorCodigo);
routerReservas.get('/:id', obtenerReserva);
routerReservas.post('/', crearReserva);
routerReservas.put('/:id', actualizarReserva);
routerReservas.patch('/:id/estado', cambiarEstadoReserva);
routerReservas.delete('/:id', restringirA('admin'), eliminarReserva);

// =====================================
// menu.routes.js
// =====================================
const routerMenu = require('express').Router();
const {
  obtenerMenu,
  obtenerItemMenu,
  crearItemMenu,
  actualizarItemMenu,
  eliminarItemMenu,
} = require('../controllers/menu.controller');

// Rutas públicas
routerMenu.get('/', obtenerMenu);
routerMenu.get('/:id', obtenerItemMenu);

// Rutas privadas
routerMenu.post('/', verificarToken, restringirA('admin', 'empleado'), crearItemMenu);
routerMenu.put('/:id', verificarToken, restringirA('admin', 'empleado'), actualizarItemMenu);
routerMenu.delete('/:id', verificarToken, restringirA('admin'), eliminarItemMenu);

module.exports = {
  routerUsuarios,
  routerRestaurantes,
  routerMesas,
  routerReservas,
  routerMenu,
};
