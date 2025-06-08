import { insertarJuego } from "./juegoInsert.ts";
import type { Juegos } from "../../models/torneo.ts";
import { juegosMap } from "./types/juegosMap.ts";

const juegos: Juegos[] = [1, 2, 3, 4].map(id => ({
    id_juego: id,
    nombre_juego: juegosMap(id),
    premio: "",
    num_jugadores: 0,
    jugadores: []
}));

export const inicializarJuegos = async () => {
    try {
        for (const juego of juegos) {
            await insertarJuego(juego);
        }
        console.log("Juegos inicializados correctamente");
    } catch (error) {
        console.error("Error al inicializar los juegos:", error);
        throw error;
    }
};
