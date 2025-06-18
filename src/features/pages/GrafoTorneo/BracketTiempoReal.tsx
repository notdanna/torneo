// BracketTiempoReal.tsx
import * as React from 'react';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useFirebaseData } from '../../../core/hooks/useFirebaseDataGrafo';
import { crearEstructuraConRondasOcultas } from '../../../core/utils/torneoUtils';
import { renderBracket } from '../../../core/utils/d3Render';

const BracketTiempoReal: React.FC = () => {
  const {
    partidas,
    nivelesJugadores,
    loading,
    error,
    ultimaActualizacion
  } = useFirebaseData();
  
  const svgRef = useRef<SVGSVGElement>(null!);

  // Dibujar bracket con D3 usando la nueva lógica de ocultación
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

    // Usar la nueva función que maneja ocultación de rondas
    const { estructura, rondasVisibles, estructuraCompleta } = crearEstructuraConRondasOcultas(
      partidas, 
      nivelesJugadores
    );
    
    console.log('🎯 Estructura filtrada:', estructura);
    console.log('👁️ Rondas visibles:', rondasVisibles);
    console.log('📊 Estructura completa:', estructuraCompleta);
    
    // Renderizar solo las rondas visibles
    renderBracket(svgRef, estructura, rondasVisibles);
  }, [partidas, nivelesJugadores]);

  if (loading) {
    return <div style={{ padding: '20px' }}>Cargando árbol por niveles...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
  }

  // Calcular estadísticas del progreso del torneo
  const totalJugadores = Object.keys(nivelesJugadores).length;
  const jugadoresConNivel = Object.values(nivelesJugadores).filter(nivel => nivel > 0).length;
  const porcentajeProgreso = totalJugadores > 0 ? (jugadoresConNivel / totalJugadores) * 100 : 0;

  // Calcular rondas completadas
  const rondasCompletadas = Math.max(...Object.values(nivelesJugadores));

  return (
    <div style={{ padding: '20px' }}>
      <h2>🌳 Árbol de Torneo por Niveles</h2>
      
      {/* Panel de información del torneo */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          padding: '10px 15px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px',
          border: '1px solid #d1d5db'
        }}>
          <strong>Total partidas:</strong> {partidas.length}
        </div>
        
        <div style={{
          padding: '10px 15px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px',
          border: '1px solid #d1d5db'
        }}>
          <strong>Jugadores activos:</strong> {totalJugadores}
        </div>
        
        <div style={{
          padding: '10px 15px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px',
          border: '1px solid #d1d5db'
        }}>
          <strong>Progreso:</strong> {porcentajeProgreso.toFixed(1)}%
        </div>
        
        <div style={{
          padding: '10px 15px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px',
          border: '1px solid #d1d5db'
        }}>
          <strong>Ronda máxima:</strong> {rondasCompletadas}
        </div>
        
        {ultimaActualizacion && (
          <div style={{
            padding: '10px 15px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            border: '1px solid #d1d5db'
          }}>
            <strong>Última actualización:</strong> {ultimaActualizacion.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Indicador de rondas ocultas */}
      {partidas.length > 0 && (
        <div style={{
          padding: '10px 15px',
          backgroundColor: '#fef3c7',
          borderRadius: '6px',
          border: '1px solid #f59e0b',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '12px', color: '#92400e' }}>
            <strong>📋 Sistema de ocultación activo:</strong> Las rondas se ocultan automáticamente cuando ≥50% de los jugadores avanzan al siguiente nivel
          </div>
        </div>
      )}
      
      {/* Bracket del torneo */}
      <div style={{
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#f9fafb',
        overflow: 'auto'
      }}>
        <svg ref={svgRef}></svg>
      </div>

      {/* Panel de debug (opcional - se puede remover en producción) */}
      {process.env.NODE_ENV === 'development' && (
        <details style={{ marginTop: '20px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            🔧 Debug Info (Development)
          </summary>
          <div style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <div><strong>Niveles de jugadores:</strong></div>
            <pre>{JSON.stringify(nivelesJugadores, null, 2)}</pre>
          </div>
        </details>
      )}
    </div>
  );
};

export default BracketTiempoReal;