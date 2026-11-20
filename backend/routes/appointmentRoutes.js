
const express = require("express");
const router = express.Router();

const protect = require("../middelware/authMiddleware");

const {
    createAppointment,
    getMyAppointments,
    cancelAppointment,
    getBookedSlots
} = require("../controlers/appointmentController");

router.post("/", protect, createAppointment);

router.get("/availability", protect, getBookedSlots);

router.get("/my", protect, getMyAppointments);

router.patch("/:id/cancel", protect, cancelAppointment);

module.exports = router;
