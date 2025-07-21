import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const { user, token, updateUserInContext } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    position: '',
    area: '',
    phone_number: '',
    location: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  // CAMBIO CLAVE AQUÍ: API_BASE_URL dinámica
  const API_BASE_URL_PROFILE = `http://${window.location.hostname}:8000/api/`;


  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        full_name: user.profile?.full_name || '',
        position: user.profile?.position || '',
        area: user.profile?.area || '',
        phone_number: user.profile?.phone_number || '',
        location: user.profile?.location || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      if (!user || !user.id) {
        console.error("ProfilePage: Error - User ID is missing in context.");
        throw new Error("No se pudo obtener el ID del usuario para actualizar.");
      }

      let userUpdatePayload = {};
      if (formData.email !== user.email) {
        userUpdatePayload.email = formData.email === '' ? null : formData.email;
      }

      const profileUpdatePayload = {
        full_name: formData.full_name,
        position: formData.position,
        area: formData.area,
        phone_number: formData.phone_number,
        location: formData.location,
      };
      userUpdatePayload.userprofile = profileUpdatePayload;

      // Usar la URL dinámica
      const updateUrl = `${API_BASE_URL_PROFILE}users/${user.id}/`;

      const response = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(userUpdatePayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = 'Error al guardar perfil.';
        if (errorData && errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData && typeof errorData === 'object') {
          errorMessage = Object.keys(errorData).map(key => {
            const value = errorData[key];
            return `${key}: ${Array.isArray(value) ? value.join(', ') : value}`;
          }).join('; ');
        }
        throw new Error(errorMessage);
      }

      // Usar la URL dinámica
      const fetchUpdatedUserUrl = `${API_BASE_URL_PROFILE}users/${user.id}/`;
      const updatedUserResponse = await fetch(fetchUpdatedUserUrl, {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (!updatedUserResponse.ok) {
        throw new Error('Error al obtener datos actualizados del usuario después de guardar.');
      }

      const updatedUserData = await updatedUserResponse.json();

      const newAuthUserObject = {
        id: updatedUserData.id,
        username: updatedUserData.username,
        email: updatedUserData.email,
        is_staff: updatedUserData.is_staff, // Asegúrate de incluir is_staff aquí
        profile: updatedUserData.userprofile
      };

      updateUserInContext(newAuthUserObject);

      setMessage('Perfil actualizado con éxito.');
      setIsEditing(false);
    } catch (error) {
      console.error("ProfilePage: Error en handleSave:", error);
      setMessage(`Error al guardar: ${error.message}`);
    }
  };

  if (!user || !user.username) {
    return (
      <div className="flex justify-center items-center h-full text-xl text-gray-700 dark:text-gray-300">
        Cargando perfil...
      </div>
    );
  }

  const displayDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (dateString.includes('T') && dateString.includes('Z')) {
        return date.toLocaleString();
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md mt-10 dark:bg-gray-800 dark:text-white">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Mi Perfil</h2>
      {message && (
        <div className={`mb-4 px-4 py-2 rounded ${message.startsWith('Error') ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200' : 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200'}`}>
          {message}
        </div>
      )}

      {!isEditing ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Usuario:</label>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{user.username}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email:</label>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{user.email || 'No proporcionado'}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo:</label>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{user.profile?.full_name || 'No proporcionado'}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cargo:</label>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{user.profile?.position || 'No proporcionado'}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Área:</label>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{user.profile?.area || 'No proporcionado'}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono:</label>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{user.profile?.phone_number || 'No proporcionado'}</p>
            </div>
            <div className="mb-4">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación/Oficina</label>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{user.profile?.location || 'No proporcionado'}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Última Conexión:</label>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{displayDate(user.profile?.last_login_at) || 'N/A'}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Registro:</label>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{displayDate(user.date_joined) || 'N/A'}</p>
            </div>
          </div>
          <div className="mt-6 text-right">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors duration-200"
            >
              Editar Perfil
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Usuario (no editable)</label>
            <input
              type="text"
              id="username"
              value={user.username}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
            <input
              type="text"
              name="full_name"
              id="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cargo</label>
            <input
              type="text"
              name="position"
              id="position"
              value={formData.position}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="area" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Área</label>
            <input
              type="text"
              name="area"
              id="area"
              value={formData.area}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de Teléfono</label>
            <input
              type="text"
              name="phone_number"
              id="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación/Oficina</label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="md:col-span-2 flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => { setIsEditing(false); setMessage(''); }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ProfilePage;
