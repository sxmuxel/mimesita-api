const mongoose = require('mongoose');

const itemMenuSchema = new mongoose.Schema(
  {
    restaurante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurante',
      required: [true, 'El restaurante es muy obligatorio'],
    },
    nombre: {
      type: String,
      required: [true, 'El nombre del plato es obligatorio'],
      trim: true,
      maxlength: [150, 'El nombre no puede superar 150 caracteres'],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede superar 500 caracteres'],
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    categoria: {
      type: String,
      enum: ['entrada', 'sopa', 'ensalada', 'plato_principal', 'postre', 'bebida', 'especial'],
      required: [true, 'La categoría es obligatoria'],
    },
    disponible: {
      type: Boolean,
      default: true,
    },
    vegetariano: {
      type: Boolean,
      default: false,
    },
    vegano: {
      type: Boolean,
      default: false,
    },
    sinGluten: {
      type: Boolean,
      default: false,
    },
    alergenos: [
      {
        type: String,
        enum: ['gluten', 'lacteos', 'huevos', 'frutos_secos', 'mariscos', 'pescado', 'soya', 'sesamo'],
      },
    ],
    tiempoPreparacion: {
      type: Number, // En minutos
      min: [0, 'El tiempo no puede ser menor a 0'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('ItemMenu', itemMenuSchema);
