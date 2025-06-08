import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SearchPage from '../../features/pages/SearchPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/search" element={<SearchPage />} />
      {/* Otras rutas */}
    </Routes>
  );
};

// O si quieres usarlo en App.tsx directamente:
// import SearchPage from './features/search/pages/SearchPage';