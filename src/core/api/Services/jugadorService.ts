import { doc, getDoc, updateDoc, collection, getDocs, addDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase'; 

export interface JugadorFirebase {
  id: string;
  nombre: string;
  nombreAcompanante?: string;
  empresa: string;
  empresaAcompanante?: string;
  nivel: number;
  activo: boolean;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  // Agrega más campos según tu estructura
}

// ✅ NUEVA FUNCIÓN: Crear un nuevo jugador
export const crearJugador = async (
  datos: Omit<JugadorFirebase, 'id' | 'fechaCreacion' | 'fechaActualizacion'>
): Promise<JugadorFirebase> => {
  try {
    console.log('🔥 Creando nuevo jugador en Firebase:', datos);
    
    const jugadoresRef = collection(db, 'jugadores');
    const ahora = new Date().toISOString();
    
    const datosCompletos = {
      ...datos,
      fechaCreacion: ahora,
      fechaActualizacion: ahora,
      activo: datos.activo !== undefined ? datos.activo : true, // Por defecto activo
      nivel: datos.nivel || 0, // Por defecto nivel 0
    };
    
    // Usar addDoc para generar ID automáticamente
    const docRef = await addDoc(jugadoresRef, datosCompletos);
    
    console.log('✅ Jugador creado con ID:', docRef.id);
    
    // Retornar el objeto completo incluyendo el ID generado
    return {
      id: docRef.id,
      ...datosCompletos
    } as JugadorFirebase;
    
  } catch (error) {
    console.error('❌ Error creando jugador:', error);
    throw new Error(`Error al crear el jugador: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

// ✅ ALTERNATIVA: Crear jugador con ID personalizado (opcional)
export const crearJugadorConId = async (
  id: string,
  datos: Omit<JugadorFirebase, 'id' | 'fechaCreacion' | 'fechaActualizacion'>
): Promise<JugadorFirebase> => {
  try {
    console.log('🔥 Creando nuevo jugador con ID personalizado:', { id, datos });
    
    const jugadorRef = doc(db, 'jugadores', id);
    const ahora = new Date().toISOString();
    
    // Verificar que el ID no existe
    const existeJugador = await getDoc(jugadorRef);
    if (existeJugador.exists()) {
      throw new Error(`Ya existe un jugador con el ID: ${id}`);
    }
    
    const datosCompletos = {
      ...datos,
      fechaCreacion: ahora,
      fechaActualizacion: ahora,
      activo: datos.activo !== undefined ? datos.activo : true,
      nivel: datos.nivel || 0,
    };
    
    // Usar setDoc para crear con ID específico
    await setDoc(jugadorRef, datosCompletos);
    
    console.log('✅ Jugador creado con ID personalizado:', id);
    
    return {
      id,
      ...datosCompletos
    } as JugadorFirebase;
    
  } catch (error) {
    console.error('❌ Error creando jugador con ID personalizado:', error);
    throw new Error(`Error al crear el jugador: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

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
  datos: Partial<Omit<JugadorFirebase, 'id' | 'fechaCreacion'>>
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
      fechaActualizacion: new Date().toISOString()
    });
    
    console.log(`✅ Jugador ${id} actualizado exitosamente`);
    
  } catch (error) {
    console.error('❌ Error actualizando jugador:', error);
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

// ✅ FUNCIÓN HELPER: Validar datos del jugador antes de crear/actualizar
export const validarDatosJugador = (datos: Partial<JugadorFirebase>): string[] => {
  const errores: string[] = [];
  
  if (!datos.nombre || datos.nombre.trim() === '') {
    errores.push('El nombre principal es obligatorio');
  }
  
  if (!datos.empresa || datos.empresa.trim() === '') {
    errores.push('La empresa principal es obligatoria');
  }
  
  if (datos.nivel !== undefined && (datos.nivel < 0 || datos.nivel > 10)) {
    errores.push('El nivel debe estar entre 0 y 10');
  }
  
  // Si hay acompañante, validar que tenga empresa
  if (datos.nombreAcompanante && datos.nombreAcompanante.trim() !== '' && 
      (!datos.empresaAcompanante || datos.empresaAcompanante.trim() === '')) {
    errores.push('Si hay acompañante, debe especificar su empresa');
  }
  
  return errores;
};

// ✅ FUNCIÓN DE BÚSQUEDA: Buscar jugadores por nombre (para complementar la búsqueda)
export const buscarJugadoresPorNombre = async (termino: string): Promise<JugadorFirebase[]> => {
  try {
    // Firebase no tiene búsqueda de texto nativa, así que obtenemos todos y filtramos
    // En producción, considera usar Algolia o similar para búsqueda más eficiente
    const todosLosJugadores = await obtenerTodosLosJugadores();
    
    const terminoLower = termino.toLowerCase();
    
    return todosLosJugadores.filter(jugador => 
      jugador.nombre.toLowerCase().includes(terminoLower) ||
      (jugador.nombreAcompanante && jugador.nombreAcompanante.toLowerCase().includes(terminoLower)) ||
      jugador.empresa.toLowerCase().includes(terminoLower) ||
      (jugador.empresaAcompanante && jugador.empresaAcompanante.toLowerCase().includes(terminoLower))
    );
  } catch (error) {
    console.error('Error buscando jugadores:', error);
    throw error;
  }
};