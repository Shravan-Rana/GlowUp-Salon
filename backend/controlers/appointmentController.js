
const Appointment = require("../models/Appointment.");
const Service = require("../models/Service");
const mongoose = require("mongoose");

// Get current date and time in India
const getIndiaDateTime = () => {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).formatToParts(new Date());

    const values = {};

    parts.forEach((part) => {
        values[part.type] = part.value;
    });

    return {
        date: `${values.year}-${values.month}-${values.day}`,
        minutes: Number(values.hour) * 60 + Number(values.minute)
    };
};

// Convert 10:00 AM into minutes
const convertTimeToMinutes = (time) => {
    const [clock, period] = time.split(" ");
    let [hours, minutes] = clock.split(":").map(Number);

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
};


// 1. Book Appointment
const createAppointment = async (req, res) => {
    try {
        const { service, appointmentDate, appointmentTime } = req.body;

        // Required fields
        if (!service || !appointmentDate || !appointmentTime) {
            return res.status(400).json({
                message: "Please provide service, date and time."
            });
        }

        // Validate MongoDB service ID
        if (!mongoose.isValidObjectId(service)) {
            return res.status(400).json({
                message: "Invalid service ID."
            });
        }

        // Validate date format
        if (
            typeof appointmentDate !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)
        ) {
            return res.status(400).json({
                message: "Invalid appointment date."
            });
        }

        const parsedDate = new Date(`${appointmentDate}T00:00:00Z`);

        if (
            isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !== appointmentDate
        ) {
            return res.status(400).json({
                message: "Invalid appointment date."
            });
        }

        // Validate appointment time
        const allowedTimes = [
            "10:00 AM", "11:00 AM", "12:00 PM",
            "01:00 PM", "02:00 PM", "03:00 PM",
            "04:00 PM", "05:00 PM", "06:00 PM",
            "07:00 PM"
        ];

        if (!allowedTimes.includes(appointmentTime)) {
            return res.status(400).json({
                message: "Please select a valid appointment time."
            });
        }

        // Check date and time using India timezone
        const current = getIndiaDateTime();

        if (appointmentDate < current.date) {
            return res.status(400).json({
                message: "Please select today or a future date."
            });
        }

        if (
            appointmentDate === current.date &&
            convertTimeToMinutes(appointmentTime) <= current.minutes
        ) {
            return res.status(400).json({
                message: "This appointment time has already passed."
            });
        }

        // Check whether service exists
        const selectedService = await Service.findById(service);

        if (!selectedService) {
            return res.status(404).json({
                message: "Service not found."
            });
        }

        // Create appointment at midnight India time
        const date = new Date(`${appointmentDate}T00:00:00+05:30`);

        const appointment = await Appointment.create({
            user: req.user._id,
            service,
            appointmentDate: date,
            appointmentTime
        });

        res.status(201).json({
            message: "Appointment booked successfully!",
            appointment
        });

    } catch (error) {
        console.error("Booking Error:", error);

        res.status(500).json({
            message: "Unable to book appointment."
        });
    }
};


// 2. Get Logged-in User Appointments
const getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({
            user: req.user._id
        })
            .populate("service", "name price duration")
            .sort({ createdAt: -1 });

        res.status(200).json({
            appointments
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// 3. Cancel Appointment
const cancelAppointment = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid appointment ID."
            });
        }

        const appointment = await Appointment.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user._id,
                status: "Pending"
            },
            {
                status: "Cancelled"
            },
            {
                new: true
            }
        );

        if (!appointment) {
            return res.status(404).json({
                message: "Pending appointment not found."
            });
        }

        res.status(200).json({
            message: "Appointment cancelled successfully!",
            appointment
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


const getBookedSlots = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                message: "Please provide a valid date."
            });
        }

        const startDate = new Date(`${date}T00:00:00+05:30`);

        if (
            isNaN(startDate.getTime()) ||
            startDate.toISOString().slice(0, 10) !==
                new Date(`${date}T00:00:00+05:30`).toISOString().slice(0, 10)
        ) {
            return res.status(400).json({
                message: "Invalid date."
            });
        }

        const endDate = new Date(
            startDate.getTime() + 24 * 60 * 60 * 1000
        );

        const appointments = await Appointment.find({
            appointmentDate: {
                $gte: startDate,
                $lt: endDate
            },
            status: { $in: ["Pending", "Confirmed"] }
        }).select("appointmentTime -_id");

        const bookedSlots = appointments.map(
            (appointment) => appointment.appointmentTime
        );

        res.status(200).json({ bookedSlots });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};



module.exports = {
     createAppointment,
    getMyAppointments,
    cancelAppointment,
    getBookedSlots
};