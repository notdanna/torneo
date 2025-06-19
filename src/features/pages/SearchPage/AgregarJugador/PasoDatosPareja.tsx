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

const PasoDatosPareja: React.FC<PasoDatosParejaProps> = ({
  formData,
  loading,
  onInputChange,
  onConfirmar,
  onCancelar,
  mostrarAlertaDuplicados = false,
  jugadoresSimilares = [],
  ultimaValidacion,
  onCerrarAlertaDuplicados,
  onContinuarConSimilares,
  validando = false
}) => {
  // Función para quitar acentos
  const quitarAcentos = (texto: string): string => {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  // Función para procesar los datos antes de confirmar
  const handleConfirmar = () => {
    // Crear una copia de formData con los acentos removidos
    const datosLimpios = {
      ...formData,
      nombre: quitarAcentos(formData.nombre),
      nombreAcompanante: quitarAcentos(formData.nombreAcompanante),
      empresa: quitarAcentos(formData.empresa),
      empresaAcompanante: quitarAcentos(formData.empresaAcompanante)
    };

    // Actualizar el formData original con los datos sin acentos
    Object.assign(formData, datosLimpios);
    
    // Ahora enviar los datos
    onConfirmar();
  };

  // Mostrar alert cuando aparezcan duplicados
  React.useEffect(() => {
    if (mostrarAlertaDuplicados && ultimaValidacion?.mensaje) {
      alert(`❌ ${ultimaValidacion.mensaje}`);
    }
  }, [mostrarAlertaDuplicados, ultimaValidacion?.mensaje]);

  const isFormValid = formData.nombre.trim() && formData.empresa.trim();

  return (
    <div className="wizard-step">
      <div className="step-header">
        <h3 className="step-title">Datos de la Pareja</h3>
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
        <h4 className="section-title">Jugador Principal</h4>
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
              className={`form-input ${!formData.nombre.trim() ? 'error' : ''}`}
              disabled={loading}
              autoComplete="off"
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
              className={`form-input ${!formData.empresa.trim() ? 'error' : ''}`}
              disabled={loading}
              autoComplete="off"
            />
            {!formData.empresa.trim() && (
              <span className="form-error">Este campo es requerido</span>
            )}
          </div>
        </div>
      </div>

      {/* Acompañante */}
      <div className="form-section">
        <h4 className="section-title">Acompañante</h4>
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
              className="form-input" 
              disabled={loading}
              autoComplete="off"
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
              className="form-input" 
              disabled={loading}
              autoComplete="off"
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

      {/* Acciones */}
      <div className="step-actions">
        <button 
          type="button" 
          onClick={onCancelar} 
          className="btn-cancel" 
          disabled={loading}
        >
          <span className="btn-icon"></span>
          Cancelar
        </button>
        
        <button 
          type="button" 
          onClick={handleConfirmar} 
          className="btn-confirm" 
          disabled={loading || !isFormValid}
          title={!isFormValid ? 'Complete todos los campos requeridos' : 'Continuar al siguiente paso'}
        >
          <span className="btn-icon">
          </span>
          {loading ? 'Guardando...' : validando ? 'Verificando...' : 'Confirmar y Continuar'}
        </button>
      </div>

      {/* Alerta de duplicados - Movida aquí, abajo de los botones */}
      {mostrarAlertaDuplicados && (
        <div className="duplicados-section">
          <AlertaDuplicados
            jugadorDuplicado={ultimaValidacion?.jugadorExistente}
            jugadoresSimilares={jugadoresSimilares}
            mensaje={ultimaValidacion?.mensaje}
            onCerrar={onCerrarAlertaDuplicados || (() => {})}
            onContinuarAnyway={onContinuarConSimilares}
          />
        </div>
      )}
    </div>
  );
};

export default PasoDatosPareja;