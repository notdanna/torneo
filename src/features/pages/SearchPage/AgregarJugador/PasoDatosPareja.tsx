import * as React from 'react';
import AlertaDuplicados from '../../../../core/components/alertaDuplicados';
import { JugadorFirebase } from '../../../../core/api/Services/jugadorService';

interface FormData {
  nombre: string;
  nombreAcompanante: string;
  empresa: string;
  empresaAcompanante: string;
  nivel: number;
  activo: boolean;
}

interface PasoDatosParejaProps {
  formData: FormData;
  loading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onConfirmar: () => void;
  onCancelar: () => void;
  getNivelTexto: (nivel: number) => string;
  
  // Props para validación de duplicados
  mostrarAlertaDuplicados?: boolean;
  jugadoresSimilares?: JugadorFirebase[];
  ultimaValidacion?: any;
  onCerrarAlertaDuplicados?: () => void;
  onContinuarConSimilares?: () => void;
  validando?: boolean;
}

const NIVELES_DISPONIBLES = [
  { value: 0, label: '0 - Nuevo jugador' },
  { value: 1, label: '1 - Principiante' },
  { value: 2, label: '2 - Básico' },
  { value: 3, label: '3 - Básico+' },
  { value: 4, label: '4 - Intermedio' },
  { value: 5, label: '5 - Intermedio+' },
  { value: 6, label: '6 - Intermedio++' },
  { value: 7, label: '7 - Avanzado' },
  { value: 8, label: '8 - Avanzado+' },
  { value: 9, label: '9 - Experto' },
  { value: 10, label: '10 - Experto+' },
];

