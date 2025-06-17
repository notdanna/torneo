import { doc, getDoc, updateDoc,collection,getDocs } from 'firebase/firestore';
import { db } from '../../../firebase'; 

export interface JugadorFirebase {
  id: string;
  nombre: string;
  nombreAcompanante?: string;
  empresa: string;
  empresaAcompanante?: string;
  nivel: number;
  activo: boolean;
  // Agrega más campos según tu estructura
}

// Función para obtener un jugador por ID
export const obtenerJugadorPorId = async (id: string): Promise<JugadorFirebase | null> => {
  try {
    const jugadorRef = doc(db, 'jugadores', id);
    const jugadorSnap = await getDoc(jugadorRef);
    
    if (jugadorSnap.exists()) {
      return {
        id: jugadorSnap.id,
        ...jugadorSnap.data()
      } as JugadorFirebase;
    } else {
      throw new Error(`Jugador con ID ${id} no encontrado`);
    }
  } catch (error) {
    console.error('Error obteniendo jugador:', error);
    throw error;
  }
};

// ✅ Función para actualizar un jugador
export const actualizarJugador = async (
  id: string, 
  datos: Partial<Omit<JugadorFirebase, 'id'>>
): Promise<void> => {
  try {
    const jugadorRef = doc(db, 'jugadores', id);
    
    // Verificar que el jugador existe antes de actualizar
    const jugadorSnap = await getDoc(jugadorRef);
    if (!jugadorSnap.exists()) {
      throw new Error(`Jugador con ID ${id} no encontrado`);
    }
    
    // Actualizar los datos
    await updateDoc(jugadorRef, {
      ...datos,
      fechaActualizacion: new Date().toISOString() // Opcional: timestamp de actualización
    });
    
    console.log(`Jugador ${id} actualizado exitosamente`);
    
  } catch (error) {
    console.error('Error actualizando jugador:', error);
    throw error;
  }
};

// Función para obtener todos los jugadores (si la necesitas)
export const obtenerTodosLosJugadores = async (): Promise<JugadorFirebase[]> => {
  try {
    const jugadoresRef = collection(db, 'jugadores');
    const snapshot = await getDocs(jugadoresRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as JugadorFirebase[];
  } catch (error) {
    console.error('Error obteniendo jugadores:', error);
    throw error;
  }
};