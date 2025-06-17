// BracketTiempoReal.tsx
import * as React from 'react';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useFirebaseData } from '../../../core/hooks/useFirebaseDataGrafo';
import { crearEstructuraCompleta } from '../../../core/utils/torneoUtils';
import { renderBracket } from '../../../core/utils/d3Render';


const BracketTiempoReal: React.FC = () => {
  const {
    partidas,
    nivelesJugadores,
    loading,
    error,
    ultimaActualizacion
  } = useFirebaseData();
  
  const svgRef = useRef<SVGSVGElement>(null);

  // Dibujar bracket con D3
  useEffect(() => {
    if (!svgRef.current || partidas.length === 0) {
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        
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
      }
      return;
    }

    const estructura = crearEstructuraCompleta(partidas, nivelesJugadores);
    renderBracket(svgRef, estructura);
  }, [partidas, nivelesJugadores]);

  if (loading) {
    return <div style={{ padding: '20px' }}>Cargando árbol por niveles...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>🌳 Árbol de Torneo por Niveles</h2>
      <p><strong>Total partidas:</strong> {partidas.length}</p>
      {ultimaActualizacion && (
        <p><strong>Última actualización:</strong> {ultimaActualizacion.toLocaleString()}</p>
      )}
      
      
      <div style={{
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#f9fafb',
        overflow: 'auto'
      }}>
        <svg ref={svgRef}></svg>
      </div>

     
    </div>
  );
};

export default BracketTiempoReal;