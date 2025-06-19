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

    // Gradiente dorado para el ganador
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "winner-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .style("stop-color", "#fbbf24")
      .style("stop-opacity", 1);
    
    gradient.append("stop")
      .attr("offset", "100%")
      .style("stop-color", "#f59e0b")
      .style("stop-opacity", 1);

    // Sombra para el nodo ganador
    const filter = defs.append("filter")
      .attr("id", "winner-shadow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");

    filter.append("feDropShadow")
      .attr("dx", "3")
      .attr("dy", "3")
      .attr("stdDeviation", "4")
      .attr("flood-color", "#f9e58d")
      .attr("flood-opacity", "0.3");
  
    const winnerRect = svg.append("rect")
      .attr("x", x)
      .attr("y", y)
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("rx", 20)
      .style("fill", "url(#winner-gradient)")
      .style("stroke", "#d97706")
      .style("stroke-width", 5)
      .style("filter", "url(#winner-shadow)")
      .style("opacity", 0);

    // Animación de aparición del ganador
    winnerRect.transition()
      .duration(800)
      .ease(d3.easeBackOut)
      .style("opacity", 1)
      .attr("transform", "scale(1)")
      .style("stroke-width", 3);

    // Corona con animación
    const crown = svg.append("text")
      .attr("x", x + nodeWidth / 2)
      .attr("y", y + nodeHeight * 0.3)
      .attr("text-anchor", "middle")
      .style("font-size", `${nodeHeight * 0.25}px`)
      .style("opacity", 0)
      .text("👑");

    crown.transition()
      .delay(400)
      .duration(600)
      .ease(d3.easeBounceOut)
      .style("opacity", 1)
      .attr("transform", "scale(1.2)")
      .transition()
      .duration(300)
      .attr("transform", "scale(1)");

    const fontSize = Math.min(nodeHeight * 0.15, nodeWidth / (ganador.nombre.length * 0.6));
    const winnerText = svg.append("text")
      .attr("x", x + nodeWidth / 2)
      .attr("y", y + nodeHeight * 0.55)
      .attr("text-anchor", "middle")
      .style("font-size", `${fontSize}px`)
      .style("font-weight", "bold")
      .style("fill", "#92400e")
      .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.2)")
      .style("opacity", 0)
      .text(ganador.nombre);

    winnerText.transition()
      .delay(600)
      .duration(500)
      .style("opacity", 1);

    if ((ganador as any).nombreAcompanante) {
      const companionFontSize = fontSize * 0.8;
      const companionText = svg.append("text")
        .attr("x", x + nodeWidth / 2)
        .attr("y", y + nodeHeight * 0.75)
        .attr("text-anchor", "middle")
        .style("font-size", `${companionFontSize}px`)
        .style("fill", "#92400e")
        .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.2)")
        .style("opacity", 0)
        .text(`+ ${(ganador as any).nombreAcompanante}`);

      companionText.transition()
        .delay(800)
        .duration(500)
        .style("opacity", 1);
    }
};

// Función auxiliar para animar la salida de elementos
const animateElementExit = (
  element: d3.Selection<any, any, any, any>,
  direction: 'left' | 'right' = 'left',
  delay: number = 0
): Promise<void> => {
  return new Promise((resolve) => {
    const moveDistance = direction === 'left' ? -100 : 100;
    
    element
      .transition()
      .delay(delay)
      .duration(400)
      .ease(d3.easeQuadIn)
      .style("opacity", 0)
      .attr("transform", `translate(${moveDistance}, 0) scale(0.9)`)
      .on("end", () => resolve());
  });
};

// Función auxiliar para animar la entrada de elementos
const animateElementEnter = (
  element: d3.Selection<any, any, any, any>,
  direction: 'left' | 'right' = 'right',
  delay: number = 0
): void => {
  const moveDistance = direction === 'left' ? -50 : 50;
  
  element
    .style("opacity", 0)
    .attr("transform", `translate(${moveDistance}, 0) scale(0.8)`)
    .transition()
    .delay(delay)
    .duration(600)
    .ease(d3.easeBackOut)
    .style("opacity", 1)
    .attr("transform", "translate(0, 0) scale(1)");
};

