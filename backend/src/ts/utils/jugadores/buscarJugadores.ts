import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import type { Jugador } from '../../models/torneo.ts';
import { firebaseConfig } from '../../../firebase.ts';
import * as readline from 'readline';

// Inicializar Firebase si no está inicializado
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

type Filtro = Partial<{
  id: number;
  nombre: string;
  empresa: string;
  nivel: number;
  activo: boolean;
}>;

/**
 * Busca jugadores en Firestore según su nombre.
 * @param nombre Nombre del jugador a buscar.
 * @returns Array de Jugador que coinciden con el nombre.
 */
export async function buscarJugadoresPorNombre(nombre: string): Promise<Jugador[]> {
  try {
    const jugadoresRef = collection(db, 'jugadores');
    const q = query(jugadoresRef, where('nombre', '==', nombre));
    const snapshot = await getDocs(q);
    const resultados: Jugador[] = [];
    snapshot.forEach(doc => resultados.push(doc.data() as Jugador));
    return resultados;
  } catch (error) {
    console.error('Error al buscar jugadores por nombre:', error);
    throw error;
  }
}

// ================================
// CÓDIGO DE EJECUCIÓN INTERACTIVA - SOLO BÚSQUEDA POR NOMBRE
// ================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Función principal para búsqueda por nombre
 */
async function main() {
  try {
    console.log('🏆 Buscador de Jugadores');
    console.log('------------------------');
    
    // Usar Promise para manejar readline de forma async/await
    const nombre = await new Promise<string>((resolve) => {
      rl.question('Ingresa el nombre del jugador a buscar: ', (respuesta) => {
        resolve(respuesta.trim());
      });
    });

    console.log(`🔍 Buscando jugadores con nombre: "${nombre}"`);
    
    const resultados = await buscarJugadoresPorNombre(nombre);
    
    if (resultados.length === 0) {
      console.log('❌ No se encontraron jugadores con ese nombre');
    } else {
      console.log(`✅ Se encontraron ${resultados.length} jugador(es):`);
      resultados.forEach((jugador, index) => {
        console.log(`\n${index + 1}. ${jugador.nombre}`);
        console.log(`   Empresa: ${jugador.empresa}`);
        console.log(`   Nivel: ${jugador.nivel}`);
        console.log(`   Activo: ${jugador.activo ? 'Sí' : 'No'}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    rl.close();
  }
}

// Ejecutar la función principal automáticamente
main();