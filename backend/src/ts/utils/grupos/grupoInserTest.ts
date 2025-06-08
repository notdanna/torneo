import { crearGruposParaJuego } from './grupoInsert.ts';

async function test() {
    try {
        // Prueba crear un grupo
        // donde el primer parámetro es el juego a jugar y el segundo es el torneo
        // IMPORTANTE: El el torneo debe existir el juego con el id correspondiente
        
        // await crearGruposParaJuego(1, 7); // Futbolito
        // await crearGruposParaJuego(2, 7); // Futbolito Soplado
        await crearGruposParaJuego(3, 7); // Ruelas
        // await crearGruposParaJuego(4, 7); // Beer Pong
    } catch (error) {
        console.error('Error en la prueba:', error);
    }
}

test();