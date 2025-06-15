import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Building2, Trophy, CheckCircle } from 'lucide-react';
import './VisualizacionJuegos.css';

interface JugadorData {
  id_jugador?: string;
  nombre: string;
  empresa: string;
  nivel?: number;
  activo?: boolean;
}

interface LocationState {
  jugador?: JugadorData;
  from?: string;
}

const VisualizacionJuegos = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const jugador = state?.jugador;
  const from = state?.from;

  const handleVolver = () => {
    if (from === 'search') {
      navigate('/search', { replace: true });
    } else {
      navigate(-1); // Volver a la página anterior
    }
  };

  return (
    <div className="visualizacion-juegos">
      <div className="container">
        {/* Header */}
        <div className="header">
          <button 
            onClick={handleVolver}
            className="btn-volver"
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          
          <h1 className="titulo">
            🎮 Visualización de Juegos
          </h1>
        </div>

        {/* Contenido principal */}
        <div className="contenido">
          <div className="mensaje-bienvenida">
            <h2>Acciones para jugador</h2>
          </div>

          {/* Información del jugador si viene de SearchPage */}
          {jugador && (
            <div className="jugador-seleccionado">
              <div className="card">
                <div className="card-header">
                  <CheckCircle className="icon-success" size={24} />
                  <h3>Jugador seleccionado para agregar al juego</h3>
                </div>
                
                <div className="card-content">
                  <div className="jugador-info">
                    <div className="info-item">
                      <User className="icon" size={18} />
                      <div>
                        <label>Nombre:</label>
                        <span>{jugador.nombre}</span>
                      </div>
                    </div>
                    
                    <div className="info-item">
                      <Building2 className="icon" size={18} />
                      <div>
                        <label>Empresa:</label>
                        <span>{jugador.empresa}</span>
                      </div>
                    </div>
                    
                    {jugador.nivel !== undefined && (
                      <div className="info-item">
                        <Trophy className="icon" size={18} />
                        <div>
                          <label>Nivel:</label>
                          <span>
                            {jugador.nivel === 0 ? 'Nuevo jugador' : `Nivel ${jugador.nivel}`}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {jugador.activo !== undefined && (
                      <div className="info-item">
                        <div className={`status ${jugador.activo ? 'activo' : 'inactivo'}`}>
                          <label>Estado:</label>
                          <span>{jugador.activo ? '✅ Activo' : '❌ Inactivo'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="card-actions">
                  <button className="btn-primary">
                    Confirmar y agregar al juego
                  </button>
                  <button className="btn-secondary" onClick={handleVolver}>
                    Seleccionar otro jugador
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Estado cuando no hay jugador seleccionado */}
          {!jugador && (
            <div className="sin-jugador">
              <div className="info-box">
                <h3>No hay jugador seleccionado</h3>
                <p>Para agregar un jugador al juego, primero debes buscarlo y seleccionarlo desde la página de búsqueda.</p>
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/search')}
                >
                  Ir a búsqueda de jugadores
                </button>
              </div>
            </div>
          )}

        
        </div>
      </div>
    </div>
  );
};

export default VisualizacionJuegos;