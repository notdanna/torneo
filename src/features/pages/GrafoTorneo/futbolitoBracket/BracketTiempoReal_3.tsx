// src/features/pages/GrafoTorneo/BracketTiempoReal.tsx
import * as React from 'react';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useFirebaseData } from '../../../../core/hooks/futbolitoGrupos/useFirebaseDataGrafo_3';
import { crearEstructuraConRondasOcultas } from '../../../../core/utils/torneoUtils';
import { renderBracket } from '../../../../core/utils/d3Render';

const BracketTiempoReal13: React.FC = () => {
  const {
    partidas,
    nivelesJugadores,
    loading,
    error,
  } = useFirebaseData();
  
  const svgRef = useRef<SVGSVGElement>(null!);

  // Effect to draw the bracket with D3
  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Clear SVG during loading, on error, or if there's no data
    if (loading || error || !svgRef.current || partidas.length === 0) {
      svg.selectAll("*").remove();
      return;
    }

    // Create the structure for the bracket, hiding rounds if necessary
    const { estructura, rondasVisibles } = crearEstructuraConRondasOcultas(
      partidas, 
      nivelesJugadores
    );
    
    // Render only the visible rounds of the bracket
    renderBracket(svgRef, estructura, rondasVisibles);
  }, [partidas, nivelesJugadores, loading, error]);

  // The component now only renders the title and the SVG container for the bracket.
  return (
    <div style={{ height: 'calc(100vh - 40px)', width: '100%', padding: '20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      {/* <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Futbolito: 1</h1> */}

      {/* The container for the D3 bracket */}
      <div style={{
        flex: 1,
        width: '100%',
        position: 'relative'
      }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
      </div>
    </div>
  );
};

export default BracketTiempoReal13;