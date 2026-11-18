const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    workerId: { type: String, required: true, unique: true },
    zone: { type: String, required: true },
    status: { type: String, enum: ['SAFE', 'WARNING', 'CRITICAL'], default: 'SAFE' },
    envTemp: { type: Number, default: 25 },
    battery: { type: Number, default: 100 },
    connectivity: { type: String, default: 'Strong' }
}, { timestamps: true });

module.exports = mongoose.model('Worker', WorkerSchema);
