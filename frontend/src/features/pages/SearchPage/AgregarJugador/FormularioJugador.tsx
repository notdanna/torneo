import * as React from 'react';

interface DatosJugador {
  nombre: string;
  empresa: string;
}

interface ErroresJugador {
  nombre?: string;
  empresa?: string;
}

interface FormularioJugadorProps {
  datos: DatosJugador;
  errores: ErroresJugador;
  onCancelar: () => void;
  onContinuar: () => void;
  onActualizarDatos: (campo: keyof DatosJugador, valor: string) => void;
}

export const FormularioJugador: React.FC<FormularioJugadorProps> = ({
  datos,
  errores,
  onCancelar,
  onContinuar,
  onActualizarDatos
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinuar();
  };

  return (
    <>
      <div className="modal-header-jugador">
        <h2 className="modal-title-jugador">
          Agregar Nuevo Jugador
        </h2>
        <p className="modal-subtitle-jugador">
          Complete los datos del jugador
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Campo Nombre */}
        <div className="form-group-jugador">
          <label htmlFor="nombre" className="form-label-jugador">
            Nombre del jugador *
          </label>
          <input
            id="nombre"
            type="text"
            value={datos.nombre}
            onChange={(e) => onActualizarDatos('nombre', e.target.value)}
            placeholder="Ingrese el nombre del jugador"
            className={`form-input-jugador ${errores.nombre ? 'error' : ''}`}
            autoFocus
          />
          {errores.nombre && (
            <p className="error-message-jugador">
              {errores.nombre}
            </p>
          )}
        </div>

        {/* Campo Empresa */}
        <div className="form-group-jugador">
          <label htmlFor="empresa" className="form-label-jugador">
            Empresa *
          </label>
          <input
            id="empresa"
            type="text"
            value={datos.empresa}
            onChange={(e) => onActualizarDatos('empresa', e.target.value)}
            placeholder="Ingrese la empresa"
            className={`form-input-jugador ${errores.empresa ? 'error' : ''}`}
          />
          {errores.empresa && (
            <p className="error-message-jugador">
              {errores.empresa}
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="form-buttons-jugador">
          <button
            type="button"
            onClick={onCancelar}
            className="btn-jugador btn-secondary-jugador"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className="btn-jugador btn-primary-jugador"
          >
            Continuar
          </button>
        </div>
      </form>
    </>
  );
};