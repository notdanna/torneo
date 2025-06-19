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

    // Animación de entrada dramática para el ganador
    const winnerGroup = svg.append("g")
      .attr("opacity", 0)
      .attr("transform", `scale(0.3) translate(${x * 2}, ${y * 2})`);

    // Fondo del ganador con pulso
    const winnerRect = winnerGroup.append("rect")
      .attr("x", x)
      .attr("y", y)
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("rx", 20)
      .style("fill", "#fef3c7")
      .style("stroke", "#f59e0b")
      .style("stroke-width", 4)
      .style("filter", "drop-shadow(0 10px 25px rgba(245, 158, 11, 0.4))");

    // Corona con animación de rebote
    const crown = winnerGroup.append("text")
      .attr("x", x + nodeWidth / 2)
      .attr("y", y + nodeHeight * 0.3)
      .attr("text-anchor", "middle")
      .style("font-size", `${nodeHeight * 0.25}px`)
      .text("👑");

    // Nombre del ganador
    const fontSize = Math.min(nodeHeight * 0.15, nodeWidth / (ganador.nombre.length * 0.6));
    const winnerName = winnerGroup.append("text")
      .attr("x", x + nodeWidth / 2)
      .attr("y", y + nodeHeight * 0.55)
      .attr("text-anchor", "middle")
      .style("font-size", `${fontSize}px`)
      .style("font-weight", "bold")
      .style("fill", "#92400e")
      .text(ganador.nombre);

    // Acompañante si existe
    if ((ganador as any).nombreAcompanante) {
      const companionFontSize = fontSize * 0.8;
      winnerGroup.append("text")
        .attr("x", x + nodeWidth / 2)
        .attr("y", y + nodeHeight * 0.75)
        .attr("text-anchor", "middle")
        .style("font-size", `${companionFontSize}px`)
        .style("fill", "#92400e")
        .text(`+ ${(ganador as any).nombreAcompanante}`);
    }

    // Animación de entrada épica
    winnerGroup
      .transition()
      .duration(1200)
      .ease(d3.easeElastic.amplitude(1).period(0.5))
      .attr("opacity", 1)
      .attr("transform", "scale(1) translate(0, 0)");

    // Efecto de pulso continuo en el fondo
    winnerRect
      .transition()
      .delay(1200)
      .duration(2000)
      .ease(d3.easeSinInOut)
      .style("filter", "drop-shadow(0 15px 35px rgba(245, 158, 11, 0.6))")
      .transition()
      .duration(2000)
      .ease(d3.easeSinInOut)
      .style("filter", "drop-shadow(0 10px 25px rgba(245, 158, 11, 0.4))")
      .on("end", function repeat() {
        d3.select(this)
          .transition()
          .duration(2000)
          .ease(d3.easeSinInOut)
          .style("filter", "drop-shadow(0 15px 35px rgba(245, 158, 11, 0.6))")
          .transition()
          .duration(2000)
          .ease(d3.easeSinInOut)
          .style("filter", "drop-shadow(0 10px 25px rgba(245, 158, 11, 0.4))")
          .on("end", repeat);
      });

    // Animación de rebote en la corona
    crown
      .transition()
      .delay(1500)
      .duration(600)
      .ease(d3.easeBounceOut)
      .attr("y", y + nodeHeight * 0.25)
      .transition()
      .duration(400)
      .ease(d3.easeQuadOut)
      .attr("y", y + nodeHeight * 0.3);

    // Partículas de celebración
    createCelebrationParticles(svg, x + nodeWidth / 2, y + nodeHeight / 2, 15);
};

// Nueva función para crear partículas de celebración
const createCelebrationParticles = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  centerX: number,
  centerY: number,
  count: number
): void => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: centerX,
    y: centerY,
    angle: (i / count) * Math.PI * 2,
    velocity: 3 + Math.random() * 4,
    size: 3 + Math.random() * 4,
    color: d3.schemeCategory10[i % 10]
  }));

  particles.forEach((particle, i) => {
    const circle = svg.append("circle")
      .attr("cx", particle.x)
      .attr("cy", particle.y)
      .attr("r", 0)
      .style("fill", particle.color)
      .style("opacity", 0.8);

    const endX = particle.x + Math.cos(particle.angle) * particle.velocity * 50;
    const endY = particle.y + Math.sin(particle.angle) * particle.velocity * 50;

    circle
      .transition()
      .delay(1800 + i * 50)
      .duration(100)
      .attr("r", particle.size)
      .transition()
      .duration(1500)
      .ease(d3.easeQuadOut)
      .attr("cx", endX)
      .attr("cy", endY)
      .style("opacity", 0)
      .remove();
  });
};

