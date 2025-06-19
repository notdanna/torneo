import { doc, getDoc,  collection, getDocs, runTransaction, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebase'; 

export interface JugadorFirebase {
    id_jugador: number;
    nombre: string;
    nombreAcompanante?: string;
    empresa: string;
    empresaAcompanante?: string;
    nivel: number;
    activo: boolean;
}

// Reference to the 'jugadores' collection
const jugadoresCollection = collection(db, 'jugadores');

// ✨ NUEVA FUNCIÓN: Obtener el siguiente ID basado en la colección jugadores
async function getNextJugadorId(): Promise<number> {
    try {
        // Consulta para obtener el jugador con el ID más alto
        const q = query(
            jugadoresCollection, 
            orderBy('id_jugador', 'desc'), 
            limit(1)
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            // Si no hay jugadores, empezar desde 1
            return 1;
        }
        
        // Obtener el ID más alto y sumarle 1
        const lastJugador = snapshot.docs[0].data() as JugadorFirebase;
        return lastJugador.id_jugador + 1;
        
    } catch (error) {
        console.error("❌ Error obteniendo siguiente ID:", error);
        throw new Error(`Failed to get next ID: ${error}`);
    }
}

// ✅ FUNCIÓN MODIFICADA: Crear jugador con ID secuencial
export const crearJugador = async (
    datos: Omit<JugadorFirebase, 'id_jugador'>
): Promise<JugadorFirebase> => {
    try {
        console.log('🔥 Creando nuevo jugador en Firebase:', datos);

        // Usar transacción para asegurar que no haya conflictos de ID
        const nuevoJugador = await runTransaction(db, async (transaction) => {
            // Obtener el siguiente ID disponible
            const nuevoId = await getNextJugadorId();
            

            const datosCompletos = {
                ...datos,
                id_jugador: nuevoId,
                activo: datos.activo !== undefined ? datos.activo : true,
                nivel: datos.nivel || 0,
            };

            // Verificar que el documento no existe (por seguridad)
            const jugadorRef = doc(jugadoresCollection, String(nuevoId));
            const jugadorExistente = await transaction.get(jugadorRef);
            
            if (jugadorExistente.exists()) {
                throw new Error(`El jugador con ID ${nuevoId} ya existe`);
            }

            // Crear el nuevo jugador
            transaction.set(jugadorRef, datosCompletos);
            
            return datosCompletos as JugadorFirebase;
        });

        console.log('✅ Jugador creado con ID:', nuevoJugador.id_jugador);
        return nuevoJugador;

    } catch (error) {
        console.error('❌ Error creando jugador:', error);
        throw new Error(`Error al crear el jugador: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
};

// ✅ Obtener un jugador por ID
export const obtenerJugadorPorId = async (id: number): Promise<JugadorFirebase | null> => {
    try {
        const jugadorRef = doc(db, 'jugadores', String(id)); 
        const jugadorSnap = await getDoc(jugadorRef);

        if (jugadorSnap.exists()) {
            return {
                id_jugador: Number(jugadorSnap.id),
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

// ✅ Actualizar un jugador
export const actualizarJugador = async (
    id: number,
): Promise<void> => {
    try {
        const jugadorRef = doc(db, 'jugadores', String(id)); 

        // Verificar que el jugador existe antes de actualizar
        const jugadorSnap = await getDoc(jugadorRef);
        if (!jugadorSnap.exists()) {
            throw new Error(`Jugador con ID ${id} no encontrado`);
        }

      

        console.log(`✅ Jugador ${id} actualizado exitosamente`);

    } catch (error) {
        console.error('❌ Error actualizando jugador:', error);
        throw error;
    }
};

// ✅ Obtener todos los jugadores
export const obtenerTodosLosJugadores = async (): Promise<JugadorFirebase[]> => {
    try {
        const jugadoresRef = collection(db, 'jugadores');
        const snapshot = await getDocs(jugadoresRef);

        return snapshot.docs.map(doc => ({
            id_jugador: Number(doc.id),
            ...doc.data()
        })) as JugadorFirebase[];
    } catch (error) {
        console.error('Error obteniendo jugadores:', error);
        throw error;
    }
};

// ✅ Validar datos del jugador
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

// ✅ Buscar jugadores por nombre
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