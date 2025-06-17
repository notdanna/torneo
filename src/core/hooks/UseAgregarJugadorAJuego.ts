import { useState } from 'react';
import { agregarJugadorAJuego, validarJugadorJuego } from '../../../src/core/api/Services/agregarJuego';
import type { ApiResponse } from '../../../src/core/models/torneo';

// Definición de juegos locales con sus IDs correspondientes a la base de datos
export interface JuegoLocal {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
}

// Mapeo de juegos según tu base de datos
export const JUEGOS_DISPONIBLES: JuegoLocal[] = [
  {
    id: 1,
    nombre: 'Futbolitos',
    descripcion: 'Juego de futbolito clásico',
    icono: '⚽'
  },
  {
    id: 2,
    nombre: 'Soplados',
    descripcion: 'Futbolito con pelotas sopladas',
    icono: '💨'
  },
  {
    id: 3,
    nombre: 'Ruelas',
    descripcion: 'Juego de ruelas',
    icono: '🎯'
  },
  {
    id: 4,
    nombre: 'Beer Pong',
    descripcion: 'Juego de beer pong',
    icono: '🍺'

  }
];

interface UseJuegosLocalState {
  juegoSeleccionado: number | null;
  juegos: JuegoLocal[];
  // Estados para la operación de agregar jugador
  cargando: boolean;
  error: string | null;
  exito: boolean;
  mensaje: string | null;
}

interface UseJuegosLocalReturn extends UseJuegosLocalState {
  // Funciones de selección de juegos
  seleccionarJuego: (idJuego: number) => void;
  limpiarSeleccion: () => void;
  obtenerJuegoPorId: (id: number) => JuegoLocal | undefined;
  obtenerNombreJuego: (id: number) => string;
  
  // Funciones de API
  agregarJugadorAlJuegoSeleccionado: (idJugador: number) => Promise<boolean>;
  limpiarEstadoAPI: () => void;
}

export const useJuegosLocal = (): UseJuegosLocalReturn => {
  const [estado, setEstado] = useState<UseJuegosLocalState>({
    juegoSeleccionado: null,
    juegos: JUEGOS_DISPONIBLES,
    cargando: false,
    error: null,
    exito: false,
    mensaje: null
  });

  // ========== FUNCIONES DE SELECCIÓN DE JUEGOS ==========
  
  const seleccionarJuego = (idJuego: number) => {
    setEstado(prev => ({
      ...prev,
      juegoSeleccionado: idJuego,
      // Limpiar estados de API al cambiar juego
      error: null,
      exito: false,
      mensaje: null
    }));
  };

  const limpiarSeleccion = () => {
    console.log('🔄 Limpiando selección de juego...');
    setEstado(prev => ({
      ...prev,
      juegoSeleccionado: null,
      // También limpiar estados de API
      error: null,
      exito: false,
      mensaje: null
    }));
  };

  const obtenerJuegoPorId = (id: number): JuegoLocal | undefined => {
    return JUEGOS_DISPONIBLES.find(juego => juego.id === id);
  };

  const obtenerNombreJuego = (id: number): string => {
    const juego = obtenerJuegoPorId(id);
    return juego ? juego.nombre : `Juego ${id}`;
  };

  // ========== FUNCIONES DE API ==========

  const agregarJugadorAlJuegoSeleccionado = async (idJugador: number): Promise<boolean> => {
    if (!estado.juegoSeleccionado) {
      console.error('❌ No hay juego seleccionado');
      setEstado(prev => ({
        ...prev,
        error: 'Debes seleccionar un juego primero',
        exito: false,
        mensaje: null
      }));
      return false;
    }

    const juegoInfo = obtenerJuegoPorId(estado.juegoSeleccionado);
    console.log(`🚀 Iniciando proceso de agregar jugador ${idJugador} al juego ${estado.juegoSeleccionado} (${juegoInfo?.nombre})`);
    
    // Establecer estado de carga
    setEstado(prev => ({
      ...prev,
      cargando: true,
      error: null,
      exito: false,
      mensaje: null
    }));

    try {
      // Validar datos antes de enviar
      const erroresValidacion = validarJugadorJuego(idJugador, estado.juegoSeleccionado);
      
      if (erroresValidacion.length > 0) {
        console.log('❌ Errores de validación:', erroresValidacion);
        setEstado(prev => ({
          ...prev,
          cargando: false,
          error: erroresValidacion.join(', '),
          exito: false,
          mensaje: null
        }));
        return false;
      }

      console.log(`📤 Agregando jugador ${idJugador} al juego ${estado.juegoSeleccionado} (${juegoInfo?.nombre})...`);

      // Llamar a la API
      const resultado: ApiResponse<any> = await agregarJugadorAJuego(idJugador, estado.juegoSeleccionado);

      if (resultado.success) {
        const mensajeExito = `Jugador agregado exitosamente a ${juegoInfo?.nombre || 'el juego seleccionado'}`;
        console.log('✅ ' + mensajeExito);
        
        setEstado(prev => ({
          ...prev,
          cargando: false,
          error: null,
          exito: true,
          mensaje: resultado.message || mensajeExito
        }));
        return true;
      } else {
        console.error('❌ Error al agregar jugador:', resultado.error);
        setEstado(prev => ({
          ...prev,
          cargando: false,
          error: resultado.error || 'Error desconocido al agregar jugador',
          exito: false,
          mensaje: null
        }));
        return false;
      }

    } catch (error) {
      console.error('💥 Error inesperado:', error);
      setEstado(prev => ({
        ...prev,
        cargando: false,
        error: error instanceof Error ? error.message : 'Error inesperado al agregar jugador al juego',
        exito: false,
        mensaje: null
      }));
      return false;
    }
  };

  const limpiarEstadoAPI = () => {
    console.log('🔄 Limpiando estado de la API...');
    setEstado(prev => ({
      ...prev,
      cargando: false,
      error: null,
      exito: false,
      mensaje: null
    }));
  };

  // ========== RETURN DEL HOOK ==========

  return {
    // Estados
    ...estado,
    
    // Funciones de selección
    seleccionarJuego,
    limpiarSeleccion,
    obtenerJuegoPorId,
    obtenerNombreJuego,
    
    // Funciones de API
    agregarJugadorAlJuegoSeleccionado,
    limpiarEstadoAPI
  };
};