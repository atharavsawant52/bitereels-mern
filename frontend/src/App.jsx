import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import UploadReel from './pages/UploadReel';
import MenuManagement from './pages/MenuManagement';
import OrdersReceived from './pages/OrdersReceived';

import RestaurantDashboard from './pages/RestaurantDashboard';
import MainLayout from './components/MainLayout';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'restaurant') {
            return <Navigate to="/restaurant-dashboard" replace />;
        }
        return <Navigate to="/" replace />; 
    }
    return children;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen bg-dark text-light font-sans">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        
                        {/* User Routes - Wrapped in MainLayout */}
                        <Route path="/" element={
                            <ProtectedRoute allowedRoles={['user', 'admin']}>
                                <MainLayout>
                                    <Home />
                                </MainLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/cart" element={
                            <ProtectedRoute allowedRoles={['user', 'admin']}>
                                <MainLayout>
                                    <Cart />
                                </MainLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/orders" element={
                            <ProtectedRoute allowedRoles={['user', 'restaurant', 'admin']}>
                                <MainLayout>
                                    <Orders />
                                </MainLayout>
                            </ProtectedRoute>
                        } />

                        {/* Restaurant Routes - Keep existing layout or separate */}
                        <Route path="/restaurant-dashboard" element={
                            <ProtectedRoute allowedRoles={['restaurant', 'admin']}>
                                <RestaurantDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/restaurant/upload" element={
                            <ProtectedRoute allowedRoles={['restaurant']}>
                                <UploadReel />
                            </ProtectedRoute>
                        } />
                        <Route path="/restaurant/menu" element={
                            <ProtectedRoute allowedRoles={['restaurant']}>
                                <MenuManagement />
                            </ProtectedRoute>
                        } />
                        <Route path="/restaurant/orders" element={
                            <ProtectedRoute allowedRoles={['restaurant']}>
                                <OrdersReceived />
                            </ProtectedRoute>
                        } />
                        
                        {/* Shared/Other */}
                        <Route path="/restaurant/:id" element={
                            <ProtectedRoute allowedRoles={['user', 'admin']}>
                                <MainLayout>
                                    <RestaurantDetail />
                                </MainLayout>
                            </ProtectedRoute>
                        } />
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
