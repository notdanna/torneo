import { insertarJuego } from "./juegoInsert.ts";
import type { Juegos } from "../../models/torneo.ts";
// ...existing code...


// Definición de los juegos iniciales
const juegos: Juegos[] = [
    {
        id_juego: 1,
        nombre_juego: "Futbolito",
        premio: "",
        num_jugadores: 0
    },
    {
        id_juego: 1,
        nombre_juego: "Futbolito",
        premio: "",
        num_jugadores: 0
    },
    {
        id_juego: 3,
        nombre_juego: "Ruelas",
        premio: "",
        num_jugadores: 0
    },
    {
        id_juego: 4,
        nombre_juego: "Beer Pong",
        premio: "",
        num_jugadores: 0
    }
];

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
