// notdanna/torneo/torneo-aee1783eb67b4c33057cc1c53182dbef6b508154/src/core/utils/d3Render.ts

import * as d3 from 'd3';
import { NodoTorneo, Jugador } from '../models/grafos';

// Las funciones auxiliares (renderWinnerNode, etc.) no necesitan cambios.
// Todo el ajuste se realiza en la función principal renderBracket.

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
  const height = containerHeight; // Límite estricto

  const nodeCalculations: { x: number; y: number; width: number; height: number }[][] = Array(estructura.length).fill(0).map(() => []);
  
  const numRondas = estructura.length;
  const rondaWidth = (width - margin.left - margin.right) / numRondas;
  const baseNodeWidth = 110;

  // --- INICIO DE LA LÓGICA CORREGIDA ---

  // 1. Escala de visibilidad moderada
  const totalRoundsInTournament = Math.log2(estructura[0].length * 2) || numRondas;
  const visibilityScale = Math.max(1, (totalRoundsInTournament / numRondas));

  // 2. Cálculo de la primera ronda, restringido por la altura del contenedor
  if (estructura.length > 0) {
    const firstRonda = estructura[0];
    const nodosEnRonda = firstRonda.length;

    // El espacio vertical disponible por nodo es el límite principal
    const espacioVertical = (height - margin.top - margin.bottom) / nodosEnRonda;

    // La altura del nodo es un 80% del espacio disponible, con un tamaño base que escala moderadamente
    const nodeHeight = Math.min(espacioVertical * 0.8, 45 * visibilityScale);
    const nodeWidth = Math.min(rondaWidth - 20, baseNodeWidth * visibilityScale);

    firstRonda.forEach((_, nodoIndex) => {
      // Distribuir nodos uniformemente en el espacio disponible
      const y = margin.top + (nodoIndex * espacioVertical) + (espacioVertical / 2);
      const x = margin.left + (rondaWidth - nodeWidth) / 2;
      nodeCalculations[0][nodoIndex] = { x, y, width: nodeWidth, height: nodeHeight };
    });
  }

  // 3. Cálculo de rondas subsecuentes con topes de tamaño
  for (let i = 1; i < estructura.length; i++) {
    const scaleFactor = visibilityScale * (1 + i * 0.15); // Escalado por ronda moderado
    
    // Se añade un tope máximo al tamaño para evitar que los nodos finales sean excesivamente grandes
    const nodeHeight = Math.min(90, 45 * scaleFactor); 
    const nodeWidth = Math.min(rondaWidth - 20, baseNodeWidth * scaleFactor);

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
  // --- FIN DE LA LÓGICA CORREGIDA ---

  // El resto del código (dibujado) permanece igual
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

  estructura.forEach((ronda, rondaIndex) => {
    ronda.forEach((nodo, nodoIndex) => {
      const { x, y, width, height } = nodeCalculations[rondaIndex][nodoIndex];
      const scaleFactor = visibilityScale * (1 + rondaIndex * 0.15);

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
        renderCompactFinalNode(svg, nodo, x, y, width, height, scaleFactor);
      } else {
        renderCompactRegularNode(svg, nodo, x, y, width, height, rondaOriginalIndex, scaleFactor);
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
  scaleFactor: number
): void => {
    svg.append("line")
        .attr("x1", x + 5).attr("y1", y)
        .attr("x2", x + nodeWidth - 5).attr("y2", y)
        .style("stroke", "#e5e7eb").style("stroke-width", 1);
    
    const baseFontSize = Math.min(9 * scaleFactor, nodeHeight * 0.25);
    const maxChars = Math.floor(nodeWidth / (baseFontSize * 0.7));

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
            .style("font-size", `${baseFontSize}px`).style("font-weight", avanzo1 ? "600" : "400").style("fill", avanzo1 ? "#15803d" : "#1e40af")
            .text(truncateName(jugador1.nombre, maxChars));
        if (jugador1.nombreAcompanante) {
            svg.append("text")
                .attr("x", x + 4).attr("y", y - nodeHeight * 0.05 + 2)
                .style("font-size", `${baseFontSize * 0.9}px`).style("fill", "#4b5563")
                .text(truncateName(`+ ${jugador1.nombreAcompanante}`, maxChars));
        }
    } else {
        svg.append("text").attr("x", x + 4).attr("y", y - 6).style("font-size", `${8 * scaleFactor}px`).style("fill", "#9ca3af").text("---");
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
            .style("font-size", `${baseFontSize}px`).style("font-weight", avanzo2 ? "600" : "400").style("fill", avanzo2 ? "#15803d" : "#1e40af")
            .text(truncateName(jugador2.nombre, maxChars));
        if (jugador2.nombreAcompanante) {
            svg.append("text")
                .attr("x", x + 4).attr("y", y + nodeHeight * 0.45 - 2)
                .style("font-size", `${baseFontSize * 0.9}px`).style("fill", "#4b5563")
                .text(truncateName(`+ ${jugador2.nombreAcompanante}`, maxChars));
        }
    } else {
        svg.append("text").attr("x", x + 4).attr("y", y + 12).style("font-size", `${8 * scaleFactor}px`).style("fill", "#9ca3af").text("---");
    }
};

const truncateName = (name: string, maxLength: number): string => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 2) + '..';
};