import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import type { Jugador } from '../models/torneo.ts';
// Importar firebaseConfig desde firebase.ts
import { firebaseConfig } from '../../firebase.ts';


// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getJugadores(): Promise<Jugador[]> {
    try {
        const jugadoresRef = collection(db, 'jugadores');
        const jugadoresSnap = await getDocs(jugadoresRef);
        const jugadores: Jugador[] = [];

        jugadoresSnap.forEach((doc) => {
            const jugador = doc.data() as Jugador;
            jugadores.push(jugador);
        });

        return jugadores;
    } catch (error) {
        console.error('Error al obtener los jugadores:', error);
        throw error;
    }
}

async function testJugadores(): Promise<void> {
    try {
        console.log('\n--- Obteniendo todos los jugadores ---');
        const jugadores = await getJugadores();
        
        console.log(`Jugadores: ${jugadores.length}`);
        
        jugadores.forEach((jugador, index) => {
            console.log(`\nJugador ${index + 1}:`);
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

testJugadores(); 