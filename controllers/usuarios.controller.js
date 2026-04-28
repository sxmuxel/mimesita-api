const Usuario = require('../models/Usuario');

// @route   GET /api/usuarios
// @desc    Obtener todos los usuarios (admin)
// @access  Privado - Admin
const obtenerUsuarios = async (req, res, next) => {
  try {
    const { rol, activo, page = 1, limit = 10, buscar } = req.query;
    const filtro = {};

    if (rol) filtro.rol = rol;
    if (activo !== undefined) filtro.activo = activo === 'true';
    if (buscar) {
      filtro.$or = [
        { nombre: { $regex: buscar, $options: 'i' } },
        { apellido: { $regex: buscar, $options: 'i' } },
        { email: { $regex: buscar, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [usuarios, total] = await Promise.all([
      Usuario.find(filtro).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Usuario.countDocuments(filtro),
    ]);

    res.json({
      success: true,
      total,
      pagina: parseInt(page),
      totalPaginas: Math.ceil(total / parseInt(limit)),
      usuarios,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/usuarios/:id
// @desc    Obtener un usuario por ID (admin)
// @access  Privado - Admin
const obtenerUsuario = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado.' });
    }
    res.json({ success: true, usuario });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/usuarios
// @desc    Crear usuario (admin puede asignar roles)
// @access  Privado - Admin
const crearUsuario = async (req, res, next) => {
  try {
    const { nombre, apellido, email, password, telefono, rol } = req.body;

    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(409).json({ success: false, mensaje: 'Ya existe una cuenta con ese email.' });
    }

    const usuario = await Usuario.create({ nombre, apellido, email, password, telefono, rol });

    res.status(201).json({
      success: true,
      mensaje: 'Usuario creado exitosamente.',
      usuario,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/usuarios/:id
// @desc    Actualizar usuario (admin)
// @access  Privado - Admin
const actualizarUsuario = async (req, res, next) => {
  try {
    const { nombre, apellido, telefono, rol, activo } = req.body;

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { nombre, apellido, telefono, rol, activo },
      { new: true, runValidators: true }
    );

    if (!usuario) {
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado.' });
    }

    res.json({ success: true, mensaje: 'Usuario actualizado.', usuario });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/usuarios/:id
// @desc    Desactivar usuario (soft delete) (admin)
// @access  Privado - Admin
const eliminarUsuario = async (req, res, next) => {
  try {
    if (req.params.id === req.usuario._id.toString()) {
      return res.status(400).json({ success: false, mensaje: 'No puedes eliminarte a ti mismo.' });
    }

    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado.' });
    }

    res.json({ success: true, mensaje: 'Usuario desactivado correctamente.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { obtenerUsuarios, obtenerUsuario, crearUsuario, actualizarUsuario, eliminarUsuario };
