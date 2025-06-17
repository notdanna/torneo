import { useState, useEffect } from 'react';
import { agregarJugadorAJuego, validarJugadorJuego } from '../../api/agregarJuego';
import type { ApiResponse } from '../../models/torneo';

// Definición de juegos locales con sus IDs correspondientes a la base de datos
export interface JuegoLocal {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  activo: boolean;
}

// Mapeo de juegos según tu base de datos - usando la estructura similar a Juegos
export const JUEGOS_DISPONIBLES: JuegoLocal[] = [
  {
    id: 1,
    nombre: 'Futbolitos',
    descripcion: 'Juego de futbolito clásico',
    icono: '⚽',
    activo: true
  },
  {
    id: 2,
    nombre: 'Soplados',
    descripcion: 'Futbolito con pelotas sopladas',
    icono: '💨',
    activo: true
  },
  {
    id: 3,
    nombre: 'Ruelas',
    descripcion: 'Juego de ruelas',
    icono: '🎯',
    activo: true
  },
  {
    id: 4,
    nombre: 'Beer Pong',
    descripcion: 'Juego de beer pong',
    icono: '🍺',
    activo: true
  }
];

interface UseJuegosState {
  juegos: JuegoLocal[];
  cargando: boolean;
  error: string | null;
  juegoSeleccionado: number | null;
  // Estados adicionales para la funcionalidad de agregar jugador
  agregandoJugador: boolean;
  errorAgregar: string | null;
  exitoAgregar: boolean;
  mensajeAgregar: string | null;
}

interface UseJuegosReturn extends UseJuegosState {
  // Funciones originales
  seleccionarJuego: (idJuego: number) => void;
  recargarJuegos: () => Promise<void>;
  limpiarSeleccion: () => void;
  
  // Nuevas funciones para agregar jugador
  agregarJugadorAlJuegoSeleccionado: (idJugador: number) => Promise<boolean>;
  limpiarEstadosAgregar: () => void;
  obtenerJuegoPorId: (id: number) => JuegoLocal | undefined;
  obtenerNombreJuego: (id: number) => string;
}

