const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    workerId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    location: { type: String, required: true },
    time: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false }
});

module.exports = mongoose.model('Alert', AlertSchema);
