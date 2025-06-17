import * as React from 'react';
import { useState } from 'react';
import  FormularioJugador  from '../../../../src/features/pages/SearchPage/AgregarJugador/FormularioJugador';
import { ConfirmacionJugador } from '../../../../src/features/pages/SearchPage/AgregarJugador/ConfirmacionJugador';
import { useJugadorForm } from '../../../../src/core/hooks/useJugadorForm';
import './AgregarJugador.css';

interface JugadorCompleto {
  nombre: string;
  empresa: string;
  nivel: number;
}

interface ButtonAgregarJugadorProps {
  onAgregar?: (jugador: JugadorCompleto) => void;
  disabled?: boolean;
  nombreInicial?: string;
}

const ButtonAgregarJugador: React.FC<ButtonAgregarJugadorProps> = ({ 
  onAgregar, 
  disabled = false,
  nombreInicial = ''
}) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  
  const {
    datos,
    errores,
    cargando,
    validarFormulario,
    resetearFormulario,
    actualizarDatos,
    procesarJugador
  } = useJugadorForm(nombreInicial);

  const abrirModal = () => {
    if (!disabled) {
      setMostrarModal(true);
      setMostrarConfirmacion(false);
      resetearFormulario();
    }
  };

  const handleCancelar = () => {
    resetearFormulario();
    setMostrarModal(false);
    setMostrarConfirmacion(false);
  };

  const handleContinuar = () => {
    if (validarFormulario()) {
      setMostrarConfirmacion(true);
    }
  };

  const handleConfirmarAgregar = async () => {
    const resultado = await procesarJugador();
    if (resultado.exito) {
      onAgregar?.(resultado.jugador);
      handleCancelar();
    }
  };

  const volverAEditar = () => {
    setMostrarConfirmacion(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancelar();
    }
  };

  return (
    <>
      {/* Botón flotante en la esquina inferior derecha */}
      <button
        className="floating-add-button"
        onClick={abrirModal}
        disabled={disabled}
        title="Agregar nuevo jugador"
        aria-label="Agregar nuevo jugador"
      >
        <svg
          className="plus-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
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
              <FormularioJugador
                datos={datos}
                errores={errores}
                onCancelar={handleCancelar}
                onContinuar={handleContinuar}
                onActualizarDatos={actualizarDatos}
              />
            ) : (
              <ConfirmacionJugador
                datos={datos}
                cargando={cargando}
                onVolver={volverAEditar}
                onConfirmar={handleConfirmarAgregar}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ButtonAgregarJugador;