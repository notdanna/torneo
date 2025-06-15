import { Routes, Route } from 'react-router-dom';
import SearchPage from '../../features/pages/SearchPage/SearchPage';
import DataJuegos from '../../features/pages/DataJuegos/VisualizacionJuegos';

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
      
      {/* Ruta alternativa para visualización de juegos */}
      <Route path="/visualizacion-juegos" element={<DataJuegos />} />
    </Routes>
  );
};