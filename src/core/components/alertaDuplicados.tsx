import * as React from 'react';
import { JugadorFirebase } from '../../core/api/Services/jugadorService';

interface AlertaDuplicadosProps {
  jugadorDuplicado?: JugadorFirebase;
  jugadoresSimilares: JugadorFirebase[];
  mensaje?: string;
  onCerrar: () => void;
  onContinuarAnyway?: () => void;
}

const AlertaDuplicados: React.FC<AlertaDuplicadosProps> = ({
  jugadorDuplicado,
  jugadoresSimilares,
  onCerrar,
  onContinuarAnyway
}) => {
  if (!jugadorDuplicado && jugadoresSimilares.length === 0) {
    return null;
  }

  return (
    <div className="alerta-duplicados-overlay">
      <div className="alerta-duplicados-modal">

        {/* Alerta de similares (advertencia) */}
        {!jugadorDuplicado && jugadoresSimilares.length > 0 && (
          <div className="similares-advertencia">
            <div className="alerta-header warning">
              <span className="alerta-icon">⚠️</span>
              <h4>Registros Similares Encontrados</h4>
              <button 
                className="close-button" 
                onClick={onCerrar}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            
            <div className="alerta-content">
              <p>Se encontraron <strong>{jugadoresSimilares.length}</strong> registro(s) similar(es). Por favor verifica que no se trate de duplicados:</p>
              
              <div className="lista-similares">
                {jugadoresSimilares.map((jugador, index) => (
                  <div key={jugador.id_jugador || index} className="jugador-similar">
                    <div className="similar-info">
                      <div className="similar-nombre-grupo">
                        <span className="similar-nombre">{jugador.nombre}</span>
                        {jugador.nombreAcompanante && (
                          <span className="similar-acompanante">+ {jugador.nombreAcompanante}</span>
                        )}
                      </div>
                      <span className="similar-empresa">{jugador.empresa}</span>
                    </div>
                    <span className="similar-id">ID: {jugador.id_jugador}</span>
                  </div>
                ))}
              </div>
              
              <div className="advertencia-nota">
                <p><strong>Nota:</strong> Si confirmas que es una persona diferente, puedes continuar con el registro.</p>
              </div>
            </div>
            
            <div className="alerta-actions">
              <button 
                type="button" 
                onClick={onCerrar}
                className="btn-secondary"
              >
                ✏️ Revisar Datos
              </button>
              {onContinuarAnyway && (
                <button 
                  type="button" 
                  onClick={onContinuarAnyway}
                  className="btn-primary"
                >
                  ✅ Continuar de Todas Formas
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertaDuplicados;