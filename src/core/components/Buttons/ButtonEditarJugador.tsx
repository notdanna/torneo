import * as React from 'react';
import { Edit2, Loader2 } from 'lucide-react';

interface ButtonEditarJugadorProps {
  onEditar: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  text?: string;
}

const ButtonEditarJugador: React.FC<ButtonEditarJugadorProps> = ({
  onEditar,
  disabled = false,
  loading = false,
  className = '',
  text = 'Editar'
}) => {
  // ✅ Estilos inline basados en el CSS proporcionado
  const buttonStyle: React.CSSProperties = {
    backgroundColor: disabled || loading ? '#9ca3af' : '#201dc7',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    marginLeft: '8px',
    transition: 'background-color 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  };

  return (
    <button
      onClick={onEditar}
      disabled={disabled || loading}
      className={`button-edit ${className} ${loading ? 'loading' : ''}`}
      type="button"
      aria-label={loading ? 'Cargando...' : 'Editar jugador'}
      style={buttonStyle}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = '#010578';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = '#201dc7';
        }
      }}
      onMouseDown={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = '#131aea';
        }
      }}
      onMouseUp={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = '#010578';
        }
      }}
    >
      {loading ? (
        <>
          <Loader2 
            size={16} 
            style={{ 
              animation: 'spin 1s linear infinite',
              marginRight: '2px'
            }} 
          />
          Cargando...
        </>
      ) : (
        <>
          <Edit2 size={16} style={{ marginRight: '2px' }} />
          {text}
        </>
      )}
    </button>
  );
};

export default ButtonEditarJugador;