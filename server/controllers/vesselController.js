const Vessel = require('../models/Vessel');

exports.createVessel = async (req, res) => {
  try {
    const vessel = await Vessel.create(req.body);
    res.status(201).json(vessel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getVessels = async (req, res) => {
  try {
    const vessels = await Vessel.find().populate('assignedCrew', 'name email role');
    res.json(vessels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getVesselById = async (req, res) => {
  try {
    const vessel = await Vessel.findById(req.params.id).populate('assignedCrew', 'name email role');
    if (!vessel) return res.status(404).json({ message: 'Vessel not found' });
    res.json(vessel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateVessel = async (req, res) => {
  try {
    const vessel = await Vessel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vessel) return res.status(404).json({ message: 'Vessel not found' });
    res.json(vessel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteVessel = async (req, res) => {
  try {
    const vessel = await Vessel.findByIdAndDelete(req.params.id);
    if (!vessel) return res.status(404).json({ message: 'Vessel not found' });
    res.json({ message: 'Vessel deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};