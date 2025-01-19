import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./router/PrivateRoute";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import DeviceList from "./pages/DeviceList";
import Dashboard from "./pages/Dashboard";
import Documentation from "./pages/Documentation";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Document" element={<Documentation />} />
          <Route
            path="/DeviceList"
            element={<PrivateRoute element={<DeviceList />} />}
          />
          <Route
            path="/Dashboard"
            element={<PrivateRoute element={<Dashboard />} />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
