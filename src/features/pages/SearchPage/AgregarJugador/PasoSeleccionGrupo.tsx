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
  const formatearNombrePareja = (jugador: JugadorCreadoLocal) => {
    if (jugador.nombreAcompanante) {
      return `${jugador.nombre} y ${jugador.nombreAcompanante}`;
    }
    return jugador.nombre;
  };

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
        <h3 className="step-title">📁 Paso 3: Seleccionar Grupo</h3>
        <p className="step-description">Elige el grupo donde competirá la pareja</p>
        
        {/* Información del contexto */}
        {jugadorCreado && juegoSeleccionado && (
          <div className="context-info">
            <div className="context-card">
              <div className="context-row">
                <span className="context-label">👤 Pareja:</span>
                <span className="context-value">{formatearNombrePareja(jugadorCreado)}</span>
              </div>
              <div className="context-row">
                <span className="context-label">🎮 Juego:</span>
                <span className="context-value">{obtenerNombreJuego(juegoSeleccionado)}</span>
              </div>
              <div className="context-row">
                <span className="context-label">⭐ Nivel:</span>
                <span className="context-value">{jugadorCreado.nivel} - {getNivelTexto(jugadorCreado.nivel)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

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
            {/* Recomendación */}
            {grupoRecomendado && (
              <div className="recommendation-banner">
                <span className="recommendation-icon">💡</span>
                <div className="recommendation-content">
                  <strong>Grupo recomendado:</strong> Basado en el nivel de habilidad ({jugadorCreado?.nivel}), 
                  recomendamos el grupo {gruposDisponibles.find(g => g.id === grupoRecomendado)?.nombre}.
                </div>
              </div>
            )}

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
                          <span className="grupo-descripcion">{grupo.descripcion || 'Sin descripción'}</span>
                        </div>
                        <div className="grupo-meta">
                          {grupo.id === grupoRecomendado && (
                            <span className="recomendado-badge">Recomendado</span>
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
                      
                      {grupoSeleccionado === grupo.id && (
                        <div className="grupo-details">
                          <div className="detail-item">
                            <span className="detail-icon">📊</span>
                            <span>Nivel sugerido para este grupo</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">👥</span>
                            <span>Competencias grupales regulares</span>
                          </div>
                        </div>
                      )}
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

      {/* Resumen final */}
      {grupoSeleccionadoInfo && jugadorCreado && juegoSeleccionado && (
        <div className="resumen-final">
          <h5>🎯 Resumen del registro completo:</h5>
          <div className="resumen-details">
            <div className="resumen-grid">
              <div className="resumen-item">
                <span className="resumen-icon">👤</span>
                <div className="resumen-content">
                  <span className="resumen-label">Pareja:</span>
                  <span className="resumen-value">{formatearNombrePareja(jugadorCreado)}</span>
                </div>
              </div>
              
              <div className="resumen-item">
                <span className="resumen-icon">🎮</span>
                <div className="resumen-content">
                  <span className="resumen-label">Juego:</span>
                  <span className="resumen-value">{obtenerNombreJuego(juegoSeleccionado)}</span>
                </div>
              </div>
              
              <div className="resumen-item">
                <span className="resumen-icon">📁</span>
                <div className="resumen-content">
                  <span className="resumen-label">Grupo:</span>
                  <span className="resumen-value">{grupoSeleccionadoInfo.nombre}</span>
                </div>
              </div>
              
              <div className="resumen-item">
                <span className="resumen-icon">⭐</span>
                <div className="resumen-content">
                  <span className="resumen-label">Nivel:</span>
                  <span className="resumen-value">{formDataNivel} - {getNivelTexto(formDataNivel)}</span>
                </div>
              </div>

              <div className="resumen-item">
                <span className="resumen-icon">📋</span>
                <div className="resumen-content">
                  <span className="resumen-label">Estado:</span>
                  <span className="resumen-value">Listo para finalizar</span>
                </div>
              </div>
            </div>

            {/* Información adicional del grupo */}
            <div className="grupo-info-extra">
              <div className="info-item">
                <span className="info-icon">📝</span>
                <span className="info-text">
                  <strong>{grupoSeleccionadoInfo.nombre}:</strong> {grupoSeleccionadoInfo.descripcion || 'Sin descripción'}
                </span>
              </div>
              
              {grupoRecomendado && grupoSeleccionado === grupoRecomendado && (
                <div className="info-item highlight">
                  <span className="info-icon">✨</span>
                  <span className="info-text">
                    Este grupo es el <strong>recomendado</strong> para el nivel de habilidad de la pareja
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de éxito */}
      {dataGrupo !== null && (
        <div className="success-final">
          <div className="success-icon">🎉</div>
          <div className="success-content">
            <h4>¡Registro completado exitosamente!</h4>
            <p>
              La pareja <strong>{jugadorCreado?.nombre}</strong> ha sido agregada al grupo{' '}
              <strong>{grupoSeleccionadoInfo?.nombre}</strong> correctamente.
            </p>
            <div className="success-details">
              <div className="success-step">
                <span className="step-icon">✅</span>
                <span className="step-text">Jugador registrado</span>
              </div>
              <div className="success-step">
                <span className="step-icon">✅</span>
                <span className="step-text">Juego asignado</span>
              </div>
              <div className="success-step">
                <span className="step-icon">✅</span>
                <span className="step-text">Grupo confirmado</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="step-actions">
        <button 
          type="button" 
          onClick={onCancelar} 
          className="btn-cancel" 
          disabled={loadingGrupo || dataGrupo !== null}
        >
          <span className="btn-icon">❌</span>
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
            {loadingGrupo ? '⏳' : dataGrupo !== null ? '✅' : '🎉'}
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