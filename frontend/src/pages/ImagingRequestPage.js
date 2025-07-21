import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, PrinterIcon, DocumentCheckIcon } from '@heroicons/react/24/solid';
import { useParams, useLocation } from 'react-router-dom';

function ImagingRequestPage() {
    useEffect(() => {
        console.log("🟢 ImagingRequestPage: ¡Componente MONTADO!");
        return () => {
            console.log("🔴 ImagingRequestPage: Componente DESMONTADO.");
        };
    }, []);

    const { token, user, loading: authLoading } = useAuth();
    const { id } = useParams();

    const location = useLocation(); // eslint-disable-line no-unused-vars

    const [categories, setCategories] = useState([]);
    const [requestData, setRequestData] = useState({
        patient_name: '',
        patient_rut: '',
        request_date: '',
        patient_phone: '',
        patient_prevencion: '',
        diagnosis: '',
        observations: '',
        selected_exams: [],
        doctor: null, // CAMBIO CLAVE: Cambiado de doctor_id a doctor (espera el ID del doctor)
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');

    const [currentRequestId, setCurrentRequestId] = useState(id || null);
    const [isEditing, setIsEditing] = useState(!id);
    
    const canEdit = isEditing;

    const API_BASE_URL = `http://${window.location.hostname}:8000/api/`;

    // Usar el campo es_doctor del objeto user del AuthContext
    const currentIsUserDoctor = user?.es_doctor || false; 
    const currentIsUserAdmin = user?.is_staff || false;

    // isOwner debe comparar el ID del usuario logueado con el ID del doctor de la solicitud
    const isOwner = requestData.doctor && user?.doctor?.id === requestData.doctor; 


    useEffect(() => {
        console.log(`[ImagingRequestPage Init Effect] id de useParams: ${id}`);
        if (id) {
            setCurrentRequestId(id);
            setIsEditing(false); 
        } else {
            setCurrentRequestId(null);
            setIsEditing(true); 
        }
    }, [id]);


    useEffect(() => {
        const fetchExamsAndRequest = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!token) {
                    throw new Error("No token available to fetch data.");
                }

                // Asegúrate de que esta URL es correcta para las categorías
                const categoriesResponse = await fetch(`${API_BASE_URL}exam-categories/`, {
                    headers: { 'Authorization': `Token ${token}` }
                });
                if (!categoriesResponse.ok) {
                    const errorDetails = await categoriesResponse.json().catch(() => ({}));
                    throw new Error(`Error al cargar categorías de exámenes: ${errorDetails.detail || categoriesResponse.statusText}`);
                }
                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData); // Esto ahora debería incluir los exam_items anidados

                if (id) {
                    const requestResponse = await fetch(`${API_BASE_URL}imaging-requests/${id}/`, {
                        headers: { 'Authorization': `Token ${token}` }
                    });
                    if (!requestResponse.ok) {
                        const errorDetails = await requestResponse.json().catch(() => ({}));
                        if (requestResponse.status === 404) {
                            throw new Error('Solicitud no encontrada.');
                        } else if (requestResponse.status === 403) {
                            throw new Error('No tienes permisos para ver esta solicitud.');
                        } else {
                            throw new Error(`Error al cargar la solicitud: ${errorDetails.detail || requestResponse.statusText}`);
                        }
                    }
                    const requestLoadedData = await requestResponse.json();

                    setRequestData(prevData => ({
                        ...prevData,
                        patient_name: requestLoadedData.patient_name || '',
                        patient_rut: requestLoadedData.patient_rut || '',
                        request_date: requestLoadedData.request_date || '',
                        patient_phone: requestLoadedData.patient_phone || '',
                        patient_prevencion: requestLoadedData.patient_prevencion || '',
                        diagnosis: requestLoadedData.diagnosis || '',
                        observations: requestLoadedData.observations || '',
                        // selected_exams ahora viene como IDs directamente
                        selected_exams: requestLoadedData.selected_exams.map(examId => parseInt(examId)).filter(id => !isNaN(id)),
                        doctor: requestLoadedData.doctor || null, // CAMBIO CLAVE: Asignar el ID del doctor directamente
                    }));
                    setMessage('Solicitud cargada correctamente.');
                } else {
                    // Si es una nueva solicitud, asignar el doctor_id si el usuario actual es un doctor
                    if (user && user.es_doctor) { // Usar user.es_doctor
                        setRequestData(prev => ({ ...prev, doctor: user.doctor?.id || null })); // Asignar el ID del doctor logueado
                    }
                }

            } catch (err) {
                setError(err);
                console.error('Error fetching data for Imaging Request Page:', err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && token) {
            fetchExamsAndRequest();
        } else if (!authLoading && !token) {
            setLoading(false);
            setError(new Error("Acceso denegado. No hay token de autenticación."));
        }
    }, [token, user, id, authLoading]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setRequestData(prev => {
                const examId = parseInt(value);
                if (isNaN(examId)) {
                    console.warn("Intento de agregar un ID de examen no numérico:", value);
                    return prev;
                }
                if (checked) {
                    return { ...prev, selected_exams: [...prev.selected_exams, examId] };
                } else {
                    return { ...prev, selected_exams: prev.selected_exams.filter(id => id !== examId) };
                }
            });
        } else {
            setRequestData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        console.log("handleSubmit: currentRequestId antes de la decisión PUT/POST:", currentRequestId);

        try {
            const method = currentRequestId ? 'PATCH' : 'POST'; // Usar PATCH para edición
            const url = currentRequestId ? `${API_BASE_URL}imaging-requests/${currentRequestId}/` : `${API_BASE_URL}imaging-requests/`;

            const payload = {
                ...requestData,
                // CAMBIO CLAVE: Asegurarse de que 'doctor' se envíe como un ID (o null)
                doctor: requestData.doctor, // Ya es un ID o null
                selected_exams: requestData.selected_exams.filter(id => typeof id === 'number' && !isNaN(id)),
            };

            console.log("handleSubmit: Payload completo a enviar:", payload);

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                let errMsg = 'Error al guardar solicitud.';
                if (errorData && typeof errorData === 'object') {
                    errMsg = Object.keys(errorData).map(key => {
                        const value = errorData[key];
                        if (Array.isArray(value)) {
                            return `${key}: ${value.join(', ')}`;
                        } else if (typeof value === 'object' && value !== null) {
                            return `${key}: ${JSON.stringify(value)}`;
                        }
                        return `${key}: ${value}`;
                    }).join('; ');
                }
                throw new Error(errMsg);
            }

            const savedRequest = await response.json();
            setCurrentRequestId(savedRequest.id);
            setIsEditing(false);
            setMessage('Solicitud guardada con éxito.');
            
        } catch (err) {
            setError(err);
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        if (!currentRequestId) {
            alert('Primero debes guardar la solicitud para poder imprimirla.');
            return;
        }
        window.open(`${API_BASE_URL}imaging-requests/${currentRequestId}/generate_pdf/`, '_blank');
    };

    const handleNewRequest = () => {
        setRequestData({
            patient_name: '',
            patient_rut: '',
            request_date: '', 
            patient_phone: '',
            patient_prevencion: '',
            diagnosis: '',
            observations: '',
            selected_exams: [],
            // CAMBIO CLAVE: Asignar el ID del doctor logueado si el usuario es doctor
            doctor: currentIsUserDoctor ? (user?.doctor?.id || null) : null, 
        });
        setCurrentRequestId(null);
        setIsEditing(true);
        setMessage('');
        setError(null);
    };

    console.log("---------------------------------------");
    console.log("Estado de Edición y Permisos:");
    console.log("authLoading:", authLoading);
    console.log("isEditing:", isEditing);
    console.log("currentRequestId (estado):", currentRequestId);
    console.log("useParams().id (URL):", id);
    console.log("currentIsUserAdmin:", currentIsUserAdmin);
    console.log("currentIsUserDoctor (user?.es_doctor):", currentIsUserDoctor); // Usar user.es_doctor
    console.log("isOwner:", isOwner);
    console.log("requestData.doctor:", requestData.doctor); // Logear requestData.doctor
    console.log("user?.doctor?.id:", user?.doctor?.id); // Logear user?.doctor?.id
    console.log("FINAL canEdit:", canEdit);
    console.log("---------------------------------------");

    if (authLoading || loading) return <div className="flex justify-center items-center h-full text-xl text-gray-700 dark:text-gray-300">Cargando...</div>;
    if (error) return <div className="flex justify-center items-center h-full flex-col text-red-600 dark:text-red-400">Error: {error.message}</div>;

    return (
        <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-md mt-10 dark:bg-gray-800 dark:text-white">
            <style>
                {`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .heart-blink {
                    animation: blink 1.5s infinite;
                }
                `}
            </style>

            <div className="flex justify-center mb-6">
                <img 
                    src="/images/descarga.png" 
                    alt="RedSalud Logo" 
                    className="max-w-full h-auto rounded-lg"
                    onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x100/cccccc/000000?text=Logo+No+Disponible"; }}
                />
            </div>

            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white flex items-center justify-center">
                Solicitud de Exámenes de Imagenología
                <img 
                    src="/images/396725489_1027100055288602_348806683407432185_n.jpg" 
                    alt="Heart Icon" 
                    className="h-10 w-10 ml-4 heart-blink" 
                    onError={(e) => { e.target.onerror = null; e.target.src="/images/logo.jpg"; }}
                />
            </h2>
            {message && (
                <div className={`mb-4 px-4 py-2 rounded ${message.startsWith('Error') ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200' : 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Sección de Datos del Paciente */}
                <div className="mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Datos del Paciente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
                            {canEdit ? (
                                <input type="text" name="patient_name" value={requestData.patient_name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white" />
                            ) : (
                                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{requestData.patient_name || 'N/A'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">RUT</label>
                            {canEdit ? (
                                <input type="text" name="patient_rut" value={requestData.patient_rut} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white" />
                            ) : (
                                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{requestData.patient_rut || 'N/A'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Solicitud</label>
                            {canEdit ? (
                                <input type="date" name="request_date" value={requestData.request_date} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white" />
                            ) : (
                                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{requestData.request_date || 'N/A'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                            {canEdit ? (
                                <input type="text" name="patient_phone" value={requestData.patient_phone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white" />
                            ) : (
                                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{requestData.patient_phone || 'N/A'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo Previsión</label>
                            {canEdit ? (
                                <input type="text" name="patient_prevencion" value={requestData.patient_prevencion} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white" />
                            ) : (
                                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{requestData.patient_prevencion || 'N/A'}</p>
                            )}
                        </div>
                        <div className="md:col-span-2 lg:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Diagnóstico</label>
                            {canEdit ? (
                                <textarea name="diagnosis" value={requestData.diagnosis} onChange={handleChange} rows="2" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"></textarea>
                            ) : (
                                <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{requestData.diagnosis || 'N/A'}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sección de Selección de Exámenes */}
                <div className="mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Selección de Exámenes</h3>
                    {categories && categories.length > 0 ? (
                        categories.sort((a, b) => a.order - b.order).map(category => (
                            <div key={category.id} className="mb-4">
                                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{category.name}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
                                    {/* CAMBIO CLAVE AQUÍ: category.exam_items ahora debería existir */}
                                    {category.exam_items && category.exam_items.length > 0 ? ( 
                                        category.exam_items.map(exam => (
                                            <div key={exam.id} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`exam-${exam.id}`}
                                                    name="selected_exams"
                                                    value={exam.id}
                                                    checked={requestData.selected_exams.includes(exam.id)}
                                                    onChange={handleChange}
                                                    disabled={!canEdit}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                                />
                                                <label htmlFor={`exam-${exam.id}`} className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {exam.name} ({exam.code})
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No hay exámenes disponibles en esta categoría.</p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-600 dark:text-gray-300">No se pudieron cargar las categorías de exámenes o no hay categorías disponibles.</p>
                    )}
                </div>

                {/* Sección de Observaciones y Acciones */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observaciones / Justificación</label>
                    {canEdit ? (
                        <textarea name="observations" value={requestData.observations} onChange={handleChange} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white"></textarea>
                    ) : (
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{requestData.observations || 'N/A'}</p>
                    )}
                </div>

                <div className="flex justify-end space-x-3">
                    {/* Botón Imprimir PDF */}
                    {currentRequestId && (
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center"
                        >
                            <PrinterIcon className="h-5 w-5 mr-2" /> Imprimir PDF
                        </button>
                    )}

                    {isEditing ? (
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center"
                        >
                            <DocumentCheckIcon className="h-5 w-5 mr-2" /> {loading ? 'Guardando...' : 'Guardar Solicitud'}
                        </button>
                    ) : null}
                    
                    <button
                        type="button"
                        onClick={handleNewRequest}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 flex items-center dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-50"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" /> Nueva Solicitud
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ImagingRequestPage;



