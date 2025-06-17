import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import FormularioJugador from '../../../pages/SearchPage/AgregarJugador/FormularioJugador';
import './AgregarJugador.css';

// ✅ Interfaz simple y clara
interface AgregarJugadorProps {
  onAgregar: (jugador: any) => void;
  disabled?: boolean;
  nombreInicial?: string;
}

const AgregarJugador: React.FC<AgregarJugadorProps> = ({
  onAgregar,
  disabled = false,
  nombreInicial = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (!disabled) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleJugadorAgregado = (jugador: any) => {
    onAgregar(jugador);
    setIsModalOpen(false);
  };

  // ✅ Estilos inline solo para el botón flotante
  const floatingButtonStyle = {
    position: 'fixed' as const,
    bottom: '2rem',
    right: '2rem',
    width: '56px',
    height: '56px',
    backgroundColor: disabled ? '#9ca3af' : '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.2s',
    zIndex: 100,
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={handleOpenModal}
        disabled={disabled}
        style={floatingButtonStyle}
        aria-label="Agregar nuevo jugador"
        title="Agregar nueva pareja"
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = '#059669';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = '#10b981';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          }
        }}
      >
        <Plus size={24} />
      </button>

      {/* ✅ Modal usando las mismas clases CSS que el modal de edición */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                ➕ Agregar Nueva Pareja
              </h2>
              <button
                onClick={handleCloseModal}
                className="modal-close-button"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <FormularioJugador
                onJugadorAgregado={handleJugadorAgregado}
                onCancelar={handleCloseModal}
                nombreInicial={nombreInicial}
                jugadorParaEditar={null}
                modoEdicion={false}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AgregarJugador;