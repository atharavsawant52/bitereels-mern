import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import UploadReel from './pages/UploadReel';
import OrdersReceived from './pages/OrdersReceived';
import RestaurantDashboard from './pages/RestaurantDashboard';
import MainLayout from './components/MainLayout';
import Search from './pages/Search';
import UserProfile from './pages/UserProfile';
import Notifications from './pages/Notifications';
import ManageMenu from './pages/ManageMenu';
import OrderSuccess from './pages/OrderSuccess';
import OrderFailed from './pages/OrderFailed';
import SavedReels from './pages/SavedReels';
import { Toaster } from 'react-hot-toast';

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
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    duration: 3200,
                    style: {
                        background: 'rgba(9, 14, 26, 0.95)',
                        color: '#f8fafc',
                        border: '1px solid rgba(148, 163, 184, 0.18)',
                        borderRadius: '18px',
                        padding: '14px 16px',
                        boxShadow: '0 24px 60px rgba(2, 6, 23, 0.5)'
                    },
                    success: {
                        iconTheme: {
                            primary: '#fb5d47',
                            secondary: '#ffffff'
                        }
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#ffffff'
                        }
                    }
                }}
            />
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
                        <Route path="/search" element={
                            <ProtectedRoute allowedRoles={['user', 'admin']}>
                                <MainLayout>
                                    <Search />
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
                            <ProtectedRoute allowedRoles={['user', 'admin']}>
                                <MainLayout>
                                    <Orders />
                                </MainLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/order-success" element={
                            <ProtectedRoute allowedRoles={['user', 'admin']}>
                                <OrderSuccess />
                            </ProtectedRoute>
                        } />
                        <Route path="/order-failed" element={
                            <ProtectedRoute allowedRoles={['user', 'admin']}>
                                <OrderFailed />
                            </ProtectedRoute>
                        } />
                        <Route path="/notifications" element={
                            <ProtectedRoute allowedRoles={['user', 'admin', 'restaurant']}>
                                <MainLayout>
                                    <Notifications />
                                </MainLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/saved" element={
                            <ProtectedRoute allowedRoles={['user', 'admin']}>
                                <MainLayout>
                                    <SavedReels />
                                </MainLayout>
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute allowedRoles={['user', 'admin']}>
                                <MainLayout>
                                    <UserProfile />
                                </MainLayout>
                            </ProtectedRoute>
                        } />

                        {/* Restaurant Routes */}
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
                        <Route path="/restaurant/orders" element={
                            <ProtectedRoute allowedRoles={['restaurant']}>
                                <OrdersReceived />
                            </ProtectedRoute>
                        } />
                        <Route path="/restaurant/menu" element={
                            <ProtectedRoute allowedRoles={['restaurant']}>
                                <ManageMenu />
                            </ProtectedRoute>
                        } />

                        {/* Restaurant Profile — viewable by users */}
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
