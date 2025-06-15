import * as React from 'react';
import './ButtonEdit.css';

interface ButtonEditarJugadorProps {
  onEditar: () => void;
  disabled?: boolean;
}

const ButtonEditarJugador: React.FC<ButtonEditarJugadorProps> = ({ onEditar, disabled = false }) => {
  return (
    <button
      className="button-edit"
      disabled={disabled}
      onClick={onEditar}
    >
      Editar
    </button>
  );
};

export default ButtonEditarJugador;