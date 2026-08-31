const mongoose = require('mongoose');

const samplingStationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  depth: { type: Number }, // in meters
  parameters: [{ type: String }], // e.g. ["temperature", "salinity", "pH"]
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('SamplingStation', samplingStationSchema);