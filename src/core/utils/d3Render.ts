// notdanna/torneo/torneo-aee1783eb67b4c33057cc1c53182dbef6b508154/src/core/utils/d3Render.ts

import * as d3 from 'd3';
import { NodoTorneo, Jugador } from '../models/grafos';

const renderWinnerNode = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    nodo: NodoTorneo,
    width: number,
    height: number
  ): void => {
    const ganador = nodo.jugador1 || nodo.jugador2;
    if (!ganador) return;
  
    const nodeWidth = width * 0.8;
    const nodeHeight = height * 0.7;
    const x = (width - nodeWidth) / 2;
    const y = (height - nodeHeight) / 2;
  
    svg.append("rect")
      .attr("x", x)
      .attr("y", y)
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("rx", 20)
      .style("fill", "#fef3c7")
      .style("stroke", "#f59e0b")
      .style("stroke-width", 4);
  
    svg.append("text")
      .attr("x", x + nodeWidth / 2)
      .attr("y", y + nodeHeight * 0.3)
      .attr("text-anchor", "middle")
      .style("font-size", `${nodeHeight * 0.25}px`)
      .text("👑");
  
    const fontSize = Math.min(nodeHeight * 0.15, nodeWidth / (ganador.nombre.length * 0.6));
    svg.append("text")
      .attr("x", x + nodeWidth / 2)
      .attr("y", y + nodeHeight * 0.55)
      .attr("text-anchor", "middle")
      .style("font-size", `${fontSize}px`)
      .style("font-weight", "bold")
      .style("fill", "#92400e")
      .text(ganador.nombre);
  
    if ((ganador as any).nombreAcompanante) {
      const companionFontSize = fontSize * 0.8;
      svg.append("text")
        .attr("x", x + nodeWidth / 2)
        .attr("y", y + nodeHeight * 0.75)
        .attr("text-anchor", "middle")
        .style("font-size", `${companionFontSize}px`)
        .style("fill", "#92400e")
        .text(`+ ${(ganador as any).nombreAcompanante}`);
    }
};

