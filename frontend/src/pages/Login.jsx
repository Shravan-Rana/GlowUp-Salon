
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Toast from "../components/Toast";
import "./Auth.css";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

        try {
            setLoading(true);

            const response = await API.post("/auth/login", formData);

            // Save login details
            localStorage.setItem("token", response.data.token);

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            // Show success notification
            setToast({
                message: "Login successful! Welcome to GlowUp.",
                type: "success"
            });

            // Redirect after notification appears
            setTimeout(() => {
                navigate("/");
            }, 1200);

        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Login failed. Please check your details.";

            setError(errorMessage);

            // Show error notification
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

                <p className="auth-tag">WELCOME BACK</p>

                <h1>Login to GlowUp</h1>

                <p className="auth-subtitle">
                    Sign in to book your favorite salon services.
                </p>

                <form onSubmit={handleSubmit}>

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

                    <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    {error && (
                        <p className="auth-error">{error}</p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <p className="auth-footer">
                    Don't have an account?
                    <Link to="/register"> Create Account</Link>
                </p>

                <Link to="/" className="auth-back">
                    ← Back to Home
                </Link>

            </div>
        </div>
    );
}

export default Login;