export const renderBracket = (
  svgRef: React.RefObject<SVGSVGElement>,
  estructura: NodoTorneo[][],
  rondasVisibles?: number[]
): void => {
  if (!svgRef.current || estructura.length === 0) return;

  const svg = d3.select(svgRef.current);
  
  // Transición de salida para elementos existentes
  svg.selectAll("*")
    .transition()
    .duration(300)
    .style("opacity", 0)
    .remove();

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
  
  // --- LÓGICA DE CRECIMIENTO DINÁMICO (mantener la lógica original) ---
  const totalRoundsInTournament = rondasVisibles 
    ? Math.max(...rondasVisibles) + 1 
    : numRondas;
  
  const hiddenRounds = totalRoundsInTournament - numRondas;
  const visibilityRatio = numRondas / totalRoundsInTournament;
  const growthFactor = Math.pow(2 - visibilityRatio, 1.5);
  
  const baseNodeWidth = 110 * growthFactor;
  const baseNodeHeight = 45 * growthFactor;
  const baseFontSize = 9 * growthFactor;
  const verticalSpacingFactor = 0.8 + (0.2 * visibilityRatio);

  // Cálculos de posiciones (mantener lógica original)
  if (estructura.length > 0) {
    const firstRonda = estructura[0];
    const nodosEnRonda = firstRonda.length;
    const espacioVertical = ((height - margin.top - margin.bottom) / nodosEnRonda) * verticalSpacingFactor;
    const nodeHeight = Math.min(espacioVertical * 0.85, baseNodeHeight);
    const nodeWidth = Math.min(rondaWidth - 20, baseNodeWidth);

    firstRonda.forEach((_, nodoIndex) => {
      const totalUsedHeight = nodosEnRonda * espacioVertical;
      const startY = margin.top + (height - margin.top - margin.bottom - totalUsedHeight) / 2;
      const y = startY + (nodoIndex * espacioVertical) + (espacioVertical / 2);
      const x = margin.left + (rondaWidth - nodeWidth) / 2;
      nodeCalculations[0][nodoIndex] = { x, y, width: nodeWidth, height: nodeHeight };
    });
  }

  for (let i = 1; i < estructura.length; i++) {
    const depthFactor = 1 + (i / numRondas) * 0.3;
    const scaleFactor = growthFactor * depthFactor;
    const nodeHeight = Math.min(height * 0.4, baseNodeHeight * depthFactor);
    const nodeWidth = Math.min(rondaWidth - 20, baseNodeWidth * depthFactor);

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

  // --- DIBUJO DE CONEXIONES CON ANIMACIONES DINÁMICAS ---
  const connectionGroup = svg.append("g").attr("class", "connections");
  
  for (let i = 0; i < nodeCalculations.length - 1; i++) {
    for (let j = 0; j < nodeCalculations[i].length; j++) {
      if (j % 2 === 1) { 
        const source1 = nodeCalculations[i][j - 1];
        const source2 = nodeCalculations[i][j];
        const target = nodeCalculations[i + 1][Math.floor(j / 2)];
        
        if (!source1 || !source2 || !target) continue;

        const midPointX = source1.x + source1.width + rondaWidth / 4;
        const connectionDelay = (i * 200) + (j * 100);

        // Crear el grupo de conexión con animación de entrada
        const connectionLines = connectionGroup.append("g")
          .attr("opacity", 0);

        // Líneas de conexión con efectos de trazado animado
        const createAnimatedLine = (x1: number, y1: number, x2: number, y2: number, delay: number = 0) => {
          const line = connectionLines.append("line")
            .attr("x1", x1).attr("y1", y1)
            .attr("x2", x1).attr("y2", y1) // Empezar desde el punto inicial
            .style("stroke", "#d1d5db")
            .style("stroke-width", 2)
            .style("stroke-linecap", "round")
            .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
            .style("stroke-dasharray", "5,5")
            .style("stroke-dashoffset", "10");

          // Animación de trazado
          line
            .transition()
            .delay(connectionDelay + delay)
            .duration(600)
            .ease(d3.easeQuadInOut)
            .attr("x2", x2)
            .attr("y2", y2)
            .style("stroke-dashoffset", "0");

          // Efecto de pulso en hover (agregar después de la animación inicial)
          line
            .transition()
            .delay(connectionDelay + delay + 600)
            .duration(0)
            .style("stroke-dasharray", "none")
            .on("end", function() {
              d3.select(this)
                .on("mouseover", function() {
                  d3.select(this)
                    .transition()
                    .duration(200)
                    .style("stroke", "#3b82f6")
                    .style("stroke-width", 3)
                    .style("filter", "drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3))");
                })
                .on("mouseout", function() {
                  d3.select(this)
                    .transition()
                    .duration(200)
                    .style("stroke", "#d1d5db")
                    .style("stroke-width", 2)
                    .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))");
                });
            });

          return line;
        };

        // Crear las líneas de conexión animadas
        createAnimatedLine(source1.x + source1.width, source1.y, midPointX, source1.y, 0);
        createAnimatedLine(source2.x + source2.width, source2.y, midPointX, source2.y, 100);
        createAnimatedLine(midPointX, source1.y, midPointX, source2.y, 200);
        createAnimatedLine(midPointX, target.y, target.x, target.y, 300);

        // Animación de entrada del grupo
        connectionLines
          .transition()
          .delay(connectionDelay)
          .duration(400)
          .attr("opacity", 1);
      }
    }
  }

  // --- DIBUJO DE NODOS CON ANIMACIONES ESCALONADAS ---
  estructura.forEach((ronda, rondaIndex) => {
    ronda.forEach((nodo, nodoIndex) => {
      const { x, y, width, height } = nodeCalculations[rondaIndex][nodoIndex];
      const nodeDelay = (rondaIndex * 300) + (nodoIndex * 150);
      
      // Crear grupo del nodo con animación de entrada
      const nodeGroup = svg.append("g")
        .attr("opacity", 0)
        .attr("transform", `translate(0, 50) scale(0.8)`);

      const textScaleFactor = growthFactor * (1 + rondaIndex * 0.15);

      // Fondo del nodo con sombra dinámica
      const nodeRect = nodeGroup.append("rect")
        .attr("x", x)
        .attr("y", y - height / 2)
        .attr("width", width)
        .attr("height", height)
        .attr("rx", 6)
        .style("fill", "#ffffff")
        .style("stroke", "#e5e7eb")
        .style("stroke-width", 1.5)
        .style("filter", "drop-shadow(0 2px 8px rgba(0,0,0,0.1))");

      const rondaOriginalIndex = rondasVisibles ? rondasVisibles[rondaIndex] : rondaIndex;
      
      if (rondaIndex === estructura.length - 1) {
        renderAnimatedFinalNode(nodeGroup, nodo, x, y, width, height, textScaleFactor);
      } else {
        renderAnimatedRegularNode(nodeGroup, nodo, x, y, width, height, rondaOriginalIndex, textScaleFactor, baseFontSize);
      }

      // Animación de entrada del nodo
      nodeGroup
        .transition()
        .delay(nodeDelay)
        .duration(600)
        .ease(d3.easeBackOut.overshoot(1.2))
        .attr("opacity", 1)
        .attr("transform", "translate(0, 0) scale(1)");

      // Efectos de hover dinámicos
      nodeGroup
        .on("mouseover", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("transform", "translate(0, -3) scale(1.02)");
          
          nodeRect
            .transition()
            .duration(200)
            .style("filter", "drop-shadow(0 8px 16px rgba(0,0,0,0.15))");
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("transform", "translate(0, 0) scale(1)");
          
          nodeRect
            .transition()
            .duration(200)
            .style("filter", "drop-shadow(0 2px 8px rgba(0,0,0,0.1))");
        });
    });
  });

  // Agregar efectos de fondo dinámicos
  addBackgroundEffects(svg, width, height);
};

