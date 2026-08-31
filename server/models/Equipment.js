const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g. "sonar", "CTD sensor", "water sampler"
  serialNumber: { type: String, required: true, unique: true },
  calibrationDate: { type: Date },
  status: {
    type: String,
    enum: ['available', 'in-use', 'maintenance'],
    default: 'available'
  },
  assignedExpeditionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expedition', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);