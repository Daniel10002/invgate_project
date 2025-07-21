import React from 'react';
import { WifiIcon, ShieldCheckIcon, BuildingOfficeIcon, ComputerDesktopIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

function AssetCard({ asset, onEdit, onDelete }) {
  const connectivityColor = asset.connectivity ? 'bg-green-500' : 'bg-red-500';
  const connectivityText = asset.connectivity ? 'Online' : 'Offline';
  const antivirusStatus = asset.antivirus_enabled ? 'Habilitado' : 'Deshabilitado';
  const antivirusColor = asset.antivirus_enabled ? 'text-green-600' : 'text-red-600';

  const getAssetIcon = (type) => {
    switch (type) {
      case 'computer':
        return <ComputerDesktopIcon className="h-5 w-5 text-purple-600" />;
      case 'software':
        return <img src="[https://via.placeholder.com/20](https://via.placeholder.com/20)" alt="Software" className="h-5 w-5" />;
      case 'contract':
        return <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <ComputerDesktopIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 flex flex-col justify-between dark:bg-gray-800 dark:border-blue-700">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getAssetIcon(asset.asset_type)}
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{asset.name || 'Sin Nombre'}</h3>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-800 dark:text-blue-100">
            {asset.status || 'Desconocido'}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">ID: <span className="font-medium text-gray-700 dark:text-gray-200">{asset.asset_id || 'N/A'}</span></p>

        <div className="grid grid-cols-2 gap-y-2 mt-4 text-sm">
          <div className="flex items-center">
            <WifiIcon className={`h-5 w-5 mr-2 ${asset.connectivity ? 'text-green-500' : 'text-red-500'}`} />
            <span className="font-medium text-gray-700 dark:text-gray-300">Conectividad:</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${connectivityColor} text-white`}>
              {connectivityText}
            </span>
          </div>
          <div className="flex items-center">
            <ShieldCheckIcon className={`h-5 w-5 mr-2 ${antivirusColor}`} />
            <span className="font-medium text-gray-700 dark:text-gray-300">Antivirus:</span>
            <span className={`ml-2 text-xs font-semibold ${antivirusColor}`}>
              {antivirusStatus}
            </span>
          </div>
          {asset.location && (
            <div className="flex items-center col-span-2">
              <span className="text-gray-500 mr-2 dark:text-gray-400">Ubicación:</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">{asset.location}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
        <button
          onClick={onEdit}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center dark:text-blue-400 dark:hover:text-blue-200"
        >
          <PencilIcon className="h-4 w-4 mr-1" /> Editar
        </button>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center dark:text-red-400 dark:hover:text-red-200"
        >
          <TrashIcon className="h-4 w-4 mr-1" /> Eliminar
        </button>
      </div>
    </div>
  );
}

export default AssetCard;