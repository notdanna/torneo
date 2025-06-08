import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import type { Jugador } from '../../models/torneo.ts';
import { firebaseConfig } from '../../../firebase.ts';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Lista de ejemplo de jugadores para insertar (sin id_jugador)
const jugadoresParaInsertar: Omit<Jugador, 'id_jugador'>[] = [
    {
        nombre: "Juan Pérez",
        empresa: "TechCorp",
        nivel: 3,
        activo: true
    },
    {
        nombre: "María García",
        empresa: "DataSoft",
        nivel: 2,
        activo: true
    },
    {
        nombre: "Carlos López",
        empresa: "InnovaSys",
        nivel: 1,
        activo: false
    }
];

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

async function jugadoresInsert(jugadores: Omit<Jugador, 'id_jugador'>[]): Promise<void> {
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
                
                const docRef = await addDoc(jugadoresRef, jugadorCompleto);
                console.log(`Jugador insertado con ID: ${docRef.id}`);
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

// Ejecutar la inserción
jugadoresInsert(jugadoresParaInsertar);