import * as React from 'react';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../../src/firebase';
import { User, Building2, Activity, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface JugadorData {
  id_jugador?: number;
  nombre: string;
  nombreAcompanante: string;
  empresa: string;
  empresaAcompanante: string;
  nivel: number;
  activo: boolean;
}

const JugadorTiempoReal: React.FC = () => {
  const [jugador, setJugador] = useState<JugadorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);

  useEffect(() => {
    console.log('🔥 Iniciando listener en tiempo real para jugador ID: 1');
    
    // Referencia al documento del jugador con ID 1
    const jugadorRef = doc(db, 'jugadores', '1');
    
    // Configurar el listener en tiempo real
    const unsubscribe = onSnapshot(
      jugadorRef,
      (docSnapshot) => {
        setLoading(false);
        
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as JugadorData;
          console.log('📥 Datos actualizados del jugador:', data);
          
          setJugador(data);
          setError(null);
          setUltimaActualizacion(new Date());
        } else {
          console.log('❌ El jugador con ID 1 no existe');
          setJugador(null);
          setError('El jugador con ID 1 no existe en la base de datos');
        }
      },
      (error) => {
        console.error('💥 Error al escuchar cambios:', error);
        setLoading(false);
        setError(`Error al conectar con Firebase: ${error.message}`);
        setJugador(null);
      }
    );

    // Cleanup: Desconectar el listener cuando el componente se desmonte
    return () => {
      console.log('🔄 Desconectando listener de tiempo real');
      unsubscribe();
    };
  }, []);

  const getNivelTexto = (nivel: number): string => {
    if (nivel === 0) return 'Nuevo jugador';
    if (nivel === 1) return 'Principiante';
    if (nivel <= 3) return 'Básico';
    if (nivel <= 6) return 'Intermedio';
    if (nivel <= 8) return 'Avanzado';
    return 'Experto';
  };

  const formatearFecha = (fecha: Date): string => {
    return fecha.toLocaleString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        gap: '16px',
        padding: '20px'
      }}>
        <Loader2 size={40} style={{ animation: 'spin 2s linear infinite' }} />
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Conectando con Firebase y cargando datos en tiempo real...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <AlertCircle size={40} style={{ color: '#dc2626' }} />
        <h3 style={{ margin: 0, color: '#dc2626' }}>Error de Conexión</h3>
        <p style={{ margin: 0, color: '#7f1d1d', textAlign: 'center' }}>{error}</p>
      </div>
    );
  }

  if (!jugador) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '40px',
        backgroundColor: '#f9fafb',
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        margin: '20px'
      }}>
        <User size={48} style={{ color: '#9ca3af' }} />
        <h3 style={{ margin: 0, color: '#6b7280' }}>Jugador No Encontrado</h3>
        <p style={{ margin: 0, color: '#9ca3af', textAlign: 'center' }}>
          El jugador con ID 1 no existe en /jugadores/1
        </p>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '600px',
      margin: '20px auto',
      padding: '0 20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        color: 'white',
        padding: '20px',
        borderRadius: '8px 8px 0 0',
        textAlign: 'center'
      }}>
        <h1 style={{
          margin: '0 0 8px 0',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          🔥 Jugador en Tiempo Real
        </h1>
        <p style={{
          margin: 0,
          fontSize: '14px',
          opacity: 0.9
        }}>
          Conectado a /jugadores/1 - Se actualiza automáticamente
        </p>
      </div>

      {/* Indicador de última actualización */}
      {ultimaActualizacion && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: '#16a34a'
        }}>
          <Clock size={16} />
          <span>Última actualización: {formatearFecha(ultimaActualizacion)}</span>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#22c55e',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }} />
        </div>
      )}

      {/* Contenido principal */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0 0 8px 8px',
        padding: '24px'
      }}>
        {/* Información del jugador principal */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <User size={20} style={{ color: '#3b82f6' }} />
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              Jugador Principal
            </h3>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              Nombre
            </label>
            <div style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#1f2937',
              padding: '8px 12px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}>
              {jugador.nombre}
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              Empresa
            </label>
            <div style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#1f2937',
              padding: '8px 12px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Building2 size={16} style={{ color: '#6b7280' }} />
              {jugador.empresa}
            </div>
          </div>
        </div>

        {/* Información del acompañante */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <User size={20} style={{ color: '#10b981' }} />
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              Acompañante
            </h3>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              Nombre
            </label>
            <div style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#1f2937',
              padding: '8px 12px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px'
            }}>
              {jugador.nombreAcompanante || 'Sin acompañante'}
            </div>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '4px'
            }}>
              Empresa
            </label>
            <div style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#1f2937',
              padding: '8px 12px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Building2 size={16} style={{ color: '#6b7280' }} />
              {jugador.empresaAcompanante || 'Sin empresa'}
            </div>
          </div>
        </div>

        {/* Información de estadísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            backgroundColor: '#eff6ff',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <Activity size={16} style={{ color: '#3b82f6' }} />
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e40af'
              }}>
                Nivel
              </span>
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e40af',
              marginBottom: '4px'
            }}>
              {jugador.nivel}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#3730a3'
            }}>
              {getNivelTexto(jugador.nivel)}
            </div>
          </div>

          <div style={{
            backgroundColor: jugador.activo ? '#f0fdf4' : '#fef2f2',
            padding: '16px',
            borderRadius: '8px',
            border: `1px solid ${jugador.activo ? '#bbf7d0' : '#fecaca'}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: jugador.activo ? '#22c55e' : '#ef4444'
              }} />
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: jugador.activo ? '#15803d' : '#dc2626'
              }}>
                Estado
              </span>
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: jugador.activo ? '#15803d' : '#dc2626'
            }}>
              {jugador.activo ? 'Activo' : 'Inactivo'}
            </div>
            <div style={{
              fontSize: '12px',
              color: jugador.activo ? '#166534' : '#991b1b'
            }}>
              {jugador.activo ? 'Disponible para juegos' : 'No disponible'}
            </div>
          </div>
        </div>

        {/* Información técnica */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div>
              <strong>Ruta Firebase:</strong> /jugadores/1
            </div>
            <div>
              <strong>ID Jugador:</strong> {jugador.id_jugador || 1}
            </div>
            <div>
              <strong>Listener:</strong> ✅ Conectado en tiempo real
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default JugadorTiempoReal;