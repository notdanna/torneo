import { useState, useCallback, useEffect } from 'react';
import { useAgregarGrupo } from '../../hooks/useAgregarGrupo';
import type { AgregarGrupoRequest, AgregarGrupoResponse } from '../../models/torneo';

// Interfaces para el selector
export interface Grupo {
  id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface Jugador {
  id: number;
  nombre: string;
  activo?: boolean;
}

export interface Juego {
  id: number;
  nombre: string;
  activo?: boolean;
}

export interface SelectorGrupoConfig {
  jugadores?: Jugador[];
  grupos?: Grupo[];
  juegos?: Juego[];
  jugadorSeleccionado?: number;
  grupoSeleccionado?: number;
  juegoSeleccionado?: number;
  onSuccess?: (data: AgregarGrupoResponse) => void;
  onError?: (error: string) => void;
}

export interface SelectorGrupoState {
  jugadorId: number;
  grupoId: number;
  juegoId: number;
  loading: boolean;
  error: string | null;
  data: AgregarGrupoResponse | null;
}

export interface SelectorGrupoActions {
  setJugadorId: (id: number) => void;
  setGrupoId: (id: number) => void;
  setJuegoId: (id: number) => void;
  ejecutarAgregar: () => Promise<void>;
  reset: () => void;
  esValido: () => boolean;
}

/**
 * Hook personalizado para usar el selector de grupo
 */
export const useSelectorGrupo = (config: SelectorGrupoConfig = {}) => {
  const { data, loading, error, agregarJugador, reset } = useAgregarGrupo();
  
  // Estados locales para los IDs
  const [jugadorId, setJugadorId] = useState(config.jugadorSeleccionado || 0);
  const [grupoId, setGrupoId] = useState(config.grupoSeleccionado || 0);
  const [juegoId, setJuegoId] = useState(config.juegoSeleccionado || 0);

  const esValido = useCallback(() => {
    return jugadorId > 0 && grupoId > 0 && juegoId > 0;
  }, [jugadorId, grupoId, juegoId]);

  const ejecutarAgregar = useCallback(async (): Promise<void> => {
    if (!esValido()) {
      const errorMsg = 'Faltan datos requeridos: jugadorId, grupoId o juegoId';
      console.error(errorMsg);
      if (config.onError) {
        config.onError(errorMsg);
      }
      return;
    }

    try {
      console.log('Ejecutando agregar con:', { jugadorId, grupoId, juegoId });
      await agregarJugador(jugadorId, grupoId, juegoId);
      
      // La respuesta exitosa se maneja en el siguiente render cuando 'data' se actualiza
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error en ejecutarAgregar:', errorMessage);
      if (config.onError) {
        config.onError(errorMessage);
      }
    }
  }, [jugadorId, grupoId, juegoId, esValido, agregarJugador, config]);

  // Efecto para manejar el éxito cuando data cambia
  useEffect(() => {
    if (data && !loading && !error) {
      console.log('Operación exitosa, data recibida:', data);
      if (config.onSuccess) {
        config.onSuccess(data);
      }
    }
  }, [data, loading, error, config]);

  // Efecto para manejar errores cuando error cambia
  useEffect(() => {
    if (error && !loading) {
      console.error('Error detectado:', error);
      if (config.onError) {
        config.onError(error);
      }
    }
  }, [error, loading, config]);

  const resetAll = useCallback(() => {
    setJugadorId(0);
    setGrupoId(0);
    setJuegoId(0);
    reset();
  }, [reset]);

  return {
    // Estado del selector
    jugadorId,
    grupoId,
    juegoId,
    
    // Estado de la API
    data,
    loading,
    error,
    
    // Acciones
    setJugadorId,
    setGrupoId,
    setJuegoId,
    ejecutarAgregar,
    reset: resetAll,
    
    // Validaciones
    esValido,
  };
};

/**
 * Función utilitaria para crear parámetros de solicitud
 */
export const crearParametrosGrupo = (
  jugadorId: number,
  grupoId: number,
  juegoId: number
): AgregarGrupoRequest => ({
  jugadorId,
  grupoId,
  juegoId
});

/**
 * Función para validar una configuración completa
 */
export const validarConfiguracionSelector = (
  config: SelectorGrupoConfig
): { valido: boolean; errores: string[] } => {
  const errores: string[] = [];

  if (!config.jugadores || config.jugadores.length === 0) {
    errores.push('La lista de jugadores no puede estar vacía');
  }

  if (!config.grupos || config.grupos.length === 0) {
    errores.push('La lista de grupos no puede estar vacía');
  }

  if (!config.juegos || config.juegos.length === 0) {
    errores.push('La lista de juegos no puede estar vacía');
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Función helper para filtrar elementos activos
 */
export const filtrarActivos = <T extends { activo?: boolean }>(lista: T[]): T[] => {
  return lista.filter(item => item.activo !== false);
};

// Exportación por defecto
export default {
  useSelectorGrupo,
  crearParametrosGrupo,
  validarConfiguracionSelector,
  filtrarActivos
};