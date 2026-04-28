const Reserva = require('../models/Reserva');
const Mesa = require('../models/Mesa');

// Verificar disponibilidad de una mesa en fecha/hora
const verificarDisponibilidad = async (mesaId, fecha, horaInicio, horaFin, reservaIdExcluir = null) => {
  const filtro = {
    mesa: mesaId,
    fecha: new Date(fecha),
    estado: { $nin: ['cancelada', 'no_presentado'] },
    $or: [
      { horaInicio: { $lt: horaFin }, horaFin: { $gt: horaInicio } },
    ],
  };
  if (reservaIdExcluir) filtro._id = { $ne: reservaIdExcluir };

  const conflicto = await Reserva.findOne(filtro);
  return !conflicto;
};

// @route   GET /api/reservas
// @desc    Obtener reservas (admin/empleado: todas; cliente: las propias)
// @access  Privado
const obtenerReservas = async (req, res, next) => {
  try {
    const { estado, restaurante, fecha, page = 1, limit = 10 } = req.query;
    const filtro = {};

    // Clientes solo ven sus propias reservas
    if (req.usuario.rol === 'cliente') filtro.cliente = req.usuario._id;
    if (estado) filtro.estado = estado;
    if (restaurante) filtro.restaurante = restaurante;
    if (fecha) filtro.fecha = new Date(fecha);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reservas, total] = await Promise.all([
      Reserva.find(filtro)
        .populate('cliente', 'nombre apellido email telefono')
        .populate('restaurante', 'nombre direccion')
        .populate('mesa', 'numero capacidad ubicacion')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ fecha: -1, horaInicio: 1 }),
      Reserva.countDocuments(filtro),
    ]);

    res.json({
      success: true,
      total,
      pagina: parseInt(page),
      totalPaginas: Math.ceil(total / parseInt(limit)),
      reservas,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/reservas/:id
// @desc    Obtener una reserva por ID
// @access  Privado
const obtenerReserva = async (req, res, next) => {
  try {
    const reserva = await Reserva.findById(req.params.id)
      .populate('cliente', 'nombre apellido email telefono')
      .populate('restaurante', 'nombre direccion telefono')
      .populate('mesa', 'numero capacidad ubicacion');

    if (!reserva) {
      return res.status(404).json({ success: false, mensaje: 'Reserva no encontrada.' });
    }

    // Clientes solo pueden ver sus propias reservas
    if (
      req.usuario.rol === 'cliente' &&
      reserva.cliente._id.toString() !== req.usuario._id.toString()
    ) {
      return res.status(403).json({ success: false, mensaje: 'Acceso denegado.' });
    }

    res.json({ success: true, reserva });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/reservas/codigo/:codigo
// @desc    Buscar reserva por código
// @access  Privado
const obtenerReservaPorCodigo = async (req, res, next) => {
  try {
    const reserva = await Reserva.findOne({ codigoReserva: req.params.codigo })
      .populate('cliente', 'nombre apellido email')
      .populate('restaurante', 'nombre')
      .populate('mesa', 'numero capacidad ubicacion');

    if (!reserva) {
      return res.status(404).json({ success: false, mensaje: 'Reserva no encontrada.' });
    }

    res.json({ success: true, reserva });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/reservas
// @desc    Crear una nueva reserva
// @access  Privado
const crearReserva = async (req, res, next) => {
  try {
    const { mesa: mesaId, fecha, horaInicio, horaFin, numeroPersonas, restaurante,
            ocasionEspecial, peticionesEspeciales } = req.body;

    // Verificar que la mesa existe
    const mesa = await Mesa.findById(mesaId);
    if (!mesa || !mesa.activa) {
      return res.status(404).json({ success: false, mensaje: 'Mesa no encontrada o inactiva.' });
    }

    // Verificar que la capacidad es suficiente
    if (numeroPersonas > mesa.capacidad) {
      return res.status(400).json({
        success: false,
        mensaje: `La mesa tiene capacidad para ${mesa.capacidad} personas, pero solicitaste ${numeroPersonas}.`,
      });
    }

    // Verificar disponibilidad
    const disponible = await verificarDisponibilidad(mesaId, fecha, horaInicio, horaFin);
    if (!disponible) {
      return res.status(409).json({
        success: false,
        mensaje: 'La mesa no está disponible en ese horario. Por favor elige otro horario o mesa.',
      });
    }

    // Asignar cliente: si es cliente, usa su propio ID; admin puede asignar a otro
    const clienteId =
      req.usuario.rol === 'cliente' ? req.usuario._id : req.body.cliente || req.usuario._id;

    const reserva = await Reserva.create({
      cliente: clienteId,
      restaurante,
      mesa: mesaId,
      fecha,
      horaInicio,
      horaFin,
      numeroPersonas,
      ocasionEspecial,
      peticionesEspeciales,
      historialEstados: [{ estado: 'pendiente', modificadoPor: req.usuario._id }],
    });

    const reservaPopulada = await Reserva.findById(reserva._id)
      .populate('cliente', 'nombre apellido email')
      .populate('restaurante', 'nombre')
      .populate('mesa', 'numero ubicacion');

    res.status(201).json({
      success: true,
      mensaje: `Reserva creada exitosamente. Tu código de reserva es: ${reserva.codigoReserva}`,
      reserva: reservaPopulada,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/reservas/:id
// @desc    Actualizar reserva
// @access  Privado
const actualizarReserva = async (req, res, next) => {
  try {
    const reserva = await Reserva.findById(req.params.id);
    if (!reserva) {
      return res.status(404).json({ success: false, mensaje: 'Reserva no encontrada.' });
    }

    // Cliente solo puede editar sus propias reservas y solo si están pendientes
    if (req.usuario.rol === 'cliente') {
      if (reserva.cliente.toString() !== req.usuario._id.toString()) {
        return res.status(403).json({ success: false, mensaje: 'Acceso denegado.' });
      }
      if (!['pendiente', 'confirmada'].includes(reserva.estado)) {
        return res.status(400).json({
          success: false,
          mensaje: 'Solo puedes modificar reservas pendientes o confirmadas.',
        });
      }
    }

    const { fecha, horaInicio, horaFin, numeroPersonas, peticionesEspeciales, ocasionEspecial } = req.body;

    // Si cambia horario/mesa, reverificar disponibilidad
    if (fecha || horaInicio || horaFin) {
      const disponible = await verificarDisponibilidad(
        reserva.mesa,
        fecha || reserva.fecha,
        horaInicio || reserva.horaInicio,
        horaFin || reserva.horaFin,
        reserva._id
      );
      if (!disponible) {
        return res.status(409).json({
          success: false,
          mensaje: 'La mesa no está disponible en ese horario.',
        });
      }
    }

    const actualizaciones = {};
    if (fecha) actualizaciones.fecha = fecha;
    if (horaInicio) actualizaciones.horaInicio = horaInicio;
    if (horaFin) actualizaciones.horaFin = horaFin;
    if (numeroPersonas) actualizaciones.numeroPersonas = numeroPersonas;
    if (peticionesEspeciales !== undefined) actualizaciones.peticionesEspeciales = peticionesEspeciales;
    if (ocasionEspecial) actualizaciones.ocasionEspecial = ocasionEspecial;

    const reservaActualizada = await Reserva.findByIdAndUpdate(req.params.id, actualizaciones, {
      new: true,
      runValidators: true,
    })
      .populate('cliente', 'nombre apellido email')
      .populate('restaurante', 'nombre')
      .populate('mesa', 'numero ubicacion');

    res.json({ success: true, mensaje: 'Reserva actualizada.', reserva: reservaActualizada });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/reservas/:id/estado
// @desc    Cambiar estado de una reserva
// @access  Privado
const cambiarEstadoReserva = async (req, res, next) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'completada', 'no_presentado'];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ success: false, mensaje: 'Estado inválido.' });
    }

    const reserva = await Reserva.findById(req.params.id);
    if (!reserva) {
      return res.status(404).json({ success: false, mensaje: 'Reserva no encontrada.' });
    }

    // Clientes solo pueden cancelar sus propias reservas
    if (req.usuario.rol === 'cliente') {
      if (reserva.cliente.toString() !== req.usuario._id.toString()) {
        return res.status(403).json({ success: false, mensaje: 'Acceso denegado.' });
      }
      if (estado !== 'cancelada') {
        return res.status(403).json({
          success: false,
          mensaje: 'Los clientes solo pueden cancelar sus reservas.',
        });
      }
    }

    reserva.estado = estado;
    reserva.historialEstados.push({ estado, modificadoPor: req.usuario._id });
    await reserva.save();

    res.json({ success: true, mensaje: `Estado cambiado a: ${estado}.`, reserva });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/reservas/:id
// @desc    Eliminar reserva (solo admin)
// @access  Privado - Admin
const eliminarReserva = async (req, res, next) => {
  try {
    const reserva = await Reserva.findByIdAndDelete(req.params.id);
    if (!reserva) {
      return res.status(404).json({ success: false, mensaje: 'Reserva no encontrada.' });
    }
    res.json({ success: true, mensaje: 'Reserva eliminada definitivamente.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerReservas,
  obtenerReserva,
  obtenerReservaPorCodigo,
  crearReserva,
  actualizarReserva,
  cambiarEstadoReserva,
  eliminarReserva,
};
