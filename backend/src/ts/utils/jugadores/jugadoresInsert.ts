import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import type { Jugador } from '../../models/torneo.ts';
import { firebaseConfig } from '../../../firebase.ts';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function obtenerSiguienteId(): Promise<number> {
    const jugadoresRef = collection(db, 'jugadores');
    const snapshot = await getDocs(jugadoresRef);
    let maxId = 0;

    snapshot.forEach((doc) => {
        const jugador = doc.data() as Jugador;
        if (jugador.id_jugador > maxId) {
            maxId = jugador.id_jugador;
        }
    });

    return maxId + 1;
}

export async function jugadoresInsert(jugadores: Omit<Jugador, 'id_jugador'>[]): Promise<void> {
    try {
        console.log('\n--- Iniciando inserción de jugadores ---');
        const jugadoresRef = collection(db, 'jugadores');
        let siguienteId = await obtenerSiguienteId();

        for (const jugadorBase of jugadores) {
            try {
                const jugadorCompleto: Jugador = {
                    ...jugadorBase,
                    id_jugador: siguienteId
                };
                
                const docRef = doc(jugadoresRef, siguienteId.toString());
                await setDoc(docRef, jugadorCompleto);
                
                console.log(`Jugador insertado con ID: ${siguienteId}`);
                console.log('Datos:', jugadorCompleto);
                
                siguienteId++;
            } catch (error) {
                console.error(`Error al insertar jugador ${jugadorBase.nombre}:`, error);
            }
        }

        console.log('\n--- Inserción de jugadores completada ---');
    } catch (error) {
        console.error('Error general en la inserción:', error);
        throw error;
    }
}