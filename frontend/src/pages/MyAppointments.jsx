
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Toast from "../components/Toast";
import "./MyAppointments.css";

function MyAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    // Toast state
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

    // Fetch appointments
    const fetchAppointments = async () => {
        try {
            setError("");

            const response = await API.get("/appointments/my");

            setAppointments(response.data.appointments);
        } catch (err) {
            const errorMessage =
                "Unable to load your appointments.";

            setError(errorMessage);
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    // Appointment summary
    const totalBookings = appointments.length;

    const pendingBookings = appointments.filter(
        (item) => item.status === "Pending"
    ).length;

    const confirmedBookings = appointments.filter(
        (item) => item.status === "Confirmed"
    ).length;

    const cancelledBookings = appointments.filter(
        (item) => item.status === "Cancelled"
    ).length;

    // Filter appointments
    const filteredAppointments =
        activeFilter === "All"
            ? appointments
            : appointments.filter(
                (item) => item.status === activeFilter
            );

    // Cancel appointment
    const cancelAppointment = async (id) => {
        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this appointment?"
        );

        if (!confirmCancel) return;

        try {
            await API.patch(`/appointments/${id}/cancel`);

            showToast(
                "Appointment cancelled successfully!",
                "success"
            );

            await fetchAppointments();

        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Unable to cancel appointment.";

            showToast(errorMessage, "error");
        }
    };

    return (
        <div className="my-bookings">

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={closeToast}
            />

            {/* Navbar */}
            <nav className="bookings-nav">
                <Link to="/" className="booking-logo">
                    Glow<span>Up.</span>
                </Link>

                <Link to="/" className="home-link">
                    Back to Home
                </Link>
            </nav>

            <div className="bookings-container">

                {/* Heading */}
                <div className="bookings-heading">
                    <p>YOUR BOOKINGS</p>
                    <h1>My Appointments</h1>
                    <span>
                        Manage your salon appointments here.
                    </span>
                </div>

                {/* Summary Cards */}
                {!loading && !error && (
                    <div className="booking-summary">

                        <div className="summary-card">
                            <h3>Total Bookings</h3>
                            <h2>{totalBookings}</h2>
                        </div>

                        <div className="summary-card pending-summary">
                            <h3>Pending</h3>
                            <h2>{pendingBookings}</h2>
                        </div>

                        <div className="summary-card confirmed-summary">
                            <h3>Confirmed</h3>
                            <h2>{confirmedBookings}</h2>
                        </div>

                        <div className="summary-card cancelled-summary">
                            <h3>Cancelled</h3>
                            <h2>{cancelledBookings}</h2>
                        </div>

                    </div>
                )}

                {/* Filters */}
                {!loading && !error && appointments.length > 0 && (
                    <div className="booking-filters">

                        <h3>Filter Appointments</h3>

                        <div className="filter-buttons">
                            {["All", "Pending", "Confirmed", "Cancelled"].map(
                                (filter) => (
                                    <button
                                        key={filter}
                                        className={
                                            activeFilter === filter
                                                ? "filter-btn active"
                                                : "filter-btn"
                                        }
                                        onClick={() =>
                                            setActiveFilter(filter)
                                        }
                                    >
                                        {filter}
                                    </button>
                                )
                            )}
                        </div>

                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <p>Loading appointments...</p>
                )}

                {/* Error */}
                {error && (
                    <p className="booking-error">{error}</p>
                )}

                {/* Empty appointments */}
                {!loading && !error && appointments.length === 0 && (
                    <div className="empty-bookings">
                        <h2>No appointments yet</h2>
                        <p>Book your first salon service today.</p>

                        <Link to="/" className="explore-btn">
                            Explore Services
                        </Link>
                    </div>
                )}

                {/* Appointment List */}
                {!loading && !error && appointments.length > 0 && (

                    <div className="appointments-list">

                        {filteredAppointments.length === 0 ? (
                            <div className="empty-bookings">
                                <h2>
                                    No {activeFilter.toLowerCase()} appointments
                                </h2>
                                <p>
                                    You don't have any appointments with
                                    this status.
                                </p>
                            </div>
                        ) : (

                            filteredAppointments.map((item) => (

                                <div
                                    className="appointment-card"
                                    key={item._id}
                                >

                                    <div className="appointment-info">

                                        <h2>
                                            {item.service?.name || "Salon Service"}
                                        </h2>

                                        <p>
                                            Date:{" "}
                                            {new Date(
                                                item.appointmentDate
                                            ).toLocaleDateString("en-IN")}
                                        </p>

                                        <p>
                                            Time: {item.appointmentTime}
                                        </p>

                                        <p>
                                            Duration:{" "}
                                            {item.service?.duration ?? "N/A"} minutes
                                        </p>

                                    </div>

                                    <div className="appointment-actions">

                                        <h3>
                                            ₹{item.service?.price ?? "N/A"}
                                        </h3>

                                        <span
                                            className={`status ${item.status.toLowerCase()}`}
                                        >
                                            {item.status}
                                        </span>

                                        {item.status === "Pending" && (
                                            <button
                                                onClick={() =>
                                                    cancelAppointment(item._id)
                                                }
                                                className="cancel-btn"
                                            >
                                                Cancel Appointment
                                            </button>
                                        )}

                                    </div>

                                </div>

                            ))
                        )}

                    </div>
                )}

            </div>
        </div>
    );
}

export default MyAppointments;
