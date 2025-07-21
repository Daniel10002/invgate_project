import React, { useState, useEffect } from 'react';

function AssetForm({ asset, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    asset_id: '',
    asset_type: 'computer',
    description: '',
    status: 'Activo',
    connectivity: true,
    antivirus_enabled: true,
    purchase_date: '',
    warranty_expiry_date: '',
    contract_number: '',
    location: '',
    ip_address: '',
    mac_address: '',
    assigned_to: '',
    ...(asset && { id: asset.id }),
  });

  const [errors, setErrors] = useState({});

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (asset) {
      setFormData({
        id: asset.id || '',
        name: asset.name || '',
        asset_id: asset.asset_id || '',
        asset_type: asset.asset_type || 'computer',
        description: asset.description || '',
        status: asset.status || 'Activo',
        connectivity: asset.connectivity,
        antivirus_enabled: asset.antivirus_enabled,
        purchase_date: formatDate(asset.purchase_date),
        warranty_expiry_date: formatDate(asset.warranty_expiry_date),
        contract_number: asset.contract_number || '',
        location: asset.location || '',
        ip_address: asset.ip_address || '',
        mac_address: asset.mac_address || '',
        assigned_to: asset.assigned_to || '',
      });
    } else {
      setFormData({
        name: '',
        asset_id: '',
        asset_type: 'computer',
        description: '',
        status: 'Activo',
        connectivity: true,
        antivirus_enabled: true,
        purchase_date: '',
        warranty_expiry_date: '',
        contract_number: '',
        location: '',
        ip_address: '',
        mac_address: '',
        assigned_to: '',
      });
    }
    setErrors({});
  }, [asset]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
        setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del activo es obligatorio.';
    }
    if (!formData.asset_id.trim()) {
      newErrors.asset_id = 'El ID del activo es obligatorio.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    } else {
      alert('Por favor, corrige los errores del formulario.');
    }
  };

  const assetTypes = [
    { value: 'computer', label: 'Computadora' },
    { value: 'software', label: 'Software' },
    { value: 'contract', label: 'Contrato' },
    { value: 'network_device', label: 'Dispositivo de Red' },
    { value: 'server', label: 'Servidor' },
    { value: 'printer', label: 'Impresora' },
    { value: 'mobile_device', label: 'Dispositivo Móvil' },
    { value: 'peripheral', label: 'Periférico' },
    { value: 'other', label: 'Otro' },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{asset ? 'Editar Activo' : 'Nuevo Activo'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Activo</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="asset_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ID del Activo</label>
            <input
              type="text"
              name="asset_id"
              id="asset_id"
              value={formData.asset_id}
              onChange={handleChange}
              required
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white ${errors.asset_id ? 'border-red-500' : ''}`}
            />
            {errors.asset_id && <p className="text-red-500 text-xs mt-1">{errors.asset_id}</p>}
          </div>

          <div>
            <label htmlFor="asset_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Activo</label>
            <select
              name="asset_type"
              id="asset_type"
              value={formData.asset_type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            >
              {assetTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
            <input
              type="text"
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              name="connectivity"
              id="connectivity"
              checked={formData.connectivity}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="connectivity" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Conectividad (Online)</label>
          </div>
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              name="antivirus_enabled"
              id="antivirus_enabled"
              checked={formData.antivirus_enabled}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="antivirus_enabled" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Antivirus Habilitado</label>
          </div>

          <div>
            <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Compra</label>
            <input
              type="date"
              name="purchase_date"
              id="purchase_date"
              value={formData.purchase_date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="warranty_expiry_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fin de Garantía</label>
            <input
              type="date"
              name="warranty_expiry_date"
              id="warranty_expiry_date"
              value={formData.warranty_expiry_date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
          <div>
            <label htmlFor="contract_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número de Contrato</label>
            <input
              type="text"
              name="contract_number"
              id="contract_number"
              value={formData.contract_number}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación Física</label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="ip_address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección IP</label>
            <input
              type="text"
              name="ip_address"
              id="ip_address"
              value={formData.ip_address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="mac_address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dirección MAC</label>
            <input
              type="text"
              name="mac_address"
              id="mac_address"
              value={formData.mac_address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Asignado A</label>
            <input
              type="text"
              name="assigned_to"
              id="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Botones de acción */}
          <div className="md:col-span-2 flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Guardar Activo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssetForm;