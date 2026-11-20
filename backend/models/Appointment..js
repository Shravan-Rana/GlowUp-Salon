
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        service: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true
        },

        appointmentDate: {
            type: Date,
            required: true
        },

        appointmentTime: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["Pending", "Confirmed", "Cancelled"],
            default: "Pending"
        }
    },
    { timestamps: true }
);

// Prevent duplicate active bookings
appointmentSchema.index(
    {
        appointmentDate: 1,
        appointmentTime: 1
    },
    {
        unique: true,
        partialFilterExpression: {
            status: { $in: ["Pending", "Confirmed"] }
        }
    }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
