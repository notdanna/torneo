import { db } from "../../../firebase.ts";
import { collection, addDoc } from "firebase/firestore";
import type { Juegos} from "../../models/torneo.ts";


export const insertarJuego = async (juego: Juegos) => {
    try {
        // Crea un nuevo documento con UID automático en la colección "torneo"
        const torneoRef = await addDoc(collection(db, "torneo"), {});
        // Dentro de ese UID, crea una subcolección "juegos" y agrega el juego
        await addDoc(collection(db, "torneo", torneoRef.id, "juego"), juego);
        console.log(`Juego insertado correctamente bajo torneo UID: ${torneoRef.id}`, juego);
    } catch (error) {
        console.error("Error al insertar el juego:", error);
        throw error;
    }
};