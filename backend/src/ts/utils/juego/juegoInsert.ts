import { db } from "../../../../../src/firebase.ts";
import { setDoc, doc } from "firebase/firestore";
import type { Juegos } from "../../models/torneo.ts";

const TORNEO_ID = 1; // ID fijo para el único torneo

export const insertarJuego = async (juego: Juegos) => {
    try {
        // Crear el juego directamente en la subcolección del torneo único
        const juegoDoc = doc(db, "torneo", TORNEO_ID.toString(), "juego", juego.id_juego.toString());
        await setDoc(juegoDoc, juego);
        
        console.log(`Juego ${juego.nombre_juego} insertado correctamente en el torneo ID: ${TORNEO_ID}`, juego);
    } catch (error) {
        console.error("Error al insertar el juego:", error);
        throw error;
    }
};