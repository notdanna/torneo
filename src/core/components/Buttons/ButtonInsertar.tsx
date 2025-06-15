import * as React from 'react';
import './ButtonsConfirm.css';

interface ButtonInsertarProps {
 onInsertar: () => void;
 disabled?: boolean;
}

const ButtonInsertar: React.FC<ButtonInsertarProps> = ({ onInsertar, disabled = false }) => {
 return (
   <button
     className="button-confirm"
     onClick={onInsertar}
     disabled={disabled}
   >
     Ver juego
   </button>
 );
};

export default ButtonInsertar;