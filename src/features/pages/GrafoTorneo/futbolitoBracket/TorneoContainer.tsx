// components/TorneoContainer.tsx
import * as React from 'react';
import { useRef, useEffect } from 'react';
import { useTorneoCompleto } from '../../../../core/hooks/futbolitoGrupos/useTorneoCompleto_1';
import { GanadoresDisplay } from '../../../../core/components/GanadoresDisplay';
import { renderBracket } from '../../../../core/utils/d3Render';

interface TorneoContainerProps {
  className?: string;
}

export const TorneoContainer: React.FC<TorneoContainerProps> = ({ className = "" }) => {
  const svgRef = useRef<SVGSVGElement>(null) as React.RefObject<SVGSVGElement>;
  
  const {
    loading,
    error,
    modoVisualizacion,
    estructura,
    rondasVisibles,
    totalGanadores,
    refreshData,
    ultimaActualizacion
  } = useTorneoCompleto();

  // Renderizar el bracket cuando el modo es 'arbol'
  useEffect(() => {
    if (modoVisualizacion === 'arbol' && estructura.length > 0) {
      console.log('🎨 Renderizando bracket del torneo...');
      renderBracket(svgRef, estructura, rondasVisibles);
    }
  }, [modoVisualizacion, estructura, rondasVisibles]);

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Cargando torneo...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="text-red-500 text-4xl mb-2">⚠️</div>
          <h3 className="text-red-800 font-semibold mb-2">Error al cargar el torneo</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Mostrar ganadores
  if (modoVisualizacion === 'ganadores') {
    return (
      <div className={className}>
        <GanadoresDisplay />
        
        {/* Panel de información adicional */}
        <div className="fixed bottom-4 left-4 bg-white/90 backdrop-blur border border-gray-200 rounded-lg p-3 shadow-lg">
          <div className="text-xs text-gray-600">
            <div>💫 Total ganadores: <span className="font-semibold">{totalGanadores}</span></div>
            <div>⏱️ Última actualización: {ultimaActualizacion?.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar árbol del torneo
  return (
    <div className={`relative ${className}`}>
      {/* Header con estadísticas - TÍTULO CENTRADO */}
      <div className="bg-white border-b border-gray-200 p-4 mb-4">
        <div className="w-full flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center w-full">
            ⚽ 🏆 Futbolito : GRUPO 1 🏆 ⚽
          </h2>
          <p className="text-sm text-gray-600 text-center">
            {/* {estadisticasTorneo.partidasCompletadas} de {estadisticasTorneo.partidasCompletadas + estadisticasTorneo.partidasPendientes} partidas completadas */}
          </p>
        </div>
      </div>

      {/* Contenedor del SVG del bracket */}
      <div className="w-full h-[600px] bg-gray-50 border border-gray-200 rounded-lg overflow-auto">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ minWidth: '800px', minHeight: '600px' }}
        />
      </div>

    </div>
  );
};