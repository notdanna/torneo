import { Search, X } from 'lucide-react';
import './SearchPage.css';
import { useState, useEffect, useCallback } from 'react';
import { buscarJugadoresPorNombreParcial } from '../../../core/api/jugadoresService.ts';
import ButtonInsertar from '../../../core/components/ButtonInsertar.tsx';
import ButtonEditarJugador from '../../../core/components/ButtonEditarJugador.tsx';
import ButtonAgregarJugador from '../../pages/SearchPage/AgregarJugador/AgregarJugador.tsx';
import type { Jugador } from '../../../../../backend/src/ts/models/torneo.ts';

interface SearchPageProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const SearchPage: React.FC<SearchPageProps> = ({
  onSearch,
  placeholder = "Buscar jugador por nombre..."
}) => {
  const [query, setQuery] = useState('');
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función debounced para búsqueda
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setJugadores([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const resultados = await buscarJugadoresPorNombreParcial(searchQuery.trim());
        setJugadores(resultados);
        onSearch?.(searchQuery.trim());
      } catch (err) {
        setError('Error al buscar jugadores. Intenta de nuevo.');
        console.error('Error en búsqueda:', err);
        setJugadores([]);
      } finally {
        setLoading(false);
      }
    }, 300), // 300ms de delay
    [onSearch]
  );

  // Efecto para búsqueda en tiempo real
  useEffect(() => {
    debouncedSearch(query);
    
    // Cleanup function para cancelar búsquedas pendientes
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [query, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
  };

  const handleClear = () => {
    setQuery('');
    setJugadores([]);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // La búsqueda ya se maneja en tiempo real, solo evitamos el refresh
  };

  const handleInsertar = (jugador: Jugador) => {
    // Aquí puedes agregar la lógica para insertar el jugador
    console.log('Insertando jugador:', jugador);
    // Por ejemplo, podrías llamar a una función para agregar al torneo
    // insertarJugadorEnTorneo(jugador);
  };

  const handleEditar = (jugador: Jugador) => {
    // Aquí puedes agregar la lógica para editar el jugador
    console.log('Editando jugador:', jugador);
    // Por ejemplo, podrías abrir un modal de edición
    // abrirModalEdicion(jugador);
  };

  const handleAgregarJugador = () => {
    // Aquí puedes agregar la lógica para agregar un nuevo jugador
    console.log('Agregando nuevo jugador con nombre:', query);
    // Por ejemplo, podrías abrir un modal para crear jugador
    // abrirModalCrearJugador(query);
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <h1 className="search-title">Búsqueda de Jugadores</h1>
        
        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="search-input"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="clear-button"
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {loading && (
            <div className="loading-indicator">
              <span>🔍 Buscando...</span>
            </div>
          )}
        </form>

        {/* Resultados de búsqueda */}
        {query.trim() && (
          <div className="search-results">
            {error ? (
              <div className="error-message">
                <p>❌ {error}</p>
              </div>
            ) : jugadores.length === 0 && !loading ? (
              <div className="no-results">
                <p>❌ No se encontraron jugadores que contengan "{query}"</p>
                <div className="add-player-suggestion">
                  <ButtonAgregarJugador 
                   onAgregar={(jugador) => {
                    console.log('Nuevo jugador creado:', jugador);
                    // Aquí puedes agregar lógica adicional como actualizar el estado
                  }}
                  disabled={loading}
                  />
                </div>
              </div>
            ) : (
              jugadores.length > 0 && (
                <div className="results-container">
                  <h2 className="results-title">
                    ✅ Se encontraron {jugadores.length} jugador(es):
                  </h2>
                  <div className="jugadores-list">
                    {jugadores.map((jugador, index) => (
                      <div key={`${jugador.id_jugador}-${index}`} className="jugador-card">
                        <div className="jugador-info">
                          <h3 className="jugador-nombre">
                            {highlightMatch(jugador.nombre, query)}
                          </h3>
                          <div className="jugador-details">
                            <p><strong>Empresa:</strong> {jugador.empresa}</p>
                          </div>
                        </div>
                        <div className="jugador-actions">
                          <ButtonInsertar 
                            onInsertar={() => handleInsertar(jugador)}
                            disabled={loading}
                          />
                          <ButtonEditarJugador 
                            onEditar={() => handleEditar(jugador)}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Función debounce
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout;
  
  const debouncedFunction = ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T & { cancel: () => void };
  
  debouncedFunction.cancel = () => {
    clearTimeout(timeoutId);
  };
  
  return debouncedFunction;
}

// Función para resaltar el texto coincidente
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="highlight">{part}</mark>
    ) : (
      part
    )
  );
}

export default SearchPage;