const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Generar JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};


const registro = async (req, res, next) => {
  try {
    const { nombre, apellido, email, password, telefono, rol } = req.body;

    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(409).json({
        success: false,
        mensaje: 'Ya existe una cuenta con ese email.',
      });
    }

    const rolAsignado =
      req.usuario && req.usuario.rol === 'admin' ? rol || 'cliente' : 'cliente';

    const usuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password,
      telefono,
      rol: rolAsignado,
    });

    const token = generarToken(usuario._id);

    res.status(201).json({
      success: true,
      mensaje: 'Usuario registrado exitosamente.',
      token,
      usuario,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        mensaje: 'Email y contraseña son obligatorios.',
      });
    }

    const usuario = await Usuario.findOne({ email }).select('+password');
    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        success: false,
        mensaje: 'Credenciales incorrectas.',
      });
    }

    const passwordCorrecta = await usuario.compararPassword(password);
    if (!passwordCorrecta) {
      return res.status(401).json({
        success: false,
        mensaje: 'Credenciales incorrectas.',
      });
    }

    const token = generarToken(usuario._id);

    res.json({
      success: true,
      mensaje: 'Sesión iniciada exitosamente.',
      token,
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        telefono: usuario.telefono,
      },
    });
  } catch (error) {
    next(error);
  }
};

const obtenerPerfil = async (req, res) => {
  res.json({
    success: true,
    usuario: req.usuario,
  });
};

// @route   PUT /api/auth/perfil
// @desc    Actualizar perfil del usuario autenticado
// @access  Privado
const actualizarPerfil = async (req, res, next) => {
  try {
    const camposPermitidos = ['nombre', 'apellido', 'telefono'];
    const actualizaciones = {};
    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) actualizaciones[campo] = req.body[campo];
    });

    const usuario = await Usuario.findByIdAndUpdate(req.usuario._id, actualizaciones, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      mensaje: 'Perfil actualizado correctamente.',
      usuario,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/auth/cambiar-password
// @desc    Cambiar contraseña del usuario autenticado
// @access  Privado
const cambiarPassword = async (req, res, next) => {
  try {
    const { passwordActual, passwordNueva } = req.body;

    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({
        success: false,
        mensaje: 'Se requieren la contraseña actual y la nueva.',
      });
    }

    const usuario = await Usuario.findById(req.usuario._id).select('+password');
    const esCorrecta = await usuario.compararPassword(passwordActual);

    if (!esCorrecta) {
      return res.status(401).json({
        success: false,
        mensaje: 'La contraseña actual es incorrecta.',
      });
    }

    usuario.password = passwordNueva;
    await usuario.save(); // Activa el middleware pre-save para hashear

    const token = generarToken(usuario._id);

    res.json({
      success: true,
      mensaje: 'Contraseña actualizada correctamente.',
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registro, login, obtenerPerfil, actualizarPerfil, cambiarPassword };