// Nueva función para efectos de fondo
const addBackgroundEffects = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  height: number
): void => {
  const defs = svg.append("defs");
  
  // Gradiente animado de fondo
  const gradient = defs.append("linearGradient")
    .attr("id", "backgroundGradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "100%");

  gradient.append("stop")
    .attr("offset", "0%")
    .style("stop-color", "#f8fafc")
    .style("stop-opacity", 0.8);

  gradient.append("stop")
    .attr("offset", "50%")
    .style("stop-color", "#e2e8f0")
    .style("stop-opacity", 0.4);

  gradient.append("stop")
    .attr("offset", "100%")
    .style("stop-color", "#f1f5f9")
    .style("stop-opacity", 0.6);

  // Fondo con el gradiente
  svg.insert("rect", ":first-child")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "url(#backgroundGradient)");

  // Partículas flotantes de fondo
  const numParticles = 12;
  for (let i = 0; i < numParticles; i++) {
    const particle = svg.append("circle")
      .attr("cx", Math.random() * width)
      .attr("cy", Math.random() * height)
      .attr("r", 1 + Math.random() * 2)
      .style("fill", "#cbd5e1")
      .style("opacity", 0.3);

    // Animación flotante continua
    const floatAnimation = () => {
      particle
        .transition()
        .duration(3000 + Math.random() * 2000)
        .ease(d3.easeSinInOut)
        .attr("cx", Math.random() * width)
        .attr("cy", Math.random() * height)
        .style("opacity", 0.1 + Math.random() * 0.3)
        .on("end", floatAnimation);
    };
    
    floatAnimation();
  }
};

