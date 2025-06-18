// utils/tournamentUtils.ts
import { Jugador, Partida, NodoTorneo } from '../models/grafos';

// Ordena jugador1 y jugador2 alfabéticamente por nombre si ambos existen
export const ordenarJugadoresEnNodo = (nodoDestino: NodoTorneo): void => {
  if (nodoDestino.jugador1 && nodoDestino.jugador2) {
    if (nodoDestino.jugador1.nombre.localeCompare(nodoDestino.jugador2.nombre) > 0) {
      // Intercambiar si jugador2 debe ir antes
      const temp = nodoDestino.jugador1;
      nodoDestino.jugador1 = nodoDestino.jugador2;
      nodoDestino.jugador2 = temp;
    }
  }
};

// Colocar jugador en la ronda correspondiente según su nivel
// RESPETA las conexiones del bracket para mantener el flujo correcto
export const colocarJugadorEnRondaPorNivel = (estructura: NodoTorneo[][], jugador: Jugador): void => {
  // El nivel del jugador determina hasta qué ronda debe avanzar
  // Nivel 1 = avanza a ronda 2 (índice 1), Nivel 2 = avanza a ronda 3 (índice 2), etc.
  const maxRondaDestino = jugador.nivel;
  
  if (maxRondaDestino >= estructura.length) {
    console.log(`⚠️ Nivel ${jugador.nivel} demasiado alto para ${jugador.nombre} - solo hay ${estructura.length} rondas`);
    return;
  }

  // Avanzar ronda por ronda siguiendo las conexiones del bracket
  for (let rondaActual = 0; rondaActual < maxRondaDestino; rondaActual++) {
    const rondaSiguiente = rondaActual + 1;
    
    if (rondaSiguiente >= estructura.length) break;
    
    // Buscar al jugador en la ronda actual
    const nodosRondaActual = estructura[rondaActual];
    let jugadorEncontrado = false;
    
    for (let i = 0; i < nodosRondaActual.length; i++) {
      const nodoActual = nodosRondaActual[i];
      
      // Si encontramos al jugador en este nodo
      if (nodoActual.jugador1?.id_jugador === jugador.id_jugador || 
          nodoActual.jugador2?.id_jugador === jugador.id_jugador) {
        
        jugadorEncontrado = true;
        
        // Calcular a qué nodo de la siguiente ronda debe ir según las conexiones del bracket
        // En un bracket estándar: nodos 0,1 van al nodo 0; nodos 2,3 van al nodo 1; etc.
        const nodoDestinoIndex = Math.floor(i / 2);
        const nodosRondaSiguiente = estructura[rondaSiguiente];
        
        if (nodoDestinoIndex < nodosRondaSiguiente.length) {
          const nodoDestino = nodosRondaSiguiente[nodoDestinoIndex];
          
          // Verificar si el jugador ya está en el nodo destino
          if (nodoDestino.jugador1?.id_jugador === jugador.id_jugador) {
            // Actualizar datos del jugador existente
            nodoDestino.jugador1 = jugador;
            console.log(`🔄 Jugador ${jugador.nombre} actualizado en ronda ${rondaSiguiente + 1}, nodo ${nodoDestinoIndex + 1}, slot 1`);
            break;
          } else if (nodoDestino.jugador2?.id_jugador === jugador.id_jugador) {
            // Actualizar datos del jugador existente
            nodoDestino.jugador2 = jugador;
            console.log(`🔄 Jugador ${jugador.nombre} actualizado en ronda ${rondaSiguiente + 1}, nodo ${nodoDestinoIndex + 1}, slot 2`);
            break;
          }
          
          // Colocar en el primer slot disponible del nodo correcto según las conexiones del bracket
          if (!nodoDestino.jugador1) {
            nodoDestino.jugador1 = jugador;
            console.log(`✅ Jugador ${jugador.nombre} (nivel ${jugador.nivel}) avanzó de ronda ${rondaActual + 1} nodo ${i + 1} → ronda ${rondaSiguiente + 1}, nodo ${nodoDestinoIndex + 1}, slot 1`);
            break;
          } else if (!nodoDestino.jugador2) {
            nodoDestino.jugador2 = jugador;
            console.log(`✅ Jugador ${jugador.nombre} (nivel ${jugador.nivel}) avanzó de ronda ${rondaActual + 1} nodo ${i + 1} → ronda ${rondaSiguiente + 1}, nodo ${nodoDestinoIndex + 1}, slot 2`);
            break;
          } else {
            console.log(`⚠️ Nodo destino ${nodoDestinoIndex + 1} en ronda ${rondaSiguiente + 1} está lleno para ${jugador.nombre}`);
            // El nodo está lleno, este jugador no puede avanzar más por ahora
            return;
          }
        }
        
        break; // Salir del bucle de búsqueda en la ronda actual
      }
    }
    
    if (!jugadorEncontrado) {
      console.log(`⚠️ Jugador ${jugador.nombre} no encontrado en ronda ${rondaActual + 1}, no puede avanzar más`);
      return;
    }
  }
};

