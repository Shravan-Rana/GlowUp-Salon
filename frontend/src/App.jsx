
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyAppointments from "./pages/MyAppointments";
import BookAppointment from "./pages/BookAppointment";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/my-appointments" element={<MyAppointments />} />
                <Route path="/book/:serviceId" element={<BookAppointment />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
