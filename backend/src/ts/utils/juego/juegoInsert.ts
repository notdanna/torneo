import { db } from "../../../firebase.ts";
import { collection, setDoc, getDocs, doc } from "firebase/firestore";
import type { Juegos } from "../../models/torneo.ts";


export const insertarJuego = async (juego: Juegos) => {
    try {
        // Obtener el número de documentos existentes en la colección "torneo"
        const torneoSnapshot = await getDocs(collection(db, "torneo"));
        const nextId = torneoSnapshot.size + 1;

        // Crear un nuevo documento con ID numérico en la colección "torneo"
        const torneoDoc = doc(db, "torneo", nextId.toString());
        await setDoc(torneoDoc, {
            id: nextId
        });

        // Dentro de ese ID, crear una subcolección "juego" y usar el id_juego como ID del documento
        const juegoDoc = doc(db, "torneo", nextId.toString(), "juego", juego.id_juego.toString());
        await setDoc(juegoDoc, juego);
        
        console.log(`Juego insertado correctamente bajo torneo ID: ${nextId}`, juego);
    } catch (error) {
        console.error("Error al insertar el juego:", error);
        throw error;
    }
};