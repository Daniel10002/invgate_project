import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-700 dark:text-gray-300">
      <h1 className="text-6xl font-bold text-blue-600">404</h1>
      <p className="text-2xl mt-4 mb-6">Página No Encontrada</p>
      <p className="text-lg text-center">
        Lo sentimos, la página que estás buscando no existe o ha sido movida.
      </p>
      <Link to="/activos" className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200">
        Ir a Activos
      </Link>
    </div>
  );
}

export default NotFound;