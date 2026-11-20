
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import Toast from "../components/Toast";
import "./BookAppointment.css";

const timeSlots = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM"
];

function BookAppointment() {
    const { serviceId } = useParams();
    const navigate = useNavigate();

    const [service, setService] = useState(null);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [bookedSlots, setBookedSlots] = useState([]);

    const [toast, setToast] = useState({
        message: "",
        type: "success"
    });

    const showToast = (message, type = "success") => {
        setToast({ message, type });
    };

    const closeToast = () => {
        setToast({ message: "", type: "success" });
    };

    const today = new Date();

    const minDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    // Convert 12-hour time into minutes
    const convertTimeToMinutes = (slot) => {
        const [clock, period] = slot.split(" ");
        let [hours, minutes] = clock.split(":").map(Number);

        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;

        return hours * 60 + minutes;
    };

    // Check whether a time slot has already passed
    const isPastSlot = (slot) => {
        if (date !== minDate) return false;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        return convertTimeToMinutes(slot) <= currentMinutes;
    };

    // Fetch selected service
    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
            return;
        }

        const fetchService = async () => {
            try {
                const response = await API.get("/services");

                const selectedService = response.data.find(
                    (item) => item._id === serviceId
                );

                if (!selectedService) {
                    setError("Selected service was not found.");
                    showToast("Selected service was not found.", "error");
                } else {
                    setService(selectedService);
                }
            } catch (err) {
                setError("Unable to load service details.");
                showToast("Unable to load service details.", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchService();
    }, [serviceId, navigate]);

    // Fetch booked slots whenever date changes
    useEffect(() => {
        if (!date) {
            setBookedSlots([]);
            setTime("");
            return;
        }

        const fetchBookedSlots = async () => {
            try {
                setAvailabilityLoading(true);
                setError("");

                const response = await API.get(
                    `/appointments/availability?date=${date}`
                );

                const slots = response.data.bookedSlots || [];

                setBookedSlots(slots);

                setTime((currentTime) =>
                    slots.includes(currentTime) ? "" : currentTime
                );

            } catch (err) {
                console.error("Unable to fetch available slots:", err);

                setError("Unable to check appointment availability.");
                showToast(
                    "Unable to check appointment availability.",
                    "error"
                );

            } finally {
                setAvailabilityLoading(false);
            }
        };

        fetchBookedSlots();
    }, [date]);

    // Handle booking
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        closeToast();

        if (!date || !time) {
            const message = "Please select appointment date and time.";
            setError(message);
            showToast(message, "error");
            return;
        }

        if (date < minDate) {
            const message = "Please select today or a future date.";
            setError(message);
            showToast(message, "error");
            return;
        }

        if (isPastSlot(time)) {
            const message =
                "This time has already passed. Please select another time.";

            setError(message);
            showToast(message, "error");
            return;
        }

        if (bookedSlots.includes(time)) {
            const message =
                "This time slot is already booked. Please select another.";

            setError(message);
            setTime("");
            showToast(message, "error");
            return;
        }

        try {
            setSubmitting(true);

            await API.post("/appointments", {
                service: serviceId,
                appointmentDate: date,
                appointmentTime: time
            });

            setSuccess(true);

            showToast(
                "Appointment booked successfully!",
                "success"
            );

        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Booking failed. Please try again.";

            setError(errorMessage);
            showToast(errorMessage, "error");

        } finally {
            setSubmitting(false);
        }
    };

    // Header
    const Header = () => (
        <header className="booking-header">
            <Link to="/" className="booking-logo">
                Glow<span>Up.</span>
            </Link>

            <nav className="booking-nav">
                <Link to="/">Home</Link>
                <a href="/#services">Services</a>
                <a href="/#about">About</a>
            </nav>

            <div className="booking-nav-actions">
                <Link
                    to="/my-appointments"
                    className="header-appointment-btn"
                >
                    My Appointments
                </Link>
            </div>
        </header>
    );

    // Footer
    const Footer = () => (
        <footer className="booking-footer">
            <div className="footer-content">

                <div className="footer-brand">
                    <Link to="/" className="footer-logo">
                        Glow<span>Up.</span>
                    </Link>

                    <p>
                        Your beauty, our passion. Experience professional
                        salon services designed to make you feel confident.
                    </p>
                </div>

                <div className="footer-links">
                    <h3>Quick Links</h3>
                    <Link to="/">Home</Link>
                    <a href="/#services">Services</a>
                    <a href="/#about">About Us</a>
                    <Link to="/my-appointments">My Appointments</Link>
                </div>

                <div className="footer-contact">
                    <h3>Get In Touch</h3>
                    <p>We are here to make you feel beautiful.</p>
                    <p>Book your next salon experience with GlowUp.</p>
                </div>

            </div>

            <div className="footer-bottom">
                <p>
                    © {new Date().getFullYear()} GlowUp Salon.
                    All rights reserved.
                </p>
            </div>
        </footer>
    );

    if (loading) {
        return (
            <div className="booking-page">
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />
                <Header />
                <div className="booking-message">
                    Loading service details...
                </div>
                <Footer />
            </div>
        );
    }

    // Success Screen
    if (success) {
        return (
            <div className="booking-page">

                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />

                <Header />

                <div className="booking-card success-card">
                    <div className="success-icon">✓</div>

                    <h1>Appointment Booked!</h1>

                    <p>
                        Your appointment request has been submitted successfully.
                    </p>

                    <Link to="/my-appointments" className="booking-btn">
                        View My Appointments
                    </Link>

                    <Link to="/" className="back-link">
                        Back to Home
                    </Link>
                </div>

                <Footer />

            </div>
        );
    }

    // Main Booking Page
    return (
        <div className="booking-page">

            <Toast
                message={toast.message}
                type={toast.type}
                onClose={closeToast}
            />

            <Header />

            <div className="booking-layout">

                {/* Booking Form */}
                <div className="booking-card">

                    <p className="booking-tag">GLOWUP SALON</p>

                    <h1>Book Your Appointment</h1>

                    <p className="booking-subtitle">
                        Choose your preferred date and time.
                    </p>

                    <form onSubmit={handleSubmit}>

                        <div className="booking-field">
                            <label htmlFor="appointment-date">
                                Appointment Date
                            </label>

                            <input
                                id="appointment-date"
                                type="date"
                                min={minDate}
                                value={date}
                                onChange={(e) => {
                                    setDate(e.target.value);
                                    setTime("");
                                    setError("");
                                    closeToast();
                                }}
                                required
                            />
                        </div>

                        <div className="booking-field">

                            <label>Choose Appointment Time</label>

                            {!date && (
                                <p className="slot-instruction">
                                    Please select a date first.
                                </p>
                            )}

                            {date && availabilityLoading && (
                                <p className="slot-instruction">
                                    Checking available slots...
                                </p>
                            )}

                            {date && !availabilityLoading && (
                                <div className="time-slot-grid">

                                    {timeSlots.map((slot) => {
                                        const isBooked = bookedSlots.includes(slot);
                                        const isPast = isPastSlot(slot);
                                        const isDisabled = isBooked || isPast;

                                        return (
                                            <button
                                                type="button"
                                                key={slot}
                                                disabled={isDisabled}
                                                className={`time-slot ${
                                                    time === slot ? "selected" : ""
                                                } ${
                                                    isBooked ? "booked" : ""
                                                }`}
                                                onClick={() => {
                                                    setTime(slot);
                                                    setError("");
                                                    closeToast();
                                                }}
                                            >
                                                {slot}

                                                {isBooked && (
                                                    <span>Booked</span>
                                                )}

                                                {!isBooked && isPast && (
                                                    <span>Passed</span>
                                                )}
                                            </button>
                                        );
                                    })}

                                </div>
                            )}

                        </div>

                        {error && (
                            <p className="booking-error">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                !service ||
                                !date ||
                                !time ||
                                availabilityLoading
                            }
                            className="booking-btn"
                        >
                            {submitting
                                ? "Booking..."
                                : "Confirm Appointment"}
                        </button>

                    </form>

                    <Link to="/" className="back-link">
                        ← Back to Services
                    </Link>

                </div>

                {/* Booking Summary */}
                <div className="booking-summary-card">

                    <p className="booking-tag">YOUR SELECTION</p>

                    <h2>Booking Summary</h2>

                    {service && (
                        <div className="booking-summary-service">

                            <div className="summary-image">
                                <img
                                    src={
                                        service.image ||
                                        "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800"
                                    }
                                    alt={service.name}
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src =
                                            "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800";
                                    }}
                                />
                            </div>

                            <h3>{service.name}</h3>

                            <p>{service.description}</p>

                            <div className="summary-row">
                                <span>Duration</span>
                                <strong>{service.duration} Minutes</strong>
                            </div>

                            <div className="summary-row">
                                <span>Appointment Date</span>
                                <strong>{date || "Not selected"}</strong>
                            </div>

                            <div className="summary-row">
                                <span>Appointment Time</span>
                                <strong>{time || "Not selected"}</strong>
                            </div>

                            <div className="summary-total">
                                <span>Total Amount</span>
                                <h2>₹{service.price}</h2>
                            </div>

                        </div>
                    )}

                    <div className="booking-note">
                        <span>✦</span>
                        Your appointment will be submitted for confirmation.
                    </div>

                </div>

            </div>

            <Footer />

        </div>
    );
}

export default BookAppointment;
