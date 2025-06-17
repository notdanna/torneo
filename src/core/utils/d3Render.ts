// utils/d3Renderer.ts
import * as d3 from 'd3';
import { NodoTorneo } from '../models/grafos';

export const renderBracket = (
  svgRef: React.RefObject<SVGSVGElement | null>, 
  estructura: NodoTorneo[][]
): void => {
  if (!svgRef.current || estructura.length === 0) return;

  console.log('🎨 Dibujando árbol por niveles reales con D3');

  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove();

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
        renderFinalNode(svg, nodo, x, y, rondaWidth);
      } else {
        renderRegularNode(svg, nodo, x, y, rondaWidth, rondaIndex);
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
        renderConnections(svg, estructura, rondaIndex, nodoIndex, x, y, rondaWidth, margin, height);
      }
    });
  });
};

const renderFinalNode = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  nodo: NodoTorneo,
  x: number,
  y: number,
  rondaWidth: number
): void => {
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
};

const renderRegularNode = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  nodo: NodoTorneo,
  x: number,
  y: number,
  rondaWidth: number,
  rondaIndex: number
): void => {
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
};

const renderConnections = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  estructura: NodoTorneo[][],
  rondaIndex: number,
  nodoIndex: number,
  x: number,
  y: number,
  rondaWidth: number,
  margin: number,
  height: number
): void => {
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
      const espacioVertical = Math.max(100, (height - 2 * margin) / estructura[rondaIndex].length);
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
};