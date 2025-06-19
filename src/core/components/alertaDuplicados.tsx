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
  mensaje,
  onCerrar,
  onContinuarAnyway
}) => {
  if (!jugadorDuplicado && jugadoresSimilares.length === 0) {
    return null;
  }

  return (
    <div className="alerta-duplicados-overlay">
      <div className="alerta-duplicados-modal">
        {/* Alerta de duplicado exacto */}
        {jugadorDuplicado && (
          <div className="duplicado-exacto">
            <div className="alerta-header">
              <span className="alerta-icon">🚫</span>
              <h4>Registro Duplicado Detectado</h4>
              <button 
                className="close-button" 
                onClick={onCerrar}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            
            <div className="alerta-content">
              <p className="mensaje-principal">{mensaje}</p>
              
              <div className="jugador-existente">
                <h5>📋 Datos del registro existente:</h5>
                <div className="datos-grid">
                  <div className="dato-item">
                    <span className="dato-label">Nombre:</span>
                    <span className="dato-valor">{jugadorDuplicado.nombre}</span>
                  </div>
                  <div className="dato-item">
                    <span className="dato-label">Empresa:</span>
                    <span className="dato-valor">{jugadorDuplicado.empresa}</span>
                  </div>
                  {jugadorDuplicado.nombreAcompanante && (
                    <div className="dato-item">
                      <span className="dato-label">Acompañante:</span>
                      <span className="dato-valor">{jugadorDuplicado.nombreAcompanante}</span>
                    </div>
                  )}
                  {jugadorDuplicado.empresaAcompanante && (
                    <div className="dato-item">
                      <span className="dato-label">Empresa acompañante:</span>
                      <span className="dato-valor">{jugadorDuplicado.empresaAcompanante}</span>
                    </div>
                  )}
                  <div className="dato-item">
                    <span className="dato-label">Nivel:</span>
                    <span className="dato-valor">{jugadorDuplicado.nivel}</span>
                  </div>
                  <div className="dato-item">
                    <span className="dato-label">ID:</span>
                    <span className="dato-valor badge">{jugadorDuplicado.id}</span>
                  </div>
                </div>
              </div>
              
              <div className="sugerencias">
                <h5>💡 Sugerencias para resolver:</h5>
                <ul>
                  <li>Verifica si es la misma persona</li>
                  <li>Si es diferente, agrega un distintivo al nombre (ej: "Juan Pérez Jr.")</li>
                  <li>Usa el segundo nombre o apellido materno</li>
                  <li>Verifica la escritura exacta de la empresa</li>
                  <li>Considera agregar el área o departamento</li>
                </ul>
              </div>
            </div>
            
            <div className="alerta-actions">
              <button 
                type="button" 
                onClick={onCerrar}
                className="btn-primary"
              >
                ✏️ Corregir Datos
              </button>
            </div>
          </div>
        )}

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
                  <div key={jugador.id || index} className="jugador-similar">
                    <div className="similar-info">
                      <div className="similar-nombre-grupo">
                        <span className="similar-nombre">{jugador.nombre}</span>
                        {jugador.nombreAcompanante && (
                          <span className="similar-acompanante">+ {jugador.nombreAcompanante}</span>
                        )}
                      </div>
                      <span className="similar-empresa">{jugador.empresa}</span>
                    </div>
                    <span className="similar-id">ID: {jugador.id}</span>
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