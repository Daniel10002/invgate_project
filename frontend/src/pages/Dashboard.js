import React, { useEffect, useState } from 'react';
import AssetCard from '../components/AssetCard';
import AssetForm from '../components/AssetForm';

function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // CAMBIO CLAVE AQUÍ: BASE_API_URL dinámica
  const BASE_API_URL = `http://${window.location.hostname}:8000/api/assets/`;
  
  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = searchTerm ? `${BASE_API_URL}?search=${searchTerm}` : BASE_API_URL;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      setAssets(data);
    } catch (err) {
      setError(err);
      console.error("Error al obtener los activos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [searchTerm]);

  const openForm = (asset = null) => {
    setCurrentAsset(asset);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setCurrentAsset(null);
  };

  const handleSaveAsset = async (assetData) => {
    try {
      const method = assetData.id ? 'PUT' : 'POST';
      const url = assetData.id ? `${BASE_API_URL}${assetData.id}/` : BASE_API_URL;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al guardar activo: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      await fetchAssets();
      closeForm();
    } catch (err) {
      setError(err);
      console.error("Error al guardar el activo:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este activo?')) {
      return;
    }
    try {
      const response = await fetch(`${BASE_API_URL}${assetId}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al eliminar activo: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      await fetchAssets();
    } catch (err) {
      setError(err);
      console.error("Error al eliminar el activo:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const displayedAssets = assets;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-700 dark:text-gray-300">
        Cargando activos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen flex-col text-red-600 dark:text-red-400">
        <p className="text-xl">Error al cargar los datos:</p>
        <p className="text-sm">{error.message}</p>
        <p className="text-sm mt-2">Asegúrate de que el servidor de Django esté corriendo en http://localhost:8000 en otra terminal.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Activos de TI</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => openForm()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
          >
            <span className="mr-2">+</span>
            Nuevo Activo
          </button>
          <button
            onClick={() => alert('Funcionalidad de exportar aún no implementada.')}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            Exportar
          </button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar activos por nombre, ID, tipo, ubicación o asignado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-4 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedAssets.length > 0 ? (
          displayedAssets.map(asset => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onEdit={() => openForm(asset)}
              onDelete={() => handleDeleteAsset(asset.id)}
            />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600 text-lg dark:text-gray-300">
            No hay activos disponibles o no coinciden con la búsqueda.
          </p>
        )}
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm dark:text-gray-400">
          <p>© 2025 InvGate. Todos los derechos reservados. | <a href="#" className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-200">Más información</a></p>
      </div>

      {isFormOpen && (
        <AssetForm
          asset={currentAsset}
          onSave={handleSaveAsset}
          onCancel={closeForm}
        />
      )}
    </>
  );
}

export default Dashboard;