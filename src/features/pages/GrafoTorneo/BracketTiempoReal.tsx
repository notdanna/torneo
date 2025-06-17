import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, doc, DocumentData, DocumentSnapshot } from 'firebase/firestore';
//import { db } from '../../../firabase'; // Ajusta esta ruta según donde esté tu archivo firebase
import { db } from '../../../../src/firebase';
import * as d3 from 'd3';

interface Jugador {
  id_jugador: number;
  nombre: string;
  nivel: number;
}

interface Partida {
  id: string;
  id_partida: number;
  ronda: number;
  equiposX: Jugador[];
  equiposY: Jugador[];
  resultado: string;
}

interface NodoTorneo {
  id: string;
  ronda: number;
  posicion: number;
  jugador1: Jugador | null;
  jugador2: Jugador | null;
}

const BracketTiempoReal: React.FC = () => {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [nivelesJugadores, setNivelesJugadores] = useState<{[key: number]: number}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    console.log('🔥 Conectando a Firebase - Árbol por Niveles');
    
    const partidasRef = collection(db, 'torneo', '1', 'juego', '1', 'grupos', '1', 'partidas');
    
    const unsubscribe = onSnapshot(
      partidasRef,
      (querySnapshot) => {
        const todasLasPartidas: Partida[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          todasLasPartidas.push({
            id: doc.id,
            id_partida: data.id_partida,
            ronda: data.ronda,
            equiposX: data.equiposX || [],
            equiposY: data.equiposY || [],
            resultado: data.resultado
          });
        });
        
        console.log(`📥 ${todasLasPartidas.length} partidas actualizadas:`, todasLasPartidas);
        
        setPartidas(todasLasPartidas);
        setError(null);
        setUltimaActualizacion(new Date());

        // Obtener todos los IDs de jugadores únicos
        const idsJugadores = new Set<number>();
        todasLasPartidas.forEach(partida => {
          [...partida.equiposX, ...partida.equiposY].forEach(jugador => {
            idsJugadores.add(jugador.id_jugador);
          });
        });

        // Escuchar los niveles de todos los jugadores
        escucharNivelesJugadores(Array.from(idsJugadores));
      },
      (error) => {
        console.error('💥 Error:', error);
        setLoading(false);
        setError(error.message);
        setPartidas([]);
      }
    );

    return () => {
      console.log('🔄 Desconectando bracket');
      unsubscribe();
    };
  }, []);

  // Función para escuchar los niveles de los jugadores desde /jugadores/{id}
  const escucharNivelesJugadores = (idsJugadores: number[]) => {
    console.log('👥 Escuchando niveles de jugadores:', idsJugadores);
    
    const unsubscribers: (() => void)[] = [];

    idsJugadores.forEach(idJugador => {
      const jugadorRef = doc(db, 'jugadores', idJugador.toString());
      
      const unsubscribe: () => void = onSnapshot(
        jugadorRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
        const data: { nivel?: number } = docSnapshot.data() as { nivel?: number };
        const nivel: number = data.nivel !== undefined ? data.nivel : 0;
        
        console.log(`📊 Jugador ${idJugador} tiene nivel ${nivel}`);
        
        // Actualizar el estado con los nuevos niveles
        setNivelesJugadores((prev: { [key: number]: number }) => ({ ...prev, [idJugador]: nivel }));
          } else {
        console.log(`❌ Jugador ${idJugador} no existe en /jugadores/, asignando nivel 0`);
        setNivelesJugadores((prev: { [key: number]: number }) => ({ ...prev, [idJugador]: 0 }));
          }
          
          setLoading(false);
        },
        (error: Error) => {
          console.error(`💥 Error obteniendo nivel del jugador ${idJugador}:`, error);
          console.log(`🔄 Asignando nivel 0 por defecto al jugador ${idJugador}`);
          setNivelesJugadores((prev: { [key: number]: number }) => ({ ...prev, [idJugador]: 0 }));
          setLoading(false);
        }
      );

      unsubscribers.push(unsubscribe);
    });

    // Retornar función de cleanup
    return () => {
      console.log('🧹 Limpiando listeners de niveles de jugadores');
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  };

  // Crear estructura completa del árbol basada en niveles reales de jugadores
  const crearEstructuraCompleta = (partidas: Partida[], niveles: {[key: number]: number}): NodoTorneo[][] => {
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

  // Colocar jugador en la ronda correspondiente según su nivel
  // RESPETA las conexiones del bracket para mantener el flujo correcto
  const colocarJugadorEnRondaPorNivel = (estructura: NodoTorneo[][], jugador: Jugador) => {
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

  // Dibujar bracket con D3
  useEffect(() => {
    if (!svgRef.current || partidas.length === 0) return;

    console.log('🎨 Dibujando árbol por niveles reales con D3');

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const estructura = crearEstructuraCompleta(partidas, nivelesJugadores);
    
    if (estructura.length === 0) {
      const width = 1200;
      const height = 600;
      svg.attr("width", width).attr("height", height);
      
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .style("fill", "#9ca3af")
        .text("No hay partidas - Creando estructura básica...");
      return;
    }

    // Calcular dimensiones
    const maxPartidas = Math.max(...estructura.map(ronda => ronda.length));
    const width = estructura.length * 250 + 100;
    const height = maxPartidas * 100 + 100;
    
    svg.attr("width", width).attr("height", height);

    const rondaWidth = 250;
    const margin = 50;

    console.log('📊 Estructura final del árbol:', estructura);

    estructura.forEach((ronda, rondaIndex) => {
      const x = margin + (rondaIndex * rondaWidth);
      const nodosEnRonda = ronda.length;
      const espacioVertical = Math.max(100, (height - 2 * margin) / nodosEnRonda);

      // Título de la ronda
      const tituloRonda = rondaIndex === 0 ? 'RONDA INICIAL' :
                         rondaIndex === estructura.length - 1 ? 'GANADOR FINAL' :
                         rondaIndex === estructura.length - 2 ? 'FINAL' :
                         nodosEnRonda === 2 ? 'SEMIFINAL' :
                         nodosEnRonda === 4 ? 'CUARTOS' :
                         nodosEnRonda === 8 ? 'OCTAVOS' :
                         `Ronda ${rondaIndex + 1}`;

      svg.append("text")
        .attr("x", x + rondaWidth / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#1f2937")
        .text(tituloRonda);

      // Subtítulo con nivel (excepto para el ganador final)
      if (rondaIndex < estructura.length - 1) {
        svg.append("text")
          .attr("x", x + rondaWidth / 2)
          .attr("y", 45)
          .attr("text-anchor", "middle")
          .style("font-size", "11px")
          .style("fill", "#6b7280")
          .text(`(Jugadores Nivel ${rondaIndex}+)`);
      } else {
        svg.append("text")
          .attr("x", x + rondaWidth / 2)
          .attr("y", 45)
          .attr("text-anchor", "middle")
          .style("font-size", "11px")
          .style("fill", "#dc2626")
          .text("(Campeón del Torneo)");
      }

      ronda.forEach((nodo, nodoIndex) => {
        const y = margin + (nodoIndex * espacioVertical) + (espacioVertical / 2);

        // Rectángulo del nodo
        svg.append("rect")
          .attr("x", x)
          .attr("y", y - 40)
          .attr("width", rondaWidth - 50)
          .attr("height", 80)
          .attr("rx", 6)
          .style("fill", "#ffffff")
          .style("stroke", "#e5e7eb")
          .style("stroke-width", 2);

        // Tratamiento especial para el nodo final (ganador absoluto)
        if (rondaIndex === estructura.length - 1) {
          // Solo mostrar el ganador, sin VS
          const ganador = nodo.jugador1 || nodo.jugador2;
          if (ganador) {
            // Rectángulo especial para el ganador
            svg.append("rect")
              .attr("x", x + 10)
              .attr("y", y - 25)
              .attr("width", rondaWidth - 60)
              .attr("height", 50)
              .attr("rx", 8)
              .style("fill", "#fef3c7")
              .style("stroke", "#f59e0b")
              .style("stroke-width", 3);

            // Corona
            svg.append("text")
              .attr("x", x + rondaWidth / 2 - 25)
              .attr("y", y - 5)
              .attr("text-anchor", "middle")
              .style("font-size", "24px")
              .text("👑");

            // Nombre del ganador
            svg.append("text")
              .attr("x", x + rondaWidth / 2 - 25)
              .attr("y", y + 15)
              .attr("text-anchor", "middle")
              .style("font-size", "14px")
              .style("font-weight", "bold")
              .style("fill", "#92400e")
              .text(`${ganador.nombre}`);

            // Nivel del ganador
            svg.append("text")
              .attr("x", x + rondaWidth / 2 - 25)
              .attr("y", y + 30)
              .attr("text-anchor", "middle")
              .style("font-size", "11px")
              .style("fill", "#92400e")
              .text(`Nivel ${ganador.nivel}`);
          } else {
            // Esperando al ganador final
            svg.append("rect")
              .attr("x", x + 10)
              .attr("y", y - 25)
              .attr("width", rondaWidth - 60)
              .attr("height", 50)
              .attr("rx", 8)
              .style("fill", "#f9fafb")
              .style("stroke", "#d1d5db")
              .style("stroke-width", 2)
              .style("stroke-dasharray", "5,5");

            svg.append("text")
              .attr("x", x + rondaWidth / 2 - 25)
              .attr("y", y)
              .attr("text-anchor", "middle")
              .style("font-size", "14px")
              .style("fill", "#9ca3af")
              .text("Esperando");

            svg.append("text")
              .attr("x", x + rondaWidth / 2 - 25)
              .attr("y", y + 15)
              .attr("text-anchor", "middle")
              .style("font-size", "14px")
              .style("fill", "#9ca3af")
              .text("Campeón...");
          }
        } else {
          // Nodos normales de VS
          // Jugador 1
          const jugador1Texto = nodo.jugador1 ? 
            `${nodo.jugador1.nombre} (Nivel ${nodo.jugador1.nivel})` : 
            "Esperando...";
          
          // Determinar si el jugador avanzó (nivel > ronda actual)
          const jugador1Avanzo = nodo.jugador1 && nodo.jugador1.nivel > rondaIndex;
          
          svg.append("rect")
            .attr("x", x + 5)
            .attr("y", y - 35)
            .attr("width", rondaWidth - 60)
            .attr("height", 20)
            .attr("rx", 3)
            .style("fill", nodo.jugador1 ? 
              (jugador1Avanzo ? "#dcfce7" : "#eff6ff") : "#f9fafb")
            .style("stroke", nodo.jugador1 ? 
              (jugador1Avanzo ? "#16a34a" : "#bfdbfe") : "#e5e7eb")
            .style("stroke-width", jugador1Avanzo ? 2 : 1);

          svg.append("text")
            .attr("x", x + 10)
            .attr("y", y - 22)
            .style("font-size", "11px")
            .style("font-weight", nodo.jugador1 ? "600" : "400")
            .style("fill", nodo.jugador1 ? 
              (jugador1Avanzo ? "#15803d" : "#1e40af") : "#9ca3af")
            .text(jugador1Texto);

          // Indicador de avance para jugador 1
          if (jugador1Avanzo) {
            svg.append("text")
              .attr("x", x + rondaWidth - 70)
              .attr("y", y - 22)
              .style("font-size", "12px")
              .style("fill", "#15803d")
              .text("✓");
          }

          // VS
          svg.append("text")
            .attr("x", x + rondaWidth / 2 - 25)
            .attr("y", y - 5)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "#7c3aed")
            .text("VS");

          // Jugador 2
          const jugador2Texto = nodo.jugador2 ? 
            `${nodo.jugador2.nombre} (Nivel ${nodo.jugador2.nivel})` : 
            "Esperando...";
          
          // Determinar si el jugador avanzó (nivel > ronda actual)
          const jugador2Avanzo = nodo.jugador2 && nodo.jugador2.nivel > rondaIndex;
          
          svg.append("rect")
            .attr("x", x + 5)
            .attr("y", y + 15)
            .attr("width", rondaWidth - 60)
            .attr("height", 20)
            .attr("rx", 3)
            .style("fill", nodo.jugador2 ? 
              (jugador2Avanzo ? "#dcfce7" : "#f0fdf4") : "#f9fafb")
            .style("stroke", nodo.jugador2 ? 
              (jugador2Avanzo ? "#16a34a" : "#bbf7d0") : "#e5e7eb")
            .style("stroke-width", jugador2Avanzo ? 2 : 1);

          svg.append("text")
            .attr("x", x + 10)
            .attr("y", y + 28)
            .style("font-size", "11px")
            .style("font-weight", nodo.jugador2 ? "600" : "400")
            .style("fill", nodo.jugador2 ? 
              (jugador2Avanzo ? "#15803d" : "#15803d") : "#9ca3af")
            .text(jugador2Texto);

          // Indicador de avance para jugador 2
          if (jugador2Avanzo) {
            svg.append("text")
              .attr("x", x + rondaWidth - 70)
              .attr("y", y + 28)
              .style("font-size", "12px")
              .style("fill", "#15803d")
              .text("✓");
          }
        }

        // ID del nodo (debug)
        svg.append("text")
          .attr("x", x + rondaWidth - 45)
          .attr("y", y - 35)
          .style("font-size", "9px")
          .style("fill", "#9ca3af")
          .text(`${nodoIndex + 1}`);

        // Conexiones hacia la siguiente ronda
        if (rondaIndex < estructura.length - 1) {
          const siguienteRonda = estructura[rondaIndex + 1];
          const targetNodoIndex = Math.floor(nodoIndex / 2);
          
          if (targetNodoIndex < siguienteRonda.length) {
            const nextX = x + rondaWidth;
            const nextEspacioVertical = Math.max(100, (height - 2 * margin) / siguienteRonda.length);
            const targetY = margin + (targetNodoIndex * nextEspacioVertical) + (nextEspacioVertical / 2);

            // Línea horizontal
            svg.append("line")
              .attr("x1", x + rondaWidth - 50)
              .attr("y1", y)
              .attr("x2", nextX - 25)
              .attr("y2", y)
              .style("stroke", "#6b7280")
              .style("stroke-width", 2);

            // Conexión en pares
            if (nodoIndex % 2 === 1) {
              const prevY = margin + ((nodoIndex - 1) * espacioVertical) + (espacioVertical / 2);
              
              // Línea vertical
              svg.append("line")
                .attr("x1", nextX - 25)
                .attr("y1", prevY)
                .attr("x2", nextX - 25)
                .attr("y2", y)
                .style("stroke", "#6b7280")
                .style("stroke-width", 2);

              // Línea hacia el siguiente nodo
              svg.append("line")
                .attr("x1", nextX - 25)
                .attr("y1", (prevY + y) / 2)
                .attr("x2", nextX)
                .attr("y2", targetY)
                .style("stroke", "#6b7280")
                .style("stroke-width", 2);
            }
          }
        }
      });
    });

  }, [partidas, nivelesJugadores]);

  if (loading) {
    return <div style={{padding: '20px'}}>Cargando árbol por niveles...</div>;
  }

  if (error) {
    return <div style={{padding: '20px', color: 'red'}}>Error: {error}</div>;
  }

  return (
    <div style={{padding: '20px'}}>
      <h2>🌳 Árbol de Torneo por Niveles</h2>
      <p><strong>Total partidas:</strong> {partidas.length}</p>
      {ultimaActualizacion && (
        <p><strong>Última actualización:</strong> {ultimaActualizacion.toLocaleString()}</p>
      )}
      
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f0f9ff',
        borderRadius: '8px',
        border: '1px solid #0284c7'
      }}>
        <h4 style={{margin: '0 0 8px 0', color: '#0369a1'}}>🎯 Sistema por Niveles con Historial:</h4>
        <ul style={{margin: 0, paddingLeft: '20px', color: '#075985', fontSize: '14px'}}>
          <li><strong>Nivel 0:</strong> Jugadores en ronda inicial (no han ganado)</li>
          <li><strong>Nivel 1+:</strong> Jugadores que ganaron avanzan a siguientes rondas</li>
          <li><strong>Historial completo:</strong> Los jugadores permanecen en rondas anteriores con ✓ verde</li>
          <li><strong>Tiempo real:</strong> Se actualiza automáticamente cuando el admin cambia niveles</li>
        </ul>
      </div>
      
      <div style={{
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#f9fafb',
        overflow: 'auto'
      }}>
        <svg ref={svgRef}></svg>
      </div>

      {/* Debug info */}
      <details style={{marginTop: '20px'}}>
        <summary style={{cursor: 'pointer', fontWeight: 'bold'}}>Ver niveles reales de jugadores (debug)</summary>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '16px',
          borderRadius: '4px',
          border: '1px solid #ddd',
          fontSize: '14px',
          marginTop: '10px'
        }}>
          <h4>Niveles desde /jugadores/:</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '8px',
            fontSize: '12px'
          }}>
            {Object.entries(nivelesJugadores).map(([id, nivel]) => (
              <div key={id} style={{
                padding: '4px 8px',
                backgroundColor: nivel > 0 ? '#dcfce7' : '#f3f4f6',
                borderRadius: '4px',
                border: '1px solid #d1d5db'
              }}>
                ID {id}: Nivel {nivel}
              </div>
            ))}
          </div>
          
          <h4 style={{marginTop: '16px'}}>Estado de carga:</h4>
          <p style={{fontSize: '12px', margin: 0}}>
            <strong>Total jugadores únicos:</strong> {Object.keys(nivelesJugadores).length}
            <br />
            <strong>Jugadores con nivel definido:</strong> {Object.values(nivelesJugadores).filter(n => n !== undefined).length}
            <br />
            <strong>Loading:</strong> {loading ? 'Sí' : 'No'}
          </p>
          
          <h4 style={{marginTop: '16px'}}>Partidas con jugadores:</h4>
          <pre style={{fontSize: '11px', margin: 0, maxHeight: '200px', overflow: 'auto'}}>
            {JSON.stringify(partidas.slice(0, 5).map(p => ({
              partida: p.id_partida,
              ronda: p.ronda,
              equiposX: p.equiposX.map(j => `${j.nombre} (ID: ${j.id_jugador}, Nivel Real: ${nivelesJugadores[j.id_jugador] !== undefined ? nivelesJugadores[j.id_jugador] : 'Sin datos'})`),
              equiposY: p.equiposY.map(j => `${j.nombre} (ID: ${j.id_jugador}, Nivel Real: ${nivelesJugadores[j.id_jugador] !== undefined ? nivelesJugadores[j.id_jugador] : 'Sin datos'})`)
            })), null, 2)}
            {partidas.length > 5 && `\n... y ${partidas.length - 5} partidas más`}
          </pre>
        </div>
      </details>
    </div>
  );
};

export default BracketTiempoReal;
function ordenarJugadoresEnNodo(nodoDestino: NodoTorneo) {
  // Ordena jugador1 y jugador2 alfabéticamente por nombre si ambos existen
  if (nodoDestino.jugador1 && nodoDestino.jugador2) {
    if (nodoDestino.jugador1.nombre.localeCompare(nodoDestino.jugador2.nombre) > 0) {
      // Intercambiar si jugador2 debe ir antes
      const temp = nodoDestino.jugador1;
      nodoDestino.jugador1 = nodoDestino.jugador2;
      nodoDestino.jugador2 = temp;
    }
  }
}
