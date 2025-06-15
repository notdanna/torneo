import { useState, useCallback } from 'react';
import { agregarJugadorAGrupo, agregarJugadorAGrupoConParams } from '../api/agregarGrupo';
import type { AgregarGrupoRequest, AgregarGrupoResponse } from '../models/torneo';

interface UseAgregarGrupoState {
  data: AgregarGrupoResponse | null;
  loading: boolean;
  error: string | null;
}

interface UseAgregarGrupoReturn extends UseAgregarGrupoState {
  agregarJugador: (jugadorId: number, grupoId: number, juegoId: number) => Promise<void>;
  agregarJugadorConParams: (params: AgregarGrupoRequest) => Promise<void>;
  reset: () => void;
}

/**
 * Hook personalizado para agregar jugadores a grupos
 * @returns Objeto con estado y funciones para agregar jugadores
 */
export const useAgregarGrupo = (): UseAgregarGrupoReturn => {
  const [state, setState] = useState<UseAgregarGrupoState>({
    data: null,
    loading: false,
    error: null,
  });

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  const agregarJugador = useCallback(async (
    jugadorId: number,
    grupoId: number,
    juegoId: number
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await agregarJugadorAGrupo(jugadorId, grupoId, juegoId);
      setState({
        data: response,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }, []);

  const agregarJugadorConParams = useCallback(async (params: AgregarGrupoRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await agregarJugadorAGrupoConParams(params);
      setState({
        data: response,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  }, []);

  return {
    ...state,
    agregarJugador,
    agregarJugadorConParams,
    reset,
  };
};

// Hook alternativo con mutación automática (estilo react-query)
interface UseAgregarGrupoMutationOptions {
  onSuccess?: (data: AgregarGrupoResponse) => void;
  onError?: (error: string) => void;
}

export const useAgregarGrupoMutation = (options?: UseAgregarGrupoMutationOptions) => {
  const [state, setState] = useState<UseAgregarGrupoState>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (params: AgregarGrupoRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await agregarJugadorAGrupoConParams(params);
      setState({
        data: response,
        loading: false,
        error: null,
      });
      
      options?.onSuccess?.(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      
      options?.onError?.(errorMessage);
    }
  }, [options]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
};