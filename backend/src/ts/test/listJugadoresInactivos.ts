import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import type { Jugador } from '../../models/torneo.ts';
import { firebaseConfig } from '../../../../../src/firebase.ts';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getJugadoresInactivos(): Promise<Jugador[]> {
    try {
        const jugadoresRef = collection(db, 'jugadores');
        const q = query(jugadoresRef, where("activo", "==", false));
        const jugadoresSnap = await getDocs(q);
        const jugadoresInactivos: Jugador[] = [];

        jugadoresSnap.forEach((doc) => {
            const jugador = doc.data() as Jugador;
            jugadoresInactivos.push(jugador);
        });

        return jugadoresInactivos;
    } catch (error) {
        console.error('Error al obtener los jugadores inactivos:', error);
        throw error;
    }
}

async function listJugadoresInactivos(): Promise<void> {
    try {
        console.log('\n--- Obteniendo jugadores inactivos ---');
        const jugadoresInactivos = await getJugadoresInactivos();
        
        console.log(`Jugadores Inactivos: ${jugadoresInactivos.length}`);
        
        jugadoresInactivos.forEach((jugador, index) => {
            console.log(`\nJugador Inactivo ${index + 1}:`);
            console.log('ID:', jugador.id_jugador);
            console.log('Nombre:', jugador.nombre);
            console.log('Empresa:', jugador.empresa);
            console.log('Nivel:', jugador.nivel);
            console.log('Activo:', jugador.activo);
        });

    } catch (error) {
        console.error('Error en las pruebas:', error);
    }
}

listJugadoresInactivos(); 