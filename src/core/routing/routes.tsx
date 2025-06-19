import { Routes, Route } from 'react-router-dom';
import SearchPage from '../../features/pages/SearchPage/SearchPage';

{/*}
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
*/}

import { TorneoContainer11 } from '../../features/pages/GrafoTorneo/futbolitoBracket/TorneoContainer_1.tsx';
import { TorneoContainer12 } from '../../features/pages/GrafoTorneo/futbolitoBracket/TorneoContainer_2.tsx';
import { TorneoContainer13 } from '../../features/pages/GrafoTorneo/futbolitoBracket/TorneoContainer_3.tsx';

import { TorneoContainer21 } from '../../features/pages/GrafoTorneo/sopladosBracket/TorneoContainer_1.tsx';
import { TorneoContainer22 } from '../../features/pages/GrafoTorneo/sopladosBracket/TorneoContainer_2.tsx';
import { TorneoContainer23 } from '../../features/pages/GrafoTorneo/sopladosBracket/TorneoContainer_3.tsx';

import { TorneoContainer31 } from '../../features/pages/GrafoTorneo/beerpongBracket/TorneoContainer_1.tsx';
import { TorneoContainer32 } from '../../features/pages/GrafoTorneo/beerpongBracket/TorneoContainer_2.tsx';
import { TorneoContainer33 } from '../../features/pages/GrafoTorneo/beerpongBracket/TorneoContainer_3.tsx';

import { TorneoContainer41 } from '../../features/pages/GrafoTorneo/rayuelaBracket/TorneoContainer_1.tsx';
import { TorneoContainer42 } from '../../features/pages/GrafoTorneo/rayuelaBracket/TorneoContainer_2.tsx';
import { TorneoContainer43 } from '../../features/pages/GrafoTorneo/rayuelaBracket/TorneoContainer_3.tsx';

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
      {/*Ruta para BracketTiempoReal 
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
      */}

      {/* Rutas para el torneo de futbolito */}

      {/* Ruta para el torneo completo */}
      <Route path="/torneo_11" element={<TorneoContainer11 />} />
      <Route path="/torneo_12" element={<TorneoContainer12 />} />
      <Route path="/torneo_13" element={<TorneoContainer13 />} />
     
      <Route path="/torneo_21" element={<TorneoContainer21 />} />
      <Route path="/torneo_22" element={<TorneoContainer22 />} />
      <Route path="/torneo_23" element={<TorneoContainer23 />} />

      <Route path="/torneo_31" element={<TorneoContainer31 />} />
      <Route path="/torneo_32" element={<TorneoContainer32 />} />
      <Route path="/torneo_33" element={<TorneoContainer33 />} />

      <Route path="/torneo_41" element={<TorneoContainer41 />} />
      <Route path="/torneo_42" element={<TorneoContainer42 />} />
      <Route path="/torneo_43" element={<TorneoContainer43 />} />
      
      {/* Rutas para otros torneos */}

    </Routes>
  );
};