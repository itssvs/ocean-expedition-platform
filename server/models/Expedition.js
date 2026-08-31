const mongoose = require('mongoose');

const expeditionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['planned', 'ongoing', 'completed', 'cancelled'],
    default: 'planned'
  },
  vesselId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vessel', required: true },
  leadScientistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  crewIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  equipmentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' }],
  stationIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SamplingStation' }],
  route: [{
    lat: Number,
    lng: Number,
    order: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('Expedition', expeditionSchema);