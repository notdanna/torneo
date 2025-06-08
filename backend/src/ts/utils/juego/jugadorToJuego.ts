import { db } from "../../../../../src/firebase.ts";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import type { Jugador } from "../../models/torneo.ts";

export const agregarJugadorAJuego = async (
    idJugador: number,
    idJuego: number,
    idTorneo: number
): Promise<void> => {
    try {
        // 1. Verificar que el jugador existe
        const jugadorRef = doc(db, "jugadores", idJugador.toString());
        const jugadorSnap = await getDoc(jugadorRef);

        if (!jugadorSnap.exists()) {
            throw new Error(`El jugador con ID ${idJugador} no existe`);
        }

        const jugador = jugadorSnap.data() as Jugador;

        // 2. Verificar que el juego existe en el torneo
        const juegoRef = doc(db, "torneo", idTorneo.toString(), "juego", idJuego.toString());
        const juegoSnap = await getDoc(juegoRef);

        if (!juegoSnap.exists()) {
            throw new Error(`El juego ${idJuego} no existe en el torneo ${idTorneo}`);
        }

        // 3. Agregar el jugador al array de jugadores del juego
        await updateDoc(juegoRef, {
            jugadores: arrayUnion(jugador),
            num_jugadores: juegoSnap.data().num_jugadores + 1
        });

        console.log(`Jugador ${jugador.nombre} agregado exitosamente al juego ${idJuego} del torneo ${idTorneo}`);

    } catch (error) {
        console.error("Error al agregar jugador al juego:", error);
        throw error;
    }
};