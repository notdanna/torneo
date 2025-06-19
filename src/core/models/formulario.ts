
import { JugadorFirebase } from '../../core/api/Services/jugadorService';

// Extender la interfaz existente para compatibilidad
export interface GrupoLocal {
  id: number;
  nombre: string;
  descripcion?: string; // Opcional para compatibilidad
  activo?: boolean; // Opcional para compatibilidad
}

export interface JuegoLocal {
  id: number;
  nombre: string;
  descripcion?: string;
  icono: string;
}

export interface JugadorCreadoLocal extends JugadorFirebase {
  id: number; 
}

export interface FormDataLocal {
  nombre: string;
  nombreAcompanante: string;
  empresa: string;
  empresaAcompanante: string;
  nivel: number;
  activo: boolean;
}

export interface FormularioJugadorProps {
  onCancelar: () => void;
  nombreInicial?: string;
  jugadorParaEditar?: JugadorFirebase | null;
  modoEdicion?: boolean;
  onJugadorAgregado?: (jugador: JugadorCreadoLocal) => void;
}

export enum PasoWizard {
  DATOS_PAREJA = 1,
  SELECCION_JUEGO = 2,
  SELECCION_GRUPO = 3
}