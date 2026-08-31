const mongoose = require('mongoose');

const vesselSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true }, // crew capacity
  status: {
    type: String,
    enum: ['docked', 'at-sea', 'maintenance'],
    default: 'docked'
  },
  homePort: {
    lat: { type: Number },
    lng: { type: Number }
  },
  currentPosition: {
    lat: { type: Number },
    lng: { type: Number }
  },
  assignedCrew: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Vessel', vesselSchema);