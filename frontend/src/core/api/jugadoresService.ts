import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../../src/firebase.ts'; // Ajusta la ruta según tu estructura
import type { Jugador } from '../../../../backend/src/ts/models/torneo.ts';

/**
 * Normaliza texto removiendo acentos y convirtiendo a minúsculas
 * @param texto Texto a normalizar
 * @returns Texto sin acentos y en minúsculas
 */
function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD') 
    .replace(/[\u0300-\u036f]/g, '') 
    .trim();
}
export async function buscarJugadoresPorNombreParcial(nombre: string): Promise<Jugador[]> {
  try {
    const jugadoresRef = collection(db, 'jugadores');
    const snapshot = await getDocs(jugadoresRef);
    const resultados: Jugador[] = [];
    
    // Normalizar el término de búsqueda
    const nombreNormalizado = normalizarTexto(nombre);
    
    snapshot.forEach(doc => {
      const jugador = doc.data() as Jugador;
      const nombreJugadorNormalizado = normalizarTexto(jugador.nombre);
      
      // Comparar sin acentos
      if (nombreJugadorNormalizado.includes(nombreNormalizado)) {
        resultados.push(jugador);
      }
    });
    
    // Ordenar resultados por relevancia (coincidencias al principio primero)
    resultados.sort((a, b) => {
      const aNormalizado = normalizarTexto(a.nombre);
      const bNormalizado = normalizarTexto(b.nombre);
      const nombreBusquedaNormalizado = normalizarTexto(nombre);
      
      const aStartsWith = aNormalizado.startsWith(nombreBusquedaNormalizado);
      const bStartsWith = bNormalizado.startsWith(nombreBusquedaNormalizado);
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return a.nombre.localeCompare(b.nombre);
    });
    
    return resultados;
  } catch (error) {
    console.error('Error al buscar jugadores por nombre parcial:', error);
    throw error;
  }
}
