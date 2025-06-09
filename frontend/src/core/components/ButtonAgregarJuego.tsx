import * as React from 'react';
import './ButtonsConfirm.css';

interface ButtonAgregarJuegoProps {
 onAgregarJuego: () => void;
 disabled?: boolean;
}

const ButtonAgregarJuego: React.FC<ButtonAgregarJuegoProps> = ({ onAgregarJuego, disabled = false }) => {
 return (
   <button
     className="button-confirm"
     disabled={disabled}
   >
     Agregar a juego
   </button>
 );
};

export default ButtonAgregarJuego;