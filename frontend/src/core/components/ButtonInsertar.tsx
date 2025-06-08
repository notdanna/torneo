import * as React from 'react';
import './ButtonsConfirm.css';

interface ButtonInsertarProps {
 onInsertar: () => void;
 disabled?: boolean;
}

const ButtonInsertar: React.FC<ButtonInsertarProps> = ({  disabled = false }) => {
 return (
   <button
     className="button-confirm"
     disabled={disabled}
   >
     Agregar
   </button>
 );
};

export default ButtonInsertar;