const Client = require('../models/Client');

// POST /api/clients
const createClient = async (req, res, next) => {
  try {
    const client = await Client.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, client });
  } catch (err) {
    next(err);
  }
};

// GET /api/clients
const getClients = async (req, res, next) => {
  try {
    const clients = await Client.find({ userId: req.user._id }).sort({ name: 1 });
    res.json({ success: true, clients });
  } catch (err) {
    next(err);
  }
};

// GET /api/clients/:id
const getClient = async (req, res, next) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, userId: req.user._id });
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, client });
  } catch (err) {
    next(err);
  }
};

// PUT /api/clients/:id
const updateClient = async (req, res, next) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, client });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/clients/:id
const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, message: 'Client deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createClient, getClients, getClient, updateClient, deleteClient };