export const useJuegos = (cargarInmediatamente: boolean = true): UseJuegosReturn => {
  const [estado, setEstado] = useState<UseJuegosState>({
    juegos: [],
    cargando: false,
    error: null,
    juegoSeleccionado: null,
    agregandoJugador: false,
    errorAgregar: null,
    exitoAgregar: false,
    mensajeAgregar: null
  });

  // ========== FUNCIONES ORIGINALES ==========

  const cargarJuegos = async () => {
    console.log('🎮 Iniciando carga de juegos locales...');
    
    setEstado(prev => ({
      ...prev,
      cargando: true,
      error: null
    }));

    try {
      // Simular una pequeña carga para mantener consistencia con la API original
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Filtrar solo juegos activos
      const juegosActivos = JUEGOS_DISPONIBLES.filter(juego => juego.activo);
      
      console.log('✅ Juegos locales cargados exitosamente:', juegosActivos);
      setEstado(prev => ({
        ...prev,
        juegos: juegosActivos,
        cargando: false,
        error: null
      }));
    } catch (error) {
      console.error('💥 Error inesperado al cargar juegos:', error);
      setEstado(prev => ({
        ...prev,
        juegos: [],
        cargando: false,
        error: error instanceof Error ? error.message : 'Error inesperado al cargar juegos'
      }));
    }
  };

  const seleccionarJuego = (idJuego: number) => {
    console.log('🎯 Juego seleccionado:', idJuego);
    const juegoInfo = obtenerJuegoPorId(idJuego);
    console.log('🎯 Información del juego:', juegoInfo);
    
    setEstado(prev => ({
      ...prev,
      juegoSeleccionado: idJuego,
      // Limpiar estados de agregar jugador al cambiar de juego
      errorAgregar: null,
      exitoAgregar: false,
      mensajeAgregar: null
    }));
  };

  const recargarJuegos = async () => {
    await cargarJuegos();
  };

  const limpiarSeleccion = () => {
    console.log('🔄 Limpiando selección de juego...');
    setEstado(prev => ({
      ...prev,
      juegoSeleccionado: null,
      // También limpiar estados de agregar jugador
      errorAgregar: null,
      exitoAgregar: false,
      mensajeAgregar: null
    }));
  };

  // ========== NUEVAS FUNCIONES PARA AGREGAR JUGADOR ==========

  const obtenerJuegoPorId = (id: number): JuegoLocal | undefined => {
    return JUEGOS_DISPONIBLES.find(juego => juego.id === id);
  };

  const obtenerNombreJuego = (id: number): string => {
    const juego = obtenerJuegoPorId(id);
    return juego ? juego.nombre : `Juego ${id}`;
  };

  const agregarJugadorAlJuegoSeleccionado = async (jugadorId: number): Promise<boolean> => {
    if (!estado.juegoSeleccionado) {
      console.error('❌ No hay juego seleccionado');
      setEstado(prev => ({
        ...prev,
        errorAgregar: 'Debes seleccionar un juego primero',
        exitoAgregar: false,
        mensajeAgregar: null
      }));
      return false;
    }

    const juegoInfo = obtenerJuegoPorId(estado.juegoSeleccionado);
    console.log(`🚀 Iniciando proceso de agregar jugador ${jugadorId} al juego ${estado.juegoSeleccionado} (${juegoInfo?.nombre})`);
    
    // Establecer estado de carga
    setEstado(prev => ({
      ...prev,
      agregandoJugador: true,
      errorAgregar: null,
      exitoAgregar: false,
      mensajeAgregar: null
    }));

    try {
      // Validar datos antes de enviar (usando nombres correctos)
      const erroresValidacion = validarJugadorJuego(jugadorId, estado.juegoSeleccionado);
      
      if (erroresValidacion.length > 0) {
        console.log('❌ Errores de validación:', erroresValidacion);
        setEstado(prev => ({
          ...prev,
          agregandoJugador: false,
          errorAgregar: erroresValidacion.join(', '),
          exitoAgregar: false,
          mensajeAgregar: null
        }));
        return false;
      }

      console.log(`📤 Agregando jugador ${jugadorId} al juego ${estado.juegoSeleccionado} (${juegoInfo?.nombre})...`);

      // Llamar a la API con los parámetros correctos
      const resultado: ApiResponse<any> = await agregarJugadorAJuego(jugadorId, estado.juegoSeleccionado);

      if (resultado.success) {
        const mensajeExito = `Jugador agregado exitosamente a ${juegoInfo?.nombre || 'el juego seleccionado'}`;
        console.log('✅ ' + mensajeExito);
        
        setEstado(prev => ({
          ...prev,
          agregandoJugador: false,
          errorAgregar: null,
          exitoAgregar: true,
          mensajeAgregar: resultado.message || mensajeExito
        }));
        return true;
      } else {
        console.error('❌ Error al agregar jugador:', resultado.error);
        setEstado(prev => ({
          ...prev,
          agregandoJugador: false,
          errorAgregar: resultado.error || 'Error desconocido al agregar jugador',
          exitoAgregar: false,
          mensajeAgregar: null
        }));
        return false;
      }

    } catch (error) {
      console.error('💥 Error inesperado:', error);
      setEstado(prev => ({
        ...prev,
        agregandoJugador: false,
        errorAgregar: error instanceof Error ? error.message : 'Error inesperado al agregar jugador al juego',
        exitoAgregar: false,
        mensajeAgregar: null
      }));
      return false;
    }
  };

  const limpiarEstadosAgregar = () => {
    console.log('🔄 Limpiando estados de agregar jugador...');
    setEstado(prev => ({
      ...prev,
      agregandoJugador: false,
      errorAgregar: null,
      exitoAgregar: false,
      mensajeAgregar: null
    }));
  };

  // ========== EFFECT PARA CARGAR JUEGOS ==========

  // Cargar juegos al montar el componente
  useEffect(() => {
    if (cargarInmediatamente) {
      cargarJuegos();
    }
  }, [cargarInmediatamente]);

  // ========== RETURN DEL HOOK ==========

  return {
    // Estados originales
    juegos: estado.juegos,
    cargando: estado.cargando,
    error: estado.error,
    juegoSeleccionado: estado.juegoSeleccionado,
    
    // Nuevos estados para agregar jugador
    agregandoJugador: estado.agregandoJugador,
    errorAgregar: estado.errorAgregar,
    exitoAgregar: estado.exitoAgregar,
    mensajeAgregar: estado.mensajeAgregar,
    
    // Funciones originales
    seleccionarJuego,
    recargarJuegos,
    limpiarSeleccion,
    
    // Nuevas funciones
    agregarJugadorAlJuegoSeleccionado,
    limpiarEstadosAgregar,
    obtenerJuegoPorId,
    obtenerNombreJuego
  };
};