export const renderBracket = (
  svgRef: React.RefObject<SVGSVGElement>,
  estructura: NodoTorneo[][],
  rondasVisibles?: number[]
): void => {
  if (!svgRef.current || estructura.length === 0) return;

  const svg = d3.select(svgRef.current);
  
  // Verificar si es la primera renderización
  const isFirstRender = svg.selectAll("*").empty();
  
  // Si no es la primera renderización, animar la salida de elementos existentes
  if (!isFirstRender) {
    const existingElements = svg.selectAll(".node, .connections");
    
    if (!existingElements.empty()) {
      // Animar salida de conexiones primero
      const connections = svg.selectAll(".connections");
      const nodes = svg.selectAll(".node");
      
      Promise.all([
        animateElementExit(connections, 'left', 0),
        animateElementExit(nodes, 'right', 100)
      ]).then(() => {
        // Una vez que terminan las animaciones de salida, limpiar y renderizar nuevo contenido
        svg.selectAll("*").remove();
        renderNewContent();
      });
      
      return;
    }
  }
  
  // Si es primera renderización o no hay elementos existentes, renderizar directamente
  svg.selectAll("*").remove();
  renderNewContent();

  function renderNewContent() {
    const container = svgRef.current?.parentElement;
    if (!container) return;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    svg.attr("width", containerWidth).attr("height", containerHeight);

    // Definir gradientes y filtros globales
    const defs = svg.append("defs");
    
    // Gradiente para conexiones activas
    const connectionGradient = defs.append("linearGradient")
      .attr("id", "connection-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "0%");
    
    connectionGradient.append("stop")
      .attr("offset", "0%")
      .style("stop-color", "#3b82f6")
      .style("stop-opacity", 0.8);
    
    connectionGradient.append("stop")
      .attr("offset", "100%")
      .style("stop-color", "#1d4ed8")
      .style("stop-opacity", 0.6);

    // Gradiente para nodos normales
    const nodeGradient = defs.append("linearGradient")
      .attr("id", "node-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    
    nodeGradient.append("stop")
      .attr("offset", "0%")
      .style("stop-color", "#ffffff")
      .style("stop-opacity", 1);
    
    nodeGradient.append("stop")
      .attr("offset", "100%")
      .style("stop-color", "#f8fafc")
      .style("stop-opacity", 1);

    // Gradiente para jugadores que avanzan
    const advancedGradient = defs.append("linearGradient")
      .attr("id", "advanced-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    
    advancedGradient.append("stop")
      .attr("offset", "0%")
      .style("stop-color", "#d1fae5")
      .style("stop-opacity", 1);
    
    advancedGradient.append("stop")
      .attr("offset", "100%")
      .style("stop-color", "#a7f3d0")
      .style("stop-opacity", 1);

    // Sombra sutil para nodos
    const nodeShadow = defs.append("filter")
      .attr("id", "node-shadow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");

    nodeShadow.append("feDropShadow")
      .attr("dx", "2")
      .attr("dy", "2")
      .attr("stdDeviation", "3")
      .attr("flood-color", "#64748b")
      .attr("flood-opacity", "0.15");

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
    const baseFontSize = 9 * growthFactor;
    
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

    // --- DIBUJO DE CONEXIONES CON ANIMACIÓN ---
    const connectionGroup = svg.append("g").attr("class", "connections");
    
    for (let i = 0; i < nodeCalculations.length - 1; i++) {
      for (let j = 0; j < nodeCalculations[i].length; j++) {
        if (j % 2 === 1) { 
            const source1 = nodeCalculations[i][j - 1];
            const source2 = nodeCalculations[i][j];
            const target = nodeCalculations[i + 1][Math.floor(j / 2)];
            
            if (!source1 || !source2 || !target) continue;

            const midPointX = source1.x + source1.width + rondaWidth / 4;
            
            // Crear el path completo para la conexión
            const pathData = `
              M ${source1.x + source1.width} ${source1.y}
              L ${midPointX} ${source1.y}
              L ${midPointX} ${source2.y}
              L ${source2.x + source2.width} ${source2.y}
              M ${midPointX} ${target.y}
              L ${target.x} ${target.y}
            `;

            // Líneas de conexión con gradiente y animación
            const connectionPath = connectionGroup.append("path")
              .attr("d", pathData)
              .style("stroke", "url(#connection-gradient)")
              .style("stroke-width", 2.5)
              .style("fill", "none")
              .style("opacity", 0.7);

            // Animar entrada de conexiones
            if (isFirstRender) {
              const pathLength = connectionPath.node()?.getTotalLength() || 0;
              connectionPath
                .style("stroke-dasharray", pathLength + " " + pathLength)
                .style("stroke-dashoffset", pathLength)
                .transition()
                .delay(i * 200 + j * 50)
                .duration(800)
                .ease(d3.easeQuadInOut)
                .style("stroke-dashoffset", 0);
            } else {
              // Si no es primera renderización, usar animación de entrada estándar
              animateElementEnter(d3.select(connectionPath.node()), 'left', i * 50 + j * 25);
            }

            // Añadir línea vertical principal con efecto pulsante
            const verticalLine = connectionGroup.append("line")
              .attr("x1", midPointX)
              .attr("y1", source1.y)
              .attr("x2", midPointX)
              .attr("y2", source2.y)
              .style("stroke", "#1e40af")
              .style("stroke-width", 3)
              .style("opacity", 0.4);

            verticalLine.append("animate")
              .attr("attributeName", "opacity")
              .attr("values", "0.4;0.8;0.4")
              .attr("dur", "2s")
              .attr("repeatCount", "indefinite");

            if (!isFirstRender) {
              animateElementEnter(d3.select(verticalLine.node()), 'left', i * 50 + j * 25);
            }

            // Línea horizontal hacia el target
            const horizontalLine = connectionGroup.append("line")
              .attr("x1", midPointX)
              .attr("y1", target.y)
              .attr("x2", target.x)
              .attr("y2", target.y)
              .style("stroke", "url(#connection-gradient)")
              .style("stroke-width", 2.5)
              .style("opacity", 0.7);

            if (!isFirstRender) {
              animateElementEnter(d3.select(horizontalLine.node()), 'left', i * 50 + j * 25);
            }
        }
      }
    }

    // --- DIBUJO DE NODOS CON TRANSICIONES ---
    estructura.forEach((ronda, rondaIndex) => {
      ronda.forEach((nodo, nodoIndex) => {
        const { x, y, width, height } = nodeCalculations[rondaIndex][nodoIndex];
        
        // Factor de escala para el texto basado en el crecimiento
        const textScaleFactor = growthFactor * (1 + rondaIndex * 0.15);

        const nodeGroup = svg.append("g").attr("class", "node");

        const nodeRect = nodeGroup.append("rect")
          .attr("x", x)
          .attr("y", y - height / 2)
          .attr("width", width)
          .attr("height", height)
          .attr("rx", 8)
          .style("fill", "url(#node-gradient)")
          .style("stroke", "#cbd5e1")
          .style("stroke-width", 1.5)
          .style("filter", "url(#node-shadow)");

        // Aplicar animaciones de entrada
        if (isFirstRender) {
          nodeRect
            .style("opacity", 0)
            .style("transform", "scale(0.8)")
            .transition()
            .delay((rondaIndex * 100) + (nodoIndex * 50))
            .duration(600)
            .ease(d3.easeBackOut)
            .style("opacity", 1)
            .style("transform", "scale(1)");
        } else {
          // Usar nueva animación de entrada para cambios de ronda
          animateElementEnter(nodeGroup, 'right', rondaIndex * 100 + nodoIndex * 50);
        }

        // Hover effect (siempre activo)
        nodeRect
          .on("mouseenter", function() {
            d3.select(this)
              .transition()
              .duration(200)
              .style("stroke", "#3b82f6")
              .style("stroke-width", 2.5)
              .style("transform", "scale(1.02)");
          })
          .on("mouseleave", function() {
            d3.select(this)
              .transition()
              .duration(200)
              .style("stroke", "#cbd5e1")
              .style("stroke-width", 1.5)
              .style("transform", "scale(1)");
          });

        const rondaOriginalIndex = rondasVisibles ? rondasVisibles[rondaIndex] : rondaIndex;
        if (rondaIndex === estructura.length - 1) {
          renderCompactFinalNode(nodeGroup, nodo, x, y, width, height, textScaleFactor, isFirstRender, rondaIndex, nodoIndex);
        } else {
          renderCompactRegularNode(nodeGroup, nodo, x, y, width, height, rondaOriginalIndex, baseFontSize, isFirstRender, rondaIndex, nodoIndex);
        }
      });
    });
  }
};

const renderCompactFinalNode = (
  nodeGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodo: NodoTorneo,
  x: number,
  y: number,
  nodeWidth: number,
  nodeHeight: number,
  scaleFactor: number,
  isFirstRender: boolean,
  rondaIndex: number,
  nodoIndex: number
): void => {
    const ganador = nodo.jugador1 || nodo.jugador2;
    if (ganador) {
        const finalRect = nodeGroup.append("rect")
            .attr("x", x + 2).attr("y", y - nodeHeight / 2 + 2)
            .attr("width", nodeWidth - 4).attr("height", nodeHeight - 4)
            .attr("rx", 6).style("fill", "#fef3c7").style("stroke", "#f59e0b").style("stroke-width", 2.5);

        const crown = nodeGroup.append("text")
            .attr("x", x + nodeWidth / 2).attr("y", y - nodeHeight * 0.1)
            .attr("text-anchor", "middle").style("font-size", `${Math.min(14 * scaleFactor, nodeHeight * 0.3)}px`).text("👑");

        const fontSize = Math.min(11 * scaleFactor, nodeHeight * 0.22);
        const maxChars = Math.floor(nodeWidth / (fontSize * 0.6));

        const nameText = nodeGroup.append("text")
            .attr("x", x + nodeWidth / 2)
            .attr("y", y + nodeHeight * 0.15)
            .attr("text-anchor", "middle")
            .style("font-size", `${fontSize}px`)
            .style("font-weight", "bold")
            .style("fill", "#92400e")
            .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.1)")
            .text(truncateName(`ID: ${ganador.id_jugador} : ${ganador.nombre}`, maxChars));

        if (isFirstRender) {
          finalRect.style("opacity", 0).transition().delay((rondaIndex * 100) + (nodoIndex * 50) + 200).duration(500).style("opacity", 1);
          crown.style("opacity", 0).transition().delay((rondaIndex * 100) + (nodoIndex * 50) + 400).duration(500).style("opacity", 1);
          nameText.style("opacity", 0).transition().delay((rondaIndex * 100) + (nodoIndex * 50) + 600).duration(500).style("opacity", 1);
        }

        if ((ganador as any).nombreAcompanante) {
            const companionText = nodeGroup.append("text")
                .attr("x", x + nodeWidth / 2).attr("y", y + nodeHeight * 0.40)
                .attr("text-anchor", "middle").style("font-size", `${fontSize * 0.9}px`).style("fill", "#92400e")
                .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.1)")
                .text(truncateName(`+ ${(ganador as any).nombreAcompanante}`, maxChars));

            if (isFirstRender) {
              companionText.style("opacity", 0).transition().delay((rondaIndex * 100) + (nodoIndex * 50) + 800).duration(500).style("opacity", 1);
            }
        }
    } else {
        const pendingText = nodeGroup.append("text")
            .attr("x", x + nodeWidth / 2).attr("y", y + 3)
            .attr("text-anchor", "middle").style("font-size", "10px").style("fill", "#9ca3af").text("...");

        if (isFirstRender) {
          pendingText.style("opacity", 0).transition().delay((rondaIndex * 100) + (nodoIndex * 50) + 200).duration(500).style("opacity", 1);
        }
    }
};

const renderCompactRegularNode = (
  nodeGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodo: NodoTorneo,
  x: number,
  y: number,
  nodeWidth: number,
  nodeHeight: number,
  rondaOriginalIndex: number,
  baseFontSize: number,
  isFirstRender: boolean,
  rondaIndex: number,
  nodoIndex: number
): void => {
    const dividerLine = nodeGroup.append("line")
        .attr("x1", x + 5).attr("y1", y)
        .attr("x2", x + nodeWidth - 5).attr("y2", y)
        .style("stroke", "#e2e8f0").style("stroke-width", 1.5);
    
    const fontSize = Math.min(baseFontSize, nodeHeight * 0.25);
    const maxChars = Math.floor(nodeWidth / (fontSize * 0.7));

    if (isFirstRender) {
      dividerLine.style("opacity", 0).transition().delay((rondaIndex * 100) + (nodoIndex * 50) + 300).duration(400).style("opacity", 1);
    }

    const jugador1 = nodo.jugador1 as (Jugador & { nombreAcompanante?: string }) | null;
    if (jugador1) {
        const avanzo1 = jugador1.nivel > rondaOriginalIndex;
        if (avanzo1) {
            const advancedRect1 = nodeGroup.append("rect")
                .attr("x", x + 2).attr("y", y - nodeHeight / 2 + 2)
                .attr("width", nodeWidth - 4).attr("height", nodeHeight / 2 - 3)
                .attr("rx", 4).style("fill", "url(#advanced-gradient)")
                .style("stroke", "#10b981").style("stroke-width", 1);

            if (isFirstRender) {
              advancedRect1.style("opacity", 0).transition().delay((rondaIndex * 100) + (nodoIndex * 50) + 400).duration(500).style("opacity", 1);
            }
        }
        
        const player1Text = nodeGroup.append("text")
            .attr("x", x + 6)
            .attr("y", y - nodeHeight * 0.18 + 2)
            .style("font-size", `${fontSize}px`)
            .style("font-weight", avanzo1 ? "600" : "500")
            .style("fill", avanzo1 ? "#047857" : "#1e40af")
            .style("text-shadow", "0.5px 0.5px 1px rgba(0,0,0,0.1)")
            .text(truncateName(`ID: ${jugador1.id_jugador} : ${jugador1.nombre}`, maxChars));

        if (isFirstRender) {
          player1Text.style("opacity", 0).transition().delay((rondaIndex * 100) + (nodoIndex * 50) + 500).duration(400).style("opacity", 1);
        }

        if (jugador1.nombreAcompanante) {
            const companion1Text = nodeGroup.append("text")
                .attr("x", x + 6).attr("y", y - nodeHeight * 0.05 + 2)
                .style("font-size", `${fontSize * 0.85}px`).style("fill", "#64748b")
                .style("text-shadow", "0.5px 0.5px 1px rgba(0,0,0,0.1)")
                .text(truncateName(`+ ${jugador1.nombreAcompanante}`, maxChars));

            if (isFirstRender) {
              companion1Text.style("opacity", 0).transition().delay((rondaIndex * 100) + (nodoIndex * 50) + 600).duration(400).style("opacity", 1);
            }
        }
    } else {
        const emptyText1 = nodeGroup.append("text").attr("x", x + 6).attr("y", y - 6)
            .style("font-size", `${fontSize * 0.9}px`).style("fill", "#94a3b8").text("---");

        if (isFirstRender) {
          emptyText1.style("opacity", 0).transition().delay((rondaIndex * 100) + (nodoIndex * 50) + 500).duration(400).style("opacity", 1);
        }
    }

    const jugador2 = nodo.jugador2 as (Jugador & { nombreAcompanante?: string }) | null;
    if (jugador2) {
        const avanzo2 = jugador2.nivel > rondaOriginalIndex;
        if (avanzo2) {
            const advancedRect2 = nodeGroup.append("rect")
                .attr("x", x + 2).attr("y", y + 1)
                .attr("width", nodeWidth - 4).attr("height", nodeHeight / 2 - 3)
                .attr("rx", 4).style("fill", "url(#advanced-gradient)")
                .style("stroke", "#10b981").style("stroke-width", 1);

            if (isFirstRender) {
              advancedRect2.style("opacity", 0).transition().delay((rondaIndex * 100) + (nodoIndex * 50) + 400).duration(500).style("opacity", 1);
            }
        }
        
        const player2Text = nodeGroup.append("text")
            .attr("x", x + 6)
            .attr("y", y + nodeHeight * 0.32 - 2)
            .style("font-size", `${fontSize}px`)
            .style("font-weight", avanzo2 ? "600" : "500")
            .style("fill", avanzo2 ? "#047857" : "#1e40af")
            .style("text-shadow", "0.5px 0.5px 1px rgba(0,0,0,0.1)")
            .text(truncateName(`ID: ${jugador2.id_jugador} : ${jugador2.nombre}`, maxChars));

        if (isFirstRender) {
          player2Text.style("opacity", 0).transition().delay((rondaIndex * 100) + (nodoIndex * 50) + 700).duration(400).style("opacity", 1);
        }

        if (jugador2.nombreAcompanante) {
            const companion2Text = nodeGroup.append("text")
                .attr("x", x + 6).attr("y", y + nodeHeight * 0.45 - 2)
                .style("font-size", `${fontSize * 0.85}px`).style("fill", "#64748b")
                .style("text-shadow", "0.5px 0.5px 1px rgba(0,0,0,0.1)")
                .text(truncateName(`+ ${jugador2.nombreAcompanante}`, maxChars));

            if (isFirstRender) {
              companion2Text.style("opacity", 0).transition().delay((rondaIndex * 100) + (nodoIndex * 50) + 800).duration(400).style("opacity", 1);
            }
        }
    } else {
        const emptyText2 = nodeGroup.append("text").attr("x", x + 6).attr("y", y + 14)
            .style("font-size", `${fontSize * 0.9}px`).style("fill", "#94a3b8").text("---");

        if (isFirstRender) {
          emptyText2.style("opacity", 0).transition().delay((rondaIndex * 100) + (nodoIndex * 50) + 700).duration(400).style("opacity", 1);
        }
    }
};

const truncateName = (name: string, maxLength: number): string => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 2) + '..';
};