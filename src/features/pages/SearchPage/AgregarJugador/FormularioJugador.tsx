import { useState, useEffect, useMemo } from 'react';
import { actualizarJugador, crearJugador, type JugadorFirebase } from '../../../../core/api/Services/jugadorService.ts';
import { useJuegos } from '../../../../core/components/Selectores/selectorJuegos';
import { useSelectorGrupo, type Grupo } from '../../../../core/components/Selectores/selectorGrupo';
import { agregarJugadorAJuego } from '../../../../core/api/Services/agregarJuego';
import './FormularioJugador.css';


interface FormularioJugadorProps {
  onCancelar: () => void;
  nombreInicial?: string;
  jugadorParaEditar?: JugadorFirebase | null;
  modoEdicion?: boolean;
  onJugadorAgregado?: (jugador: any) => void;
}

enum PasoWizard {
  DATOS_PAREJA = 1,
  SELECCION_JUEGO = 2,
  SELECCION_GRUPO = 3
}

const FormularioJugador: React.FC<FormularioJugadorProps> = ({
  onCancelar,
  nombreInicial = '',
  jugadorParaEditar = null,
  modoEdicion = false,
  onJugadorAgregado
}) => {
  const [pasoActual, setPasoActual] = useState<PasoWizard>(PasoWizard.DATOS_PAREJA);
  const [jugadorCreado, setJugadorCreado] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    nombreAcompanante: '',
    empresa: '',
    empresaAcompanante: '',
    nivel: 0,
    activo: true,
  });
  const [juegoSeleccionado, setJuegoSeleccionado] = useState<number | undefined>();
  const [grupoSeleccionadoLocal, setGrupoSeleccionadoLocal] = useState<number>(0);
  const [gruposDisponibles, setGruposDisponibles] = useState<Grupo[]>([]);
  const [cargandoGrupos, setCargandoGrupos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    juegos,
    cargando: cargandoJuegos,
    error: errorJuegos,
    seleccionarJuego,
    obtenerNombreJuego,
  } = useJuegos(pasoActual >= PasoWizard.SELECCION_JUEGO);

  // Configuración del selector de grupo similar a VisualizacionJuegos
  const selectorGrupoConfig = useMemo(() => ({
    grupos: gruposDisponibles,
    jugadorSeleccionado: jugadorCreado?.id ? parseInt(jugadorCreado.id) : undefined,
    juegoSeleccionado: juegoSeleccionado || undefined,
    onSuccess: (data: any) => {
      console.log('✅ Jugador agregado al grupo exitosamente:', data);
      setSuccess('✅ ¡Pareja registrada y asignada exitosamente!');
      
      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        if (onJugadorAgregado && jugadorCreado) {
          onJugadorAgregado({
            ...jugadorCreado,
            juegoId: juegoSeleccionado,
            grupoId: grupoSeleccionadoLocal
          });
        }
      }, 2000);
    },
    onError: (errorMsg: string) => {
      console.error('❌ Error al agregar jugador al grupo:', errorMsg);
      setError(`Error al asignar grupo: ${errorMsg}`);
      setLoading(false);
    }
  }), [gruposDisponibles, jugadorCreado?.id, juegoSeleccionado, grupoSeleccionadoLocal, onJugadorAgregado]);

  const {
    data: dataGrupo,
    loading: loadingGrupo,
    error: errorGrupo,
    setJugadorId: setJugadorIdGrupo,
    setGrupoId,
    setJuegoId: setJuegoIdGrupo,
    ejecutarAgregar,
    reset: resetSelectorGrupo,
  } = useSelectorGrupo(selectorGrupoConfig);

  useEffect(() => {
    if (modoEdicion && jugadorParaEditar) {
      setFormData({
        nombre: jugadorParaEditar.nombre || '',
        nombreAcompanante: jugadorParaEditar.nombreAcompanante || '',
        empresa: jugadorParaEditar.empresa || '',
        empresaAcompanante: jugadorParaEditar.empresaAcompanante || '',
        nivel: jugadorParaEditar.nivel || 0,
        activo: jugadorParaEditar.activo !== undefined ? jugadorParaEditar.activo : true,
      });
    } else if (!modoEdicion && nombreInicial) {
      setFormData(prev => ({ ...prev, nombre: nombreInicial }));
    }
  }, [modoEdicion, jugadorParaEditar, nombreInicial]);

  useEffect(() => {
    if (pasoActual === PasoWizard.SELECCION_GRUPO && juegoSeleccionado) {
      const cargarGrupos = async () => {
        setCargandoGrupos(true);
        setError(null);
        try {
          console.log(`Cargando grupos para el juego ID: ${juegoSeleccionado}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // TODO: Reemplazar con tu API real de grupos
          const gruposDeEjemplo: Grupo[] = [
            { id: 1, nombre: "Grupo A", descripcion: "Principiantes", activo: true },
            { id: 2, nombre: "Grupo B", descripcion: "Intermedio", activo: true },
            { id: 3, nombre: "Grupo C", descripcion: "Avanzado", activo: true },
          ];
          setGruposDisponibles(gruposDeEjemplo);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Error al cargar los grupos';
          setError(`❌ ${errorMessage}`);
        } finally {
          setCargandoGrupos(false);
        }
      };
      cargarGrupos();
    }
  }, [pasoActual, juegoSeleccionado]);

  // Limpiar estados al desmontar
  useEffect(() => {
    return () => {
      resetSelectorGrupo();
    };
  }, [resetSelectorGrupo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? Number(value) : value
    }));
  };

  const validarPaso1 = (): boolean => {
    setError(null);
    if (!formData.nombre.trim()) {
      setError('❌ El nombre principal es requerido');
      return false;
    }
    if (!formData.empresa.trim()) {
      setError('❌ La empresa principal es requerida');
      return false;
    }
    return true;
  };

  const confirmarPaso1 = async () => {
    if (!validarPaso1()) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      let resultado;
      if (modoEdicion && jugadorParaEditar?.id) {
        await actualizarJugador(jugadorParaEditar.id, formData);
        resultado = { ...jugadorParaEditar, ...formData };
        setSuccess('✅ Pareja actualizada en Firebase');
      } else {
        resultado = await crearJugador(formData);
        setSuccess('✅ Pareja creada en Firebase');
      }
      setJugadorCreado(resultado);
      setTimeout(() => {
        setPasoActual(PasoWizard.SELECCION_JUEGO);
        setSuccess(null);
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar jugador';
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const confirmarPaso2 = async () => {
    if (!juegoSeleccionado || !jugadorCreado?.id) {
      setError('❌ Faltan datos para continuar.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const resultado = await agregarJugadorAJuego(Number(jugadorCreado.id), juegoSeleccionado);
      if (resultado.success) {
        setSuccess(`✅ Asignado al juego: ${obtenerNombreJuego(juegoSeleccionado)}`);
        
        // Configurar IDs para el siguiente paso
        const idJugadorNumerico = parseInt(jugadorCreado.id);
        if (!isNaN(idJugadorNumerico)) {
          setJugadorIdGrupo(idJugadorNumerico);
          setJuegoIdGrupo(juegoSeleccionado);
        }
        
        setTimeout(() => {
          setPasoActual(PasoWizard.SELECCION_GRUPO);
          setSuccess(null);
        }, 1500);
      } else {
        setError(`❌ Error al asignar al juego: ${resultado.error}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al asignar juego';
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarGrupo = (idGrupo: number) => {
    console.log(`🎯 Seleccionando grupo: ${idGrupo}`);
    
    // Usar estado local para el grupo
    setGrupoSeleccionadoLocal(idGrupo);
    
    // Asegurar que los otros IDs están configurados en el hook
    if (jugadorCreado?.id && juegoSeleccionado) {
      const idJugadorNumerico = parseInt(jugadorCreado.id);
      setJugadorIdGrupo(idJugadorNumerico);
      setJuegoIdGrupo(juegoSeleccionado);
      
      // También configurar el grupo en el hook
      setGrupoId(idGrupo);
    }
    
    console.log(`✅ Grupo seleccionado localmente: ${idGrupo}`);
  };

  const confirmarPaso3 = async () => {
    if (!jugadorCreado?.id || !juegoSeleccionado || !grupoSeleccionadoLocal) {
      console.error('❌ Faltan datos para agregar al grupo');
      setError('❌ Faltan datos para finalizar el registro.');
      return;
    }

    const idJugadorNumerico = parseInt(jugadorCreado.id);
    
    if (isNaN(idJugadorNumerico)) {
      console.error('❌ ID de jugador inválido:', jugadorCreado.id);
      setError('❌ ID de jugador inválido');
      return;
    }

    // Configurar todos los IDs en el hook antes de ejecutar
    setJugadorIdGrupo(idJugadorNumerico);
    setJuegoIdGrupo(juegoSeleccionado);
    setGrupoId(grupoSeleccionadoLocal);

    console.log(`🎯 Agregando jugador ${idJugadorNumerico} al grupo ${grupoSeleccionadoLocal} en juego ${juegoSeleccionado}`);
    
    setError(null);
    setSuccess(null);
    
    // Ejecutar la acción usando el hook del selector
    await ejecutarAgregar();
  };

  const handleJuegoSeleccionado = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const juegoId = Number(e.target.value);
    if (juegoId) {
      setJuegoSeleccionado(juegoId);
      seleccionarJuego(juegoId);
      setGrupoSeleccionadoLocal(0);
      setGruposDisponibles([]);
      setJuegoIdGrupo(juegoId);
    }
  };

  const getNivelTexto = (nivel: number): string => {
    if (nivel === 0) return 'Nuevo jugador';
    if (nivel === 1) return 'Principiante';
    if (nivel <= 3) return 'Básico';
    if (nivel <= 6) return 'Intermedio';
    if (nivel <= 8) return 'Avanzado';
    return 'Experto';
  };

  const IndicadorProgreso = () => (
    <div className="wizard-progress">
      <div className="progress-steps">
        <div className={`step ${pasoActual >= PasoWizard.DATOS_PAREJA ? 'completed' : ''} ${pasoActual === PasoWizard.DATOS_PAREJA ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Datos de Pareja</span>
        </div>
        <div className={`step ${pasoActual >= PasoWizard.SELECCION_JUEGO ? 'completed' : ''} ${pasoActual === PasoWizard.SELECCION_JUEGO ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Seleccionar Juego</span>
        </div>
        <div className={`step ${pasoActual >= PasoWizard.SELECCION_GRUPO ? 'completed' : ''} ${pasoActual === PasoWizard.SELECCION_GRUPO ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Seleccionar Grupo</span>
        </div>
      </div>
    </div>
  );

  // Obtener información del grupo seleccionado
  const grupoSeleccionadoInfo = gruposDisponibles.find(grupo => grupo.id === grupoSeleccionadoLocal);

  return (
    <div className="formulario-wizard">
      <IndicadorProgreso />

      {error && <div className="error-message">{error}</div>}
      {errorGrupo && <div className="error-message">{errorGrupo}</div>}
      {success && <div className="success-message">{success}</div>}

      {pasoActual === PasoWizard.DATOS_PAREJA && (
        <div className="wizard-step">
          <div className="step-header">
            <h3 className="step-title">👤 Paso 1: Datos de la Pareja</h3>
            <p className="step-description">Ingresa los datos de los participantes</p>
          </div>
          <div className="form-section">
            <h4 className="section-title">👤 Jugador Principal</h4>
            <div className="form-group">
              <label htmlFor="nombre">Nombre Principal *</label>
              <input id="nombre" name="nombre" type="text" value={formData.nombre} onChange={handleInputChange} required placeholder="Ej: Ana García" className="form-input" disabled={loading} />
            </div>
            <div className="form-group">
              <label htmlFor="empresa">Empresa Principal *</label>
              <input id="empresa" name="empresa" type="text" value={formData.empresa} onChange={handleInputChange} required placeholder="Ej: Empresa ABC" className="form-input" disabled={loading} />
            </div>
          </div>
          <div className="form-section">
            <h4 className="section-title">👥 Acompañante (Opcional)</h4>
            <div className="form-group">
              <label htmlFor="nombreAcompanante">Nombre Acompañante</label>
              <input id="nombreAcompanante" name="nombreAcompanante" type="text" value={formData.nombreAcompanante} onChange={handleInputChange} placeholder="Ej: Francisco López" className="form-input" disabled={loading} />
            </div>
            <div className="form-group">
              <label htmlFor="empresaAcompanante">Empresa Acompañante</label>
              <input id="empresaAcompanante" name="empresaAcompanante" type="text" value={formData.empresaAcompanante} onChange={handleInputChange} placeholder="Ej: Empresa XYZ" className="form-input" disabled={loading} />
            </div>
          </div>
          <div className="form-section">
            <h4 className="section-title">⚙️ Configuración</h4>
            <div className="form-group">
              <label htmlFor="nivel">Nivel de Habilidad *</label>
              <select id="nivel" name="nivel" value={formData.nivel} onChange={handleInputChange} required className="form-select" disabled={loading}>
                <option value={0}>0 - Nuevo jugador</option>
              </select>
              <small className="form-help">Nivel actual: <strong>{formData.nivel} - {getNivelTexto(formData.nivel)}</strong></small>
            </div>
          </div>
          <div className="step-actions">
            <button type="button" onClick={onCancelar} className="btn-cancel" disabled={loading}>Cancelar</button>
            <button type="button" onClick={confirmarPaso1} className="btn-confirm" disabled={loading}>{loading ? '⏳ Guardando...' : '✅ Confirmar y Continuar'}</button>
          </div>
        </div>
      )}

      {pasoActual === PasoWizard.SELECCION_JUEGO && (
        <div className="wizard-step">
          <div className="step-header">
            <h3 className="step-title">🎮 Paso 2: Seleccionar Juego</h3>
            <p className="step-description">Elige el juego donde participará la pareja</p>
            {jugadorCreado && (
              <div className="jugador-info">
                <p><strong>Pareja:</strong> {jugadorCreado.nombre}{jugadorCreado.nombreAcompanante && ` y ${jugadorCreado.nombreAcompanante}`}</p>
              </div>
            )}
          </div>
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="juegoSelector">Selecciona el Juego *</label>
              <select id="juegoSelector" value={juegoSeleccionado || ''} onChange={handleJuegoSeleccionado} className="form-select" disabled={loading || cargandoJuegos} required>
                <option value="" disabled>{cargandoJuegos ? 'Cargando juegos...' : 'Selecciona un juego...'}</option>
                {juegos.map((juego) => (<option key={juego.id} value={juego.id}>{juego.icono} {juego.nombre}{juego.descripcion && ` - ${juego.descripcion}`}</option>))}
              </select>
              {juegoSeleccionado && (<small className="form-help success">✅ Seleccionado: {obtenerNombreJuego(juegoSeleccionado)}</small>)}
              {errorJuegos && (<small className="error-text">❌ {errorJuegos}</small>)}
            </div>
            {juegoSeleccionado && (
              <div className="juego-info">
                <h5>📋 Información del juego:</h5>
                <p><strong>Juego:</strong> {obtenerNombreJuego(juegoSeleccionado)}</p>
                <p><strong>ID:</strong> {juegoSeleccionado}</p>
              </div>
            )}
          </div>
          <div className="step-actions">
            <button type="button" onClick={onCancelar} className="btn-cancel" disabled={loading}>Cancelar</button>
            <button type="button" onClick={confirmarPaso2} className="btn-confirm" disabled={loading || !juegoSeleccionado}>{loading ? '⏳ Asignando...' : '✅ Confirmar y Continuar'}</button>
          </div>
        </div>
      )}

      {pasoActual === PasoWizard.SELECCION_GRUPO && (
        <div className="wizard-step">
          <div className="step-header">
            <h3 className="step-title">📁 Paso 3: Seleccionar Grupo</h3>
            <p className="step-description">Elige el grupo donde competirá la pareja</p>
            {jugadorCreado && juegoSeleccionado && (
              <div className="resumen-info">
                <p><strong>Pareja:</strong> {jugadorCreado.nombre}{jugadorCreado.nombreAcompanante && ` y ${jugadorCreado.nombreAcompanante}`}</p>
                <p><strong>Juego:</strong> {obtenerNombreJuego(juegoSeleccionado)}</p>
              </div>
            )}
          </div>
          <div className="form-section">
            {cargandoGrupos && <p>Cargando grupos disponibles...</p>}
            {!cargandoGrupos && (
              <div className="lista-grupos">
                {gruposDisponibles
                  .filter(grupo => grupo.activo !== false)
                  .map((grupo) => (
                    <div
                      key={grupo.id}
                      className={`grupo-opcion ${grupoSeleccionadoLocal === grupo.id ? 'seleccionado' : ''}`}
                      onClick={() => handleSeleccionarGrupo(grupo.id)}
                    >
                      <div className="grupo-info">
                        <span className="grupo-nombre">{grupo.nombre}</span>
                        <span className="grupo-descripcion">{grupo.descripcion}</span>
                      </div>
                      <div className="grupo-meta">
                        <span className="grupo-id-badge">ID: {grupo.id}</span>
                        <div className="selector-radio">
                          <input
                            type="radio"
                            name="grupo"
                            readOnly
                            checked={grupoSeleccionadoLocal === grupo.id}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            {errorGrupo && (<small className="error-text">❌ {errorGrupo}</small>)}
          </div>
          
          {/* Información del grupo seleccionado */}
          {grupoSeleccionadoInfo && (
            <div className="resumen-final">
              <h5>🎯 Resumen del registro:</h5>
              <div className="resumen-details">
                <p><strong>👤 Pareja:</strong> {jugadorCreado?.nombre}{jugadorCreado?.nombreAcompanante && ` y ${jugadorCreado.nombreAcompanante}`}</p>
                <p><strong>🎮 Juego:</strong> {obtenerNombreJuego(juegoSeleccionado!)}</p>
                <p><strong>📁 Grupo:</strong> {grupoSeleccionadoInfo.nombre}</p>
                <p><strong>⭐ Nivel:</strong> {formData.nivel} - {getNivelTexto(formData.nivel)}</p>
              </div>
            </div>
          )}

          {/* Mensaje de éxito del grupo */}
          {dataGrupo !== null && (
            <div className="success-message">
              ✅ ¡Jugador agregado exitosamente al grupo!
              {grupoSeleccionadoInfo && (
                <div>
                  Pareja <strong>{jugadorCreado?.nombre}</strong> agregada al grupo <strong>{grupoSeleccionadoInfo.nombre}</strong>
                </div>
              )}
            </div>
          )}

          <div className="step-actions">
            <button 
              type="button" 
              onClick={onCancelar} 
              className="btn-cancel" 
              disabled={loadingGrupo || dataGrupo !== null}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={confirmarPaso3} 
              className="btn-finish" 
              disabled={!grupoSeleccionadoLocal || loadingGrupo || dataGrupo !== null}
            >
              {loadingGrupo ? (
                '⏳ Finalizando...'
              ) : dataGrupo !== null ? (
                '✅ Registro Completado'
              ) : (
                '🎉 Finalizar Registro'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormularioJugador;