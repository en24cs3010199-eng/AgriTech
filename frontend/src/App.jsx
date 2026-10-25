import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import KisanSaathiDrawer from './components/KisanSaathiDrawer';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Auth/Profile';
import Dashboard from './pages/Dashboard/Dashboard';
import FarmsPage from './pages/Farms/FarmsPage';
import CropsSoilPage from './pages/CropsSoil/CropsSoilPage';
import WeatherPage from './pages/Weather/WeatherPage';
import MarketplacePage from './pages/Marketplace/MarketplacePage';
import CommunityPage from './pages/Community/CommunityPage';
import AdminDashboard from './pages/Admin/AdminDashboard';

export const App = () => {
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);

  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="d-flex flex-column min-vh-100 bg-page">
            <Navbar
              cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
              onOpenCart={() => setShowCartModal(true)}
            />

            <main className="flex-grow-1">
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Core Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/farms" element={<FarmsPage />} />
                  <Route path="/crops-soil" element={<CropsSoilPage />} />
                  <Route path="/weather" element={<WeatherPage />} />
                  <Route
                    path="/marketplace"
                    element={
                      <MarketplacePage
                        cart={cart}
                        setCart={setCart}
                        showCartModal={showCartModal}
                        setShowCartModal={setShowCartModal}
                      />
                    }
                  />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Protected Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                {/* Catch-all 404 Route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>

            {/* Global Hindi Agricultural Assistant Floating Drawer */}
            <KisanSaathiDrawer />

            <Footer />
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
