import { crearGruposParaJuego } from './grupoInsert.ts';

async function test() {
    try {
        // Prueba crear un grupo para Futbolito
        await crearGruposParaJuego(1);
    } catch (error) {
        console.error('Error en la prueba:', error);
    }
}

test();