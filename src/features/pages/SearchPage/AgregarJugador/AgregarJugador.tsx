import * as React from 'react';
import { useState } from 'react';
import { FormularioJugador } from './FormularioJugador';
import { ConfirmacionJugador } from './ConfirmacionJugador';
import { useJugadorForm } from '../../../../core/hooks/useJugadorForm';
import './AgregarJugador.css';

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