const PasoDatosPareja: React.FC<PasoDatosParejaProps> = ({
  formData,
  loading,
  onInputChange,
  onConfirmar,
  onCancelar,
  getNivelTexto,
  mostrarAlertaDuplicados = false,
  jugadoresSimilares = [],
  ultimaValidacion,
  onCerrarAlertaDuplicados,
  onContinuarConSimilares,
  validando = false
}) => {
  const isFormValid = formData.nombre.trim() && formData.empresa.trim();

  return (
    <div className="wizard-step">
      {/* Alerta de duplicados */}
      {mostrarAlertaDuplicados && (
        <AlertaDuplicados
          jugadorDuplicado={ultimaValidacion?.jugadorExistente}
          jugadoresSimilares={jugadoresSimilares}
          mensaje={ultimaValidacion?.mensaje}
          onCerrar={onCerrarAlertaDuplicados || (() => {})}
          onContinuarAnyway={onContinuarConSimilares}
        />
      )}

      <div className="step-header">
        <h3 className="step-title">👤 Paso 1: Datos de la Pareja</h3>
        <p className="step-description">Ingresa los datos de los participantes</p>
        
        {/* Indicador de validación */}
        {validando && (
          <div className="validacion-indicator">
            <span className="validacion-spinner">🔍</span>
            <span className="validacion-text">Verificando duplicados...</span>
          </div>
        )}
      </div>
      
      {/* Jugador Principal */}
      <div className="form-section">
        <h4 className="section-title">👤 Jugador Principal</h4>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="nombre" className="form-label required">
              Nombre Principal
            </label>
            <input 
              id="nombre" 
              name="nombre" 
              type="text" 
              value={formData.nombre} 
              onChange={onInputChange} 
              required 
              placeholder="Ej: Ana García" 
              className={`form-input ${!formData.nombre.trim() ? 'error' : ''}`}
              disabled={loading}
              autoComplete="given-name"
            />
            {!formData.nombre.trim() && (
              <span className="form-error">Este campo es requerido</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="empresa" className="form-label required">
              Empresa Principal
            </label>
            <input 
              id="empresa" 
              name="empresa" 
              type="text" 
              value={formData.empresa} 
              onChange={onInputChange} 
              required 
              placeholder="Ej: Empresa ABC" 
              className={`form-input ${!formData.empresa.trim() ? 'error' : ''}`}
              disabled={loading}
              autoComplete="organization"
            />
            {!formData.empresa.trim() && (
              <span className="form-error">Este campo es requerido</span>
            )}
          </div>
        </div>
      </div>

      {/* Acompañante */}
      <div className="form-section">
        <h4 className="section-title">👥 Acompañante (Opcional)</h4>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="nombreAcompanante" className="form-label">
              Nombre Acompañante
            </label>
            <input 
              id="nombreAcompanante" 
              name="nombreAcompanante" 
              type="text" 
              value={formData.nombreAcompanante} 
              onChange={onInputChange} 
              placeholder="Ej: Francisco López" 
              className="form-input" 
              disabled={loading}
              autoComplete="given-name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="empresaAcompanante" className="form-label">
              Empresa Acompañante
            </label>
            <input 
              id="empresaAcompanante" 
              name="empresaAcompanante" 
              type="text" 
              value={formData.empresaAcompanante} 
              onChange={onInputChange} 
              placeholder="Ej: Empresa XYZ" 
              className="form-input" 
              disabled={loading}
              autoComplete="organization"
            />
          </div>
        </div>

        {/* Información adicional si hay acompañante */}
        {formData.nombreAcompanante && (
          <div className="info-box">
            <span className="info-icon">ℹ️</span>
            <p>
              <strong>Pareja completa:</strong> {formData.nombre}
              {formData.nombreAcompanante && ` y ${formData.nombreAcompanante}`}
            </p>
          </div>
        )}
      </div>

      {/* Configuración */}
      <div className="form-section">
        <h4 className="section-title">⚙️ Configuración</h4>
        <div className="form-group">
          <label htmlFor="nivel" className="form-label required">
            Nivel de Habilidad
          </label>
          <select 
            id="nivel" 
            name="nivel" 
            value={formData.nivel} 
            onChange={onInputChange} 
            required 
            className="form-select" 
            disabled={loading}
          >
            {NIVELES_DISPONIBLES.map((nivel) => (
              <option key={nivel.value} value={nivel.value}>
                {nivel.label}
              </option>
            ))}
          </select>
          <small className="form-help">
            Nivel actual: <strong>{formData.nivel} - {getNivelTexto(formData.nivel)}</strong>
          </small>
        </div>

        {/* Estado activo */}
        <div className="form-group">
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={onInputChange}
              disabled={loading}
              className="form-checkbox"
            />
            <span className="checkbox-text">Jugador activo</span>
          </label>
          <small className="form-help">
            Los jugadores inactivos no participarán en futuras competencias
          </small>
        </div>
      </div>

      {/* Resumen */}
      <div className="form-summary">
        <h5>📋 Resumen de datos:</h5>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Jugador principal:</span>
            <span className="summary-value">{formData.nombre || 'Sin especificar'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Empresa:</span>
            <span className="summary-value">{formData.empresa || 'Sin especificar'}</span>
          </div>
          {formData.nombreAcompanante && (
            <div className="summary-item">
              <span className="summary-label">Acompañante:</span>
              <span className="summary-value">{formData.nombreAcompanante}</span>
            </div>
          )}
          <div className="summary-item">
            <span className="summary-label">Nivel:</span>
            <span className="summary-value">{getNivelTexto(formData.nivel)}</span>
          </div>
        </div>
      </div>

      {/* Información de verificación de duplicados */}
      {!mostrarAlertaDuplicados && jugadoresSimilares && jugadoresSimilares.length > 0 && (
        <div className="similares-info">
          <div className="info-header">
            <span className="info-icon">⚠️</span>
            <h5>Registros similares encontrados</h5>
          </div>
          <p className="info-text">
            Se encontraron {jugadoresSimilares.length} registro(s) similar(es). 
            Verifica que no sean duplicados antes de continuar.
          </p>
          <details className="similares-details">
            <summary>Ver registros similares</summary>
            <div className="similares-list">
              {jugadoresSimilares.map((jugador, index) => (
                <div key={jugador.id || index} className="similar-item">
                  <span className="similar-nombre">{jugador.nombre}</span>
                  <span className="similar-empresa">({jugador.empresa})</span>
                  {jugador.nombreAcompanante && (
                    <span className="similar-acompanante">+ {jugador.nombreAcompanante}</span>
                  )}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Consejos para evitar duplicados */}
      <div className="consejos-duplicados">
        <details className="consejos-details">
          <summary>💡 Consejos para evitar duplicados</summary>
          <div className="consejos-content">
            <ul className="consejos-list">
              <li><strong>Nombres:</strong> Usa el nombre completo (nombre y apellido)</li>
              <li><strong>Empresas:</strong> Verifica la escritura exacta de la empresa</li>
              <li><strong>Personas diferentes:</strong> Si son personas diferentes con el mismo nombre, agrega un distintivo</li>
              <li><strong>Verificación:</strong> El sistema detecta automáticamente posibles duplicados</li>
            </ul>
          </div>
        </details>
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
          disabled={loading || !isFormValid}
          title={!isFormValid ? 'Complete todos los campos requeridos' : 'Continuar al siguiente paso'}
        >
          <span className="btn-icon">
            {loading ? '⏳' : validando ? '🔍' : '✅'}
          </span>
          {loading ? 'Guardando...' : validando ? 'Verificando...' : 'Confirmar y Continuar'}
        </button>
      </div>
    </div>
  );
};

export default PasoDatosPareja;