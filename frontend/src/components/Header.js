import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    BellIcon, MoonIcon, SunIcon, UserCircleIcon, ChevronDownIcon,
    Bars3Icon
} from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

function Header({ toggleSidebar }) {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        setIsDropdownOpen(false); 
    }, [user, isAuthenticated]);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsDropdownOpen(false);
    };

    const handleProfileClick = () => {
        navigate('/perfil');
        setIsDropdownOpen(false);
    };

    const handleSettingsClick = () => {
        navigate('/configuracion');
        setIsDropdownOpen(false);
    };

    return (
        <header className="flex items-center justify-between p-4 bg-white shadow-md dark:bg-gray-800">
            {/* Se elimina el CSS de animación del corazón */}
            
            <div className="flex items-center space-x-4">
                {/* Botón para ocultar/mostrar sidebar (si lo tienes) */}
                <button
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white md:hidden"
                    onClick={toggleSidebar}
                >
                    <Bars3Icon className="h-6 w-6" />
                </button>

                {/* Logo REDSALUD completo */}
                <img 
                    src="/images/descarga.png" // Reemplaza con la URL real de tu logo REDSALUD
                    alt="RedSalud Logo" 
                    className="h-8 md:h-10 rounded-lg" // Ajusta el tamaño según necesites
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150x40/cccccc/000000?text=Logo"; }}
                />

                {/* Se elimina el Logo de Corazón SVG */}
            </div>
            
            {/* Un espacio flexible para empujar los elementos de la derecha */}
            <div className="flex-grow"></div> 

            <div className="flex items-center space-x-4 relative">
                {/* Icono de Campana (Notificaciones) - visible para todos */}
                <button className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                    <BellIcon className="h-6 w-6" />
                </button>

                {/* Icono de Luna/Sol (Modo oscuro) - visible para todos */}
                <button className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                    <MoonIcon className="h-6 w-6" /> 
                </button>

                {/* --- MENÚ DE USUARIO DESPLEGABLE --- */}
                <div className="relative">
                    <button
                        className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <UserCircleIcon className="h-7 w-7" />
                        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">{user?.username || 'Invitado'}</span>
                        <ChevronDownIcon className={`h-4 w-4 ml-1 transform transition-transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 dark:bg-gray-700">
                            <Link
                                to="/perfil"
                                onClick={handleProfileClick}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Mi Perfil
                            </Link>
                            <Link
                                to="/configuracion"
                                onClick={handleSettingsClick}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Configuración
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-600"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
                {/* --- FIN MENÚ DE USUARIO DESPLEGABLE --- */}
            </div>
        </header>
    );
}

export default Header;

