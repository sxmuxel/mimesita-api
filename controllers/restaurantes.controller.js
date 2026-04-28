const Restaurante = require('../models/Restaurante');


const obtenerRestaurantes = async (req, res, next) => {
  try {
    const { ciudad, tipoCocina, activo = true, page = 1, limit = 10, buscar } = req.query;
    const filtro = {};

    if (activo !== undefined) filtro.activo = activo === 'true';
    if (ciudad) filtro['direccion.ciudad'] = { $regex: ciudad, $options: 'i' };
    if (tipoCocina) filtro.tipoCocina = { $regex: tipoCocina, $options: 'i' };
    if (buscar) filtro.nombre = { $regex: buscar, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [restaurantes, total] = await Promise.all([
      Restaurante.find(filtro)
        .populate('administrador', 'nombre apellido email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ nombre: 1 }),
      Restaurante.countDocuments(filtro),
    ]);

    res.json({
      success: true,
      total,
      pagina: parseInt(page),
      totalPaginas: Math.ceil(total / parseInt(limit)),
      restaurantes,
    });
  } catch (error) {
    next(error);
  }
};

const obtenerRestaurante = async (req, res, next) => {
  try {
    const restaurante = await Restaurante.findById(req.params.id).populate(
      'administrador',
      'nombre apellido email'
    );
    if (!restaurante) {
      return res.status(404).json({ success: false, mensaje: 'Restaurante no encontrado.' });
    }
    res.json({ success: true, restaurante });
  } catch (error) {
    next(error);
  }
};


const crearRestaurante = async (req, res, next) => {
  try {
    const datos = { ...req.body };
    if (!datos.administrador) datos.administrador = req.usuario._id;

    const restaurante = await Restaurante.create(datos);
    res.status(201).json({
      success: true,
      mensaje: 'Restaurante creado exitosamente.',
      restaurante,
    });
  } catch (error) {
    next(error);
  }
};


const actualizarRestaurante = async (req, res, next) => {
  try {
    const restaurante = await Restaurante.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!restaurante) {
      return res.status(404).json({ success: false, mensaje: 'Restaurante no encontrado.' });
    }
    res.json({ success: true, mensaje: 'Restaurante actualizado.', restaurante });
  } catch (error) {
    next(error);
  }
};


const eliminarRestaurante = async (req, res, next) => {
  try {
    const restaurante = await Restaurante.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );
    if (!restaurante) {
      return res.status(404).json({ success: false, mensaje: 'Restaurante no encontrado.' });
    }
    res.json({ success: true, mensaje: 'Restaurante desactivado correctamente.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerRestaurantes,
  obtenerRestaurante,
  crearRestaurante,
  actualizarRestaurante,
  eliminarRestaurante,
};
