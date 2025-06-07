import { inicializarJuegos } from "./juegoIniciador.ts";


const init = async () => {
    try {
        await inicializarJuegos();
        process.exit(0);
    } catch (error) {
        console.error("Error en la inicialización de juegos:", error);
        process.exit(1);
    }
};

init(); 