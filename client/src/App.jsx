import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import QrInfoUpload from "./pages/QrInfoUpload";
import UpdateQrInfo from "./pages/UpdateQrInfo";
import Result from "./pages/Result";
import QrCodeShow from "./pages/QrCodeShow";
import PrivacyPolicy from "./pages/PrivacyShield";
import TermsAndConditions from "./pages/TermsAndConditions";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import BuySticker from "./pages/BuySticker";
import ShopkeeperDashboard from "./pages/ShopkeeperDashboard";
import { useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/qrinfoupload"
        element={
          <ProtectedRoute>
            <QrInfoUpload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/update"
        element={
          <ProtectedRoute>
            <UpdateQrInfo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buy-sticker"
        element={
          <ProtectedRoute>
            <BuySticker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shopkeeper"
        element={
          <ProtectedRoute>
            <ShopkeeperDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/data" element={<Result />} />
      <Route path="/genqrcode" element={<QrCodeShow />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-secret" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
