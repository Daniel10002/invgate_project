import React from 'react';
import { Routes, Route, useLocation, Navigate, BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Importaciones de tus componentes y páginas
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import NotFound from './components/NotFound'; // Ruta corregida
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';
import ContractsPage from './pages/ContractsPage';
import UsersPage from './pages/UsersPage';
import MapPage from './pages/MapPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ConfigPage from './pages/ConfigPage';
import ImagingRequestPage from './pages/ImagingRequestPage';
import ImagingRequestsList from './pages/ImagingRequestsList';

import './index.css';

// Componente PrivateRoute para proteger rutas que requieren autenticación
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl text-gray-700">Cargando autenticación...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const isDoctor = user?.profile?.medical_license || false;

  const getInitialRedirectPath = () => {
    if (!isAuthenticated) return '/login';
    
    if (isDoctor) {
      return '/solicitudes-imagenologia-list'; 
    }
    
    return '/activos';
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans dark:bg-gray-900">
      {isAuthenticated && <Sidebar />} 
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header /> 
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to={getInitialRedirectPath()} replace />} />
            
            <Route path="/activos" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/inventario" element={<PrivateRoute><InventoryPage /></PrivateRoute>} />
            <Route path="/contratos" element={<PrivateRoute><ContractsPage /></PrivateRoute>} />
            <Route path="/usuarios" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
            <Route path="/mapa" element={<PrivateRoute><MapPage /></PrivateRoute>} />
            <Route path="/ajustes" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
            <Route path="/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/configuracion" element={<PrivateRoute><ConfigPage /></PrivateRoute>} />
            
            {/* Rutas específicas de solicitud de imagenología */}
            <Route 
                path="/solicitudes-imagenologia-list" 
                element={<PrivateRoute><ImagingRequestsList /></PrivateRoute>} 
            />
            <Route 
                path="/solicitud-imagenologia" 
                element={<PrivateRoute><ImagingRequestPage key="new-request" /></PrivateRoute>} 
            />
            {/* ¡CAMBIO CLAVE AQUÍ! Usamos el ID directamente como key */}
            <Route 
                path="/solicitud-imagenologia/:id" 
                element={<PrivateRoute><ImagingRequestPage key={location.pathname.split('/').pop()} /></PrivateRoute>} 
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
