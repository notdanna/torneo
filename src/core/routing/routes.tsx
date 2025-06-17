import { Routes, Route } from 'react-router-dom';
import SearchPage from '../../features/pages/SearchPage/SearchPage';
import DataJuegos from '../../features/pages/DataJuegos/VisualizacionJuegos';
import AdministrarGrupoJuego from '../../features/pages/admin/Admin';
import LayoutJuegos from '../../features/pages/DataJuegos/LayoutJuegos';

export const AppRoutes = () => {
  // Provide onSearch callback to satisfy required SearchPageProps
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
  };

  return (
    <Routes>
      {/* Ruta principal */}
      <Route 
        path="/" 
        element={<SearchPage onSearch={handleSearch} placeholder="Buscar invitado" />} 
      />
      
      {/* Ruta de búsqueda */}
      <Route 
        path="/search" 
        element={<SearchPage onSearch={handleSearch} placeholder="Buscar invitado" />} 
      />
      
      {/* Ruta para visualización de juegos */}
      <Route path="/data-juegos" element={<DataJuegos />} /> 
      {/* Ruta para administración de grupos */}
      <Route path="/admin" element={<AdministrarGrupoJuego />} />
      {/*Ruta para visualización de juegos */}
      <Route path="/juegos-completos" element={<LayoutJuegos />} />
    </Routes>
  );
};