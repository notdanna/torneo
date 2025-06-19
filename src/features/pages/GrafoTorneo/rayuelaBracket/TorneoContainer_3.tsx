// components/TorneoContainer.tsx
import * as React from 'react';
import { useRef, useEffect } from 'react';
import { useTorneoCompleto } from '../../../../core/hooks/rayuelaGrupos/useTorneoCompleto_3';
import { renderBracket } from '../../../../core/utils/d3Render';

interface TorneoContainerProps {
  className?: string;
  }

export const TorneoContainer43: React.FC<TorneoContainerProps> = ({ className = "" }) => {
  const svgRef = useRef<SVGSVGElement>(null) as React.RefObject<SVGSVGElement>;
  
  const {
    loading,
    error,
    modoVisualizacion,
    estructura,
    rondasVisibles,
    ganadoresArray,
    totalGanadores,
    refreshData,
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
      <div className={`flex items-center justify-center min-h-screen ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
          <p className="text-gray-700 font-medium text-xl">Cargando torneo...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${className}`}>
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-red-800 font-semibold mb-4 text-xl">Error al cargar el torneo</h3>
          <p className="text-red-600 text-sm mb-6">{error}</p>
          <button
            onClick={refreshData}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

// Mostrar ganadores centrados con estilos inline
  if (modoVisualizacion === 'ganadores') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden'
      }}>
        {/* Título principal más compacto */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#92400E',
            marginBottom: '8px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            🏆 ¡Ganadores del Torneo! 🏆
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#B45309'
          }}>
            Felicitaciones a nuestros campeones
          </p>
        </div>
        
        {/* Grid de ganadores */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          flex: 1,
          alignContent: 'center'
        }}>
          {ganadoresArray.map((ganador) => (
            <div key={ganador.id} style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              padding: '16px',
              border: '2px solid #FCD34D'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}>
              {/* Icono de trofeo */}
              <div style={{
                textAlign: 'center',
                fontSize: '32px',
                marginBottom: '8px'
              }}>
                🏆
              </div>
              
              {/* Información del ganador */}
              <div style={{
                textAlign: 'center',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {/* Jugador principal */}
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#1F2937',
                  margin: '0',
                  lineHeight: '1.2'
                }}>
                  {ganador.nombre}
                </h3>
                <p style={{
                  fontSize: '12px',
                  color: '#6B7280',
                  margin: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}>
                  🏢 {ganador.empresa}
                </p>
                
                {/* Acompañante si existe */}
                {ganador.nombreAcompanante && (
                  <div style={{
                    borderTop: '1px solid #E5E7EB',
                    paddingTop: '8px',
                    marginTop: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      marginBottom: '4px'
                    }}>
                      <span style={{ fontSize: '14px', color: '#10B981' }}>👥</span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '500',
                        color: '#6B7280'
                      }}>
                        Acompañante
                      </span>
                    </div>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      margin: '0',
                      lineHeight: '1.2'
                    }}>
                      {ganador.nombreAcompanante}
                    </h4>
                    {ganador.empresaAcompanante && (
                      <p style={{
                        fontSize: '11px',
                        color: '#6B7280',
                        margin: '0',
                        marginTop: '2px'
                      }}>
                        🏢 {ganador.empresaAcompanante}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Nivel */}
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: '500',
                  backgroundColor: '#DBEAFE',
                  color: '#1E40AF',
                  marginTop: '8px'
                }}>
                  Nivel {ganador.nivel}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Total de ganadores más pequeño */}
        <div style={{
          marginTop: '20px',
          backgroundColor: 'white',
          borderRadius: '9999px',
          padding: '12px 24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>🎯</span>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151',
            margin: 0
          }}>
            Total de ganadores: 
            <span style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#F59E0B',
              marginLeft: '8px'
            }}>
              {totalGanadores}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // Mostrar árbol del torneo
  return (
    <div className={`relative ${className} p-6`}>
      {/* Header con estadísticas */}
      <div className="bg-white border-b border-gray-200 p-4 mb-4">
        <div className="flex flex-col items-center justify-center w-full">
          <h2 className="w-full flex justify-center items-center text-xl font-bold text-green-700 drop-shadow-md gap-2">
            <span className="text-2xl">⚽</span>
            <span className="bg-gradient-to-r from-green-200 via-green-100 to-green-200 px-4 py-1 rounded-lg shadow-md border border-green-300">
              Rayuela : <span className="font-extrabold text-green-800">GRUPO 3</span>
            </span>
            <span className="text-2xl">🏆</span>
          </h2>
          <p className="text-sm text-gray-600 mt-2 text-center w-full">
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

export default TorneoContainer43;