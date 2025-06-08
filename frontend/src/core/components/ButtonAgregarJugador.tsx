import * as React from 'react';
import './ButtonsConfirm.css';
interface ButtonAgregarJugadorProps {
 onInsertar: () => void;
 disabled?: boolean;
}

const ButtonAgregarJugador: React.FC<ButtonAgregarJugadorProps> = ({  disabled = false }) => {
 return (
   <button
     className="button-confirm"
     disabled={disabled}
   >
     Agregar Jugador
   </button>
 );
};

export default ButtonAgregarJugador;