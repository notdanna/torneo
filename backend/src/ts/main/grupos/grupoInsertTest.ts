import { crearGruposParaJuego } from './grupoInsert.ts';

async function test() {
    const idTorneo = 1; // Unico torneo que existe en la base de datos 
    try {
        // Prueba crear un grupo
        // donde el primer parámetro es el juego a jugar y el segundo es el torneo
        // IMPORTANTE: El el torneo debe existir el juego con el id correspondiente
        
        // await crearGruposParaJuego(1, idTorneo); // Futbolito
        // await crearGruposParaJuego(2, idTorneo); // Futbolito Soplado

        await crearGruposParaJuego(3, idTorneo); // Ruelas
        // await crearGruposParaJuego(4, idTorneo); // Beer Pong
    } catch (error) {
        console.error('Error en la prueba:', error);
    }
}

test();