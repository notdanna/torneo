import * as React from 'react';
import { useState } from 'react';
import './ButtonsConfirm.css';
import './ButtonAgregarJugador.css';

interface ButtonAgregarJugadorProps {
  onAgregar?: (jugador: { nombre: string; empresa: string }) => void;
  disabled?: boolean;
  nombreInicial?: string;
}

const ButtonAgregarJugador: React.FC<ButtonAgregarJugadorProps> = ({ 
  onAgregar, 
  disabled = false,
  nombreInicial = ''
}) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nombre, setNombre] = useState(nombreInicial);
  const [empresa, setEmpresa] = useState('');
  const [errores, setErrores] = useState<{nombre?: string; empresa?: string}>({});
  const [cargando, setCargando] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const validarFormulario = (): boolean => {
    const nuevosErrores: {nombre?: string; empresa?: string} = {};

    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    } else if (nombre.trim().length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!empresa.trim()) {
      nuevosErrores.empresa = 'La empresa es requerida';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleContinuar = () => {
    if (validarFormulario()) {
      setMostrarConfirmacion(true);
    }
  };

  const handleConfirmarAgregar = async () => {
    setCargando(true);

    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));

      const nuevoJugador = { 
        nombre: nombre.trim(), 
        empresa: empresa.trim() 
      };

      // Llamar al callback si existe
      onAgregar?.(nuevoJugador);

      console.log('Jugador agregado:', nuevoJugador);

     
      // Cerrar modal y limpiar todo
      setMostrarModal(false);
      setMostrarConfirmacion(false);
      setNombre('');
      setEmpresa('');
      setErrores({});

    } catch (error) {
      console.error('Error al agregar jugador:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleCancelar = () => {
    setNombre(nombreInicial);
    setEmpresa('');
    setErrores({});
    setMostrarModal(false);
    setMostrarConfirmacion(false);
  };

  const abrirModal = () => {
    if (!disabled) {
      setMostrarModal(true);
      setMostrarConfirmacion(false);
      setNombre(nombreInicial);
      setEmpresa('');
      setErrores({});
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancelar();
    }
  };

  const volverAEditar = () => {
    setMostrarConfirmacion(false);
  };

  return (
    <>
      <button
        className="button-confirm-agregar"
        onClick={abrirModal}
        disabled={disabled}
      >
        Agregar Nuevo Jugador
      </button>

      {mostrarModal && (
        <div 
          className="modal-overlay-jugador"
          onClick={handleCancelar}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div 
            className="modal-container-jugador"
            onClick={(e) => e.stopPropagation()}
          >
            {!mostrarConfirmacion ? (
              // Formulario de captura de datos
              <>
                <div className="modal-header-jugador">
                  <h2 className="modal-title-jugador">
                    Agregar Nuevo Jugador
                  </h2>
                  <p className="modal-subtitle-jugador">
                    Complete los datos del jugador
                  </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleContinuar(); }}>
                  {/* Campo Nombre */}
                  <div className="form-group-jugador">
                    <label htmlFor="nombre" className="form-label-jugador">
                      Nombre del jugador *
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      value={nombre}
                      onChange={(e) => {
                        setNombre(e.target.value);
                        if (errores.nombre) {
                          setErrores(prev => ({ ...prev, nombre: undefined }));
                        }
                      }}
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
                      value={empresa}
                      onChange={(e) => {
                        setEmpresa(e.target.value);
                        if (errores.empresa) {
                          setErrores(prev => ({ ...prev, empresa: undefined }));
                        }
                      }}
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
                      onClick={handleCancelar}
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
            ) : (
              // Modal de confirmación
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
                      <strong>Nombre:</strong> {nombre.trim()}
                    </div>
                    <div className="dato-item">
                      <strong>Empresa:</strong> {empresa.trim()}
                    </div>
                  </div>
                </div>

                <div className="form-buttons-jugador">
                  <button
                    type="button"
                    onClick={volverAEditar}
                    disabled={cargando}
                    className="btn-jugador btn-secondary-jugador"
                  >
                    Volver a editar
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleConfirmarAgregar}
                    disabled={cargando}
                    className="btn-jugador btn-success-jugador"
                  >
                    {cargando && <span className="loading-spinner-jugador"></span>}
                    {cargando ? 'Agregando...' : 'Confirmar y Agregar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ButtonAgregarJugador;