const renderAnimatedFinalNode = (
  nodeGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodo: NodoTorneo,
  x: number,
  y: number,
  nodeWidth: number,
  nodeHeight: number,
  scaleFactor: number
): void => {
  const ganador = nodo.jugador1 || nodo.jugador2;
  if (ganador) {
    // Fondo dorado para finalista
    nodeGroup.append("rect")
      .attr("x", x + 2).attr("y", y - nodeHeight / 2 + 2)
      .attr("width", nodeWidth - 4).attr("height", nodeHeight - 4)
      .attr("rx", 4)
      .style("fill", "#fef3c7")
      .style("stroke", "#f59e0b")
      .style("stroke-width", 2)
      .style("filter", "drop-shadow(0 4px 12px rgba(245, 158, 11, 0.3))");

    // Corona animada
    const crown = nodeGroup.append("text")
      .attr("x", x + nodeWidth / 2)
      .attr("y", y - nodeHeight * 0.1)
      .attr("text-anchor", "middle")
      .style("font-size", `${Math.min(14 * scaleFactor, nodeHeight * 0.3)}px`)
      .text("👑")
      .style("opacity", 0);

    crown
      .transition()
      .delay(400)
      .duration(600)
      .ease(d3.easeBounceOut)
      .style("opacity", 1)
      .attr("y", y - nodeHeight * 0.15)
      .transition()
      .duration(300)
      .attr("y", y - nodeHeight * 0.1);

    const fontSize = Math.min(11 * scaleFactor, nodeHeight * 0.22);
    const maxChars = Math.floor(nodeWidth / (fontSize * 0.6));

    // Texto del ganador con efecto de escritura
    const winnerText = nodeGroup.append("text")
      .attr("x", x + nodeWidth / 2)
      .attr("y", y + nodeHeight * 0.15)
      .attr("text-anchor", "middle")
      .style("font-size", `${fontSize}px`)
      .style("font-weight", "bold")
      .style("fill", "#92400e")
      .style("opacity", 0);

    // Efecto de aparición gradual del texto
    winnerText
      .transition()
      .delay(600)
      .duration(800)
      .style("opacity", 1)
      .tween("text", function() {
        const fullText = truncateName(`ID: ${ganador.id_jugador} : ${ganador.nombre}`, maxChars);
        const interpolate = d3.interpolate("", fullText);
        return function(t) {
          this.textContent = interpolate(t);
        };
      });

    if ((ganador as any).nombreAcompanante) {
      const companionText = nodeGroup.append("text")
        .attr("x", x + nodeWidth / 2)
        .attr("y", y + nodeHeight * 0.40)
        .attr("text-anchor", "middle")
        .style("font-size", `${fontSize * 0.9}px`)
        .style("fill", "#92400e")
        .style("opacity", 0);

      companionText
        .transition()
        .delay(1000)
        .duration(600)
        .style("opacity", 1)
        .tween("text", function() {
          const fullText = truncateName(`+ ${(ganador as any).nombreAcompanante}`, maxChars);
          const interpolate = d3.interpolate("", fullText);
          return function(t) {
            this.textContent = interpolate(t);
          };
        });
    }
  } else {
    nodeGroup.append("text")
      .attr("x", x + nodeWidth / 2)
      .attr("y", y + 3)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "#9ca3af")
      .style("opacity", 0)
      .text("...")
      .transition()
      .delay(300)
      .duration(400)
      .style("opacity", 1);
  }
};

