import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import type { Jugador } from '@/ts/models/torneo.ts';
import { firebaseConfig } from '../../../firebase.ts';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Lista de ejemplo de jugadores para insertar
const jugadoresParaInsertar: Jugador[] = [
    {
        id_jugador: 1,
        nombre: "Juan Pérez",
        empresa: "TechCorp",
        nivel: 3,
        activo: true
    },
    {
        id_jugador: 2,
        nombre: "María García",
        empresa: "DataSoft",
        nivel: 2,
        activo: true
    },
    {
        id_jugador: 3,
        nombre: "Carlos López",
        empresa: "InnovaSys",
        nivel: 1,
        activo: false
    }
];

async function jugadoresInsert(jugadores: Jugador[]): Promise<void> {
    try {
        console.log('\n--- Iniciando inserción de jugadores ---');
        const jugadoresRef = collection(db, 'jugadores');

        for (const jugador of jugadores) {
            try {
                const docRef = await addDoc(jugadoresRef, jugador);
                console.log(`Jugador insertado con ID: ${docRef.id}`);
                console.log('Datos:', jugador);
            } catch (error) {
                console.error(`Error al insertar jugador ${jugador.nombre}:`, error);
            }
        }

        console.log('\n--- Inserción de jugadores completada ---');
    } catch (error) {
        console.error('Error general en la inserción:', error);
        throw error;
    }
}

// Ejecutar la inserción
jugadoresInsert(jugadoresParaInsertar); 