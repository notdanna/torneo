import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
// import type { Jugador } from './models/torneo';
import { firebaseConfig } from '../firebase.ts';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function invitadosInit(): Promise<void> {
    try {
        console.log('Iniciando actualización de jugadores...');
        const jugadoresRef = collection(db, 'jugadores');
        const jugadoresSnap = await getDocs(jugadoresRef);
        
        const updatePromises = jugadoresSnap.docs.map(async (document) => {
            const docRef = doc(db, 'jugadores', document.id);
            await updateDoc(docRef, {
                nivel: 0,
                activo: false
            });
            console.log(`Jugador ${document.id} actualizado correctamente`);
        });

        await Promise.all(updatePromises);
        console.log('Todos los jugadores han sido actualizados exitosamente');
    } catch (error) {
        console.error('Error al actualizar los jugadores:', error);
        throw error;
    }
}

// Ejecutar la actualización
invitadosInit(); 