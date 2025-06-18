import * as React from 'react';

interface Juego {
  id: number;
  nombre: string;
  descripcion?: string;
  icono: string;
}

interface JugadorCreado {
  id: string;
  nombre: string;
  nombreAcompanante?: string;
  empresa: string;
  empresaAcompanante?: string;
  nivel: number;
}

interface PasoSeleccionJuegoProps {
  jugadorCreado: JugadorCreado | null;
  juegos: Juego[];
  juegoSeleccionado?: number;
  cargandoJuegos: boolean;
  loading: boolean;
  errorJuegos?: string;
  onJuegoSeleccionado: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onConfirmar: () => void;
  onCancelar: () => void;
  obtenerNombreJuego: (id: number) => string;
}

const PasoSeleccionJuego: React.FC<PasoSeleccionJuegoProps> = ({
  jugadorCreado,
  juegos,
  juegoSeleccionado,
  cargandoJuegos,
  loading,
  errorJuegos,
  onJuegoSeleccionado,
  onConfirmar,
  onCancelar,
  obtenerNombreJuego
}) => {
  const juegoSeleccionadoInfo = juegos.find(juego => juego.id === juegoSeleccionado);

  const formatearNombrePareja = (jugador: JugadorCreado) => {
    if (jugador.nombreAcompanante) {
      return `${jugador.nombre} y ${jugador.nombreAcompanante}`;
    }
    return jugador.nombre;
  };

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h3 className="step-title">🎮 Paso 2: Seleccionar Juego</h3>
        <p className="step-description">Elige el juego donde participará la pareja</p>
        
        {/* Información del jugador creado */}
        {jugadorCreado && (
          <div className="jugador-info-card">
            <div className="card-header">
              <span className="card-icon">👤</span>
              <h4>Pareja Registrada</h4>
            </div>
            <div className="card-content">
              <div className="info-row">
                <span className="info-label">Nombre:</span>
                <span className="info-value">{formatearNombrePareja(jugadorCreado)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Empresa principal:</span>
                <span className="info-value">{jugadorCreado.empresa}</span>
              </div>
              {jugadorCreado.empresaAcompanante && (
                <div className="info-row">
                  <span className="info-label">Empresa acompañante:</span>
                  <span className="info-value">{jugadorCreado.empresaAcompanante}</span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">ID de registro:</span>
                <span className="info-value badge">{jugadorCreado.id}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="juegoSelector" className="form-label required">
            <span className="label-icon">🎮</span>
            Selecciona el Juego
          </label>
          
          <select 
            id="juegoSelector" 
            value={juegoSeleccionado || ''} 
            onChange={onJuegoSeleccionado} 
            className={`form-select ${errorJuegos ? 'error' : ''}`}
            disabled={loading || cargandoJuegos} 
            required
          >
            <option value="" disabled>
              {cargandoJuegos ? '⏳ Cargando juegos...' : '🎯 Selecciona un juego...'}
            </option>
            {juegos.map((juego) => (
              <option key={juego.id} value={juego.id}>
                {juego.icono} {juego.nombre}
                {juego.descripcion && ` - ${juego.descripcion}`}
              </option>
            ))}
          </select>

          {/* Feedback del estado */}
          {cargandoJuegos && (
            <div className="form-feedback loading">
              <span className="feedback-icon">⏳</span>
              Cargando juegos disponibles...
            </div>
          )}
          
          {juegoSeleccionado && !cargandoJuegos && (
            <div className="form-feedback success">
              <span className="feedback-icon">✅</span>
              Seleccionado: {obtenerNombreJuego(juegoSeleccionado)}
            </div>
          )}
          
          {errorJuegos && (
            <div className="form-feedback error">
              <span className="feedback-icon">❌</span>
              {errorJuegos}
            </div>
          )}
        </div>

        {/* Información detallada del juego seleccionado */}
        {juegoSeleccionadoInfo && (
          <div className="juego-info-card">
            <div className="card-header">
              <span className="card-icon">{juegoSeleccionadoInfo.icono}</span>
              <h4>Información del Juego</h4>
            </div>
            <div className="card-content">
              <div className="info-row">
                <span className="info-label">Nombre:</span>
                <span className="info-value">{juegoSeleccionadoInfo.nombre}</span>
              </div>
              {juegoSeleccionadoInfo.descripcion && (
                <div className="info-row">
                  <span className="info-label">Descripción:</span>
                  <span className="info-value">{juegoSeleccionadoInfo.descripcion}</span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">ID del juego:</span>
                <span className="info-value badge">{juegoSeleccionadoInfo.id}</span>
              </div>
            </div>
          </div>
        )}

        {/* Ayuda contextual */}
        <div className="help-section">
          <div className="help-card">
            <span className="help-icon">💡</span>
            <div className="help-content">
              <h5>¿Qué juego elegir?</h5>
              <p>
                Selecciona el juego en el que la pareja desea participar. 
                Cada juego puede tener diferentes reglas y categorías.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de la selección */}
      {jugadorCreado && juegoSeleccionado && (
        <div className="selection-summary">
          <h5>📋 Resumen de la asignación:</h5>
          <div className="summary-content">
            <div className="summary-row">
              <span className="summary-icon">👤</span>
              <span>{formatearNombrePareja(jugadorCreado)}</span>
            </div>
            <div className="summary-arrow">→</div>
            <div className="summary-row">
              <span className="summary-icon">🎮</span>
              <span>{obtenerNombreJuego(juegoSeleccionado)}</span>
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
          disabled={loading}
        >
          <span className="btn-icon">❌</span>
          Cancelar
        </button>
        
        <button 
          type="button" 
          onClick={onConfirmar} 
          className="btn-confirm" 
          disabled={loading || !juegoSeleccionado}
          title={!juegoSeleccionado ? 'Selecciona un juego para continuar' : 'Continuar al siguiente paso'}
        >
          <span className="btn-icon">
            {loading ? '⏳' : '✅'}
          </span>
          {loading ? 'Asignando...' : 'Confirmar y Continuar'}
        </button>
      </div>
    </div>
  );
};

export default PasoSeleccionJuego;