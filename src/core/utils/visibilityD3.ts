// utils/roundVisibilityUtils.ts
import { NodoTorneo } from '../models/grafos';

/**
 * Calcula qué rondas deben ocultarse basado en el progreso de los jugadores
 * Una ronda se oculta cuando ≥50% de los jugadores esperados han avanzado al siguiente nivel
 */
export const calcularRondasVisibles = (
  estructura: NodoTorneo[][],
  nivelesJugadores: { [key: number]: number }
): number[] => {
  const rondasVisibles: number[] = [];
  
  console.log('🔍 Calculando rondas visibles...');
  console.log('📊 Niveles actuales:', nivelesJugadores);

  // Iterar por cada ronda para determinar si debe ocultarse
  for (let rondaIndex = 0; rondaIndex < estructura.length; rondaIndex++) {
    const ronda = estructura[rondaIndex];
    const numeroRonda = rondaIndex + 1;
    
    // Calcular cuántos jugadores deberían estar en esta ronda
    const jugadoresEsperadosEnRonda = ronda.length * 2; // 2 jugadores por nodo
    
    // Contar cuántos jugadores han avanzado más allá de esta ronda
    // Un jugador ha "completado" esta ronda si su nivel > rondaIndex
    const jugadoresQueAvanzaron = Object.values(nivelesJugadores).filter(
      nivel => nivel > rondaIndex
    ).length;
    
    // Calcular el porcentaje de jugadores que han avanzado
    const porcentajeAvance = jugadoresEsperadosEnRonda > 0 
      ? (jugadoresQueAvanzaron / jugadoresEsperadosEnRonda) * 100 
      : 0;
    
    console.log(`📊 Ronda ${numeroRonda}:`);
    console.log(`   - Jugadores esperados: ${jugadoresEsperadosEnRonda}`);
    console.log(`   - Jugadores que avanzaron (nivel > ${rondaIndex}): ${jugadoresQueAvanzaron}`);
    console.log(`   - Porcentaje de avance: ${porcentajeAvance.toFixed(1)}%`);
    
    // Si menos del 50% ha avanzado, la ronda sigue siendo visible
    if (porcentajeAvance < 50) {
      rondasVisibles.push(rondaIndex);
      console.log(`   ✅ Ronda ${numeroRonda} VISIBLE`);
    } else {
      console.log(`   🙈 Ronda ${numeroRonda} OCULTA (${porcentajeAvance.toFixed(1)}% completada)`);
    }
  }
  
  // Siempre mostrar al menos las últimas 2 rondas para que haya contexto
  // Si solo queda 1 ronda visible, mostrar también la anterior
  if (rondasVisibles.length === 1 && rondasVisibles[0] < estructura.length - 1) {
    const siguienteRonda = rondasVisibles[0] + 1;
    if (siguienteRonda < estructura.length) {
      rondasVisibles.push(siguienteRonda);
      console.log(`📋 Agregando ronda ${siguienteRonda + 1} para mantener contexto`);
    }
  }
  
  // Siempre mostrar la ronda final si hay un ganador
  const rondaFinal = estructura.length - 1;
  const nodoFinal = estructura[rondaFinal]?.[0];
  if (nodoFinal && (nodoFinal.jugador1 || nodoFinal.jugador2)) {
    if (!rondasVisibles.includes(rondaFinal)) {
      rondasVisibles.push(rondaFinal);
      console.log(`🏆 Agregando ronda final ${rondaFinal + 1} porque hay ganador`);
    }
  }
  
  rondasVisibles.sort((a, b) => a - b);
  
  console.log(`🎯 Rondas visibles finales: [${rondasVisibles.map(r => r + 1).join(', ')}]`);
  
  return rondasVisibles;
};

/**
 * Filtra la estructura del torneo para mostrar solo las rondas visibles
 */
export const filtrarEstructuraVisible = (
  estructura: NodoTorneo[][],
  rondasVisibles: number[]
): NodoTorneo[][] => {
  return rondasVisibles.map(rondaIndex => estructura[rondaIndex]);
};

/**
 * Ajusta las conexiones del bracket considerando las rondas ocultas
 * Mapea los índices de rondas originales a los nuevos índices en la estructura filtrada
 */
export const crearMapeoRondas = (
  rondasVisibles: number[]
): { [rondaOriginal: number]: number } => {
  const mapeo: { [rondaOriginal: number]: number } = {};
  
  rondasVisibles.forEach((rondaOriginal, nuevoIndex) => {
    mapeo[rondaOriginal] = nuevoIndex;
  });
  
  return mapeo;
};