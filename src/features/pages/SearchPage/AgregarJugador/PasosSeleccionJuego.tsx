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
  return (
    <div className="wizard-step">
      <div className="step-header">
        <h3 className="step-title"> Seleccionar Juego</h3>
        
       
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
              {cargandoJuegos ? '⏳ Cargando juegos...' : 'Selecciona un juego'}
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

      </div>


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