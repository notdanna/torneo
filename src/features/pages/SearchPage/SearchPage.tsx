import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { buscarJugadoresPorNombreParcial } from '../../../core/api/Services/BusquedaJugador.ts';
import ButtonInsertar from '../../../core/components/Buttons/ButtonInsertar.tsx';
import ButtonEditarJugador from '../../../core/components/Buttons/ButtonEditarJugador.tsx';
import ButtonAgregarJugador from './AgregarJugador/AgregarJugador.tsx';
import FormularioJugador from '../../../../src/features/pages/SearchPage/AgregarJugador/FormularioJugador'; 
import type { Jugador } from '../../../core/models/torneo.ts';
import { obtenerJugadorPorId, JugadorFirebase } from '../../../core/api/Services/jugadorService.ts';
import './SearchPage.css';
import './Modal.css';
interface SearchPageProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const SearchPage: React.FC<SearchPageProps> = ({
  onSearch,
  placeholder = "Buscar jugador por nombre..."
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState<JugadorFirebase | null>(null);
  const [loadingEdit, setLoadingEdit] = useState<string | null>(null); // Para manejar loading por jugador específico
  const [mostrarFormularioEdicion, setMostrarFormularioEdicion] = useState(false); // ✅ Estado para mostrar formulario

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
    navigate('/juegos-completos', { 
      state: { 
        jugador: jugador,
        from: 'search' 
      } 
    });
  };

  // ✅ NUEVA FUNCIÓN PARA RECUPERAR DATOS DEL JUGADOR POR ID Y EDITARLO
const handleEditarJugador = async (jugador: Jugador) => {
  const jugadorIdStr = jugador.id_jugador;
    const jugadorId = Number(jugadorIdStr);
  
  if (!jugadorIdStr || isNaN(jugadorId)) {
      setError('ID del jugador no válido');
      return;
    }

  setLoadingEdit(jugadorIdStr);
  setError(null);
  
  try {
    const jugadorCompleto = await obtenerJugadorPorId(jugadorId);
    
    if (jugadorCompleto) {
      setJugadorSeleccionado(jugadorCompleto);
      setMostrarFormularioEdicion(true);
    } else {
      setError(`No se encontró el jugador con ID: ${jugadorIdStr}`);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error al recuperar datos del jugador';
    setError(errorMessage);
    console.error('Error recuperando jugador para editar:', err);
  } finally {
    setLoadingEdit(null);
  }
};
  const handleAgregarJugador = ( ) => {
    // Actualizar la búsqueda para incluir el nuevo jugador
    if (query.trim()) {
      debouncedSearch(query);
    }
    // ✅ Limpiar estados de edición después de agregar/editar
    setJugadorSeleccionado(null);
    setMostrarFormularioEdicion(false);
  };

  // ✅ Función para cerrar el formulario de edición
  const handleCerrarFormularioEdicion = () => {
    setMostrarFormularioEdicion(false);
    setJugadorSeleccionado(null);
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <h1 className="search-title">Búsqueda de Parejas</h1>
        
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
                <p>❌ No se encontraron parejas que contengan "{query}"</p>
                <p className="suggestion-text">
                  💡 Puedes agregar una nueva pareja usando el botón verde en la esquina inferior derecha
                </p>
              </div>
            ) : (
              jugadores.length > 0 && (
                <div className="results-container">
                  <h2 className="results-title">
                    ✅ Se encontraron {jugadores.length} pareja(s):
                  </h2>
                  <div className="jugadores-list">
                    {jugadores.map((jugador, index) => {
                      // ✅ FIX: Convertir id_jugador a string para comparaciones
                      const jugadorIdStr = jugador.id_jugador?.toString();
                      const isLoadingThis = loadingEdit === jugadorIdStr;
                      
                      return (
                        <div key={`${jugadorIdStr}-${index}`} className="jugador-card">
                          <div className="jugador-info">
                            {/* NOMBRE DE LA PAREJA - SIN HIGHLIGHT */}
                            <div className="pareja-nombres">
                              <h3 className="jugador-nombre-principal">
                                👤 {jugador.nombre}
                              </h3>
                              <h3 className="jugador-nombre-acompanante">
                                👥 {jugador.nombreAcompanante || 'Sin acompañante'}
                              </h3>
                            </div>
                            
                            {/* DETALLES DE LA PAREJA */}
                            <div className="jugador-details">
                              <div className="empresas-info">
                                <p><strong>Empresa Principal:</strong> {jugador.empresa}</p>
                                {jugador.empresaAcompanante && (
                                  <p><strong>Empresa Acompañante:</strong> {jugador.empresaAcompanante}</p>
                                )}
                              </div>
                              
                              <div className="nivel-info">
                                <p><strong>Nivel:</strong> {jugador.nivel} - {getNivelTexto(jugador.nivel)}</p>
                                <p><strong>Estado:</strong> {jugador.activo ? '🟢 Activo' : '🔴 Inactivo'}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="jugador-actions">
                            <ButtonInsertar 
                              onInsertar={() => handleInsertar(jugador)}
                              disabled={loading || isLoadingThis}
                            />
                            {/* ✅ BOTÓN "EDITAR" QUE AHORA RECUPERA DATOS DE FIREBASE */}
                            <ButtonEditarJugador 
                              onEditar={() => handleEditarJugador(jugador)}
                              disabled={loading || isLoadingThis}
                              loading={isLoadingThis}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* ✅ MODAL DE FORMULARIO DE EDICIÓN */}
      {mostrarFormularioEdicion && jugadorSeleccionado && (
        <div className="modal-overlay" onClick={handleCerrarFormularioEdicion}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                ✏️ Editar Pareja: {jugadorSeleccionado.nombre} {jugadorSeleccionado.nombreAcompanante ? `y ${jugadorSeleccionado.nombreAcompanante}` : ''}
              </h2>
              <button
                onClick={handleCerrarFormularioEdicion}
                className="modal-close-button"
                aria-label="Cerrar formulario de edición"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <FormularioJugador
                onJugadorAgregado={handleAgregarJugador}
                onCancelar={handleCerrarFormularioEdicion}
                jugadorParaEditar={jugadorSeleccionado}
                modoEdicion={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante siempre visible */}
      <ButtonAgregarJugador 
        onAgregar={handleAgregarJugador}
        disabled={loading}
        nombreInicial={query.trim()}
      />
    </div>
  );
};

// Función para obtener texto del nivel
function getNivelTexto(nivel: number): string {
  if (nivel === 0) return 'Nuevo jugador';
  if (nivel === 1) return 'Principiante';
  if (nivel <= 3) return 'Básico';
  if (nivel <= 6) return 'Intermedio';
  if (nivel <= 8) return 'Avanzado';
  return 'Experto';
}

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

export default SearchPage;