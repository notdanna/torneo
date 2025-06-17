import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firabase';
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
        setLoading(false);
        
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

  // Crear estructura completa del árbol basada en niveles de jugadores
  const crearEstructuraCompleta = (partidas: Partida[]): NodoTorneo[][] => {
    // Obtener todos los jugadores únicos de todas las partidas
    const todosLosJugadores: Jugador[] = [];
    partidas.forEach(partida => {
      [...partida.equiposX, ...partida.equiposY].forEach(jugador => {
        const yaExiste = todosLosJugadores.find(j => j.id_jugador === jugador.id_jugador);
        if (!yaExiste) {
          todosLosJugadores.push(jugador);
        } else {
          // Actualizar con el nivel más alto si ya existe
          const index = todosLosJugadores.findIndex(j => j.id_jugador === jugador.id_jugador);
          if (jugador.nivel > todosLosJugadores[index].nivel) {
            todosLosJugadores[index] = jugador;
          }
        }
      });
    });

    console.log('👥 Todos los jugadores con sus niveles:', todosLosJugadores);

    // Determinar cuántas rondas necesitamos
    const partidasRonda1 = partidas.filter(p => p.ronda === 1);
    const numPartidasIniciales = partidasRonda1.length || 4;
    const numRondas = Math.ceil(Math.log2(numPartidasIniciales)) + 1;
    
    console.log(`🌳 Creando árbol: ${numPartidasIniciales} partidas iniciales, ${numRondas} rondas`);

    const estructura: NodoTorneo[][] = [];

    // Crear estructura completa ronda por ronda
    for (let ronda = 1; ronda <= numRondas; ronda++) {
      const partidasEnRonda = Math.max(1, Math.ceil(numPartidasIniciales / Math.pow(2, ronda - 1)));
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
    }

    // Llenar ronda 1 con las partidas originales (solo nivel 0)
    partidas.filter(p => p.ronda === 1).forEach(partida => {
      const partidaIndex = partida.id_partida - 1;
      if (partidaIndex >= 0 && partidaIndex < estructura[0].length) {
        const nodo = estructura[0][partidaIndex];
        
        // Solo colocar jugadores de nivel 0 en la ronda inicial
        nodo.jugador1 = partida.equiposX.find(j => j.nivel === 0) || null;
        nodo.jugador2 = partida.equiposY.find(j => j.nivel === 0) || null;
      }
    });

    // Propagar jugadores a rondas superiores basado en su nivel
    todosLosJugadores.forEach(jugador => {
      if (jugador.nivel > 0) {
        colocarJugadorEnRondaPorNivel(estructura, jugador);
      }
    });

    return estructura;
  };

  // Colocar jugador en la ronda correspondiente según su nivel
  const colocarJugadorEnRondaPorNivel = (estructura: NodoTorneo[][], jugador: Jugador) => {
    const rondaDestino = jugador.nivel; // nivel 1 = ronda 2 (índice 1)
    
    if (rondaDestino >= estructura.length) return;

    const ronda = estructura[rondaDestino];
    
    // Buscar el primer nodo disponible en esa ronda
    for (let i = 0; i < ronda.length; i++) {
      const nodo = ronda[i];
      
      if (!nodo.jugador1) {
        nodo.jugador1 = jugador;
        console.log(`✅ Jugador ${jugador.nombre} (nivel ${jugador.nivel}) colocado en ronda ${rondaDestino + 1}, posición ${i + 1}, slot 1`);
        return;
      } else if (!nodo.jugador2) {
        nodo.jugador2 = jugador;
        console.log(`✅ Jugador ${jugador.nombre} (nivel ${jugador.nivel}) colocado en ronda ${rondaDestino + 1}, posición ${i + 1}, slot 2`);
        return;
      }
    }
    
    console.log(`⚠️ No se pudo colocar jugador ${jugador.nombre} (nivel ${jugador.nivel}) en ronda ${rondaDestino + 1} - llena`);
  };

  // Dibujar bracket con D3
  useEffect(() => {
    if (!svgRef.current) return;

    console.log('🎨 Dibujando árbol por niveles con D3');

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const estructura = crearEstructuraCompleta(partidas);
    
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
                         rondaIndex === estructura.length - 1 ? 'FINAL' :
                         nodosEnRonda === 2 ? 'SEMIFINAL' :
                         nodosEnRonda === 4 ? 'CUARTOS' :
                         `Ronda ${rondaIndex + 1}`;

      svg.append("text")
        .attr("x", x + rondaWidth / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "#1f2937")
        .text(tituloRonda);

      // Subtítulo con nivel
      svg.append("text")
        .attr("x", x + rondaWidth / 2)
        .attr("y", 45)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("fill", "#6b7280")
        .text(`(Jugadores Nivel ${rondaIndex}+)`);

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

        // Jugador 1
        const jugador1Texto = nodo.jugador1 ? 
          `${nodo.jugador1.nombre} (Nivel ${nodo.jugador1.nivel})` : 
          "Esperando...";
        
        svg.append("rect")
          .attr("x", x + 5)
          .attr("y", y - 35)
          .attr("width", rondaWidth - 60)
          .attr("height", 20)
          .attr("rx", 3)
          .style("fill", nodo.jugador1 ? "#eff6ff" : "#f9fafb")
          .style("stroke", nodo.jugador1 ? "#bfdbfe" : "#e5e7eb")
          .style("stroke-width", 1);

        svg.append("text")
          .attr("x", x + 10)
          .attr("y", y - 22)
          .style("font-size", "11px")
          .style("font-weight", nodo.jugador1 ? "600" : "400")
          .style("fill", nodo.jugador1 ? "#1e40af" : "#9ca3af")
          .text(jugador1Texto);

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
        
        svg.append("rect")
          .attr("x", x + 5)
          .attr("y", y + 15)
          .attr("width", rondaWidth - 60)
          .attr("height", 20)
          .attr("rx", 3)
          .style("fill", nodo.jugador2 ? "#f0fdf4" : "#f9fafb")
          .style("stroke", nodo.jugador2 ? "#bbf7d0" : "#e5e7eb")
          .style("stroke-width", 1);

        svg.append("text")
          .attr("x", x + 10)
          .attr("y", y + 28)
          .style("font-size", "11px")
          .style("font-weight", nodo.jugador2 ? "600" : "400")
          .style("fill", nodo.jugador2 ? "#15803d" : "#9ca3af")
          .text(jugador2Texto);

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

  }, [partidas]);

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
        <h4 style={{margin: '0 0 8px 0', color: '#0369a1'}}>🎯 Sistema por Niveles:</h4>
        <ul style={{margin: 0, paddingLeft: '20px', color: '#075985', fontSize: '14px'}}>
          <li><strong>Nivel 0:</strong> Jugadores en ronda inicial (no han ganado)</li>
          <li><strong>Nivel 1:</strong> Jugadores que ganaron 1 vez (avanzan a ronda 2)</li>
          <li><strong>Nivel 2:</strong> Jugadores que ganaron 2 veces (avanzan a ronda 3)</li>
          <li>Los jugadores aparecen automáticamente cuando su admin les sube el nivel</li>
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
        <summary style={{cursor: 'pointer', fontWeight: 'bold'}}>Ver datos de jugadores por nivel (debug)</summary>
        <pre style={{
          backgroundColor: '#f5f5f5',
          padding: '16px',
          borderRadius: '4px',
          border: '1px solid #ddd',
          overflow: 'auto',
          fontSize: '12px',
          maxHeight: '300px'
        }}>
          {JSON.stringify(partidas.map(p => ({
            partida: p.id_partida,
            equiposX: p.equiposX.map(j => `${j.nombre} (Nivel ${j.nivel})`),
            equiposY: p.equiposY.map(j => `${j.nombre} (Nivel ${j.nivel})`)
          })), null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default BracketTiempoReal;