export const renderBracket = (
  svgRef: React.RefObject<SVGSVGElement>,
  estructura: NodoTorneo[][],
  rondasVisibles?: number[]
): void => {
  if (!svgRef.current || estructura.length === 0) return;

  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove();

  const container = svgRef.current.parentElement;
  if (!container) return;
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  
  svg.attr("width", containerWidth).attr("height", containerHeight);

  const rondaFinal = estructura[estructura.length - 1];
  const nodoFinal = rondaFinal && rondaFinal.length === 1 ? rondaFinal[0] : null;
  const ganadorTorneo = nodoFinal ? (nodoFinal.jugador1 || nodoFinal.jugador2) : null;

  if (ganadorTorneo && nodoFinal) {
    renderWinnerNode(svg, nodoFinal, containerWidth, containerHeight);
    return;
  }

  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const width = containerWidth;
  const height = containerHeight;

  const nodeCalculations: { x: number; y: number; width: number; height: number }[][] = Array(estructura.length).fill(0).map(() => []);
  
  const numRondas = estructura.length;
  const rondaWidth = (width - margin.left - margin.right) / numRondas;
  
  // --- LÓGICA DE CRECIMIENTO DINÁMICO ---
  
  // Calcular el total de rondas originales del torneo
  const totalRoundsInTournament = rondasVisibles 
    ? Math.max(...rondasVisibles) + 1 
    : numRondas;
  
  // Calcular el factor de crecimiento exponencial
  // Más sutil al principio, más pronunciado cuando quedan pocas rondas
  const visibilityRatio = numRondas / totalRoundsInTournament;
  
  // Factor de crecimiento exponencial: crece más rápido cuando quedan menos rondas
  const growthFactor = Math.pow(2 - visibilityRatio, 1.5);
  
  // Tamaños base que escalan con el factor de crecimiento
  const baseNodeWidth = 110 * growthFactor;
  const baseNodeHeight = 45 * growthFactor;
  
  // Factor de compresión del espacio vertical (inverso al crecimiento)
  // Cuando hay menos rondas, menos espacio entre nodos
  const verticalSpacingFactor = 0.8 + (0.2 * visibilityRatio);

  // 1. Cálculo de la primera ronda con crecimiento dinámico
  if (estructura.length > 0) {
    const firstRonda = estructura[0];
    const nodosEnRonda = firstRonda.length;

    // Espacio vertical disponible con factor de compresión
    const espacioVertical = ((height - margin.top - margin.bottom) / nodosEnRonda) * verticalSpacingFactor;

    // La altura del nodo crece con el factor de crecimiento, limitada por el espacio disponible
    const nodeHeight = Math.min(
      espacioVertical * 0.85, // Un poco más de margen para evitar solapamiento
      baseNodeHeight
    );
    
    // El ancho también crece proporcionalmente
    const nodeWidth = Math.min(
      rondaWidth - 20, 
      baseNodeWidth
    );

    firstRonda.forEach((_, nodoIndex) => {
      // Centrar verticalmente los nodos en el espacio disponible
      const totalUsedHeight = nodosEnRonda * espacioVertical;
      const startY = margin.top + (height - margin.top - margin.bottom - totalUsedHeight) / 2;
      const y = startY + (nodoIndex * espacioVertical) + (espacioVertical / 2);
      const x = margin.left + (rondaWidth - nodeWidth) / 2;
      nodeCalculations[0][nodoIndex] = { x, y, width: nodeWidth, height: nodeHeight };
    });
  }

  // 2. Cálculo de rondas subsecuentes con escalado progresivo
  for (let i = 1; i < estructura.length; i++) {
    // Factor adicional de escalado por profundidad de ronda
    const depthFactor = 1 + (i / numRondas) * 0.3;
    
    // Tamaños con límites prudentes para mantener legibilidad
    const nodeHeight = Math.min(
      height * 0.4, // Máximo 40% de la altura del contenedor
      baseNodeHeight * depthFactor
    );
    const nodeWidth = Math.min(
      rondaWidth - 20, 
      baseNodeWidth * depthFactor
    );

    estructura[i].forEach((_, nodoIndex) => {
      const parent1 = nodeCalculations[i - 1][nodoIndex * 2];
      const parent2 = nodeCalculations[i - 1][(nodoIndex * 2) + 1];
      let y: number;

      if (parent1 && parent2) {
        y = (parent1.y + parent2.y) / 2;
      } else if (parent1) {
        y = parent1.y;
      } else {
        y = height / 2;
      }

      const x = margin.left + (i * rondaWidth) + (rondaWidth - nodeWidth) / 2;
      nodeCalculations[i][nodoIndex] = { x, y, width: nodeWidth, height: nodeHeight };
    });
  }

  // --- DIBUJO DE CONEXIONES ---
  for (let i = 0; i < nodeCalculations.length - 1; i++) {
    for (let j = 0; j < nodeCalculations[i].length; j++) {
      if (j % 2 === 1) { 
          const source1 = nodeCalculations[i][j - 1];
          const source2 = nodeCalculations[i][j];
          const target = nodeCalculations[i + 1][Math.floor(j / 2)];
          
          if (!source1 || !source2 || !target) continue;

          const midPointX = source1.x + source1.width + rondaWidth / 4;
          
          svg.append("line").attr("x1", source1.x + source1.width).attr("y1", source1.y).attr("x2", midPointX).attr("y2", source1.y).style("stroke", "#d1d5db").style("stroke-width", 1.5);
          svg.append("line").attr("x1", source2.x + source2.width).attr("y1", source2.y).attr("x2", midPointX).attr("y2", source2.y).style("stroke", "#d1d5db").style("stroke-width", 1.5);
          svg.append("line").attr("x1", midPointX).attr("y1", source1.y).attr("x2", midPointX).attr("y2", source2.y).style("stroke", "#d1d5db").style("stroke-width", 1.5);
          svg.append("line").attr("x1", midPointX).attr("y1", target.y).attr("x2", target.x).attr("y2", target.y).style("stroke", "#d1d5db").style("stroke-width", 1.5);
      }
    }
  }

  // --- DIBUJO DE NODOS ---
  estructura.forEach((ronda, rondaIndex) => {
    ronda.forEach((nodo, nodoIndex) => {
      const { x, y, width, height } = nodeCalculations[rondaIndex][nodoIndex];
      
      // Factor de escala para el texto basado en el crecimiento
      const textScaleFactor = growthFactor * (1 + rondaIndex * 0.15);

      svg.append("rect")
        .attr("x", x)
        .attr("y", y - height / 2)
        .attr("width", width)
        .attr("height", height)
        .attr("rx", 6)
        .style("fill", "#ffffff")
        .style("stroke", "#e5e7eb")
        .style("stroke-width", 1.5);

      const rondaOriginalIndex = rondasVisibles ? rondasVisibles[rondaIndex] : rondaIndex;
      if (rondaIndex === estructura.length - 1) {
        renderCompactFinalNode(svg, nodo, x, y, width, height, textScaleFactor);
      } else {
        renderCompactRegularNode(svg, nodo, x, y, width, height, rondaOriginalIndex, textScaleFactor);
      }
    });
  });
};

