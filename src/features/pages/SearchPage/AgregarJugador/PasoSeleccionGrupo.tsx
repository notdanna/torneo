import * as React from 'react';
import { GrupoLocal, JugadorCreadoLocal } from '../../../../core/models/formulario.ts';

interface PasoSeleccionGrupoProps {
  jugadorCreado: JugadorCreadoLocal | null;
  juegoSeleccionado?: number;
  gruposDisponibles: GrupoLocal[];
  grupoSeleccionado: number;
  cargandoGrupos: boolean;
  loadingGrupo: boolean;
  dataGrupo: any;
  grupoSeleccionadoInfo?: GrupoLocal;
  formDataNivel: number;
  onSeleccionarGrupo: (id: number) => void;
  onConfirmar: () => void;
  onCancelar: () => void;
  obtenerNombreJuego: (id: number) => string;
  getNivelTexto: (nivel: number) => string;
}

const PasoSeleccionGrupo: React.FC<PasoSeleccionGrupoProps> = ({
  jugadorCreado,
  juegoSeleccionado,
  gruposDisponibles,
  grupoSeleccionado,
  cargandoGrupos,
  loadingGrupo,
  dataGrupo,
  grupoSeleccionadoInfo,
  formDataNivel,
  onSeleccionarGrupo,
  onConfirmar,
  onCancelar,
  obtenerNombreJuego,
  getNivelTexto
}) => {
  
  const getGrupoRecomendado = (nivel: number): number | null => {
    // Lógica simple para recomendar grupo basado en nivel
    if (nivel <= 2) return gruposDisponibles.find(g => g.nombre.includes('A'))?.id || null;
    if (nivel <= 5) return gruposDisponibles.find(g => g.nombre.includes('B'))?.id || null;
    return gruposDisponibles.find(g => g.nombre.includes('C'))?.id || null;
  };

  const grupoRecomendado = jugadorCreado ? getGrupoRecomendado(jugadorCreado.nivel) : null;

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h3 className="step-title">Seleccionar Grupo</h3>
      </div>

      {/* Resumen de la información del jugador */}
      {jugadorCreado && (
        <div className="resumen-jugador">
          <div className="resumen-header">
            <h4 className="resumen-title">📋 Resumen del Registro</h4>
          </div>
          <div className="resumen-content">
            <div className="resumen-item">
              <span className="resumen-label">Nombre:</span>
              <span className="resumen-valor">{jugadorCreado.nombre}</span>
            </div>
            <div className="resumen-item">
              <span className="resumen-label">Id de la pareja:</span>
              <span className="resumen-valor">{jugadorCreado.id_jugador}</span>
            </div>
            {juegoSeleccionado && (
              <div className="resumen-item">
                <span className="resumen-label">Juego:</span>
                <span className="resumen-valor">{obtenerNombreJuego(juegoSeleccionado)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="form-section">
        {/* Estados de carga */}
        {cargandoGrupos && (
          <div className="loading-state">
            <div className="loading-spinner">⏳</div>
            <p>Cargando grupos disponibles...</p>
          </div>
        )}

        {/* Lista de grupos */}
        {!cargandoGrupos && gruposDisponibles.length > 0 && (
          <>
            <div className="grupos-container">
              <h4 className="grupos-title">Grupos disponibles:</h4>
              <div className="lista-grupos">
                {gruposDisponibles
                  .filter(grupo => grupo.activo !== false)
                  .map((grupo) => (
                    <div
                      key={grupo.id}
                      className={`grupo-opcion ${grupoSeleccionado === grupo.id ? 'seleccionado' : ''} ${grupo.id === grupoRecomendado ? 'recomendado' : ''}`}
                      onClick={() => onSeleccionarGrupo(grupo.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSeleccionarGrupo(grupo.id);
                        }
                      }}
                    >
                      <div className="grupo-header">
                        <div className="grupo-info">
                          <span className="grupo-nombre">{grupo.nombre}</span>
                        </div>
                        <div className="grupo-meta">
                          {grupo.id === grupoRecomendado && (
                            <span className="recomendado-badge">⭐ Recomendado</span>
                          )}
                          <span className="grupo-id-badge">ID: {grupo.id}</span>
                          <div className="selector-radio">
                            <input
                              type="radio"
                              name="grupo"
                              readOnly
                              checked={grupoSeleccionado === grupo.id}
                              tabIndex={-1}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {/* Estado sin grupos */}
        {!cargandoGrupos && gruposDisponibles.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h4>No hay grupos disponibles</h4>
            <p>No se encontraron grupos para este juego en este momento.</p>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="step-actions">
        <button 
          type="button" 
          onClick={onCancelar} 
          className="btn-cancel" 
          disabled={loadingGrupo || dataGrupo !== null}
        >
          <span className="btn-icon"></span>
          Cancelar
        </button>
        
        <button 
          type="button" 
          onClick={onConfirmar} 
          className="btn-finish" 
          disabled={!grupoSeleccionado || loadingGrupo || dataGrupo !== null}
          title={
            !grupoSeleccionado 
              ? 'Selecciona un grupo para finalizar' 
              : dataGrupo !== null 
              ? 'Registro ya completado' 
              : 'Finalizar el registro'
          }
        >
          <span className="btn-icon">
          </span>
          {loadingGrupo ? (
            'Finalizando...'
          ) : dataGrupo !== null ? (
            'Registro Completado'
          ) : (
            'Finalizar Registro'
          )}
        </button>
      </div>
    </div>
  );
};

export default PasoSeleccionGrupo;