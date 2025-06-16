import * as React from 'react';
import VisualizacionJuegos from './VisualizacionJuegos';
import ContenedorJuego from './ContenedorJuego';

const LayoutJuegosCompleto: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Panel Izquierdo - VisualizacionJuegos */}
      <div style={{
        flex: '1',
        minWidth: '500px',
        maxWidth: '600px',
        borderRight: '2px solid #e5e7eb',
        backgroundColor: '#ffffff'
      }}>
        <VisualizacionJuegos />
      </div>

      {/* Panel Derecho - ContenedorJuego */}
      <div style={{
        flex: '2',
        minWidth: '700px',
        backgroundColor: '#ffffff',
        overflowY: 'auto'
      }}>
        <ContenedorJuego />
      </div>
    </div>
  );
};

export default LayoutJuegosCompleto;