const renderAnimatedRegularNode = (
  nodeGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  nodo: NodoTorneo,
  x: number,
  y: number,
  nodeWidth: number,
  nodeHeight: number,
  rondaOriginalIndex: number,
  scaleFactor: number,
  baseFontSize: number
): void => {
  // Línea divisoria
  nodeGroup.append("line")
    .attr("x1", x + 5).attr("y1", y)
    .attr("x2", x + 5).attr("y2", y) // Empezar desde un punto
    .style("stroke", "#e5e7eb")
    .style("stroke-width", 1)
    .transition()
    .delay(200)
    .duration(400)
    .attr("x2", x + nodeWidth - 5);
  
  const fontSize = Math.min(baseFontSize, nodeHeight * 0.25);
  const maxChars = Math.floor(nodeWidth / (fontSize * 0.7));

  // Renderizar jugador 1
  const jugador1 = nodo.jugador1 as (Jugador & { nombreAcompanante?: string }) | null;
  if (jugador1) {
    const avanzo1 = jugador1.nivel > rondaOriginalIndex;
    
    if (avanzo1) {
      const highlight1 = nodeGroup.append("rect")
        .attr("x", x + 2).attr("y", y - nodeHeight / 2 + 2)
        .attr("width", 0).attr("height", nodeHeight / 2 - 3)
        .attr("rx", 2)
        .style("fill", "#dcfce7");

      highlight1
        .transition()
        .delay(300)
        .duration(500)
        .ease(d3.easeQuadOut)
        .attr("width", nodeWidth - 4);
    }

    const player1Text = nodeGroup.append("text")
      .attr("x", x + 4)
      .attr("y", y - nodeHeight * 0.18 + 2)
      .style("font-size", `${fontSize}px`)
      .style("font-weight", avanzo1 ? "600" : "400")
      .style("fill", avanzo1 ? "#15803d" : "#1e40af")
      .style("opacity", 0);

    player1Text
      .transition()
      .delay(400)
      .duration(600)
      .style("opacity", 1)
      .tween("text", function() {
        const fullText = truncateName(`ID: ${jugador1.id_jugador} : ${jugador1.nombre}`, maxChars);
        const interpolate = d3.interpolate("", fullText);
        return function(t) {
          this.textContent = interpolate(t);
        };
      });

    if (jugador1.nombreAcompanante) {
      const companion1Text = nodeGroup.append("text")
        .attr("x", x + 4)
        .attr("y", y - nodeHeight * 0.05 + 2)
        .style("font-size", `${fontSize * 0.9}px`)
        .style("fill", "#4b5563")
        .style("opacity", 0);

      companion1Text
        .transition()
        .delay(600)
        .duration(400)
        .style("opacity", 1)
        .tween("text", function() {
          const fullText = truncateName(`+ ${jugador1.nombreAcompanante}`, maxChars);
          const interpolate = d3.interpolate("", fullText);
          return function(t) {
            this.textContent = interpolate(t);
          };
        });
    }
  } else {
    nodeGroup.append("text")
      .attr("x", x + 4)
      .attr("y", y - 6)
      .style("font-size", `${fontSize * 0.9}px`)
      .style("fill", "#9ca3af")
      .style("opacity", 0)
      .text("---")
      .transition()
      .delay(400)
      .duration(300)
      .style("opacity", 1);
  }

  // Renderizar jugador 2
  const jugador2 = nodo.jugador2 as (Jugador & { nombreAcompanante?: string }) | null;
  if (jugador2) {
    const avanzo2 = jugador2.nivel > rondaOriginalIndex;
    
    if (avanzo2) {
      const highlight2 = nodeGroup.append("rect")
        .attr("x", x + 2).attr("y", y + 1)
        .attr("width", 0).attr("height", nodeHeight / 2 - 3)
        .attr("rx", 2)
        .style("fill", "#dcfce7");

      highlight2
        .transition()
        .delay(500)
        .duration(500)
        .ease(d3.easeQuadOut)
        .attr("width", nodeWidth - 4);
    }

    const player2Text = nodeGroup.append("text")
      .attr("x", x + 4)
      .attr("y", y + nodeHeight * 0.32 - 2)
      .style("font-size", `${fontSize}px`)
      .style("font-weight", avanzo2 ? "600" : "400")
      .style("fill", avanzo2 ? "#15803d" : "#1e40af")
      .style("opacity", 0);

    player2Text
      .transition()
      .delay(600)
      .duration(600)
      .style("opacity", 1)
      .tween("text", function() {
        const fullText = truncateName(`ID: ${jugador2.id_jugador} : ${jugador2.nombre}`, maxChars);
        const interpolate = d3.interpolate("", fullText);
        return function(t) {
          this.textContent = interpolate(t);
        };
      });

    if (jugador2.nombreAcompanante) {
      const companion2Text = nodeGroup.append("text")
        .attr("x", x + 4)
        .attr("y", y + nodeHeight * 0.45 - 2)
        .style("font-size", `${fontSize * 0.9}px`)
        .style("fill", "#4b5563")
        .style("opacity", 0);

      companion2Text
        .transition()
        .delay(800)
        .duration(400)
        .style("opacity", 1)
        .tween("text", function() {
          const fullText = truncateName(`+ ${jugador2.nombreAcompanante}`, maxChars);
          const interpolate = d3.interpolate("", fullText);
          return function(t) {
            this.textContent = interpolate(t);
          };
        });
    }
  } else {
    nodeGroup.append("text")
      .attr("x", x + 4)
      .attr("y", y + 12)
      .style("font-size", `${fontSize * 0.9}px`)
      .style("fill", "#9ca3af")
      .style("opacity", 0)
      .text("---")
      .transition()
      .delay(600)
      .duration(300)
      .style("opacity", 1);
  }

  // Efectos adicionales para jugadores que avanzan
  if (jugador1 && jugador1.nivel > rondaOriginalIndex) {
    addAdvancementEffect(nodeGroup, x + nodeWidth - 10, y - nodeHeight * 0.2, 800);
  }
  if (jugador2 && jugador2.nivel > rondaOriginalIndex) {
    addAdvancementEffect(nodeGroup, x + nodeWidth - 10, y + nodeHeight * 0.2, 1000);
  }
};

