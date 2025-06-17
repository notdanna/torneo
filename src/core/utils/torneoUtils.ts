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
  const rondaDestino = jugador.nivel; // nivel 1 = ronda 2 (índice 1)
  
  if (rondaDestino >= estructura.length) {
    console.log(`⚠️ Nivel ${jugador.nivel} demasiado alto para ${jugador.nombre} - solo hay ${estructura.length} rondas`);
    return;
  }

  // Buscar en qué nodo de la ronda anterior está el jugador
  const rondaAnterior = rondaDestino - 1;
  if (rondaAnterior >= 0 && rondaAnterior < estructura.length) {
    const nodosRondaAnterior = estructura[rondaAnterior];
    
    for (let i = 0; i < nodosRondaAnterior.length; i++) {
      const nodoAnterior = nodosRondaAnterior[i];
      
      // Si encontramos al jugador en la ronda anterior
      if (nodoAnterior.jugador1?.id_jugador === jugador.id_jugador || 
          nodoAnterior.jugador2?.id_jugador === jugador.id_jugador) {
        
        // Calcular a qué nodo de la siguiente ronda debe ir según las conexiones del bracket
        const nodoDestinoIndex = Math.floor(i / 2);
        const rondaDestino = estructura[jugador.nivel];
        
        if (nodoDestinoIndex < rondaDestino.length) {
          const nodoDestino = rondaDestino[nodoDestinoIndex];
          
          // Verificar si el jugador ya está en el nodo destino
          if (nodoDestino.jugador1?.id_jugador === jugador.id_jugador) {
            nodoDestino.jugador1 = jugador; // Actualizar
            console.log(`🔄 Jugador ${jugador.nombre} actualizado en ronda ${jugador.nivel + 1}, nodo ${nodoDestinoIndex + 1}, slot 1`);
            return;
          } else if (nodoDestino.jugador2?.id_jugador === jugador.id_jugador) {
            nodoDestino.jugador2 = jugador; // Actualizar
            console.log(`🔄 Jugador ${jugador.nombre} actualizado en ronda ${jugador.nivel + 1}, nodo ${nodoDestinoIndex + 1}, slot 2`);
            return;
          }
          
          // Colocar en el primer slot disponible del nodo correcto
          if (!nodoDestino.jugador1) {
            nodoDestino.jugador1 = jugador;
            console.log(`✅ Jugador ${jugador.nombre} (nivel ${jugador.nivel}) avanzó de nodo ${i + 1} → ronda ${jugador.nivel + 1}, nodo ${nodoDestinoIndex + 1}, slot 1`);
            
            // Ordenar alfabéticamente después de colocar
            ordenarJugadoresEnNodo(nodoDestino);
            return;
          } else if (!nodoDestino.jugador2) {
            nodoDestino.jugador2 = jugador;
            console.log(`✅ Jugador ${jugador.nombre} (nivel ${jugador.nivel}) avanzó de nodo ${i + 1} → ronda ${jugador.nivel + 1}, nodo ${nodoDestinoIndex + 1}, slot 2`);
            
            // Ordenar alfabéticamente después de colocar
            ordenarJugadoresEnNodo(nodoDestino);
            return;
          } else {
            console.log(`⚠️ Nodo destino ${nodoDestinoIndex + 1} en ronda ${jugador.nivel + 1} está lleno para ${jugador.nombre}`);
          }
        }
        
        return; // Salir después de encontrar al jugador en la ronda anterior
      }
    }
  }

  // Si no se encontró en la ronda anterior, usar colocación de respaldo
  console.log(`⚠️ Jugador ${jugador.nombre} no encontrado en ronda anterior, usando colocación de respaldo`);
  const ronda = estructura[rondaDestino];
  
  for (let i = 0; i < ronda.length; i++) {
    const nodo = ronda[i];
    
    if (!nodo.jugador1) {
      nodo.jugador1 = jugador;
      console.log(`🔄 Jugador ${jugador.nombre} colocado de respaldo en ronda ${rondaDestino + 1}, nodo ${i + 1}, slot 1`);
      
      // Ordenar alfabéticamente después de colocar
      ordenarJugadoresEnNodo(nodo);
      return;
    } else if (!nodo.jugador2) {
      nodo.jugador2 = jugador;
      console.log(`🔄 Jugador ${jugador.nombre} colocado de respaldo en ronda ${rondaDestino + 1}, nodo ${i + 1}, slot 2`);
      
      // Ordenar alfabéticamente después de colocar
      ordenarJugadoresEnNodo(nodo);
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
  // SIN QUITAR de la ronda anterior - solo AGREGAR copias
  todosLosJugadores.forEach(jugador => {
    if (jugador.nivel > 0) {
      colocarJugadorEnRondaPorNivel(estructura, jugador);
    }
  });

  return estructura;
};