import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon, DocumentTextIcon, PlusIcon } from '@heroicons/react/24/solid';

function ImagingRequestsList() {
    const { token, user, loading: authLoading } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const API_BASE_URL = `http://${window.location.hostname}:8000/api/`;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Función para cargar las solicitudes de imagenología
    const fetchRequests = async () => { // Renombrada de fetchImagingRequests a fetchRequests para consistencia
        setLoading(true);
        setError(null);
        try {
            if (!token) {
                throw new Error("No token disponible para cargar datos.");
            }

            const response = await fetch(`${API_BASE_URL}imaging-requests/`, {
                headers: { 'Authorization': `Token ${token}` }
            });

            if (!response.ok) {
                const errorDetails = await response.json().catch(() => ({}));
                throw new Error(`Error al cargar solicitudes: ${errorDetails.detail || response.statusText}`);
            }
            const data = await response.json();
            setRequests(data);
            setMessage('Solicitudes cargadas correctamente.');
        } catch (err) {
            setError(err);
            console.error('Error fetching imaging requests:', err);
        } finally {
            setLoading(false);
        }
    };

    // Función para eliminar una solicitud
    const handleDeleteRequest = async (requestId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta solicitud? Esta acción es irreversible.')) {
            return;
        }
        try {
            if (!token) {
                throw new Error("No token disponible para eliminar.");
            }

            const response = await fetch(`${API_BASE_URL}imaging-requests/${requestId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Token ${token}` }
            });

            if (!response.ok) {
                const errorDetails = await response.json().catch(() => ({}));
                throw new Error(`Error al eliminar solicitud: ${errorDetails.detail || response.statusText}`);
            }

            setRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
            setMessage('Solicitud eliminada con éxito.');
        } catch (err) {
            setError(err);
            console.error("Error deleting imaging request:", err);
            setMessage(`Error: ${err.message}`);
        }
    };

    // useEffect para cargar las solicitudes cuando el token o el usuario cambian
    useEffect(() => {
        if (!authLoading && token) {
            fetchRequests(); // Llama a la función definida arriba
        } else if (!authLoading && !token) {
            setRequests([]); // Limpiar solicitudes si no hay token
            setLoading(false);
            setError(new Error("Acceso denegado. Inicia sesión para ver las solicitudes."));
        }
    }, [token, authLoading, user]); // Dependencias: token, authLoading, user

    // Renderizado condicional para estados de carga y error
    if (authLoading || loading) {
        return <div className="flex justify-center items-center h-full text-xl text-gray-700 dark:text-gray-300">Cargando solicitudes...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-full flex-col text-red-600 dark:text-red-400">Error: {error.message}</div>;
    }

    // Renderizado principal del componente
    return (
        <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-md mt-10 dark:bg-gray-800 dark:text-white">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Listado de Solicitudes de Imagenología</h2>
            {message && (
                <div className={`mb-4 px-4 py-2 rounded ${message.startsWith('Error') ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200' : 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200'}`}>
                    {message}
                </div>
            )}

            <div className="mb-4 text-right">
                <Link
                    to="/solicitud-imagenologia"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 inline-flex items-center"
                >
                    <PlusIcon className="h-5 w-5 mr-2" /> Nueva Solicitud
                </Link>
            </div>

            {requests.length === 0 ? (
                <p className="text-center text-gray-600 text-lg dark:text-gray-300">No hay solicitudes de imagenología registradas.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                    ID Solicitud
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                    Paciente
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                    RUT
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                    Diagnóstico
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                    Doctor
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                    Fecha
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {requests.map((request) => (
                                <tr key={request.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {request.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {request.patient_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {request.patient_rut}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {request.diagnosis || 'N/A'}
                                    </td>
                                    {/* Usar request.doctor_name, que viene del SerializerMethodField en el backend */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {request.doctor_name}
                                    </td> 
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {formatDate(request.request_date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            to={`/solicitud-imagenologia/${request.id}`}
                                            className="text-blue-600 hover:text-blue-900 mr-3 dark:text-blue-400 dark:hover:text-blue-200"
                                            title="Ver/Editar Solicitud"
                                        >
                                            <PencilIcon className="h-5 w-5 inline-block" />
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteRequest(request.id)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
                                            title="Eliminar Solicitud"
                                        >
                                            <TrashIcon className="h-5 w-5 inline-block" />
                                        </button>
                                        <button
                                            onClick={() => window.open(`${API_BASE_URL}imaging-requests/${request.id}/generate_pdf/`, '_blank')}
                                            className="text-purple-600 hover:text-purple-900 ml-3 dark:text-purple-400 dark:hover:text-purple-200"
                                            title="Imprimir PDF"
                                        >
                                            <DocumentTextIcon className="h-5 w-5 inline-block" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ImagingRequestsList;