// Nueva función para efectos de avance
const addAdvancementEffect = (
  nodeGroup: d3.Selection<SVGGElement, unknown, null, undefined>,
  x: number,
  y: number,
  delay: number
): void => {
  const effect = nodeGroup.append("circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", 0)
    .style("fill", "#10b981")
    .style("opacity", 0.8);

  effect
    .transition()
    .delay(delay)
    .duration(400)
    .attr("r", 4)
    .transition()
    .duration(600)
    .attr("r", 8)
    .style("opacity", 0)
    .remove();

  // Efecto de check mark
  const checkMark = nodeGroup.append("text")
    .attr("x", x)
    .attr("y", y + 2)
    .attr("text-anchor", "middle")
    .style("font-size", "8px")
    .style("fill", "#10b981")
    .style("opacity", 0)
    .text("✓");

  checkMark
    .transition()
    .delay(delay + 200)
    .duration(300)
    .style("opacity", 1)
    .transition()
    .delay(1000)
    .duration(300)
    .style("opacity", 0)
    .remove();
};

// Función mejorada para efectos de pulso en las conexiones
const addConnectionPulse = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  delay: number = 0
): void => {
  const pulse = svg.append("circle")
    .attr("cx", x1)
    .attr("cy", y1)
    .attr("r", 3)
    .style("fill", "#3b82f6")
    .style("opacity", 0.8);

  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const duration = (distance / 200) * 1000; // Velocidad proporcional a la distancia

  pulse
    .transition()
    .delay(delay)
    .duration(duration)
    .ease(d3.easeLinear)
    .attr("cx", x2)
    .attr("cy", y2)
    .transition()
    .duration(200)
    .style("opacity", 0)
    .attr("r", 6)
    .remove();
};