const renderCompactFinalNode = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  nodo: NodoTorneo,
  x: number,
  y: number,
  nodeWidth: number,
  nodeHeight: number,
  scaleFactor: number
): void => {
    const ganador = nodo.jugador1 || nodo.jugador2;
    if (ganador) {
        svg.append("rect")
            .attr("x", x + 2).attr("y", y - nodeHeight / 2 + 2)
            .attr("width", nodeWidth - 4).attr("height", nodeHeight - 4)
            .attr("rx", 4).style("fill", "#fef3c7").style("stroke", "#f59e0b").style("stroke-width", 2);

        svg.append("text")
            .attr("x", x + nodeWidth / 2).attr("y", y - nodeHeight * 0.1)
            .attr("text-anchor", "middle").style("font-size", `${Math.min(14 * scaleFactor, nodeHeight * 0.3)}px`).text("👑");

        const fontSize = Math.min(11 * scaleFactor, nodeHeight * 0.22);
        const maxChars = Math.floor(nodeWidth / (fontSize * 0.6));

        svg.append("text")
            .attr("x", x + nodeWidth / 2).attr("y", y + nodeHeight * 0.15)
            .attr("text-anchor", "middle").style("font-size", `${fontSize}px`).style("font-weight", "bold").style("fill", "#92400e")
            .text(truncateName(ganador.nombre, maxChars));

        if ((ganador as any).nombreAcompanante) {
            svg.append("text")
                .attr("x", x + nodeWidth / 2).attr("y", y + nodeHeight * 0.35)
                .attr("text-anchor", "middle").style("font-size", `${fontSize * 0.9}px`).style("fill", "#92400e")
                .text(truncateName(`+ ${(ganador as any).nombreAcompanante}`, maxChars));
        }
    } else {
        svg.append("text")
            .attr("x", x + nodeWidth / 2).attr("y", y + 3)
            .attr("text-anchor", "middle").style("font-size", "10px").style("fill", "#9ca3af").text("...");
    }
};

const renderCompactRegularNode = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  nodo: NodoTorneo,
  x: number,
  y: number,
  nodeWidth: number,
  nodeHeight: number,
  rondaOriginalIndex: number,
  baseFontSize: number
): void => {
    svg.append("line")
        .attr("x1", x + 5).attr("y1", y)
        .attr("x2", x + nodeWidth - 5).attr("y2", y)
        .style("stroke", "#e5e7eb").style("stroke-width", 1);
    
    // Tamaño de fuente escalado dinámicamente
    const fontSize = Math.min(baseFontSize, nodeHeight * 0.25);
    const maxChars = Math.floor(nodeWidth / (fontSize * 0.7));

    const jugador1 = nodo.jugador1 as (Jugador & { nombreAcompanante?: string }) | null;
    if (jugador1) {
        const avanzo1 = jugador1.nivel > rondaOriginalIndex;
        if (avanzo1) {
            svg.append("rect")
                .attr("x", x + 2).attr("y", y - nodeHeight / 2 + 2)
                .attr("width", nodeWidth - 4).attr("height", nodeHeight / 2 - 3)
                .attr("rx", 2).style("fill", "#dcfce7");
        }
        svg.append("text")
            .attr("x", x + 4).attr("y", y - nodeHeight * 0.25 + 2)
            .style("font-size", `${fontSize}px`).style("font-weight", avanzo1 ? "600" : "400").style("fill", avanzo1 ? "#15803d" : "#1e40af")
            .text(truncateName(jugador1.nombre, maxChars));
        if (jugador1.nombreAcompanante) {
            svg.append("text")
                .attr("x", x + 4).attr("y", y - nodeHeight * 0.05 + 2)
                .style("font-size", `${fontSize * 0.9}px`).style("fill", "#4b5563")
                .text(truncateName(`+ ${jugador1.nombreAcompanante}`, maxChars));
        }
    } else {
        svg.append("text").attr("x", x + 4).attr("y", y - 6).style("font-size", `${fontSize * 0.9}px`).style("fill", "#9ca3af").text("---");
    }

    const jugador2 = nodo.jugador2 as (Jugador & { nombreAcompanante?: string }) | null;
    if (jugador2) {
        const avanzo2 = jugador2.nivel > rondaOriginalIndex;
        if (avanzo2) {
            svg.append("rect")
                .attr("x", x + 2).attr("y", y + 1)
                .attr("width", nodeWidth - 4).attr("height", nodeHeight / 2 - 3)
                .attr("rx", 2).style("fill", "#dcfce7");
        }
        svg.append("text")
            .attr("x", x + 4).attr("y", y + nodeHeight * 0.25 - 2)
            .style("font-size", `${fontSize}px`).style("font-weight", avanzo2 ? "600" : "400").style("fill", avanzo2 ? "#15803d" : "#1e40af")
            .text(truncateName(jugador2.nombre, maxChars));
        if (jugador2.nombreAcompanante) {
            svg.append("text")
                .attr("x", x + 4).attr("y", y + nodeHeight * 0.45 - 2)
                .style("font-size", `${fontSize * 0.9}px`).style("fill", "#4b5563")
                .text(truncateName(`+ ${jugador2.nombreAcompanante}`, maxChars));
        }
    } else {
        svg.append("text").attr("x", x + 4).attr("y", y + 12).style("font-size", `${fontSize * 0.9}px`).style("fill", "#9ca3af").text("---");
    }
};

const truncateName = (name: string, maxLength: number): string => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 2) + '..';
};