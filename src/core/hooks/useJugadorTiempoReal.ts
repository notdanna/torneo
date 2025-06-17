// src/core/hooks/useJugadorTiempoReal.ts
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../src/firebase';

interface JugadorData {
  id_jugador?: number;
  nombre: string;
  nombreAcompanante: string;
  empresa: string;
  empresaAcompanante: string;
  nivel: number;
  activo: boolean;
}

interface UseJugadorTiempoRealReturn {
  jugador: JugadorData | null;
  loading: boolean;
  error: string | null;
  ultimaActualizacion: Date | null;
  existe: boolean;
}

/**
 * Hook para obtener datos de un jugador en tiempo real desde Firestore
 * @param jugadorId - ID del jugador a escuchar (string o number)
 * @returns Objeto con los datos del jugador y estados de loading/error
 */
export const useJugadorTiempoReal = (jugadorId: string | number): UseJugadorTiempoRealReturn => {
  const [jugador, setJugador] = useState<JugadorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const [existe, setExiste] = useState(false);

  useEffect(() => {
    // Convertir el ID a string para Firebase
    const idString = String(jugadorId);
    
    console.log(`🔥 Iniciando listener en tiempo real para jugador ID: ${idString}`);
    
    // Referencia al documento del jugador
    const jugadorRef = doc(db, 'jugadores', idString);
    
    // Configurar el listener en tiempo real
    const unsubscribe = onSnapshot(
      jugadorRef,
      (docSnapshot) => {
        setLoading(false);
        
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as JugadorData;
          console.log(`📥 Datos actualizados del jugador ${idString}:`, data);
          
          setJugador(data);
          setError(null);
          setExiste(true);
          setUltimaActualizacion(new Date());
        } else {
          console.log(`❌ El jugador con ID ${idString} no existe`);
          setJugador(null);
          setError(`El jugador con ID ${idString} no existe en la base de datos`);
          setExiste(false);
          setUltimaActualizacion(new Date());
        }
      },
      (error) => {
        console.error(`💥 Error al escuchar cambios del jugador ${idString}:`, error);
        setLoading(false);
        setError(`Error al conectar con Firebase: ${error.message}`);
        setJugador(null);
        setExiste(false);
      }
    );

    // Cleanup: Desconectar el listener cuando el ID cambie o el componente se desmonte
    return () => {
      console.log(`🔄 Desconectando listener de tiempo real para jugador ${idString}`);
      unsubscribe();
    };
  }, [jugadorId]); // Re-ejecutar cuando cambie el ID del jugador

  return {
    jugador,
    loading,
    error,
    ultimaActualizacion,
    existe
  };
};

/**
 * Hook específico para el jugador con ID 1
 * @returns Objeto con los datos del jugador ID 1 y estados de loading/error
 */
export const useJugador1TiempoReal = (): UseJugadorTiempoRealReturn => {
  return useJugadorTiempoReal(1);
};

/**
 * Hook para escuchar múltiples jugadores en tiempo real
 * @param jugadorIds - Array de IDs de jugadores a escuchar
 * @returns Array con los datos de cada jugador
 */
export const useMultiplesJugadoresTiempoReal = (jugadorIds: (string | number)[]) => {
  const [jugadores, setJugadores] = useState<{ [key: string]: JugadorData | null }>({});
  const [loading, setLoading] = useState(true);
  const [errores, setErrores] = useState<{ [key: string]: string | null }>({});

  useEffect(() => {
    console.log('🔥 Iniciando listeners múltiples para jugadores:', jugadorIds);
    
    const unsubscribes: (() => void)[] = [];
    let loadingCount = jugadorIds.length;

    const checkAllLoaded = () => {
      loadingCount--;
      if (loadingCount <= 0) {
        setLoading(false);
      }
    };

    jugadorIds.forEach((id) => {
      const idString = String(id);
      const jugadorRef = doc(db, 'jugadores', idString);
      
      const unsubscribe = onSnapshot(
        jugadorRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data() as JugadorData;
            setJugadores(prev => ({ ...prev, [idString]: data }));
            setErrores(prev => ({ ...prev, [idString]: null }));
          } else {
            setJugadores(prev => ({ ...prev, [idString]: null }));
            setErrores(prev => ({ 
              ...prev, 
              [idString]: `Jugador ${idString} no existe` 
            }));
          }
          checkAllLoaded();
        },
        (error) => {
          setJugadores(prev => ({ ...prev, [idString]: null }));
          setErrores(prev => ({ 
            ...prev, 
            [idString]: `Error: ${error.message}` 
          }));
          checkAllLoaded();
        }
      );

      unsubscribes.push(unsubscribe);
    });

    return () => {
      console.log('🔄 Desconectando listeners múltiples');
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [jugadorIds]);

  return { jugadores, loading, errores };
};

// Función utilitaria para obtener texto del nivel
export const getNivelTexto = (nivel: number): string => {
  if (nivel === 0) return 'Nuevo jugador';
  if (nivel === 1) return 'Principiante';
  if (nivel <= 3) return 'Básico';
  if (nivel <= 6) return 'Intermedio';
  if (nivel <= 8) return 'Avanzado';
  return 'Experto';
};

// Función utilitaria para formatear fecha
export const formatearFecha = (fecha: Date): string => {
  return fecha.toLocaleString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};