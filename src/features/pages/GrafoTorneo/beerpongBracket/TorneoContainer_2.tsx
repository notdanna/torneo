// components/TorneoContainer.tsx
import * as React from 'react';
import { useRef, useEffect } from 'react';
import { useTorneoCompleto } from '../../../../core/hooks/beerpongGrupos/useTorneoCompleto_2';
import { renderBracket } from '../../../../core/utils/d3Render';

interface TorneoContainerProps {
  className?: string;
  }

export const TorneoContainer32: React.FC<TorneoContainerProps> = ({ className = "" }) => {
  const svgRef = useRef<SVGSVGElement>(null) as React.RefObject<SVGSVGElement>;
  // Hook para obtener los datos del torneo completo
  const {
    loading,
    error,
    modoVisualizacion,
    estructura,
    rondasVisibles,
    ganadoresArray,
    totalGanadores,
    estadisticasTorneo,
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
        justifyContent: 'center',
        padding: '32px',
        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {/* Título principal */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#92400E',
            marginBottom: '16px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            🏆 ¡Ganadores del Torneo! 🏆
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#B45309'
          }}>
            Felicitaciones a nuestros campeones
          </p>
        </div>
        
        {/* Contenedor de ganadores */}
        <div style={{
          width: '100%',
          maxWidth: '800px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {ganadoresArray.map((ganador, index) => (
            <div key={ganador.id} style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              display: 'flex',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            }}>
              {/* Sección de posición */}
              <div style={{
                background: index === 0 ? 'linear-gradient(135deg, #FCD34D, #F59E0B)' : 
                           index === 1 ? 'linear-gradient(135deg, #E5E7EB, #9CA3AF)' :
                           index === 2 ? 'linear-gradient(135deg, #FDBA74, #F97316)' :
                           'linear-gradient(135deg, #93C5FD, #3B82F6)',
                padding: '24px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '150px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
                  }}>
                    #{index + 1}
                  </div>
                </div>
              </div>
              
              {/* Información del ganador */}
              <div style={{
                flex: 1,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {/* Jugador principal */}
                <div>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#1F2937',
                    margin: '0 0 8px 0'
                  }}>
                    {ganador.nombre}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#6B7280',
                    margin: '0 0 8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🏢 {ganador.empresa}
                  </p>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: '#DBEAFE',
                    color: '#1E40AF'
                  }}>
                    Nivel {ganador.nivel}
                  </span>
                </div>
                
                {/* Acompañante si existe */}
                {ganador.nombreAcompanante && (
                  <div style={{
                    borderTop: '1px solid #E5E7EB',
                    paddingTop: '16px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '18px', color: '#10B981' }}>👥</span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#6B7280'
                      }}>
                        Acompañante
                      </span>
                    </div>
                    <h4 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#374151',
                      margin: '0 0 4px 0'
                    }}>
                      {ganador.nombreAcompanante}
                    </h4>
                    {ganador.empresaAcompanante && (
                      <p style={{
                        fontSize: '16px',
                        color: '#6B7280',
                        margin: '0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        🏢 {ganador.empresaAcompanante}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Total de ganadores */}
        <div style={{
          marginTop: '48px',
          backgroundColor: 'white',
          borderRadius: '9999px',
          padding: '16px 32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>🎯</span>
          <p style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#374151',
            margin: 0
          }}>
            Total de ganadores: 
            <span style={{
              fontSize: '28px',
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
              Futbolito : <span className="font-extrabold text-green-800">GRUPO 1</span>
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

export default TorneoContainer32;