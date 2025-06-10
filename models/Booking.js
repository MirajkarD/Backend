const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    numberPlate: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    entryTime: { type: Date, required: true },
    exitTime: { type: Date, required: true },
    slotNumber: { type: Number, required: true },
    parkingLevel: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: "pending" 
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    amount: {
        type: Number,
        required: true
    },
    paymentTimestamp: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
