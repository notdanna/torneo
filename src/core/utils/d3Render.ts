// utils/d3RendererCompact.ts
import * as d3 from 'd3';
import { NodoTorneo } from '../models/grafos';

export const renderBracket = (
  svgRef: React.RefObject<SVGSVGElement>, 
  estructura: NodoTorneo[][]
): void => {
  if (!svgRef.current || estructura.length === 0) return;

  console.log('🎨 Dibujando árbol compacto con D3');

  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove();

  // Obtener el ancho del contenedor padre (100% de la pantalla)
  const containerWidth = svgRef.current.parentElement?.clientWidth || window.innerWidth;
  
  // Dimensiones adaptativas
  const maxPartidas = Math.max(...estructura.map(ronda => ronda.length));
  const margin = 20;
  
  // Calcular ancho de ronda basado en el espacio disponible
  const availableWidth = containerWidth - (margin * 2);
  const rondaWidth = availableWidth / estructura.length;
  
  const nodeHeight = 40;
  const verticalSpacing = 50;
  
  const width = containerWidth; // 100% del ancho disponible
  const height = maxPartidas * verticalSpacing + (margin * 2);
  
  svg.attr("width", width).attr("height", height);

  console.log('📊 Estructura compacta:', estructura);
  console.log('📐 Ancho contenedor:', containerWidth, 'Ancho por ronda:', rondaWidth);

  estructura.forEach((ronda, rondaIndex) => {
    const x = margin + (rondaIndex * rondaWidth);
    const nodosEnRonda = ronda.length;
    const espacioVertical = Math.max(verticalSpacing, (height - 2 * margin) / nodosEnRonda);

    // Título de ronda compacto
    const tituloRonda = rondaIndex === 0 ? 'R1' :
                       rondaIndex === estructura.length - 1 ? '🏆' :
                       rondaIndex === estructura.length - 2 ? 'F' :
                       nodosEnRonda === 2 ? 'SF' :
                       nodosEnRonda === 4 ? 'QF' :
                       nodosEnRonda === 8 ? 'R16' :
                       `R${rondaIndex + 1}`;

    svg.append("text")
      .attr("x", x + rondaWidth / 2)
      .attr("y", 12)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .style("fill", "#1f2937")
      .text(tituloRonda);

    ronda.forEach((nodo, nodoIndex) => {
      const y = margin + (nodoIndex * espacioVertical) + (espacioVertical / 2);

      // Rectángulo del nodo ajustado al nuevo ancho
      const nodeWidth = Math.max(rondaWidth - 40, 80); // Mínimo de 80px
      svg.append("rect")
        .attr("x", x + (rondaWidth - nodeWidth) / 2) // Centrar el nodo
        .attr("y", y - nodeHeight/2)
        .attr("width", nodeWidth)
        .attr("height", nodeHeight)
        .attr("rx", 4)
        .style("fill", "#ffffff")
        .style("stroke", "#e5e7eb")
        .style("stroke-width", 1);

      // Renderizar contenido según tipo de nodo
      const nodeX = x + (rondaWidth - nodeWidth) / 2;
      if (rondaIndex === estructura.length - 1) {
        renderCompactFinalNode(svg, nodo, nodeX, y, nodeWidth, nodeHeight);
      } else {
        renderCompactRegularNode(svg, nodo, nodeX, y, nodeWidth, nodeHeight, rondaIndex);
      }

      // Conexiones compactas
      if (rondaIndex < estructura.length - 1) {
        renderCompactConnections(svg, estructura, rondaIndex, nodoIndex, x, y, rondaWidth, margin, height, nodeWidth);
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
  nodeHeight: number
): void => {
  const ganador = nodo.jugador1 || nodo.jugador2;
  if (ganador) {
    // Fondo dorado para el ganador
    svg.append("rect")
      .attr("x", x + 2)
      .attr("y", y - nodeHeight/2 + 2)
      .attr("width", nodeWidth - 4)
      .attr("height", nodeHeight - 4)
      .attr("rx", 4)
      .style("fill", "#fef3c7")
      .style("stroke", "#f59e0b")
      .style("stroke-width", 2);

    // Corona y nombre
    svg.append("text")
      .attr("x", x + nodeWidth/2)
      .attr("y", y - 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("👑");

    const maxChars = Math.floor(nodeWidth / 8); // Ajustar caracteres según ancho
    svg.append("text")
      .attr("x", x + nodeWidth/2)
      .attr("y", y + 10)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("fill", "#92400e")
      .text(truncateName(ganador.nombre, maxChars));
  } else {
    svg.append("text")
      .attr("x", x + nodeWidth/2)
      .attr("y", y + 3)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "#9ca3af")
      .text("...");
  }
};

const renderCompactRegularNode = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  nodo: NodoTorneo,
  x: number,
  y: number,
  nodeWidth: number,
  nodeHeight: number,
  rondaIndex: number
): void => {
  // Línea divisoria central
  svg.append("line")
    .attr("x1", x + 5)
    .attr("y1", y)
    .attr("x2", x + nodeWidth - 5)
    .attr("y2", y)
    .style("stroke", "#e5e7eb")
    .style("stroke-width", 1);

  const maxChars = Math.floor(nodeWidth / 10); // Ajustar caracteres según ancho

  // Jugador 1 (arriba)
  if (nodo.jugador1) {
    const avanzo1 = nodo.jugador1.nivel > rondaIndex;
    
    if (avanzo1) {
      svg.append("rect")
        .attr("x", x + 2)
        .attr("y", y - nodeHeight/2 + 2)
        .attr("width", nodeWidth - 4)
        .attr("height", nodeHeight/2 - 3)
        .attr("rx", 2)
        .style("fill", "#dcfce7")
        .style("stroke", "none");
    }

    svg.append("text")
      .attr("x", x + 4)
      .attr("y", y - 6)
      .style("font-size", "9px")
      .style("font-weight", avanzo1 ? "600" : "400")
      .style("fill", avanzo1 ? "#15803d" : "#1e40af")
      .text(truncateName(nodo.jugador1.nombre, maxChars));

    svg.append("text")
      .attr("x", x + nodeWidth - 15)
      .attr("y", y - 6)
      .style("font-size", "8px")
      .style("fill", "#6b7280")
      .text(`L${nodo.jugador1.nivel}`);
  } else {
    svg.append("text")
      .attr("x", x + 4)
      .attr("y", y - 6)
      .style("font-size", "8px")
      .style("fill", "#9ca3af")
      .text("---");
  }

  // Jugador 2 (abajo)
  if (nodo.jugador2) {
    const avanzo2 = nodo.jugador2.nivel > rondaIndex;
    
    if (avanzo2) {
      svg.append("rect")
        .attr("x", x + 2)
        .attr("y", y + 1)
        .attr("width", nodeWidth - 4)
        .attr("height", nodeHeight/2 - 3)
        .attr("rx", 2)
        .style("fill", "#dcfce7")
        .style("stroke", "none");
    }

    svg.append("text")
      .attr("x", x + 4)
      .attr("y", y + 12)
      .style("font-size", "9px")
      .style("font-weight", avanzo2 ? "600" : "400")
      .style("fill", avanzo2 ? "#15803d" : "#1e40af")
      .text(truncateName(nodo.jugador2.nombre, maxChars));

    svg.append("text")
      .attr("x", x + nodeWidth - 15)
      .attr("y", y + 12)
      .style("font-size", "8px")
      .style("fill", "#6b7280")
      .text(`L${nodo.jugador2.nivel}`);
  } else {
    svg.append("text")
      .attr("x", x + 4)
      .attr("y", y + 12)
      .style("font-size", "8px")
      .style("fill", "#9ca3af")
      .text("---");
  }
};

const renderCompactConnections = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  estructura: NodoTorneo[][],
  rondaIndex: number,
  nodoIndex: number,
  x: number,
  y: number,
  rondaWidth: number,
  margin: number,
  height: number,
  nodeWidth: number
): void => {
  const siguienteRonda = estructura[rondaIndex + 1];
  const targetNodoIndex = Math.floor(nodoIndex / 2);
  
  if (targetNodoIndex < siguienteRonda.length) {
    const nextX = x + rondaWidth;
    const nextEspacioVertical = Math.max(50, (height - 2 * margin) / siguienteRonda.length);
    const targetY = margin + (targetNodoIndex * nextEspacioVertical) + (nextEspacioVertical / 2);

    // Calcular posición del borde del nodo actual
    const nodeRightEdge = x + (rondaWidth - nodeWidth) / 2 + nodeWidth;
    const connectionLength = rondaWidth - nodeWidth - 20; // Espacio para conexión

    // Línea horizontal
    svg.append("line")
      .attr("x1", nodeRightEdge)
      .attr("y1", y)
      .attr("x2", nodeRightEdge + connectionLength / 2)
      .attr("y2", y)
      .style("stroke", "#d1d5db")
      .style("stroke-width", 1);

    // Conexión en pares
    if (nodoIndex % 2 === 1) {
      const espacioVertical = Math.max(50, (height - 2 * margin) / estructura[rondaIndex].length);
      const prevY = margin + ((nodoIndex - 1) * espacioVertical) + (espacioVertical / 2);
      
      const connectionX = nodeRightEdge + connectionLength / 2;
      
      // Línea vertical
      svg.append("line")
        .attr("x1", connectionX)
        .attr("y1", prevY)
        .attr("x2", connectionX)
        .attr("y2", y)
        .style("stroke", "#d1d5db")
        .style("stroke-width", 1);

      // Línea hacia el siguiente nodo
      const nextNodeWidth = Math.max(rondaWidth - 40, 80);
      const nextNodeX = nextX + (rondaWidth - nextNodeWidth) / 2;
      
      svg.append("line")
        .attr("x1", connectionX)
        .attr("y1", (prevY + y) / 2)
        .attr("x2", nextNodeX)
        .attr("y2", targetY)
        .style("stroke", "#d1d5db")
        .style("stroke-width", 1);
    }
  }
};

// Función auxiliar para truncar nombres largos
const truncateName = (name: string, maxLength: number): string => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 2) + '..';
};