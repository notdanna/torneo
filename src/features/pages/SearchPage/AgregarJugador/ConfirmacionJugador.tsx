import * as React from 'react';

interface DatosJugador {
  nombre: string;
  empresa: string;
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
  return (
    <>
      <div className="modal-header-jugador">
        <h2 className="modal-title-jugador">
          Confirmar datos
        </h2>
        <p className="modal-subtitle-jugador">
          Por favor confirme los datos del nuevo jugador
        </p>
      </div>

      <div className="confirmacion-datos">
        <div className="datos-preview">
          <div className="dato-item">
            <strong>Nombre:</strong> {datos.nombre.trim()}
          </div>
          <div className="dato-item">
            <strong>Empresa:</strong> {datos.empresa.trim()}
          </div>
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
          {cargando ? 'Agregando...' : 'Confirmar y Agregar'}
        </button>
      </div>
    </>
  );
};