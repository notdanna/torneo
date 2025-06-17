import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { actualizarJugador } from '../../../core/components/Services/jugadorService.ts';
import type { JugadorFirebase } from '../../../core/components/Services/jugadorService.ts';

interface LocationState {
  jugador?: JugadorFirebase;
  mode?: 'create' | 'edit';
  from?: string;
}

const ContenedorJuego: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  // ✅ Determinar si estamos en modo edición
  const isEditMode = state?.mode === 'edit' && state?.jugador;
  const jugadorParaEditar = state?.jugador;

  // Estados del formulario - inicializar con datos existentes si es edición
  const [formData, setFormData] = useState({
    nombre: jugadorParaEditar?.nombre || '',
    nombreAcompanante: jugadorParaEditar?.nombreAcompanante || '',
    empresa: jugadorParaEditar?.empresa || '',
    empresaAcompanante: jugadorParaEditar?.empresaAcompanante || '',
    nivel: jugadorParaEditar?.nivel || 0,
    activo: jugadorParaEditar?.activo !== undefined ? jugadorParaEditar.activo : true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ✅ Efecto para cargar datos si venimos en modo edición
  useEffect(() => {
    if (isEditMode && jugadorParaEditar) {
      setFormData({
        nombre: jugadorParaEditar.nombre || '',
        nombreAcompanante: jugadorParaEditar.nombreAcompanante || '',
        empresa: jugadorParaEditar.empresa || '',
        empresaAcompanante: jugadorParaEditar.empresaAcompanante || '',
        nivel: jugadorParaEditar.nivel || 0,
        activo: jugadorParaEditar.activo !== undefined ? jugadorParaEditar.activo : true,
      });
    }
  }, [isEditMode, jugadorParaEditar]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
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
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isEditMode && jugadorParaEditar?.id) {
        // ✅ MODO EDICIÓN: Actualizar jugador existente
        await actualizarJugador(jugadorParaEditar.id, formData);
        setSuccess('¡Jugador actualizado exitosamente!');
        
        // Opcional: Regresar a la página anterior después de un delay
        setTimeout(() => {
          if (state?.from === 'search') {
            navigate('/search');
          } else {
            navigate(-1); // Regresar a la página anterior
          }
        }, 2000);
        
      } else {
        // ✅ MODO CREACIÓN: Crear nuevo jugador
        // Aquí llamas a tu función de crear jugador
        // await crearJugador(formData);
        setSuccess('¡Jugador creado exitosamente!');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar la solicitud';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (state?.from === 'search') {
      navigate('/search');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="contenedor-juego">
      <div className="form-container">
        <h1 className="form-title">
          {isEditMode ? `✏️ Editar Jugador (ID: ${jugadorParaEditar?.id})` : '➕ Agregar Nuevo Jugador'}
        </h1>

        {/* Mostrar mensaje de modo */}
        {isEditMode && (
          <div className="mode-indicator edit-mode">
            📝 Modo Edición - Modificando datos existentes
          </div>
        )}

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="jugador-form">
          {/* Nombre Principal */}
          <div className="form-group">
            <label htmlFor="nombre">Nombre Principal*</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              placeholder="Ingrese el nombre del jugador principal"
            />
          </div>

          {/* Nombre Acompañante */}
          <div className="form-group">
            <label htmlFor="nombreAcompanante">Nombre Acompañante</label>
            <input
              id="nombreAcompanante"
              name="nombreAcompanante"
              type="text"
              value={formData.nombreAcompanante}
              onChange={handleInputChange}
              placeholder="Ingrese el nombre del acompañante (opcional)"
            />
          </div>

          {/* Empresa Principal */}
          <div className="form-group">
            <label htmlFor="empresa">Empresa Principal*</label>
            <input
              id="empresa"
              name="empresa"
              type="text"
              value={formData.empresa}
              onChange={handleInputChange}
              required
              placeholder="Ingrese la empresa del jugador principal"
            />
          </div>

          {/* Empresa Acompañante */}
          <div className="form-group">
            <label htmlFor="empresaAcompanante">Empresa Acompañante</label>
            <input
              id="empresaAcompanante"
              name="empresaAcompanante"
              type="text"
              value={formData.empresaAcompanante}
              onChange={handleInputChange}
              placeholder="Ingrese la empresa del acompañante (opcional)"
            />
          </div>

          {/* Nivel */}
          <div className="form-group">
            <label htmlFor="nivel">Nivel*</label>
            <select
              id="nivel"
              name="nivel"
              value={formData.nivel}
              onChange={handleInputChange}
              required
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
          </div>

          {/* Estado Activo */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">Jugador Activo</span>
            </label>
          </div>

          {/* Botones de acción */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
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
              {loading ? '⏳ Procesando...' : isEditMode ? '💾 Actualizar Jugador' : '➕ Crear Jugador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContenedorJuego;