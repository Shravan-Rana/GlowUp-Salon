
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Toast from "../components/Toast";
import "./Auth.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [toast, setToast] = useState({
        message: "",
        type: "success"
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (formData.name.trim().length < 2) {
            const message = "Please enter your full name.";
            setError(message);
            setToast({ message, type: "error" });
            return;
        }

        if (formData.password.length < 6) {
            const message = "Password must contain at least 6 characters.";
            setError(message);
            setToast({ message, type: "error" });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            const message = "Passwords do not match.";
            setError(message);
            setToast({ message, type: "error" });
            return;
        }

        try {
            setLoading(true);

            await API.post("/auth/register", {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password
            });

            // Show success notification
            setToast({
                message: "Account created successfully! Redirecting to login...",
                type: "success"
            });

            // Redirect to login
            setTimeout(() => {
                navigate("/login");
            }, 1800);

        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Registration failed. Please try again.";

            setError(errorMessage);

            setToast({
                message: errorMessage,
                type: "error"
            });

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() =>
                    setToast({
                        message: "",
                        type: "success"
                    })
                }
            />

            <Link to="/" className="auth-logo">
                Glow<span>Up.</span>
            </Link>

            <div className="auth-card">

                <p className="auth-tag">JOIN GLOWUP SALON</p>

                <h1>Create Account</h1>

                <p className="auth-subtitle">
                    Create your account and enjoy premium salon services.
                </p>

                <form onSubmit={handleSubmit}>

                    <label>Full Name</label>

                    <input
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        minLength={2}
                        required
                    />

                    <label>Email Address</label>

                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label>Password</label>

                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Minimum 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={6}
                            required
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() =>
                                setShowPassword(!showPassword)
                            }
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    <label>Confirm Password</label>

                    <div className="password-wrapper">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />

                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                        >
                            {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    {error && (
                        <p className="auth-error">{error}</p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                </form>

                <p className="auth-footer">
                    Already have an account?
                    <Link to="/login"> Login</Link>
                </p>

                <Link to="/" className="auth-back">
                    ← Back to Home
                </Link>

            </div>
        </div>
    );
}

export default Register;
