
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./Home.css";

function Home() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        return savedUser ? JSON.parse(savedUser) : null;
    });

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        navigate("/");
    };

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await API.get("/services");
                setServices(response.data);
            } catch (error) {
                setError("Unable to load services. Please try again.");
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const handleBooking = (serviceId) => {
        if (!localStorage.getItem("token")) {
            navigate("/login");
            return;
        }

        navigate(`/book/${serviceId}`);
    };

    const getServiceImage = (serviceName) => {
        const images = {
            "Haircut": "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
            "Hair Wash": "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800",
            "Hair Styling": "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800",
            "Hair Spa": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
            "Hair Coloring": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
            "Keratin Treatment": "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800",
            "Facial": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800",
            "Cleanup": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800",
            "Manicure": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800",
            "Pedicure": "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800",
            "Beard Styling": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800",
            "Shaving": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800",
            "Threading": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800",
            "Bridal Makeup": "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800",
            "Party Makeup": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800"
        };

        return images[serviceName] ||
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800";
    };

    return (
        <div className="salon-home">

            {/* Navbar */}

            <nav className="navbar">

                <Link to="/" className="logo">
                    Glow<span>Up.</span>
                </Link>

                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <a href="#services">Services</a>
                    <a href="#about">About</a>
                </div>

                <div className="nav-actions">
                    {user ? (
                        <>
                            <div className="user-profile">
                                <span className="user-avatar">👤</span>
                                <span className="user-name">{user.name}</span>
                            </div>

                            <Link
                                to="/my-appointments"
                                className="login-link"
                            >
                                My Appointments
                            </Link>

                            <button
                                className="nav-button logout-button"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="login-link">
                                Login
                            </Link>

                            <Link to="/register" className="nav-button">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

            </nav>


            {/* Hero Section */}
         
{/* Hero Section */}
<section className="hero" id="home">

    <div className="hero-content">

        <p className="hero-tag">
            WELCOME TO GLOWUP SALON
        </p>

        <h1>
            Beauty Begins
            <br />
            <span>With You.</span>
        </h1>

        <p className="hero-description">
            Discover a new level of beauty and relaxation.
            Experience professional salon services designed
            to bring out your confidence.
        </p>

        <div className="hero-buttons">
            <a href="#services" className="hero-button">
                Explore Services →
            </a>

            <Link to="/my-appointments" className="hero-secondary-button">
                My Appointments
            </Link>
        </div>

        <div className="hero-stats">
            <div>
                <h3>15+</h3>
                <span>Beauty Services</span>
            </div>

            <div>
                <h3>100%</h3>
                <span>Customer Care</span>
            </div>
        </div>

    </div>

    <div className="hero-image">
        <img
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200"
            alt="Professional beauty salon"
        />
        <div className="hero-image-label">
            <span>✦</span>
            Your Beauty, Our Passion
        </div>
    </div>

</section>


            {/* Services Section */}
            {/* Services Section */}
            <section className="services-section" id="services">

                <div className="section-heading">
                    <p>WHAT WE OFFER</p>
                    <h2>Our Popular Services</h2>
                    <span>
                        Professional care for your beauty and wellness.
                    </span>
                </div>

                {loading && <p className="message">Loading services...</p>}

                {error && <p className="error-message">{error}</p>}

                {!loading && !error && services.length === 0 && (
                    <p className="message">No services available yet.</p>
                )}

                <div className="service-grid">

                    {services.map((service) => (
                        <div className="service-card" key={service._id}>

                            {/* Service Image */}
                            <div className="service-image">
                                <img
                                    src={service.image || getServiceImage(service.name)}
                                    alt={service.name}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src =
                                            "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800";
                                    }}
                                />

                                <span className="service-badge">
                                    GlowUp Special
                                </span>
                            </div>

                            {/* Service Details */}
                            <div className="service-card-content">

                                <h3>{service.name}</h3>

                                <p className="service-description">
                                    {service.description ||
                                        "Experience professional salon care."}
                                </p>

                                <div className="service-details">
                                    <h4>₹{service.price}</h4>
                                    <span>{service.duration} Minutes</span>
                                </div>

                                <button
                                    className="book-button"
                                    onClick={() => handleBooking(service._id)}
                                >
                                    Book Appointment →
                                </button>

                            </div>

                        </div>
                    ))}

                </div>

            </section>

            {/* About Section */}
            <section className="about-section" id="about">
                <p>ABOUT GLOWUP</p>
                <h2>Beauty, Care & Confidence.</h2>
                <span>
                    We believe everyone deserves to feel confident.
                    Our goal is to provide quality salon services
                    with professional care and attention.
                </span>
            </section>

            {/* Footer */}
            <footer className="footer">
                <h2>Glow<span>Up.</span></h2>
                <p>Beauty is an experience. Make it unforgettable.</p>
                <p>© 2026 GlowUp Salon. All Rights Reserved.</p>
            </footer>

        </div>
    );
}

export default Home;
