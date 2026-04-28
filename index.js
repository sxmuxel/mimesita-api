require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { manejarErrores, rutaNoEncontrada } = require('./middlewares/error.middleware');

// Importar routers
const authRoutes = require('./routes/auth.routes');
const {
  routerUsuarios,
  routerRestaurantes,
  routerMesas,
  routerReservas,
  routerMenu,
} = require('./routes/index.routes');

// Conectar a MongoDB
connectDB();

const app = express();

// ─── Middlewares globales ───────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Logger básico (desarrollo) ────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ─── Ruta raíz / health check ──────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    success: true,
    app: 'MiMesita API',
    version: '1.0.0',
    descripcion: 'Sistema de Gestión de Reservas para Restaurantes',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      restaurantes: '/api/restaurantes',
      mesas: '/api/mesas',
      reservas: '/api/reservas',
      menu: '/api/menu',
    },
  });
});

// ─── Rutas de la API ───────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', routerUsuarios);
app.use('/api/restaurantes', routerRestaurantes);
app.use('/api/mesas', routerMesas);
app.use('/api/reservas', routerReservas);
app.use('/api/menu', routerMenu);

// ─── Manejo de errores ─────────────────────────────────────────────
app.use(rutaNoEncontrada);
app.use(manejarErrores);

// ─── Iniciar servidor ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  
  ║           MiMesita API           
  ║  Sistema de Reservas para Restaurantes  
  ║  Servidor:  http://localhost:${PORT}     
  `);
});

module.exports = app;
