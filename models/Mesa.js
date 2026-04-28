const mongoose = require('mongoose');

const mesaSchema = new mongoose.Schema(
  {
    restaurante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurante',
      required: [true, 'El restaurante es obligatorio'],
    },
    numero: {
      type: Number,
      required: [true, 'El numero de mesa es obligatorio'],
      min: [1, 'El numero de mesa debe ser al menos 1'],
    },
    capacidad: {
      type: Number,
      required: [true, 'La capacidad de la mesa es obligatoria'],
      min: [1, 'La capacidad debe ser al menos 1'],
      max: [30, 'La capacidad no puede superar 30 personas'],
    },
    ubicacion: {
      type: String,
      enum: ['interior', 'exterior', 'terraza', 'privado', 'barra'],
      default: 'interior',
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [300, 'La descripcion debe tener menos de 300 caracteres'],
    },
    disponible: {
      type: Boolean,
      default: true,
    },
    activa: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


mesaSchema.index({ restaurante: 1, numero: 1 }, { unique: true });

module.exports = mongoose.model('Mesa', mesaSchema);
