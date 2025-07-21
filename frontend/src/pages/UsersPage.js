import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCircleIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token, user: currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    // CAMBIO CLAVE AQUÍ: La URL correcta para tu UserViewSet
    const API_URL_USERS = `http://${window.location.hostname}:8000/api/users/`; // ¡CORREGIDO!

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    
    const [isDoctorChecked, setIsDoctorChecked] = useState(false); 

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '', 
        is_staff: false,
        userprofile: {
            full_name: '',
            position: '',
            area: '',
            phone_number: '', 
            location: '',    
        },
        doctor: {
            full_name: '',
            specialty: '',
            medical_license: '',
            phone_number: '',
        },
    });
    const [passwordChange, setPasswordChange] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!token) {
                throw new Error("No hay token de autenticación disponible.");
            }

            const url = searchTerm ? `${API_URL_USERS}?search=${searchTerm}` : API_URL_USERS;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error HTTP: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            console.log("Respuesta completa de la API de usuarios:", data); // Esto mostrará todos los usuarios
            setUsers(data);
        } catch (err) {
            setError(err);
            console.error("Error al obtener los usuarios:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token, searchTerm]);

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible.')) {
            return;
        }
        try {
            const response = await fetch(`${API_URL_USERS}${userId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error al eliminar usuario: ${response.status} - ${JSON.stringify(errorData)}`);
            }

            setUsers(users.filter(user => user.id !== userId));
            alert('Usuario eliminado con éxito.'); 
        } catch (err) {
            console.error("Error al eliminar el usuario:", err);
            alert(`Error: ${err.message}`);
        }
    };

    const handleOpenModal = (user = null) => {
        setEditingUser(user);
        
        if (!user) {
            setFormData({
                username: '',
                email: '',
                password: '',
                is_staff: false,
                userprofile: { full_name: '', position: '', area: '', phone_number: '', location: '' },
                doctor: { full_name: '', specialty: '', medical_license: '', phone_number: '' },
            });
            setIsDoctorChecked(false); 
            setPasswordChange('');
        } else {
            console.log("Datos del usuario al abrir modal:", user);
            const userProfileData = user.userprofile || {};
            const doctorData = user.doctor || {};
            
            setIsDoctorChecked(user.es_doctor); 

            setFormData({
                username: user.username,
                email: user.email,
                is_staff: user.is_staff,
                userprofile: {
                    full_name: userProfileData.full_name || '',
                    position: userProfileData.position || '',
                    area: userProfileData.area || '',
                    phone_number: userProfileData.phone_number || '',
                    location: userProfileData.location || '',
                },
                doctor: {
                    full_name: doctorData.full_name || '',
                    specialty: doctorData.specialty || '',
                    medical_license: doctorData.medical_license || '',
                    phone_number: doctorData.phone_number || '',
                },
            });
            setPasswordChange(''); 
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({
            username: '',
            email: '',
            password: '',
            is_staff: false,
            userprofile: { full_name: '', position: '', area: '', phone_number: '', location: '' },
            doctor: { full_name: '', specialty: '', medical_license: '', phone_number: '' },
        });
        setPasswordChange('');
        setIsDoctorChecked(false);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } 
        else if (name.startsWith('userprofile.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                userprofile: {
                    ...prev.userprofile,
                    [field]: value
                }
            }));
        } else if (name.startsWith('doctor.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                doctor: {
                    ...prev.doctor,
                    [field]: value
                }
            }));
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordChange(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let dataToSend = {
                username: formData.username,
                email: formData.email,
                is_staff: formData.is_staff,
                userprofile: formData.userprofile, 
            };

            if (isDoctorChecked) {
                dataToSend.doctor = formData.doctor;
            } else {
                dataToSend.doctor = null; 
            }

            if (passwordChange) {
                dataToSend.password = passwordChange;
            }

            const url = editingUser ? `${API_URL_USERS}${editingUser.id}/` : API_URL_USERS;
            const method = editingUser ? 'PATCH' : 'POST'; 

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }

            fetchUsers(); 
            handleCloseModal(); 
            alert(`Usuario ${editingUser ? 'editado' : 'creado'} con éxito.`); 

        } catch (err) {
            console.error("Error al guardar usuario:", err);
            alert(`Error al guardar usuario: ${err.message}`);
        }
    };
    
    const handleEditUser = (user) => {
        handleOpenModal(user);
    };
    
    const handleAddNewUser = () => {
        handleOpenModal(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full text-xl text-gray-700 dark:text-gray-300">
                Cargando usuarios...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full flex-col text-red-600 dark:text-red-400">
                <p className="text-xl">Error al cargar los usuarios:</p>
                <p className="text-sm">{error.message}</p>
                {error.message.includes("Acceso denegado") && (
                    <p className="text-sm mt-2">Asegúrate de haber iniciado sesión con una cuenta de administrador.</p>
                )}
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 font-inter">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Gestión de Usuarios</h2>

            <div className="mb-6 flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Buscar usuarios por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-4 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-1/2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
                <button
                    onClick={handleAddNewUser}
                    className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                >
                    + Nuevo Usuario
                </button>
            </div>

            {users.length === 0 ? (
                <p className="text-center text-gray-600 text-lg dark:text-gray-300">
                    No se encontraron usuarios.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                    Usuario
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                    Email
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                    Nombre Completo
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                    Cargo
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                    Área
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        <div className="flex items-center">
                                            <UserCircleIcon className="h-6 w-6 text-blue-500 mr-2" />
                                            {user.username}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.doctor?.full_name || user.userprofile?.full_name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.userprofile?.position || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.userprofile?.area || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="text-blue-600 hover:text-blue-900 mr-3 dark:text-blue-400 dark:hover:text-blue-200"
                                        >
                                            <PencilIcon className="h-5 w-5 inline-block" />
                                        </button>
                                        {user.es_doctor && ( 
                                            <Link to={`/solicitud-imagenologia?doctor=${user.id}`} className="text-purple-600 hover:text-purple-900 mr-3 dark:text-purple-400 dark:hover:text-purple-200">
                                                <DocumentDuplicateIcon className="h-5 w-5 inline-block" />
                                            </Link>
                                        )}
                                        {currentUser && currentUser.id !== user.id && (
                                            <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">
                                                <TrashIcon className="h-5 w-5 inline-block" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL DE USUARIO */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 dark:bg-gray-900">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 className="text-xl leading-6 font-medium text-gray-900 dark:text-white mb-4" id="modal-title">
                                        {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                                    </h3>
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            {/* Campos para el formulario */}
                                            <div>
                                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre de Usuario</label>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    id="username"
                                                    value={formData.username}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    id="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña {editingUser && <span className="text-gray-400 text-xs">(Dejar en blanco para no cambiar)</span>}</label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    id="password"
                                                    value={passwordChange}
                                                    onChange={handlePasswordChange}
                                                    required={!editingUser}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                />
                                            </div>
                                            {/* Checkbox de es administrador */}
                                            <div className="flex items-center">
                                                <input
                                                    id="is_staff"
                                                    name="is_staff"
                                                    type="checkbox"
                                                    checked={formData.is_staff}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="is_staff" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Es Administrador</label>
                                            </div>
                                            {/* Checkbox de es Doctor - AHORA SIEMPRE HABILITADO Y USANDO isDoctorChecked */}
                                            <div className="flex items-center">
                                                <input
                                                    id="isDoctorChecked" 
                                                    name="isDoctorChecked" 
                                                    type="checkbox"
                                                    checked={isDoctorChecked} 
                                                    onChange={(e) => setIsDoctorChecked(e.target.checked)} 
                                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="isDoctorChecked" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Es Doctor</label>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
                                            {isDoctorChecked ? ( 
                                                <>
                                                    <h3 className="col-span-2 text-lg font-semibold text-gray-800 dark:text-white mb-2">Datos del Doctor</h3>
                                                    <div>
                                                        <label htmlFor="doctor.full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo (Doctor)</label>
                                                        <input
                                                            type="text"
                                                            name="doctor.full_name" 
                                                            id="doctor.full_name"
                                                            value={formData.doctor.full_name}
                                                            onChange={handleInputChange}
                                                            required={isDoctorChecked} 
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="doctor.medical_license" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Licencia Médica</label>
                                                        <input
                                                            type="text"
                                                            name="doctor.medical_license" 
                                                            id="doctor.medical_license"
                                                            value={formData.doctor.medical_license}
                                                            onChange={handleInputChange}
                                                            required={isDoctorChecked} 
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="doctor.specialty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Especialidad</label>
                                                        <input
                                                            type="text"
                                                            name="doctor.specialty" 
                                                            id="doctor.specialty"
                                                            value={formData.doctor.specialty}
                                                            onChange={handleInputChange}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="doctor.phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono (Doctor)</label>
                                                        <input
                                                            type="text"
                                                            name="doctor.phone_number" 
                                                            id="doctor.phone_number"
                                                            value={formData.doctor.phone_number}
                                                            onChange={handleInputChange}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <h3 className="col-span-2 text-lg font-semibold text-gray-800 dark:text-white mb-2">Datos del Perfil</h3>
                                                    <div>
                                                        <label htmlFor="userprofile.full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo (Perfil)</label>
                                                        <input
                                                            type="text"
                                                            name="userprofile.full_name" 
                                                            id="userprofile.full_name"
                                                            value={formData.userprofile.full_name}
                                                            onChange={handleInputChange}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="userprofile.position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cargo</label>
                                                        <input
                                                            type="text"
                                                            name="userprofile.position" 
                                                            id="userprofile.position"
                                                            value={formData.userprofile.position}
                                                            onChange={handleInputChange}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="userprofile.area" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Área</label>
                                                        <input
                                                            type="text"
                                                            name="userprofile.area" 
                                                            id="userprofile.area"
                                                            value={formData.userprofile.area}
                                                            onChange={handleInputChange}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="userprofile.phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono (Perfil)</label>
                                                        <input
                                                            type="text"
                                                            name="userprofile.phone_number" 
                                                            id="userprofile.phone_number"
                                                            value={formData.userprofile.phone_number}
                                                            onChange={handleInputChange}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="userprofile.location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación/Oficina</label>
                                                        <input
                                                            type="text"
                                                            name="userprofile.location" 
                                                            id="userprofile.location"
                                                            value={formData.userprofile.location}
                                                            onChange={handleInputChange}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                                            <button
                                                type="submit"
                                                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm transition-colors duration-200"
                                            >
                                                {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                                            </button>
                                            <button
                                                type="button"
                                                className="mt-3 inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 transition-colors duration-200"
                                                onClick={handleCloseModal}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UsersPage;
