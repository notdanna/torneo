import { db } from "../../../firebase.ts";
import { doc, setDoc } from "firebase/firestore";

const TORNEO_ID = 1;

export const inicializarTorneo = async () => {
    try {
        const torneoDoc = doc(db, "torneo", TORNEO_ID.toString());
        await setDoc(torneoDoc, {
            id: TORNEO_ID,
            fecha_creacion: new Date(),
            activo: true
        });
        console.log("Torneo único inicializado correctamente");
    } catch (error) {
        console.error("Error al inicializar el torneo:", error);
        throw error;
    }
};