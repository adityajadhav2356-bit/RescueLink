const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    workerId: { type: String, required: true },
    task: { type: String, required: true },
    completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
