import * as React from 'react';

interface DatosJugador {
  nombre: string;
  nombreAcompanante: string;
  empresa: string;
  empresaAcompanante: string;
  nivel: number;
}

interface ConfirmacionJugadorProps {
  datos: DatosJugador;
  cargando: boolean;
  onVolver: () => void;
  onConfirmar: () => void;
}

export const ConfirmacionJugador: React.FC<ConfirmacionJugadorProps> = ({
  datos,
  cargando,
  onVolver,
  onConfirmar
}) => {
  const getNivelTexto = (nivel: number): string => {
    if (nivel === 0) return 'Nuevo jugador (Sin clasificar)';
    switch (nivel) {
      case 1: return 'Principiante';
      case 2: return 'Básico';
      case 3: return 'Básico+';
      case 4: return 'Intermedio';
      case 5: return 'Intermedio+';
      case 6: return 'Avanzado';
      case 7: return 'Avanzado+';
      case 8: return 'Experto';
      case 9: return 'Profesional';
      case 10: return 'Maestro';
      default: return 'Sin clasificar';
    }
  };

  return (
    <>
      <div className="modal-header-jugador">
        <h2 className="modal-title-jugador">
          Confirmar datos de la pareja
        </h2>
        <p className="modal-subtitle-jugador">
          Por favor confirme los datos de ambos jugadores
        </p>
      </div>

      <div className="confirmacion-datos">
        <div className="datos-preview">
          
          {/* DATOS JUGADOR PRINCIPAL */}
          <div className="seccion-confirmacion">
            <h4 className="titulo-confirmacion">👤 Jugador Principal</h4>
            <div className="dato-item">
              <strong>Nombre:</strong> {datos.nombre.trim()}
            </div>
            <div className="dato-item">
              <strong>Empresa:</strong> {datos.empresa.trim()}
            </div>
          </div>

          {/* SEPARADOR */}
          <div className="separador"></div>

          {/* DATOS ACOMPAÑANTE */}
          <div className="seccion-confirmacion">
            <h4 className="titulo-confirmacion">👥 Acompañante</h4>
            <div className="dato-item">
              <strong>Nombre:</strong> {datos.nombreAcompanante.trim()}
            </div>
            <div className="dato-item">
              <strong>Empresa:</strong> {datos.empresaAcompanante.trim()}
            </div>
          </div>

          {/* SEPARADOR */}
          <div className="separador"></div>

          {/* INFORMACIÓN DE LA PAREJA */}
          <div className="seccion-confirmacion">
            <h4 className="titulo-confirmacion">🎯 Información de la Pareja</h4>
            <div className="dato-item">
              <strong>Nivel:</strong> {datos.nivel} - {getNivelTexto(datos.nivel)}
            </div>
            <div className="dato-item">
              <strong>Estado:</strong> Activa
            </div>
            <div className="dato-item">
              <strong>Clasificación:</strong> Pareja nueva en el torneo
            </div>
          </div>
        </div>

        <div className="info-adicional">
          <p className="info-text">
            La pareja será agregada como <strong>activa</strong> al sistema y estará disponible para participar en los juegos.
          </p>
        </div>
      </div>

      <div className="form-buttons-jugador">
        <button
          type="button"
          onClick={onVolver}
          disabled={cargando}
          className="btn-jugador btn-secondary-jugador"
        >
          Volver a editar
        </button>
        
        <button
          type="button"
          onClick={onConfirmar}
          disabled={cargando}
          className="btn-jugador btn-success-jugador"
        >
          {cargando && <span className="loading-spinner-jugador"></span>}
          {cargando ? 'Agregando pareja...' : 'Confirmar y Agregar Pareja'}
        </button>
      </div>
    </>
  );
};