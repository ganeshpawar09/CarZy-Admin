import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './pages/Login/Login';
import EmployeeDashboard from "./pages/Employee/Employee";
import AdminDashboard from "./pages/Admin/Admin";
import CarVerificationDetailsPage from "./pages/Employee/CarDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/car-verification/:carId" element={<CarVerificationDetailsPage />} />

      </Routes>
    </Router>
  );
}

export default App;
