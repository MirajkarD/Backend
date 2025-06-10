const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    id: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    isVertical: { type: Boolean, default: false },
    isRoad: { type: Boolean, default: false },
    isGate: { type: Boolean, default: false },
    gateType: { type: String, enum: ['entry', 'exit'] },
    zone: { type: String, enum: ['NORMAL', 'VIP', 'EV', 'REGULAR'], default: 'NORMAL' },
    status: { type: String, default: 'Empty' }
});

const layoutSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slots: [slotSchema],
    metadata: {
        exportDate: { type: Date, default: Date.now },
        version: { type: String, default: '1.0' }
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Layout', layoutSchema);
