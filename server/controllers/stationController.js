const SamplingStation = require('../models/SamplingStation');

exports.createStation = async (req, res) => {
  try {
    const station = await SamplingStation.create(req.body);
    res.status(201).json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStations = async (req, res) => {
  try {
    const stations = await SamplingStation.find();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStationById = async (req, res) => {
  try {
    const station = await SamplingStation.findById(req.params.id);
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStation = async (req, res) => {
  try {
    const station = await SamplingStation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteStation = async (req, res) => {
  try {
    const station = await SamplingStation.findByIdAndDelete(req.params.id);
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.json({ message: 'Station deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};