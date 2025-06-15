import { useLocation, useNavigate } from 'react-router-dom';
import { User, Building2, CheckCircle, Users, GamepadIcon, AlertCircle, Loader2, Trophy, UserPlus } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useJuegos } from '../../../core/components/selectores/selectorJuegos';
import { useSelectorGrupo } from '../../../core/components/selectores/selectorGrupo';
import type { Grupo } from '../../../core/components/selectores/selectorGrupo';
import './VisualizacionJuegos.css';

interface JugadorData {
  id_jugador?: string;
  nombre: string;
  nombreAcompanante?: string;
  empresa: string;
  empresaAcompanante?: string;
  nivel?: number;
  activo?: boolean;
}

interface LocationState {
  jugador?: JugadorData;
  from?: string;
}

const VisualizacionJuegos = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const jugador = state?.jugador;
  const from = state?.from;

  // Estados locales para manejar la vista
  const [mostrarSelectorGrupo, setMostrarSelectorGrupo] = useState(false);
  const [gruposDisponibles, setGruposDisponibles] = useState<Grupo[]>([]);
  const [grupoSeleccionadoLocal, setGrupoSeleccionadoLocal] = useState<number>(0);

  // Hook unificado para gestión de juegos y API
  const {
    // Estados de selección
    juegos,
    cargando: cargandoJuegos,
    error: errorJuegos,
    juegoSeleccionado,
    
    // Estados de API
    agregandoJugador,
    errorAgregar,
    exitoAgregar,
    mensajeAgregar,
    
    // Funciones de selección
    seleccionarJuego,
    limpiarSeleccion,
    recargarJuegos,
    
    // Funciones de API y utilidades
    agregarJugadorAlJuegoSeleccionado,
    limpiarEstadosAgregar,
    obtenerJuegoPorId,
    obtenerNombreJuego
  } = useJuegos(true);

  // Hook para selector de grupo con configuración inicial
  const selectorGrupoConfig = useMemo(() => ({
    grupos: gruposDisponibles,
    jugadorSeleccionado: jugador?.id_jugador ? parseInt(jugador.id_jugador) : undefined,
    juegoSeleccionado: juegoSeleccionado || undefined,
    onSuccess: (data: any) => {
      console.log('🎉 Jugador agregado exitosamente al grupo:', data);
      setMostrarSelectorGrupo(false);
    },
    onError: (error: string) => {
      console.error('❌ Error al agregar jugador al grupo:', error);
    }
  }), [gruposDisponibles, jugador?.id_jugador, juegoSeleccionado]);

  const {
    jugadorId: jugadorIdGrupo,
    grupoId,
    juegoId: juegoIdGrupo,
    data: dataGrupo,
    loading: loadingGrupo,
    error: errorGrupo,
    setJugadorId: setJugadorIdGrupo,
    setGrupoId,
    setJuegoId: setJuegoIdGrupo,
    ejecutarAgregar,
    reset: resetSelectorGrupo,
    esValido,
  } = useSelectorGrupo(selectorGrupoConfig);

  // Simular carga de grupos disponibles (reemplaza con tu API real)
  useEffect(() => {
    // Aquí deberías cargar los grupos desde tu API
    const cargarGrupos = async () => {
      try {
        // Ejemplo de grupos, reemplaza con tu llamada a la API
        const grupos: Grupo[] = [
          { id: 1, nombre: "Grupo A", descripcion: "Principiantes", activo: true },
          { id: 2, nombre: "Grupo B", descripcion: "Intermedio", activo: true },
          { id: 3, nombre: "Grupo C", descripcion: "Avanzado", activo: true },
          { id: 4, nombre: "Grupo D", descripcion: "Expertos", activo: false }, // Inactivo
        ];
        setGruposDisponibles(grupos);
      } catch (error) {
        console.error('Error cargando grupos:', error);
      }
    };

    cargarGrupos();
  }, []);

  // Limpiar estados al desmontar
  useEffect(() => {
    return () => {
      limpiarEstadosAgregar();
      limpiarSeleccion();
      resetSelectorGrupo();
    };
  }, []);

  // Debug: Monitorear cambios en el estado del grupo
  useEffect(() => {
    console.log(`🔍 Estado del selector de grupo cambió:`);
    console.log(`   - grupoId: ${grupoId}`);
    console.log(`   - jugadorIdGrupo: ${jugadorIdGrupo}`);
    console.log(`   - juegoIdGrupo: ${juegoIdGrupo}`);
    console.log(`   - esValido: ${esValido()}`);
    console.log(`   - dataGrupo:`, dataGrupo);
    console.log(`   - loadingGrupo: ${loadingGrupo}`);
    console.log(`   - errorGrupo:`, errorGrupo);
  }, [grupoId, jugadorIdGrupo, juegoIdGrupo, dataGrupo, loadingGrupo, errorGrupo]);

  const handleVolver = () => {
    limpiarEstadosAgregar();
    limpiarSeleccion();
    resetSelectorGrupo();
    setMostrarSelectorGrupo(false);
    if (from === 'search') {
      navigate('/search', { replace: true });
    } else {
      navigate(-1);
    }
  };

  const handleSeleccionarJuego = (idJuego: number) => {
    seleccionarJuego(idJuego);
    // El hook automáticamente limpia estados de API al seleccionar
  };

  const handleConfirmarAgregarAlJuego = async () => {
    if (!jugador?.id_jugador || !juegoSeleccionado) {
      console.error('❌ Faltan datos: jugador o juego no seleccionado');
      return;
    }

    const idJugadorNumerico = parseInt(jugador.id_jugador);
    
    if (isNaN(idJugadorNumerico)) {
      console.error('❌ ID de jugador inválido:', jugador.id_jugador);
      return;
    }

    console.log(`🎯 Iniciando proceso para agregar jugador ${idJugadorNumerico} al juego ${juegoSeleccionado} (${obtenerNombreJuego(juegoSeleccionado)})`);
    
    const exito = await agregarJugadorAlJuegoSeleccionado(idJugadorNumerico);
    
    if (exito) {
      console.log('🎉 Jugador agregado exitosamente al juego');
    }
  };

  const handleMostrarSelectorGrupo = () => {
    console.log('🔧 Mostrando selector de grupo...');
    setMostrarSelectorGrupo(true);
    setGrupoSeleccionadoLocal(0); // Reset grupo local
    
    // Asegurar que los IDs están configurados
    if (jugador?.id_jugador && juegoSeleccionado) {
      const idJugadorNumerico = parseInt(jugador.id_jugador);
      if (!isNaN(idJugadorNumerico)) {
        console.log(`🔧 Configurando IDs: Jugador ${idJugadorNumerico}, Juego ${juegoSeleccionado}`);
        
        // Configurar inmediatamente los IDs
        setTimeout(() => {
          setJugadorIdGrupo(idJugadorNumerico);
          setJuegoIdGrupo(juegoSeleccionado);
          
          console.log(`✅ IDs configurados en el selector`);
        }, 50);
      }
    }
  };

  const handleSeleccionarGrupo = (idGrupo: number) => {
    console.log(`🎯 Seleccionando grupo: ${idGrupo}`);
    
    // Usar estado local para el grupo
    setGrupoSeleccionadoLocal(idGrupo);
    
    // Asegurar que los otros IDs están configurados en el hook
    if (jugador?.id_jugador && juegoSeleccionado) {
      const idJugadorNumerico = parseInt(jugador.id_jugador);
      setJugadorIdGrupo(idJugadorNumerico);
      setJuegoIdGrupo(juegoSeleccionado);
      
      // También intentar configurar en el hook (por si funciona)
      setGrupoId(idGrupo);
    }
    
    console.log(`✅ Grupo seleccionado localmente: ${idGrupo}`);
  };

  const handleConfirmarAgregarAlGrupo = async () => {
    console.log(`🔍 Validando datos antes de agregar al grupo:`);
    console.log(`   - Jugador ID: ${jugador?.id_jugador}`);
    console.log(`   - Juego seleccionado: ${juegoSeleccionado}`);
    console.log(`   - Grupo seleccionado local: ${grupoSeleccionadoLocal}`);

    if (!jugador?.id_jugador || !juegoSeleccionado || !grupoSeleccionadoLocal) {
      console.error('❌ Faltan datos para agregar al grupo');
      return;
    }

    const idJugadorNumerico = parseInt(jugador.id_jugador);
    
    if (isNaN(idJugadorNumerico)) {
      console.error('❌ ID de jugador inválido:', jugador.id_jugador);
      return;
    }

    // Configurar todos los IDs en el hook antes de ejecutar
    setJugadorIdGrupo(idJugadorNumerico);
    setJuegoIdGrupo(juegoSeleccionado);
    setGrupoId(grupoSeleccionadoLocal);

    console.log(`🎯 Agregando jugador ${idJugadorNumerico} al grupo ${grupoSeleccionadoLocal} en juego ${juegoSeleccionado}`);
    
    // Ejecutar la acción usando el hook del selector
    await ejecutarAgregar();
  };

  const juegoSeleccionadoInfo = obtenerJuegoPorId(juegoSeleccionado || 0);
  // Obtener información del grupo seleccionado localmente
  const grupoSeleccionadoInfo = gruposDisponibles.find(grupo => grupo.id === grupoSeleccionadoLocal);

  return (
    <div className="visualizacion-juegos">
      <div className="container">
        <div className="contenido">
          {/* Información de la pareja si viene de SearchPage */}
          {jugador && (
            <div className="jugador-seleccionado">
              <div className="card">
                <div className="card-header">
                  <CheckCircle className="icon-success" size={24} />
                  <h3>Pareja seleccionada para agregar al juego</h3>
                </div>
                
                <div className="card-content">
                  {/* INFORMACIÓN DEL JUGADOR PRINCIPAL */}
                  <div className="seccion-jugador">
                    <div className="seccion-header">
                      <User className="icon-seccion" size={20} />
                      <h4>Jugador Principal</h4>
                    </div>
                    
                    <div className="jugador-info">
                      <div className="info-item">
                        <User className="icon" size={18} />
                        <div>
                          <label>Nombre:</label>
                          <span>{jugador.nombre}</span>
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <Building2 className="icon" size={18} />
                        <div>
                          <label>Empresa:</label>
                          <span>{jugador.empresa}</span>
                        </div>
                      </div>

                      <div className="info-item">
                        <span className="jugador-id-badge">
                          ID: {jugador.id_jugador}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SEPARADOR */}
                  <div className="separador"></div>

                  {/* INFORMACIÓN DEL ACOMPAÑANTE */}
                  <div className="seccion-jugador">
                    <div className="seccion-header">
                      <Users className="icon-seccion" size={20} />
                      <h4>Acompañante</h4>
                    </div>
                    
                    <div className="jugador-info">
                      <div className="info-item">
                        <User className="icon" size={18} />
                        <div>
                          <label>Nombre:</label>
                          <span>{jugador.nombreAcompanante || 'Sin acompañante'}</span>
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <Building2 className="icon" size={18} />
                        <div>
                          <label>Empresa:</label>
                          <span>{jugador.empresaAcompanante || 'Sin empresa'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEPARADOR */}
                  <div className="separador"></div>

                  {/* SELECTOR DE JUEGOS */}
                  <div className="seccion-juegos">
                    <div className="seccion-header">
                      <GamepadIcon className="icon-seccion" size={20} />
                      <h4>Seleccionar Juego</h4>
                    </div>

                    {/* Estado de carga de juegos */}
                    {cargandoJuegos && (
                      <div className="estado-carga">
                        <Loader2 className="icono-girando" size={20} />
                        <span>Cargando juegos disponibles...</span>
                      </div>
                    )}

                    {/* Error al cargar juegos */}
                    {errorJuegos && !cargandoJuegos && (
                      <div className="mensaje-error">
                        <AlertCircle size={18} />
                        <span>Error: {errorJuegos}</span>
                        <button 
                          className="btn-recargar"
                          onClick={recargarJuegos}
                        >
                          Reintentar
                        </button>
                      </div>
                    )}

                    {/* Lista de juegos disponibles */}
                    {!cargandoJuegos && !errorJuegos && juegos.length > 0 && (
                      <div className="lista-juegos">
                        {juegos.map((juego) => (
                          <div
                            key={juego.id}
                            className={`juego-opcion ${
                              juegoSeleccionado === juego.id ? 'seleccionado' : ''
                            }`}
                            onClick={() => handleSeleccionarJuego(juego.id)}
                          >
                            <div className="juego-info">
                              <div className="juego-nombre">
                                <span className="juego-emoji">{juego.icono}</span>
                                <span className="nombre-texto">{juego.nombre}</span>
                                <span className="juego-id">ID: {juego.id}</span>
                              </div>
                              <div className="juego-descripcion">
                                <span>{juego.descripcion}</span>
                              </div>
                            </div>
                            <div className="selector-radio">
                              <input
                                type="radio"
                                name="juego"
                                checked={juegoSeleccionado === juego.id}
                                onChange={() => handleSeleccionarJuego(juego.id)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sin juegos disponibles */}
                    {!cargandoJuegos && !errorJuegos && juegos.length === 0 && (
                      <div className="sin-juegos">
                        <GamepadIcon size={24} />
                        <p>No hay juegos disponibles en este momento</p>
                        <button 
                          className="btn-secondary"
                          onClick={recargarJuegos}
                        >
                          Recargar juegos
                        </button>
                      </div>
                    )}
                  </div>

                  {/* INFORMACIÓN DEL JUEGO SELECCIONADO */}
                  {juegoSeleccionadoInfo && (
                    <>
                      <div className="separador"></div>
                      <div className="juego-seleccionado-info">
                        <div className="seccion-header">
                          <Trophy className="icon-seccion" size={20} />
                          <h4>Confirmación de Selección</h4>
                        </div>
                        <div className="info-juego-detalle">
                          <div className="detalle-item">
                            <span className="juego-emoji-grande">{juegoSeleccionadoInfo.icono}</span>
                            <div className="detalle-texto">
                              <div className="detalle-nombre">
                                <strong>{juegoSeleccionadoInfo.nombre}</strong>
                                <span className="detalle-id">ID: {juegoSeleccionadoInfo.id}</span>
                              </div>
                              <div className="detalle-descripcion">
                                {juegoSeleccionadoInfo.descripcion}
                              </div>
                              <div className="detalle-accion">
                                ¿Confirmar agregar la pareja <strong>{jugador.nombre}</strong> a este juego?
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* SELECTOR DE GRUPO (cuando está visible) */}
                  {mostrarSelectorGrupo && juegoSeleccionadoInfo && (
                    <>
                      <div className="separador"></div>
                      <div className="seccion-grupos">
                        <div className="seccion-header">
                          <UserPlus className="icon-seccion" size={20} />
                          <h4>Seleccionar Grupo</h4>
                        </div>

                        <div className="lista-grupos">
                          {gruposDisponibles
                            .filter(grupo => grupo.activo !== false)
                            .map((grupo) => (
                            <div
                              key={grupo.id}
                              className={`grupo-opcion ${
                                grupoSeleccionadoLocal === grupo.id ? 'seleccionado' : ''
                              }`}
                              onClick={() => handleSeleccionarGrupo(grupo.id)}
                            >
                              <div className="grupo-info">
                                <div className="grupo-nombre">
                                  <span className="nombre-texto">{grupo.nombre}</span>
                                  <span className="grupo-id">ID: {grupo.id}</span>
                                </div>
                                <div className="grupo-descripcion">
                                  <span>{grupo.descripcion}</span>
                                </div>
                              </div>
                              <div className="selector-radio">
                                <input
                                  type="radio"
                                  name="grupo"
                                  checked={grupoSeleccionadoLocal === grupo.id}
                                  onChange={() => handleSeleccionarGrupo(grupo.id)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Información del grupo seleccionado */}
                        {grupoSeleccionadoInfo && (
                          <div className="grupo-seleccionado-info">
                            <div className="info-grupo-detalle">
                              <strong>Grupo seleccionado:</strong> {grupoSeleccionadoInfo.nombre}
                              <br />
                              <span className="grupo-descripcion">{grupoSeleccionadoInfo.descripcion}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* MENSAJES DE ESTADO */}
                  {errorAgregar && (
                    <div className="mensaje-error">
                      <AlertCircle size={18} />
                      <span>{errorAgregar}</span>
                    </div>
                  )}

                  {errorGrupo && (
                    <div className="mensaje-error">
                      <AlertCircle size={18} />
                      <span>Error en grupo: {errorGrupo}</span>
                    </div>
                  )}

                  {exitoAgregar && (
                    <div className="mensaje-exito">
                      <CheckCircle size={18} />
                      <div className="mensaje-exito-contenido">
                        <span>{mensajeAgregar}</span>
                        {juegoSeleccionadoInfo && (
                          <div className="juego-agregado-info">
                            Pareja <strong>{jugador.nombre}</strong> agregada exitosamente a: <strong>{juegoSeleccionadoInfo.nombre}</strong> (ID: {juegoSeleccionadoInfo.id})
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {dataGrupo !== null && (
                    <div className="mensaje-exito">
                      <CheckCircle size={18} />
                      <div className="mensaje-exito-contenido">
                        <span>¡Jugador agregado exitosamente al grupo!</span>
                        {grupoSeleccionadoInfo && juegoSeleccionadoInfo && (
                          <div className="grupo-agregado-info">
                            Pareja <strong>{jugador.nombre}</strong> agregada al grupo <strong>{grupoSeleccionadoInfo.nombre}</strong> en el juego <strong>{juegoSeleccionadoInfo.nombre}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="card-actions">
                  {/* Botón principal - cambia según el estado */}
                  {!mostrarSelectorGrupo ? (
                    <>
                      <button 
                        className={`btn-primary ${
                          !juegoSeleccionado || agregandoJugador || exitoAgregar ? 'disabled' : ''
                        }`}
                        onClick={handleConfirmarAgregarAlJuego}
                        disabled={!juegoSeleccionado || agregandoJugador || exitoAgregar}
                      >
                        {agregandoJugador ? (
                          <>
                            <Loader2 className="icono-girando" size={16} />
                            Agregando a {juegoSeleccionadoInfo?.nombre}...
                          </>
                        ) : exitoAgregar ? (
                          <>
                            <CheckCircle size={16} />
                            ¡Agregado a {juegoSeleccionadoInfo?.nombre}!
                          </>
                        ) : juegoSeleccionadoInfo ? (
                          `Confirmar y agregar a ${juegoSeleccionadoInfo.nombre}`
                        ) : (
                          'Selecciona un juego primero'
                        )}
                      </button>

                      {/* Botón para mostrar selector de grupo */}
                      {juegoSeleccionado && (
                        <button 
                          className="btn-secondary"
                          onClick={handleMostrarSelectorGrupo}
                          disabled={agregandoJugador}
                        >
                          <UserPlus size={16} />
                          Agregar a grupo específico
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button 
  className={`btn-primary ${
    !grupoSeleccionadoLocal || loadingGrupo || dataGrupo !== null ? 'disabled' : ''
  }`}
  onClick={handleConfirmarAgregarAlGrupo}
  disabled={!grupoSeleccionadoLocal || loadingGrupo || dataGrupo !== null}
>
  {loadingGrupo ? (
    <>
      <Loader2 className="icono-girando" size={16} />
      Agregando al grupo...
    </>
  ) : dataGrupo !== null ? (
    <>
      <CheckCircle size={16} />
      ¡Agregado al grupo!
    </>
  ) : grupoSeleccionadoLocal && grupoSeleccionadoInfo ? (
    `Confirmar y agregar al grupo ${grupoSeleccionadoInfo.nombre}`
  ) : (
    'Selecciona un grupo primero'
  )}
</button>

                      <button 
                        className="btn-secondary"
                        onClick={() => setMostrarSelectorGrupo(false)}
                        disabled={loadingGrupo}
                      >
                        Cancelar selección de grupo
                      </button>
                    </>
                  )}
                  
                  <button 
                    className="btn-secondary" 
                    onClick={handleVolver}
                    disabled={agregandoJugador || loadingGrupo}
                  >
                    {exitoAgregar || dataGrupo !== null ? 'Agregar otra pareja' : 'Seleccionar otra pareja'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Estado cuando no hay jugador seleccionado */}
          {!jugador && (
            <div className="sin-jugador">
              <div className="info-box">
                <h3>No hay pareja seleccionada</h3>
                <p>Para agregar una pareja al juego, primero debes buscarla y seleccionarla desde la página de búsqueda.</p>
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/search')}
                >
                  Ir a búsqueda de parejas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizacionJuegos;