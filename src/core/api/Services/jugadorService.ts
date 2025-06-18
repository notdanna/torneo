import { doc, getDoc, updateDoc, collection, getDocs, setDoc, runTransaction } from 'firebase/firestore'; // Import runTransaction
import { db } from '../../../firebase'; 

export interface JugadorFirebase {
    id: number; // ✨ CHANGE: ID is now a number
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

// Reference to the 'jugadores' collection
const jugadoresCollection = collection(db, 'jugadores');

// Reference to the counter document for players
const jugadorCounterRef = doc(db, 'counters', 'jugadorId'); // ✨ NEW: Document to store the last player ID

// --- ✨ NEW FUNCTION: Get the next sequential player ID using a transaction ---
async function getNextJugadorSequentialId(): Promise<number> {
    try {
        const nextId = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(jugadorCounterRef);
            let newId: number;

            if (counterDoc.exists()) {
                const currentId = counterDoc.data().lastId;
                newId = currentId + 1;
            } else {
                // If the counter document doesn't exist, start from 1
                newId = 1;
            }
            transaction.set(jugadorCounterRef, { lastId: newId });
            return newId;
        });
        return nextId;
    } catch (error) {
        console.error("❌ Error getting next sequential ID:", error);
        throw new Error(`Failed to get next ID: ${error}`);
    }
}

// ✅ MODIFIED FUNCTION: Crear un nuevo jugador con ID secuencial numérico
export const crearJugador = async (
    datos: Omit<JugadorFirebase, 'id' | 'fechaCreacion' | 'fechaActualizacion'>
): Promise<JugadorFirebase> => {
    try {
        console.log('🔥 Creando nuevo jugador en Firebase con ID secuencial:', datos);

        const nuevoId = await getNextJugadorSequentialId(); // ✨ Get the next numeric ID

        const ahora = new Date().toISOString();

        const datosCompletos = {
            ...datos,
            id: nuevoId, // ✨ Assign the numeric ID here
            fechaCreacion: ahora,
            fechaActualizacion: ahora,
            activo: datos.activo !== undefined ? datos.activo : true,
            nivel: datos.nivel || 0,
        };

        // Use setDoc to explicitly set the document ID to the new numeric ID (as a string)
        // This makes the Firestore document ID match your sequential numeric ID
        await setDoc(doc(jugadoresCollection, String(nuevoId)), datosCompletos); 

        console.log('✅ Jugador creado con ID secuencial:', nuevoId);

        return datosCompletos as JugadorFirebase; // Return the complete object
    } catch (error) {
        console.error('❌ Error creando jugador:', error);
        throw new Error(`Error al crear el jugador: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
};

// ✅ DEPRECATED/REMOVED: crearJugadorConId is now redundant if you only use sequential IDs.
// If you still need to set arbitrary string IDs sometimes, keep it, but it conflicts
// with the "sequential numeric ID" requirement.
// export const crearJugadorConId = async (...) => { /* ... */ };

// ✅ MODIFIED FUNCTION: Obtener un jugador por ID
export const obtenerJugadorPorId = async (id: number): Promise<JugadorFirebase | null> => { // ✨ CHANGE: ID is now number
    try {
        // Firestore document IDs are always strings, so convert the number back to string
        const jugadorRef = doc(db, 'jugadores', String(id)); 
        const jugadorSnap = await getDoc(jugadorRef);

        if (jugadorSnap.exists()) {
            return {
                id: Number(jugadorSnap.id), // ✨ Convert ID back to number when reading
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

// ✅ MODIFIED FUNCTION: Actualizar un jugador
export const actualizarJugador = async (
    id: number, // ✨ CHANGE: ID is now a number
    datos: Partial<Omit<JugadorFirebase, 'id' | 'fechaCreacion'>>
): Promise<void> => {
    try {
        // Firestore document IDs are always strings, so convert the number back to string
        const jugadorRef = doc(db, 'jugadores', String(id)); 

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

// ✅ MODIFIED FUNCTION: Obtener todos los jugadores
export const obtenerTodosLosJugadores = async (): Promise<JugadorFirebase[]> => {
    try {
        const jugadoresRef = collection(db, 'jugadores');
        const snapshot = await getDocs(jugadoresRef);

        return snapshot.docs.map(doc => ({
            id: Number(doc.id), // ✨ Convert ID back to number when reading
            ...doc.data()
        })) as JugadorFirebase[];
    } catch (error) {
        console.error('Error obteniendo jugadores:', error);
        throw error;
    }
};

// ✅ No changes needed for validarDatosJugador
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

    if (datos.nombreAcompanante && datos.nombreAcompanante.trim() !== '' && 
        (!datos.empresaAcompanante || datos.empresaAcompanante.trim() === '')) {
        errores.push('Si hay acompañante, debe especificar su empresa');
    }

    return errores;
};

// ✅ No changes needed for buscarJugadoresPorNombre (it filters locally)
export const buscarJugadoresPorNombre = async (termino: string): Promise<JugadorFirebase[]> => {
    try {
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