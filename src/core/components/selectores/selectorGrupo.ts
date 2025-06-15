// C:\Users\golom\Desktop\torneo\src\core\components\selectores\selectorGrupo.ts

import { useAgregarGrupo } from '../../hooks/usaAgregarGrupo';
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
 * Clase para manejar la lógica del selector de grupo
 */
export class SelectorGrupo {
  private jugadorId: number = 0;
  private grupoId: number = 0;
  private juegoId: number = 0;
  private config: SelectorGrupoConfig;

  constructor(config: SelectorGrupoConfig = {}) {
    this.config = config;
    this.jugadorId = config.jugadorSeleccionado || 0;
    this.grupoId = config.grupoSeleccionado || 0;
    this.juegoId = config.juegoSeleccionado || 0;
  }

  // Getters
  getJugadorId(): number {
    return this.jugadorId;
  }

  getGrupoId(): number {
    return this.grupoId;
  }

  getJuegoId(): number {
    return this.juegoId;
  }

  getEstado(): SelectorGrupoState {
    return {
      jugadorId: this.jugadorId,
      grupoId: this.grupoId,
      juegoId: this.juegoId,
      loading: false, // Se actualizará con el hook
      error: null,    // Se actualizará con el hook
      data: null      // Se actualizará con el hook
    };
  }

  // Setters
  setJugadorId(id: number): void {
    this.jugadorId = id;
  }

  setGrupoId(id: number): void {
    this.grupoId = id;
  }

  setJuegoId(id: number): void {
    this.juegoId = id;
  }

  // Validaciones
  esValido(): boolean {
    return this.jugadorId > 0 && this.grupoId > 0 && this.juegoId > 0;
  }

  validarJugador(jugadorId: number): boolean {
    if (!this.config.jugadores) return true;
    const jugador = this.config.jugadores.find(j => j.id === jugadorId);
    return jugador ? jugador.activo !== false : false;
  }

  validarGrupo(grupoId: number): boolean {
    if (!this.config.grupos) return true;
    const grupo = this.config.grupos.find(g => g.id === grupoId);
    return grupo ? grupo.activo !== false : false;
  }

  validarJuego(juegoId: number): boolean {
    if (!this.config.juegos) return true;
    const juego = this.config.juegos.find(j => j.id === juegoId);
    return juego ? juego.activo !== false : false;
  }

  // Métodos utilitarios
  obtenerJugadorPorId(id: number): Jugador | undefined {
    return this.config.jugadores?.find(j => j.id === id);
  }

  obtenerGrupoPorId(id: number): Grupo | undefined {
    return this.config.grupos?.find(g => g.id === id);
  }

  obtenerJuegoPorId(id: number): Juego | undefined {
    return this.config.juegos?.find(j => j.id === id);
  }

  // Configuración
  actualizarConfig(nuevaConfig: Partial<SelectorGrupoConfig>): void {
    this.config = { ...this.config, ...nuevaConfig };
  }

  reset(): void {
    this.jugadorId = 0;
    this.grupoId = 0;
    this.juegoId = 0;
  }

  // Crear parámetros para la API
  crearParametros(): AgregarGrupoRequest {
    return {
      jugadorId: this.jugadorId,
      grupoId: this.grupoId,
      juegoId: this.juegoId
    };
  }
}

/**
 * Hook personalizado para usar el selector de grupo
 */
export const useSelectorGrupo = (config: SelectorGrupoConfig = {}) => {
  const { data, loading, error, agregarJugador, reset } = useAgregarGrupo();
  const selector = new SelectorGrupo(config);

  const ejecutarAgregar = async (): Promise<void> => {
    if (selector.esValido()) {
      const params = selector.crearParametros();
      await agregarJugador(params.jugadorId, params.grupoId, params.juegoId);
      
      // Ejecutar callbacks
      if (data && config.onSuccess) {
        config.onSuccess(data);
      }
      if (error && config.onError) {
        config.onError(error);
      }
    }
  };

  return {
    // Estado del selector
    jugadorId: selector.getJugadorId(),
    grupoId: selector.getGrupoId(),
    juegoId: selector.getJuegoId(),
    
    // Estado de la API
    data,
    loading,
    error,
    
    // Acciones
    setJugadorId: (id: number) => selector.setJugadorId(id),
    setGrupoId: (id: number) => selector.setGrupoId(id),
    setJuegoId: (id: number) => selector.setJuegoId(id),
    ejecutarAgregar,
    reset: () => {
      selector.reset();
      reset();
    },
    
    // Validaciones
    esValido: () => selector.esValido(),
    validarJugador: (id: number) => selector.validarJugador(id),
    validarGrupo: (id: number) => selector.validarGrupo(id),
    validarJuego: (id: number) => selector.validarJuego(id),
    
    // Utilidades
    obtenerJugadorPorId: (id: number) => selector.obtenerJugadorPorId(id),
    obtenerGrupoPorId: (id: number) => selector.obtenerGrupoPorId(id),
    obtenerJuegoPorId: (id: number) => selector.obtenerJuegoPorId(id),
    crearParametros: () => selector.crearParametros(),
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
  SelectorGrupo,
  useSelectorGrupo,
  crearParametrosGrupo,
  validarConfiguracionSelector,
  filtrarActivos
};