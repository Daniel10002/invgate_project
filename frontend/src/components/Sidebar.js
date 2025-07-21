import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    HomeIcon, ChartBarIcon, BriefcaseIcon, UsersIcon,
    MapIcon, CogIcon, DocumentDuplicateIcon,
} from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();

    if (authLoading) {
        console.log("Sidebar: AuthContext is still loading...");
        return null;
    }

    const isDoctor = user?.es_doctor || false; 
    const isAdmin = user?.is_staff || false; // is_staff es el campo de Django para administrador

    console.log("Sidebar Render - User (after authLoading check):", user);
    console.log("Sidebar Render - isDoctor:", isDoctor);
    console.log("Sidebar Render - isAdmin:", isAdmin);

    const allMenuItems = [
        { name: 'Activos', path: '/activos', icon: HomeIcon, showToDoctor: false, showToAdmin: true },
        { name: 'Inventario', path: '/inventario', icon: ChartBarIcon, showToDoctor: false, showToAdmin: true },
        { name: 'Contratos', path: '/contratos', icon: BriefcaseIcon, showToDoctor: false, showToAdmin: true },
        { name: 'Usuarios', path: '/usuarios', icon: UsersIcon, showToDoctor: false, showToAdmin: true },
        { name: 'Mapa', path: '/mapa', icon: MapIcon, showToDoctor: false, showToAdmin: true },
        { name: 'Ajustes', path: '/ajustes', icon: CogIcon, showToDoctor: false, showToAdmin: true },
        // CAMBIO CLAVE AQUÍ: showToAdmin ahora es true para que los administradores también lo vean
        { name: 'Solicitud Imagenología', path: '/solicitudes-imagenologia-list', icon: DocumentDuplicateIcon, showToDoctor: true, showToAdmin: true }, 
    ];

    const filteredMenuItems = allMenuItems.filter(item => {
        if (isAdmin) {
            return item.showToAdmin;
        } else if (isDoctor) {
            return item.showToDoctor;
        }
        return false; 
    });

    console.log("Sidebar Render - filteredMenuItems.length:", filteredMenuItems.length);
    console.log("Sidebar Render - filteredMenuItems:", filteredMenuItems);

    return (
        <div className="flex flex-col w-64 bg-gray-800 text-white p-4">
            {/* Logo y Nombre de la Aplicación */}
            <div className="flex items-center mb-6">
                {/* Puedes poner tu logo aquí */}
                <span className="text-xl font-semibold">REDSALUD</span>
            </div>

            {/* Menú de Navegación */}
            <nav className="flex-1">
                <ul>
                    {filteredMenuItems.map((item) => (
                        <li key={item.name} className="mb-2">
                            <Link
                                to={item.path}
                                className={`flex items-center p-2 rounded-lg hover:bg-gray-700 
                                    ${location.pathname.startsWith(item.path) ? 'bg-blue-600' : ''}`}
                            >
                                <item.icon className="h-5 w-5 mr-3" />
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}

export default Sidebar;