// Crear estructura completa del árbol basada en niveles reales de jugadores
export const crearEstructuraCompleta = (partidas: Partida[], niveles: { [key: number]: number }): NodoTorneo[][] => {
  // Obtener todos los jugadores únicos con sus niveles reales
  const todosLosJugadores: Jugador[] = [];
  partidas.forEach(partida => {
    [...partida.equiposX, ...partida.equiposY].forEach(jugadorPartida => {
      const nivelReal = niveles[jugadorPartida.id_jugador] || 0;
      const jugadorConNivelReal: Jugador = {
        ...jugadorPartida,
        nivel: nivelReal
      };
      
      const yaExiste = todosLosJugadores.find(j => j.id_jugador === jugadorConNivelReal.id_jugador);
      if (!yaExiste) {
        todosLosJugadores.push(jugadorConNivelReal);
      } else {
        // Actualizar con el nivel real si ya existe
        const index = todosLosJugadores.findIndex(j => j.id_jugador === jugadorConNivelReal.id_jugador);
        todosLosJugadores[index] = jugadorConNivelReal;
      }
    });
  });

  console.log('👥 Todos los jugadores con niveles reales:', todosLosJugadores);

  // Determinar cuántas rondas necesitamos
  const partidasRonda1 = partidas.filter(p => p.ronda === 1);
  const numPartidasIniciales = Math.max(partidasRonda1.length, 4);
  
  // Calcular número de rondas correctamente para soportar hasta 16 partidas
  // 16 partidas -> 5 rondas (16->8->4->2->1)
  // 8 partidas -> 4 rondas (8->4->2->1)
  // 4 partidas -> 3 rondas (4->2->1)
  const numRondas = Math.floor(Math.log2(numPartidasIniciales)) + 2;
  
  console.log(`🌳 Creando árbol: ${numPartidasIniciales} partidas iniciales, ${numRondas} rondas`);

  const estructura: NodoTorneo[][] = [];

  // Crear estructura completa ronda por ronda
  for (let ronda = 1; ronda <= numRondas; ronda++) {
    let partidasEnRonda;
    
    if (ronda === 1) {
      // Primera ronda: usar el número real de partidas
      partidasEnRonda = numPartidasIniciales;
    } else if (ronda === numRondas) {
      // Última ronda: solo 1 nodo para el ganador final
      partidasEnRonda = 1;
    } else {
      // Rondas intermedias: dividir por 2
      const partidasRondaAnterior = ronda === 2 ? numPartidasIniciales : 
                                   Math.ceil(numPartidasIniciales / Math.pow(2, ronda - 2));
      partidasEnRonda = Math.max(1, Math.ceil(partidasRondaAnterior / 2));
    }

    const nodosRonda: NodoTorneo[] = [];

    for (let pos = 0; pos < partidasEnRonda; pos++) {
      const nodo: NodoTorneo = {
        id: `r${ronda}_p${pos + 1}`,
        ronda,
        posicion: pos,
        jugador1: null,
        jugador2: null
      };

      nodosRonda.push(nodo);
    }

    estructura.push(nodosRonda);
    console.log(`📊 Ronda ${ronda}: ${partidasEnRonda} nodos creados`);
  }

  // Llenar ronda 1 con las partidas originales SIEMPRE
  // Todos los jugadores deben aparecer en la ronda inicial independientemente de su nivel
  partidas.filter(p => p.ronda === 1).forEach(partida => {
    const partidaIndex = partida.id_partida - 1;
    if (partidaIndex >= 0 && partidaIndex < estructura[0].length) {
      const nodo = estructura[0][partidaIndex];
      
      // SIEMPRE colocar los jugadores originales en la ronda inicial
      const jugadorX = partida.equiposX[0];
      const jugadorY = partida.equiposY[0];
      
      if (jugadorX) {
        const nivelReal = niveles[jugadorX.id_jugador] !== undefined ? niveles[jugadorX.id_jugador] : 0;
        nodo.jugador1 = {...jugadorX, nivel: nivelReal};
      }
      
      if (jugadorY) {
        const nivelReal = niveles[jugadorY.id_jugador] !== undefined ? niveles[jugadorY.id_jugador] : 0;
        nodo.jugador2 = {...jugadorY, nivel: nivelReal};
      }
    }
  });

  // Propagar jugadores a rondas superiores basado en su nivel real
  // Respetar las conexiones del bracket: cada jugador avanza siguiendo la estructura
  todosLosJugadores.forEach(jugador => {
    if (jugador.nivel > 0) {
      colocarJugadorEnRondaPorNivel(estructura, jugador);
    }
  });

  return estructura;
};

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
 * Crea una estructura del torneo con las rondas completadas ocultas
 */
export const crearEstructuraConRondasOcultas = (
  partidas: Partida[], 
  niveles: { [key: number]: number }
): { estructura: NodoTorneo[][], rondasVisibles: number[], estructuraCompleta: NodoTorneo[][] } => {
  // Primero crear la estructura completa
  const estructuraCompleta = crearEstructuraCompleta(partidas, niveles);
  
  // Calcular qué rondas deben ser visibles
  const rondasVisibles = calcularRondasVisibles(estructuraCompleta, niveles);
  
  // Filtrar solo las rondas visibles
  const estructura = filtrarEstructuraVisible(estructuraCompleta, rondasVisibles);
  
  return {
    estructura,
    rondasVisibles,
    estructuraCompleta
  };
};