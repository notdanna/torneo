import { Routes, Route } from 'react-router-dom';
import SearchPage from '../../features/pages/SearchPage/SearchPage';
import BracketTiempoReal11 from '../../features/pages/GrafoTorneo/futbolitoBracket/BracketTiempoReal_1';
import BracketTiempoReal12 from '../../features/pages/GrafoTorneo/futbolitoBracket/BracketTiempoReal_2';
import BracketTiempoReal13 from '../../features/pages/GrafoTorneo/futbolitoBracket/BracketTiempoReal_3';

import BracketTiempoReal21 from '../../features/pages/GrafoTorneo/sopladosBracket/BracketTiempoReal_1';
import BracketTiempoReal22 from '../../features/pages/GrafoTorneo/sopladosBracket/BracketTiempoReal_2';
import BracketTiempoReal23 from '../../features/pages/GrafoTorneo/sopladosBracket/BracketTiempoReal_3';

import BracketTiempoReal31 from '../../features/pages/GrafoTorneo/rayuelaBracket/BracketTiempoReal_1';
import BracketTiempoReal32 from '../../features/pages/GrafoTorneo/rayuelaBracket/BracketTiempoReal_2';
import BracketTiempoReal33 from '../../features/pages/GrafoTorneo/rayuelaBracket/BracketTiempoReal_3';

import BracketTiempoReal41 from '../../features/pages/GrafoTorneo/beerpongBracket/BracketTiempoReal_1';
import BracketTiempoReal42 from '../../features/pages/GrafoTorneo/beerpongBracket/BracketTiempoReal_2';
import BracketTiempoReal43 from '../../features/pages/GrafoTorneo/beerpongBracket/BracketTiempoReal_3';

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

      {/* Ruta alternativa para visualización de juegos */}

      {/* Ruta para administración de grupos */}
      <Route path="/admin" element={<AdministrarGrupoJuego />} />
      {/*Ruta para visualización de juegos */}
      <Route path="/juegos-completos" element={<LayoutJuegos />} />
      {/*Ruta para BracketTiempoReal */}
      <Route path="/bracket_11" element={<BracketTiempoReal11 />} />
      <Route path="/bracket_12" element={<BracketTiempoReal12 />} />
      <Route path="/bracket_13" element={<BracketTiempoReal13 />} />

      <Route path="/bracket_21" element={<BracketTiempoReal21 />} />
      <Route path="/bracket_22" element={<BracketTiempoReal22 />} />
      <Route path="/bracket_23" element={<BracketTiempoReal23 />} />

      <Route path="/bracket_31" element={<BracketTiempoReal31 />} />
      <Route path="/bracket_32" element={<BracketTiempoReal32 />} />
      <Route path="/bracket_33" element={<BracketTiempoReal33 />} />

      <Route path="/bracket_41" element={<BracketTiempoReal41 />} />
      <Route path="/bracket_42" element={<BracketTiempoReal42 />} />
      <Route path="/bracket_43" element={<BracketTiempoReal43 />} />

    </Routes>
  );
};