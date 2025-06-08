import { inicializarTorneo } from "./torneoInit.ts";
import { inicializarJuegos } from "../juego/juegoInit.ts"

const init = async () => {
    try {
        // Primero inicializamos el torneo único
        await inicializarTorneo();
        // Luego inicializamos los juegos dentro de ese torneo
        await inicializarJuegos();
        console.log("Inicialización completada con éxito");
        process.exit(0);
    } catch (error) {
        console.error("Error en la inicialización:", error);
        process.exit(1);
    }
};

init();