// hooks/useTorneoCompleto.ts
import { useState, useEffect, useMemo } from 'react';
import { useFirebaseData } from './useFirebaseDataGrafo_3';
import { useFirebaseGanadores } from '../useFirebaseGanadores_1';
import { crearEstructuraConRondasOcultas } from '../../utils/torneoUtils';
import { NodoTorneo } from '../../models/grafos';

export type ModoVisualizacion = 'arbol' | 'ganadores' | 'loading';

interface UseTorneoCompletoReturn {
  // Estados de carga y error
  loading: boolean;
  error: string | null;
  ultimaActualizacion: Date | null;
  
  // Modo de visualización
  modoVisualizacion: ModoVisualizacion;
  
  // Datos del árbol del torneo
  estructura: NodoTorneo[][];
  rondasVisibles: number[];
  estructuraCompleta: NodoTorneo[][];
  partidas: any[];
  nivelesJugadores: { [key: number]: number };
  
  // Datos de ganadores
  ganadoresArray: Array<{ id: string } & import('../useFirebaseGanadores_1').GanadorInfo>;
  totalGanadores: number;
  deberiaOcultarArbol: boolean;
  
  // Funciones de utilidad
  refreshData: () => void;
  estadisticasTorneo: {
    totalJugadores: number;
    partidasCompletadas: number;
    partidasPendientes: number;
    progreso: number;
  };
}

export const useTorneoCompleto = (): UseTorneoCompletoReturn => {
  const [, setRefreshTrigger] = useState(0);
  
  // Hooks para datos del torneo y ganadores
  const {
    partidas,
    nivelesJugadores,
    loading: loadingTorneo,
    error: errorTorneo,
    ultimaActualizacion: actualizacionTorneo
  } = useFirebaseData();
  
  const {
    ganadoresArray,
    totalGanadores,
    deberiaOcultarArbol,
    loading: loadingGanadores,
    error: errorGanadores,
    ultimaActualizacion: actualizacionGanadores
  } = useFirebaseGanadores();

  // Estados combinados
  const loading = loadingTorneo || loadingGanadores;
  const error = errorTorneo || errorGanadores;
  const ultimaActualizacion = useMemo(() => {
    if (!actualizacionTorneo && !actualizacionGanadores) return null;
    if (!actualizacionTorneo) return actualizacionGanadores;
    if (!actualizacionGanadores) return actualizacionTorneo;
    return actualizacionTorneo > actualizacionGanadores ? actualizacionTorneo : actualizacionGanadores;
  }, [actualizacionTorneo, actualizacionGanadores]);

  // Determinar modo de visualización
  const modoVisualizacion: ModoVisualizacion = useMemo(() => {
    if (loading) return 'loading';
    if (deberiaOcultarArbol) return 'ganadores';
    return 'arbol';
  }, [loading, deberiaOcultarArbol]);

  // Generar estructura del torneo (solo cuando sea necesario)
  const { estructura, rondasVisibles, estructuraCompleta } = useMemo(() => {
    if (modoVisualizacion === 'ganadores' || partidas.length === 0) {
      return {
        estructura: [],
        rondasVisibles: [],
        estructuraCompleta: []
      };
    }
    
    console.log('🔄 Regenerando estructura del torneo...');
    return crearEstructuraConRondasOcultas(partidas, nivelesJugadores);
  }, [partidas, nivelesJugadores, modoVisualizacion]);

  // Estadísticas del torneo
  const estadisticasTorneo = useMemo(() => {
    const totalJugadores = Object.keys(nivelesJugadores).length;
    const partidasCompletadas = partidas.filter(p => p.resultado && p.resultado !== '').length;
    const partidasPendientes = partidas.length - partidasCompletadas;
    const progreso = partidas.length > 0 ? (partidasCompletadas / partidas.length) * 100 : 0;
    
    return {
      totalJugadores,
      partidasCompletadas,
      partidasPendientes,
      progreso
    };
  }, [partidas, nivelesJugadores]);

  // Función para forzar actualización
  const refreshData = () => {
    console.log('🔄 Forzando actualización de datos...');
    setRefreshTrigger(prev => prev + 1);
  };

  // Log de estado actual
  useEffect(() => {
    console.log('📊 Estado del torneo actualizado:');
    console.log(`   - Modo: ${modoVisualizacion}`);
    console.log(`   - Partidas: ${partidas.length}`);
    console.log(`   - Jugadores: ${Object.keys(nivelesJugadores).length}`);
    console.log(`   - Ganadores: ${totalGanadores}`);
    console.log(`   - Debe ocultar árbol: ${deberiaOcultarArbol}`);
    console.log(`   - Progreso: ${estadisticasTorneo.progreso.toFixed(1)}%`);
  }, [modoVisualizacion, partidas.length, Object.keys(nivelesJugadores).length, totalGanadores, deberiaOcultarArbol, estadisticasTorneo.progreso]);

  return {
    // Estados de carga y error
    loading,
    error,
    ultimaActualizacion,
    
    // Modo de visualización
    modoVisualizacion,
    
    // Datos del árbol del torneo
    estructura,
    rondasVisibles,
    estructuraCompleta,
    partidas,
    nivelesJugadores,
    
    // Datos de ganadores
    ganadoresArray,
    totalGanadores,
    deberiaOcultarArbol,
    
    // Funciones de utilidad
    refreshData,
    estadisticasTorneo
  };
};