// Función para efectos de entrada más dramáticos
const addDramaticEntrance = (
  element: d3.Selection<any, unknown, null, undefined>,
  delay: number = 0
): void => {
  element
    .attr("transform", "scale(0) rotate(180deg)")
    .style("opacity", 0)
    .transition()
    .delay(delay)
    .duration(800)
    .ease(d3.easeBackOut.overshoot(1.7))
    .attr("transform", "scale(1) rotate(0deg)")
    .style("opacity", 1);
};

// Función para crear ondas de energía
const createEnergyWaves = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  centerX: number,
  centerY: number,
  count: number = 3
): void => {
  for (let i = 0; i < count; i++) {
    const wave = svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 10)
      .style("fill", "none")
      .style("stroke", "#3b82f6")
      .style("stroke-width", 2)
      .style("opacity", 0.6);

    wave
      .transition()
      .delay(i * 300)
      .duration(1500)
      .ease(d3.easeQuadOut)
      .attr("r", 50)
      .style("opacity", 0)
      .remove();
  }
};

// Función para efectos de brillo en texto importante
const addTextGlow = (
  textElement: d3.Selection<SVGTextElement, unknown, null, undefined>,
  glowColor: string = "#fbbf24"
): void => {
  textElement
    .style("filter", `drop-shadow(0 0 6px ${glowColor})`)
    .transition()
    .duration(1000)
    .ease(d3.easeSinInOut)
    .style("filter", `drop-shadow(0 0 12px ${glowColor})`)
    .transition()
    .duration(1000)
    .ease(d3.easeSinInOut)
    .style("filter", `drop-shadow(0 0 6px ${glowColor})`)
    .on("end", function repeat() {
      d3.select(this)
        .transition()
        .duration(1000)
        .ease(d3.easeSinInOut)
        .style("filter", `drop-shadow(0 0 12px ${glowColor})`)
        .transition()
        .duration(1000)
        .ease(d3.easeSinInOut)
        .style("filter", `drop-shadow(0 0 6px ${glowColor})`)
        .on("end", repeat);
    });
};

// Función para crear efectos de confeti
const createConfetti = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  width: number,
  height: number,
  count: number = 20
): void => {
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];
  
  for (let i = 0; i < count; i++) {
    const confetti = svg.append("rect")
      .attr("x", Math.random() * width)
      .attr("y", -10)
      .attr("width", 4 + Math.random() * 4)
      .attr("height", 4 + Math.random() * 4)
      .attr("rx", 1)
      .style("fill", colors[Math.floor(Math.random() * colors.length)])
      .style("opacity", 0.8);

    const fallDuration = 2000 + Math.random() * 1000;
    const sway = (Math.random() - 0.5) * 100;

    confetti
      .transition()
      .delay(Math.random() * 1000)
      .duration(fallDuration)
      .ease(d3.easeQuadIn)
      .attr("y", height + 20)
      .attr("x", function() { 
        return +d3.select(this).attr("x") + sway; 
      })
      .style("opacity", 0)
      .remove();
  }
};

// Función helper mantenida del código original
const truncateName = (name: string, maxLength: number): string => {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength - 2) + '..';
};

// Función para crear efectos de partículas en las conexiones
const addConnectionParticles = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  delay: number = 0
): void => {
  const particleCount = 5;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = svg.append("circle")
      .attr("cx", x1)
      .attr("cy", y1)
      .attr("r", 1 + Math.random())
      .style("fill", "#60a5fa")
      .style("opacity", 0.7);

    const progress = i / (particleCount - 1);
    const particleDelay = delay + (progress * 500);

    particle
      .transition()
      .delay(particleDelay)
      .duration(800)
      .ease(d3.easeQuadOut)
      .attr("cx", x1 + (x2 - x1) * (0.8 + Math.random() * 0.4))
      .attr("cy", y1 + (y2 - y1) * (0.8 + Math.random() * 0.4))
      .style("opacity", 0)
      .remove();
  }
};