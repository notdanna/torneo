import { useState, useEffect, useMemo } from 'react';
import { useJuegos } from '../../../core/components/Selectores/selectorJuegos';
import { useSelectorGrupo, type Grupo } from '../../../core/components/Selectores/selectorGrupo';
import { agregarJugadorAJuego } from '../../../core/api/Services/agregarJuego';
import { PasoWizard, FormularioJugadorProps } from '../../../core/models/formulario.ts';

interface WorkflowState {
  juegoSeleccionado?: number;
  grupoSeleccionadoLocal: number;
  gruposDisponibles: Grupo[];
  cargandoGrupos: boolean;
  loading: boolean;
  error: string | null;
  success: string | null;
}

export const useJugadorWorkflow = (
  pasoActual: PasoWizard,
  jugadorCreado: any,
  onJugadorAgregado?: FormularioJugadorProps['onJugadorAgregado']
) => {
  
  const [state, setState] = useState<WorkflowState>({
    juegoSeleccionado: undefined,
    grupoSeleccionadoLocal: 0,
    gruposDisponibles: [],
    cargandoGrupos: false,
    loading: false,
    error: null,
    success: null,
  });

  // Hook de juegos
  const {
    juegos,
    cargando: cargandoJuegos,
    error: errorJuegos,
    seleccionarJuego,
    obtenerNombreJuego,
  } = useJuegos(pasoActual >= PasoWizard.SELECCION_JUEGO);

  // Configuración del selector de grupo
  const selectorGrupoConfig = useMemo(() => ({
    grupos: state.gruposDisponibles,
    jugadorSeleccionado: jugadorCreado?.id ? parseInt(jugadorCreado.id) : undefined,
    juegoSeleccionado: state.juegoSeleccionado || undefined,
    onSuccess: (data: any) => {
      console.log('✅ Jugador agregado al grupo exitosamente:', data);
      setState(prev => ({ ...prev, success: '✅ ¡Pareja registrada y asignada exitosamente!' }));
      
      // Cerrar el modal después de 2 segundos
      setTimeout(() => {
        if (onJugadorAgregado && jugadorCreado) {
          onJugadorAgregado({
            ...jugadorCreado,
            juegoId: state.juegoSeleccionado,
            grupoId: state.grupoSeleccionadoLocal
          });
        }
      }, 2000);
    },
    onError: (errorMsg: string) => {
      console.error('❌ Error al agregar jugador al grupo:', errorMsg);
      setState(prev => ({ 
        ...prev, 
        error: `Error al asignar grupo: ${errorMsg}`,
        loading: false 
      }));
    }
  }), [state.gruposDisponibles, jugadorCreado?.id, state.juegoSeleccionado, state.grupoSeleccionadoLocal, onJugadorAgregado]);

  // Hook del selector de grupo
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

  // Cargar grupos cuando llegamos al paso 3
  useEffect(() => {
    if (pasoActual === PasoWizard.SELECCION_GRUPO && state.juegoSeleccionado) {
      const cargarGrupos = async () => {
        setState(prev => ({ ...prev, cargandoGrupos: true, error: null }));
        
        try {
          console.log(`Cargando grupos para el juego ID: ${state.juegoSeleccionado}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // TODO: Reemplazar con tu API real de grupos
          const gruposDeEjemplo: Grupo[] = [
            { id: 1, nombre: "Grupo A", descripcion: "Principiantes", activo: true },
            { id: 2, nombre: "Grupo B", descripcion: "Intermedio", activo: true },
            { id: 3, nombre: "Grupo C", descripcion: "Avanzado", activo: true },
          ];
          
          setState(prev => ({ ...prev, gruposDisponibles: gruposDeEjemplo }));
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Error al cargar los grupos';
          setState(prev => ({ ...prev, error: `❌ ${errorMessage}` }));
        } finally {
          setState(prev => ({ ...prev, cargandoGrupos: false }));
        }
      };
      
      cargarGrupos();
    }
  }, [pasoActual, state.juegoSeleccionado]);

  // Limpiar estados al desmontar
  useEffect(() => {
    return () => {
      resetSelectorGrupo();
    };
  }, [resetSelectorGrupo]);

  // Manejar selección de juego
  const handleJuegoSeleccionado = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const juegoId = Number(e.target.value);
    if (juegoId) {
      setState(prev => ({
        ...prev,
        juegoSeleccionado: juegoId,
        grupoSeleccionadoLocal: 0,
        gruposDisponibles: [],
      }));
      seleccionarJuego(juegoId);
      setJuegoIdGrupo(juegoId);
    }
  };

  // Confirmar paso 2 (asignar juego)
  const confirmarPaso2 = async (): Promise<boolean> => {
    if (!state.juegoSeleccionado || !jugadorCreado?.id) {
      setState(prev => ({ ...prev, error: '❌ Faltan datos para continuar.' }));
      return false;
    }
    
    setState(prev => ({ ...prev, loading: true, error: null, success: null }));
    
    try {
      const resultado = await agregarJugadorAJuego(Number(jugadorCreado.id), state.juegoSeleccionado);
      if (resultado.success) {
        setState(prev => ({ 
          ...prev, 
          success: `✅ Asignado al juego: ${obtenerNombreJuego(state.juegoSeleccionado!)}` 
        }));
        
        // Configurar IDs para el siguiente paso
        const idJugadorNumerico = parseInt(jugadorCreado.id);
        if (!isNaN(idJugadorNumerico)) {
          setJugadorIdGrupo(idJugadorNumerico);
          setJuegoIdGrupo(state.juegoSeleccionado);
        }
        
        return true;
      } else {
        setState(prev => ({ ...prev, error: `❌ Error al asignar al juego: ${resultado.error}` }));
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al asignar juego';
      setState(prev => ({ ...prev, error: `❌ ${errorMessage}` }));
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Manejar selección de grupo
  const handleSeleccionarGrupo = (idGrupo: number) => {
    console.log(`🎯 Seleccionando grupo: ${idGrupo}`);
    
    setState(prev => ({ ...prev, grupoSeleccionadoLocal: idGrupo }));
    
    // Asegurar que los otros IDs están configurados en el hook
    if (jugadorCreado?.id && state.juegoSeleccionado) {
      const idJugadorNumerico = parseInt(jugadorCreado.id);
      setJugadorIdGrupo(idJugadorNumerico);
      setJuegoIdGrupo(state.juegoSeleccionado);
      setGrupoId(idGrupo);
    }
    
    console.log(`✅ Grupo seleccionado localmente: ${idGrupo}`);
  };

  // Confirmar paso 3 (asignar grupo)
  const confirmarPaso3 = async (): Promise<boolean> => {
    if (!jugadorCreado?.id || !state.juegoSeleccionado || !state.grupoSeleccionadoLocal) {
      console.error('❌ Faltan datos para agregar al grupo');
      setState(prev => ({ ...prev, error: '❌ Faltan datos para finalizar el registro.' }));
      return false;
    }

    const idJugadorNumerico = parseInt(jugadorCreado.id);
    
    if (isNaN(idJugadorNumerico)) {
      console.error('❌ ID de jugador inválido:', jugadorCreado.id);
      setState(prev => ({ ...prev, error: '❌ ID de jugador inválido' }));
      return false;
    }

    // Configurar todos los IDs en el hook antes de ejecutar
    setJugadorIdGrupo(idJugadorNumerico);
    setJuegoIdGrupo(state.juegoSeleccionado);
    setGrupoId(state.grupoSeleccionadoLocal);

    console.log(`🎯 Agregando jugador ${idJugadorNumerico} al grupo ${state.grupoSeleccionadoLocal} en juego ${state.juegoSeleccionado}`);
    
    setState(prev => ({ ...prev, error: null, success: null }));
    
    // Ejecutar la acción usando el hook del selector
    await ejecutarAgregar();
    return true;
  };

  // Obtener información del grupo seleccionado
  const grupoSeleccionadoInfo = state.gruposDisponibles.find(
    grupo => grupo.id === state.grupoSeleccionadoLocal
  );

  // Reset del workflow
  const resetWorkflow = () => {
    setState({
      juegoSeleccionado: undefined,
      grupoSeleccionadoLocal: 0,
      gruposDisponibles: [],
      cargandoGrupos: false,
      loading: false,
      error: null,
      success: null,
    });
    resetSelectorGrupo();
  };

  return {
    // Estado
    ...state,
    loadingGrupo,
    errorGrupo,
    dataGrupo,
    grupoSeleccionadoInfo,
    
    // Datos de juegos
    juegos,
    cargandoJuegos,
    errorJuegos,
    obtenerNombreJuego,
    
    // Acciones
    handleJuegoSeleccionado,
    handleSeleccionarGrupo,
    confirmarPaso2,
    confirmarPaso3,
    resetWorkflow,
    
    // Setters para control manual
    setError: (error: string | null) => setState(prev => ({ ...prev, error })),
    setSuccess: (success: string | null) => setState(prev => ({ ...prev, success })),
  };
};