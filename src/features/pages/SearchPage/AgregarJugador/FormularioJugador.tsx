import * as React from 'react';

interface DatosJugador {
  nombre: string;
  nombreAcompanante: string;
  empresa: string;
  empresaAcompanante: string;
  nivel: number;
}

interface ErroresJugador {
  nombre?: string;
  nombreAcompanante?: string;
  empresa?: string;
  empresaAcompanante?: string;
  nivel?: string;
}

interface FormularioJugadorProps {
  datos: DatosJugador;
  errores: ErroresJugador;
  onCancelar: () => void;
  onContinuar: () => void;
  onActualizarDatos: (campo: keyof DatosJugador, valor: string | number) => void;
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
          Agregar Nueva Pareja
        </h2>
        <p className="modal-subtitle-jugador">
          Complete los datos de ambos jugadores
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* SECCIÓN JUGADOR PRINCIPAL */}
        <div className="seccion-jugador">
          <h3 className="titulo-seccion">👤 Jugador Principal</h3>
          
          {/* Campo Nombre Jugador Principal */}
          <div className="form-group-jugador">
            <label htmlFor="nombre" className="form-label-jugador">
              Nombre del jugador principal *
            </label>
            <input
              id="nombre"
              type="text"
              value={datos.nombre}
              onChange={(e) => onActualizarDatos('nombre', e.target.value)}
              placeholder="Ingrese el nombre del jugador principal"
              className={`form-input-jugador ${errores.nombre ? 'error' : ''}`}
              autoFocus
            />
            {errores.nombre && (
              <p className="error-message-jugador">
                {errores.nombre}
              </p>
            )}
          </div>

          {/* Campo Empresa Jugador Principal */}
          <div className="form-group-jugador">
            <label htmlFor="empresa" className="form-label-jugador">
              Empresa del jugador principal *
            </label>
            <input
              id="empresa"
              type="text"
              value={datos.empresa}
              onChange={(e) => onActualizarDatos('empresa', e.target.value)}
              placeholder="Ingrese la empresa del jugador principal"
              className={`form-input-jugador ${errores.empresa ? 'error' : ''}`}
            />
            {errores.empresa && (
              <p className="error-message-jugador">
                {errores.empresa}
              </p>
            )}
          </div>
        </div>

        {/* SECCIÓN ACOMPAÑANTE */}
        <div className="seccion-jugador">
          <h3 className="titulo-seccion">👥 Acompañante</h3>
          
          {/* Campo Nombre Acompañante */}
          <div className="form-group-jugador">
            <label htmlFor="nombreAcompanante" className="form-label-jugador">
              Nombre del acompañante *
            </label>
            <input
              id="nombreAcompanante"
              type="text"
              value={datos.nombreAcompanante}
              onChange={(e) => onActualizarDatos('nombreAcompanante', e.target.value)}
              placeholder="Ingrese el nombre del acompañante"
              className={`form-input-jugador ${errores.nombreAcompanante ? 'error' : ''}`}
            />
            {errores.nombreAcompanante && (
              <p className="error-message-jugador">
                {errores.nombreAcompanante}
              </p>
            )}
          </div>

          {/* Campo Empresa Acompañante */}
          <div className="form-group-jugador">
            <label htmlFor="empresaAcompanante" className="form-label-jugador">
              Empresa del acompañante *
            </label>
            <input
              id="empresaAcompanante"
              type="text"
              value={datos.empresaAcompanante}
              onChange={(e) => onActualizarDatos('empresaAcompanante', e.target.value)}
              placeholder="Ingrese la empresa del acompañante"
              className={`form-input-jugador ${errores.empresaAcompanante ? 'error' : ''}`}
            />
            {errores.empresaAcompanante && (
              <p className="error-message-jugador">
                {errores.empresaAcompanante}
              </p>
            )}
          </div>
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