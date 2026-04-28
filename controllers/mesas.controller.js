const Mesa = require('../models/Mesa');
const Restaurante = require('../models/Restaurante');


const obtenerMesas = async (req, res, next) => {
  try {
    const { restaurante, disponible, ubicacion, capacidadMin } = req.query;
    const filtro = { activa: true };

    if (restaurante) filtro.restaurante = restaurante;
    if (disponible !== undefined) filtro.disponible = disponible === 'true';
    if (ubicacion) filtro.ubicacion = ubicacion;
    if (capacidadMin) filtro.capacidad = { $gte: parseInt(capacidadMin) };

    const mesas = await Mesa.find(filtro)
      .populate('restaurante', 'nombre direccion')
      .sort({ numero: 1 });

    res.json({ success: true, total: mesas.length, mesas });
  } catch (error) {
    next(error);
  }
};


const obtenerMesa = async (req, res, next) => {
  try {
    const mesa = await Mesa.findById(req.params.id).populate('restaurante', 'nombre');
    if (!mesa) {
      return res.status(404).json({ success: false, mensaje: 'Mesa no encontrada.' });
    }
    res.json({ success: true, mesa });
  } catch (error) {
    next(error);
  }
};


const obtenerMesasDeRestaurante = async (req, res, next) => {
  try {
    const restaurante = await Restaurante.findById(req.params.restauranteId);
    if (!restaurante) {
      return res.status(404).json({ success: false, mensaje: 'Restaurante no encontrado.' });
    }

    const mesas = await Mesa.find({
      restaurante: req.params.restauranteId,
      activa: true,
    }).sort({ numero: 1 });

    res.json({ success: true, total: mesas.length, mesas });
  } catch (error) {
    next(error);
  }
};


const crearMesa = async (req, res, next) => {
  try {
    const mesa = await Mesa.create(req.body);
    res.status(201).json({ success: true, mensaje: 'Mesa creada exitosamente.', mesa });
  } catch (error) {
    next(error);
  }
};


const actualizarMesa = async (req, res, next) => {
  try {
    const mesa = await Mesa.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!mesa) {
      return res.status(404).json({ success: false, mensaje: 'Mesa no encontrada.' });
    }
    res.json({ success: true, mensaje: 'Mesa actualizada.', mesa });
  } catch (error) {
    next(error);
  }
};


const eliminarMesa = async (req, res, next) => {
  try {
    const mesa = await Mesa.findByIdAndUpdate(req.params.id, { activa: false }, { new: true });
    if (!mesa) {
      return res.status(404).json({ success: false, mensaje: 'Mesa no encontrada.' });
    }
    res.json({ success: true, mensaje: 'Mesa desactivada correctamente.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerMesas,
  obtenerMesa,
  obtenerMesasDeRestaurante,
  crearMesa,
  actualizarMesa,
  eliminarMesa,
};
