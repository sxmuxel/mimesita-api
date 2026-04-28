const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema(
  {
    cliente: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El cliente es obligatorio'],
    },
    restaurante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurante',
      required: [true, 'El restaurante es obligatorio'],
    },
    mesa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mesa',
      required: [true, 'La mesa es obligatoria'],
    },
    fecha: {
      type: Date,
      required: [true, 'La fecha es obligatoria'],
    },
    horaInicio: {
      type: String,
      required: [true, 'La hora de inicio es obligatoria'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)'],
    },
    horaFin: {
      type: String,
      required: [true, 'La hora de fin es obligatoria'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)'],
    },
    numeroPersonas: {
      type: Number,
      required: [true, 'El numero de personas es obligatorio'],
      min: [1, 'Debe haber minimo 1 persona'],
    },
    estado: {
      type: String,
      enum: ['pendiente', 'confirmada', 'cancelada', 'completada', 'no_presentado'],
      default: 'pendiente',
    },
    ocasionEspecial: {
      type: String,
      enum: ['ninguna', 'cumpleanos', 'aniversario', 'reunion_negocios', 'otra'],
      default: 'ninguna',
    },
    peticionesEspeciales: {
      type: String,
      trim: true,
      maxlength: [500, 'Las peticiones no pueden ser mayores a 500 caracteres'],
    },
    codigoReserva: {
      type: String,
      unique: true,
    },
    historialEstados: [
      {
        estado: String,
        fecha: { type: Date, default: Date.now },
        modificadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


reservaSchema.pre('save', function (next) {
  if (!this.codigoReserva) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.codigoReserva = `MM-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Reserva', reservaSchema);
