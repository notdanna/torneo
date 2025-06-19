// components/GanadoresDisplay.tsx
import * as React from 'react';
import { useFirebaseGanadores, GanadorInfo } from '../hooks/useFirebaseGanadores_1';

interface GanadoresDisplayProps {
  className?: string;
}

interface GanadorCardProps {
  ganador: { id: string } & GanadorInfo;
  index: number;
}

const GanadorCard: React.FC<GanadorCardProps> = (props: GanadorCardProps) => {
  const { ganador, index } = props;
  return (
    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      {/* Número de posición */}
      <div className="flex items-center justify-between mb-4">
        <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
          {index + 1}
        </div>
        <div className="text-2xl">🏆</div>
      </div>
      
      {/* Información del ganador principal */}
      <div className="mb-3">
        <h3 className="font-bold text-lg text-yellow-800 mb-1">
          {ganador.nombre}
        </h3>
        <p className="text-yellow-700 text-sm font-medium">
          {ganador.empresa}
        </p>
        <div className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold mt-2 inline-block">
          Nivel {ganador.nivel}
        </div>
      </div>
      
      {/* Información del acompañante si existe */}
      {ganador.nombreAcompanante && (
        <div className="border-t border-yellow-300 pt-3">
          <h4 className="font-semibold text-yellow-800 text-sm mb-1">
            + {ganador.nombreAcompanante}
          </h4>
          {ganador.empresaAcompanante && (
            <p className="text-yellow-600 text-xs">
              {ganador.empresaAcompanante}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export const GanadoresDisplay: React.FC<GanadoresDisplayProps> = ({ className = "" }) => {
  const { ganadoresArray, loading, error, totalGanadores } = useFirebaseGanadores();

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-yellow-700 font-medium">Cargando ganadores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-500 text-4xl mb-2">⚠️</div>
          <h3 className="text-red-800 font-semibold mb-2">Error al cargar ganadores</h3>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (totalGanadores === 0) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg p-8">
          <h2 className="text-yellow-800 font-bold text-xl mb-2">🏆¡GANADORES!🏆</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-gradient-to-br from-yellow-25 to-orange-25 min-h-screen ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-4xl font-bold text-yellow-800 mb-2">
          ¡Ganadores del Torneo!
        </h1>
        <p className="text-yellow-700 text-lg">
          Felicitaciones a nuestros {totalGanadores} campeones
        </p>
      </div>

      {/* Grid de ganadores */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ganadoresArray.map((ganador, index) => (
            <GanadorCard
              key={ganador.id}
              ganador={ganador}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Footer con información adicional */}
      <div className="text-center mt-12 text-yellow-600">
        <p className="text-sm">
          Total de ganadores: <span className="font-semibold">{totalGanadores}</span>
        </p>
      </div>
    </div>
  );
};