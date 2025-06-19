// hooks/useFirebaseData.ts
import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Partida } from '../models/grafos';

interface UseFirebaseDataReturn {
  partidas: Partida[];
  nivelesJugadores: { [key: number]: number };
  loading: boolean;
  error: string | null;
  ultimaActualizacion: Date | null;
}

export const useFirebaseData = (): UseFirebaseDataReturn => {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [nivelesJugadores, setNivelesJugadores] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);

  // Función para escuchar los niveles de los jugadores desde /jugadores/{id}
  const escucharNivelesJugadores = (idsJugadores: number[]) => {
    console.log('👥 Escuchando niveles de jugadores:', idsJugadores);
    
    const unsubscribers: (() => void)[] = [];

    idsJugadores.forEach(idJugador => {
      const jugadorRef = doc(db, 'jugadores', idJugador.toString());
      
      const unsubscribe: () => void = onSnapshot(
        jugadorRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data: { nivel?: number } = docSnapshot.data() as { nivel?: number };
            const nivel: number = data.nivel !== undefined ? data.nivel : 0;
            
            console.log(`📊 Jugador ${idJugador} tiene nivel ${nivel}`);
            
            // Actualizar el estado con los nuevos niveles
            setNivelesJugadores((prev: { [key: number]: number }) => ({ ...prev, [idJugador]: nivel }));
          } else {
            console.log(`❌ Jugador ${idJugador} no existe en /jugadores/, asignando nivel 0`);
            setNivelesJugadores((prev: { [key: number]: number }) => ({ ...prev, [idJugador]: 0 }));
          }
          
          setLoading(false);
        },
        (error: Error) => {
          console.error(`💥 Error obteniendo nivel del jugador ${idJugador}:`, error);
          console.log(`🔄 Asignando nivel 0 por defecto al jugador ${idJugador}`);
          setNivelesJugadores((prev: { [key: number]: number }) => ({ ...prev, [idJugador]: 0 }));
          setLoading(false);
        }
      );

      unsubscribers.push(unsubscribe);
    });

    // Retornar función de cleanup
    return () => {
      console.log('🧹 Limpiando listeners de niveles de jugadores');
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  };

  useEffect(() => {
    console.log('🔥 Conectando a Firebase - Árbol por Niveles');
    
    const partidasRef = collection(db, 'torneo', '1', 'juego', '1', 'grupos', '1', 'partidas');
    
    const unsubscribe = onSnapshot(
      partidasRef,
      (querySnapshot) => {
        const todasLasPartidas: Partida[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          todasLasPartidas.push({
            id: doc.id,
            id_partida: data.id_partida,
            ronda: data.ronda,
            equiposX: data.equiposX || [],
            equiposY: data.equiposY || [],
            resultado: data.resultado
          });
        });
        
        console.log(`📥 ${todasLasPartidas.length} partidas actualizadas:`, todasLasPartidas);
        
        setPartidas(todasLasPartidas);
        setError(null);
        setUltimaActualizacion(new Date());

        // Obtener todos los IDs de jugadores únicos
        const idsJugadores = new Set<number>();
        todasLasPartidas.forEach(partida => {
          [...partida.equiposX, ...partida.equiposY].forEach(jugador => {
            idsJugadores.add(jugador.id_jugador);
          });
        });

        // Escuchar los niveles de todos los jugadores
        escucharNivelesJugadores(Array.from(idsJugadores));
      },
      (error) => {
        console.error('💥 Error:', error);
        setLoading(false);
        setError(error.message);
        setPartidas([]);
      }
    );

    return () => {
      console.log('🔄 Desconectando bracket');
      unsubscribe();
    };
  }, []);

  return {
    partidas,
    nivelesJugadores,
    loading,
    error,
    ultimaActualizacion
  };
};