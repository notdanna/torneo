import { useState, useEffect } from 'react';
import { actualizarJugador, type JugadorFirebase } from '../../../../core/api/Services/jugadorService.ts';

// ✅ Tipos compartidos con el hook useJugadorForm (se replican aquí para evitar dependencias circulares)
interface DatosJugador {
  nombre: string;
  nombreAcompanante: string;
  empresa: string;
  empresaAcompanante: string;
  nivel: number;
}

interface ErroresJugador {
  nombre?: string;
  nombreAcompanante?: string;
  empresa?: string;
  empresaAcompanante?: string;
  nivel?: string;
}

interface FormularioJugadorProps {
  // --- Props existentes (modo edición desde SearchPage) ---
  onCancelar: () => void;
  nombreInicial?: string;
  jugadorParaEditar?: JugadorFirebase | null;
  modoEdicion?: boolean;

  datos?: DatosJugador;
  errores?: ErroresJugador;
  onActualizarDatos?: (campo: keyof DatosJugador, valor: string | number | boolean) => void;
  onContinuar?: () => void;
  onJugadorAgregado?: (jugador: any) => void;
}

const FormularioJugador: React.FC<FormularioJugadorProps> = ({
  onJugadorAgregado,
  onCancelar,
  nombreInicial = '',
  jugadorParaEditar = null,
  modoEdicion = false,
  datos,
  errores,
  onActualizarDatos,
  onContinuar
}) => {
  // Determinar si estamos en modo controlado (recibimos "datos" y "onActualizarDatos")
  const esControlado = !!datos && !!onActualizarDatos;

  // ✅ Estados del formulario con datos específicos para parejas (no se usan en modo controlado)
  //    Se mantienen para conservar compatibilidad con modo edición existente.
  const [formData, setFormData] = useState({
    nombre: '',
    nombreAcompanante: '',
    empresa: '',
    empresaAcompanante: '',
    nivel: 0,
    activo: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ✅ Cargar datos del jugador en modo edición
  useEffect(() => {
    if (modoEdicion && jugadorParaEditar) {
      // Pre-llenar el formulario con los datos existentes de la pareja
      setFormData({
        nombre: jugadorParaEditar.nombre || '',
        nombreAcompanante: jugadorParaEditar.nombreAcompanante || '',
        empresa: jugadorParaEditar.empresa || '',
        empresaAcompanante: jugadorParaEditar.empresaAcompanante || '',
        nivel: jugadorParaEditar.nivel || 0,
        activo: jugadorParaEditar.activo !== undefined ? jugadorParaEditar.activo : true,
      });
      
      console.log('📝 Datos cargados para edición:', {
        pareja: `${jugadorParaEditar.nombre}${jugadorParaEditar.nombreAcompanante ? ` y ${jugadorParaEditar.nombreAcompanante}` : ''}`,
        id: jugadorParaEditar.id,
        datos: jugadorParaEditar
      });
    } else if (!modoEdicion) {
      // Modo creación - usar nombre inicial si se proporciona
      setFormData(prev => ({
        ...prev,
        nombre: nombreInicial
      }));
    }
  }, [modoEdicion, jugadorParaEditar, nombreInicial]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (esControlado && onActualizarDatos) {
      // Delegar la actualización al padre
      onActualizarDatos(name as keyof DatosJugador, type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : type === 'number' 
          ? Number(value)
          : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // Si estamos en modo controlado, delegar la acción al padre mediante onContinuar
    if (onContinuar) {
      e.preventDefault();
      onContinuar();
      return;
    }
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (modoEdicion && jugadorParaEditar?.id) {
        // ✅ MODO EDICIÓN: Actualizar la pareja existente en Firebase
        await actualizarJugador(jugadorParaEditar.id, formData);
        
        setSuccess('✅ ¡Pareja actualizada exitosamente en Firebase!');
        
        // Crear objeto con los datos actualizados
        const parejaActualizada = {
          ...jugadorParaEditar,
          ...formData
        };
        
        console.log('✅ Pareja actualizada:', {
          id: jugadorParaEditar.id,
          parejaAnterior: `${jugadorParaEditar.nombre}${jugadorParaEditar.nombreAcompanante ? ` y ${jugadorParaEditar.nombreAcompanante}` : ''}`,
          parejaActualizada: `${formData.nombre}${formData.nombreAcompanante ? ` y ${formData.nombreAcompanante}` : ''}`,
          cambios: formData
        });
        
        // Cerrar formulario después de 1.5 segundos
        if (onJugadorAgregado) {
          setTimeout(() => {
            onJugadorAgregado(parejaActualizada);
          }, 1500);
        }
        
      } else {
        // ✅ MODO CREACIÓN: Crear nueva pareja
        console.log('➕ Crear nueva pareja:', formData);
        
        // Aquí llamarías a tu función de crear jugador
        // const nuevaPareja = await crearJugador(formData);
        // onJugadorAgregado(nuevaPareja);
        
        // Por ahora simular la creación
        setSuccess('✅ ¡Nueva pareja creada exitosamente!');
        if (onJugadorAgregado) {
          setTimeout(() => {
            onJugadorAgregado(formData);
          }, 1500);
        }
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar la solicitud';
      setError(errorMessage);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Función para determinar el texto del nivel
  const getNivelTexto = (nivel: number): string => {
    if (nivel === 0) return 'Nuevo jugador';
    if (nivel === 1) return 'Principiante';
    if (nivel <= 3) return 'Básico';
    if (nivel <= 6) return 'Intermedio';
    if (nivel <= 8) return 'Avanzado';
    return 'Experto';
  };

  return (
    <form onSubmit={handleSubmit} className="formulario-jugador">
      {/* Indicador de modo */}
      {modoEdicion && (
        <div className="mode-indicator edit-mode">
          📝 Editando pareja: <strong>{jugadorParaEditar?.nombre}{jugadorParaEditar?.nombreAcompanante ? ` y ${jugadorParaEditar.nombreAcompanante}` : ''}</strong>
          <br />
          <small>ID en Firebase: {jugadorParaEditar?.id}</small>
        </div>
      )}

      {/* Mensajes */}
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* ===== DATOS DEL JUGADOR PRINCIPAL ===== */}
      <div className="form-section">
        <h3 className="section-title">👤 Jugador Principal</h3>
        
        <div className="form-group">
          <label htmlFor="nombre">Nombre Principal *</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={esControlado ? datos!.nombre : formData.nombre}
            onChange={handleInputChange}
            required
            placeholder="Ej: Ana García"
            className="form-input"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="empresa">Empresa Principal *</label>
          <input
            id="empresa"
            name="empresa"
            type="text"
            value={esControlado ? datos!.empresa : formData.empresa}
            onChange={handleInputChange}
            required
            placeholder="Ej: Empresa ABC"
            className="form-input"
            disabled={loading}
          />
        </div>
      </div>

      {/* ===== DATOS DEL ACOMPAÑANTE ===== */}
      <div className="form-section">
        <h3 className="section-title">👥 Acompañante (Opcional)</h3>
        
        <div className="form-group">
          <label htmlFor="nombreAcompanante">Nombre Acompañante</label>
          <input
            id="nombreAcompanante"
            name="nombreAcompanante"
            type="text"
            value={esControlado ? datos!.nombreAcompanante : formData.nombreAcompanante}
            onChange={handleInputChange}
            placeholder="Ej: Francisco López"
            className="form-input"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="empresaAcompanante">Empresa Acompañante</label>
          <input
            id="empresaAcompanante"
            name="empresaAcompanante"
            type="text"
            value={esControlado ? datos!.empresaAcompanante : formData.empresaAcompanante}
            onChange={handleInputChange}
            placeholder="Ej: Empresa XYZ"
            className="form-input"
            disabled={loading}
          />
        </div>
      </div>

      {/* ===== CONFIGURACIÓN DE LA PAREJA ===== */}
      <div className="form-section">
        <h3 className="section-title">⚙️ Configuración</h3>
        
        <div className="form-group">
          <label htmlFor="nivel">Nivel de Habilidad *</label>
          <select
            id="nivel"
            name="nivel"
            value={esControlado ? datos!.nivel : formData.nivel}
            onChange={handleInputChange}
            required
            className="form-select"
            disabled={loading}
          >
            <option value={0}>0 - Nuevo jugador</option>
            <option value={1}>1 - Principiante</option>
            <option value={2}>2 - Básico</option>
            <option value={3}>3 - Básico</option>
            <option value={4}>4 - Intermedio</option>
            <option value={5}>5 - Intermedio</option>
            <option value={6}>6 - Intermedio</option>
            <option value={7}>7 - Avanzado</option>
            <option value={8}>8 - Avanzado</option>
            <option value={9}>9 - Experto</option>
            <option value={10}>10 - Experto</option>
          </select>
          <small className="form-help">
            Nivel actual: <strong>{formData.nivel} - {getNivelTexto(formData.nivel)}</strong>
          </small>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="activo"
              checked={esControlado ? true : formData.activo}
              onChange={handleInputChange}
              className="form-checkbox"
              disabled={loading}
            />
            <span className="checkbox-text">
              <strong>Pareja Activa</strong>
              <small>Puede participar en juegos</small>
            </span>
          </label>
        </div>
      </div>

      {/* Mostrar errores en modo controlado */}
      {errores && Object.values(errores).some(Boolean) && (
        <div className="error-message">
          {Object.entries(errores).map(([campo, mensaje]) => (
            mensaje ? <p key={campo}>❌ {mensaje}</p> : null
          ))}
        </div>
      )}

      {/* ===== BOTONES DE ACCIÓN ===== */}
      <div className="form-actions">
        <button
          type="button"
          onClick={onCancelar}
          className="btn-cancel"
          disabled={loading}
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
        >
          {loading 
            ? '⏳ Guardando...' 
            : modoEdicion 
              ? '💾 Actualizar Pareja' 
              : '➕ Crear Pareja'
          }
        </button>
      </div>
    </form>
  );
};

export default FormularioJugador;