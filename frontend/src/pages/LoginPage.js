import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.profile?.medical_license) {
                // Redirige a la LISTA de solicitudes para doctores
                navigate('/solicitudes-imagenologia-list', { replace: true });
            } else {
                navigate('/activos', { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await login(username, password);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.non_field_errors) {
                setError(err.response.data.non_field_errors[0]);
            } else if (err.message) {
                setError("Error de inicio de sesión: " + err.message);
            } else {
                setError("Error de inicio de sesión. Por favor, inténtalo de nuevo.");
            }
            console.error("Error de login:", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md dark:bg-gray-800">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6 dark:text-white">Iniciar Sesión</h2>
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-800 dark:text-red-200" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Usuario</label>
                        <input
                            type="text"
                            id="username"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            placeholder="Tu nombre de usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            placeholder="******************"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200 w-full"
                        >
                            Entrar
                        </button>
                    </div>
                    <div className="text-center mt-4">
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;
