import { Routes, Route } from 'react-router-dom';
import SearchPage from '../../features/pages/SearchPage/SearchPage';

export const AppRoutes = () => {
  // Provide onSearch callback to satisfy required SearchPageProps
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
  };

  return (
    <Routes>
      <Route path="/search" element={<SearchPage onSearch={handleSearch} />} />
      {/* Otras rutas */}
    </Routes>
  );
};

// O si quieres usarlo en App.tsx directamente:
// import SearchPage from './features/search/pages/SearchPage';