import { agregarJugadorAJuego } from "./JugadorToJuego.ts";
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const pregunta = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            resolve(answer);
        });
    });
};

const main = async () => {
    try {
        console.log("🎮 Agregar Jugador a Juego");
        console.log("---------------------------");

        const idJugador = parseInt(await pregunta("ID del Jugador: "));
        const idJuego = parseInt(await pregunta("ID del Juego: "));
        const idTorneo = 1; // ID fijo para el único torneo

        await agregarJugadorAJuego(idJugador, idJuego, idTorneo);
        
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        rl.close();
    }
};

main();