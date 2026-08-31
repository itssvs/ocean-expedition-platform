const Expedition = require('../models/Expedition');

exports.createExpedition = async (req, res) => {
  try {
    const expedition = await Expedition.create(req.body);
    res.status(201).json(expedition);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getExpeditions = async (req, res) => {
  try {
    const expeditions = await Expedition.find()
      .populate('vesselId', 'name registrationNumber status')
      .populate('leadScientistId', 'name email')
      .populate('crewIds', 'name role')
      .populate('equipmentIds', 'name type status')
      .populate('stationIds', 'name coordinates');
    res.json(expeditions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getExpeditionById = async (req, res) => {
  try {
    const expedition = await Expedition.findById(req.params.id)
      .populate('vesselId')
      .populate('leadScientistId', 'name email')
      .populate('crewIds', 'name role')
      .populate('equipmentIds')
      .populate('stationIds');
    if (!expedition) return res.status(404).json({ message: 'Expedition not found' });
    res.json(expedition);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateExpedition = async (req, res) => {
  try {
    const expedition = await Expedition.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expedition) return res.status(404).json({ message: 'Expedition not found' });
    res.json(expedition);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteExpedition = async (req, res) => {
  try {
    const expedition = await Expedition.findByIdAndDelete(req.params.id);
    if (!expedition) return res.status(404).json({ message: 'Expedition not found' });
    res.json({ message: 'Expedition deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};