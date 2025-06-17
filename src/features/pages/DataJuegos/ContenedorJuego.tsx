import  { useEffect, useState } from 'react';
import { Users, Trophy, UserCheck, AlertCircle, Loader2, RefreshCw, Database } from 'lucide-react';
import { collection, getDocs, doc } from 'firebase/firestore';
import { db } from '../../../../src/firebase';
import type{Juego, Grupo} from'../../../../src/core/models/verLlenado';
const ContenedorJuego: React.FC = () => {
  const [juegos, setJuegos] = useState<Juego[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);

  // Configuración estática de juegos
  const configJuegos = {
    1: { nombre: "Futbolito", icono: "⚽", descripcion: "Torneo de futbolito por grupos" },
    2: { nombre: "Soplados", icono: "💨", descripcion: "Competencia de soplados" },
    3: { nombre: "Ruelas", icono: "🎯", descripcion: "Competencia de ruelas" },
    4: { nombre: "Beer Pong", icono: "🍺", descripcion: "Torneo de Beer Pong" }
  };

  // Función para obtener datos desde Firebase con la estructura correcta
  const cargarDatosJuegos = async () => {
    setCargando(true);
    setError(null);
    
    try {
      console.log('🔥 Cargando datos desde Firebase con estructura: /torneo/1/juego/{idJuego}');
      
      const juegosData: Juego[] = [];

      // Iterar sobre cada juego configurado
      for (const [juegoIdStr, config] of Object.entries(configJuegos)) {
        const juegoId = parseInt(juegoIdStr);
        console.log(`📊 Procesando juego ${juegoId}: ${config.nombre}`);

        try {
          // Construir la ruta correcta: /torneo/1/juego/{idJuego}
          const juegoDocRef = doc(db, 'torneo', '1', 'juego', juegoId.toString());
          
          // Obtener todas las subcollecciones del documento del juego
          // Como no podemos listar subcollecciones directamente, vamos a intentar acceder a las colecciones comunes
          const posiblesSubcolecciones = [
            'grupos',
            'group', 
            'participantes',
            'players',
            'teams',
            'equipos',
            'parejas'
          ];

          const grupos: Grupo[] = [];
          let totalJugadoresJuego = 0;
          let capacidadTotalJuego = 0;
          let subcoleccionEncontrada = false;

          // Intentar cada posible subcollección
          for (const nombreSubcoleccion of posiblesSubcolecciones) {
            try {
              console.log(`🔍 Intentando subcollección: torneo/1/juego/${juegoId}/${nombreSubcoleccion}`);
              
              const subcoleccionRef = collection(juegoDocRef, nombreSubcoleccion);
              const snapshot = await getDocs(subcoleccionRef);

              if (!snapshot.empty) {
                console.log(`✅ Subcollección '${nombreSubcoleccion}' encontrada para ${config.nombre} con ${snapshot.size} documentos`);
                subcoleccionEncontrada = true;

                // Procesar cada documento de la subcollección
                snapshot.docs.forEach((grupoDoc, index) => {
                  const grupoData = grupoDoc.data();
                  console.log(`📄 Grupo ${grupoDoc.id}:`, grupoData);

                  // Contar jugadores basado en diferentes estructuras posibles
                  let numJugadores = 0;
                  
                  if (grupoData.participantes && Array.isArray(grupoData.participantes)) {
                    numJugadores = grupoData.participantes.length;
                  } else if (grupoData.jugadores && Array.isArray(grupoData.jugadores)) {
                    numJugadores = grupoData.jugadores.length;
                  } else if (grupoData.players && Array.isArray(grupoData.players)) {
                    numJugadores = grupoData.players.length;
                  } else if (grupoData.parejas && Array.isArray(grupoData.parejas)) {
                    numJugadores = grupoData.parejas.length * 2; // Asumiendo parejas
                  } else if (grupoData.teams && Array.isArray(grupoData.teams)) {
                    numJugadores = grupoData.teams.length;
                  } else if (typeof grupoData.count === 'number') {
                    numJugadores = grupoData.count;
                  } else {
                    // Si no hay estructura clara, contar las propiedades numéricas
                    const keys = Object.keys(grupoData);
                    numJugadores = keys.filter(key => 
                      typeof grupoData[key] === 'object' && grupoData[key] !== null
                    ).length;
                  }

                  const capacidadMaxima = grupoData.capacidad_maxima || grupoData.maxCapacity || 12;

                  grupos.push({
                    id: grupoDoc.id,
                    nombre: grupoData.nombre || `Grupo ${index + 1}`,
                    jugadores: numJugadores,
                    capacidadMaxima: capacidadMaxima,
                    activo: grupoData.activo !== false,
                    datos: grupoData
                  });

                  totalJugadoresJuego += numJugadores;
                  capacidadTotalJuego += capacidadMaxima;
                });

                break; // Salir del loop si encontramos una subcollección válida
              }
            } catch (subError) {
              console.log(`ℹ️ Subcollección '${nombreSubcoleccion}' no existe para juego ${juegoId}`);
            }
          }

          // Si no se encontró ninguna subcollección, buscar datos directamente en el documento del juego
          if (!subcoleccionEncontrada) {
            try {
              console.log(`🔍 Buscando datos directamente en el documento del juego ${juegoId}`);
              
              const juegoDocSnapshot = await getDocs(collection(db, 'torneo', '1', 'juego'));
              const juegoDoc = juegoDocSnapshot.docs.find(doc => doc.id === juegoId.toString());
              
              if (juegoDoc && juegoDoc.exists()) {
                const juegoData = juegoDoc.data();
                console.log(`📄 Datos del juego ${juegoId}:`, juegoData);

                // Si hay datos en el documento principal, crear un grupo virtual
                if (Object.keys(juegoData).length > 0) {
                  grupos.push({
                    id: 'principal',
                    nombre: 'Datos del Juego',
                    jugadores: 0, // Lo ajustaremos según los datos encontrados
                    capacidadMaxima: 50,
                    activo: true,
                    datos: juegoData
                  });
                }
              }
            } catch (docError) {
              console.log(`ℹ️ No se pudo acceder al documento del juego ${juegoId}`);
            }
          }

          // Crear objeto del juego
          const estadoJuego = grupos.length > 0 ? 
            (totalJugadoresJuego > 0 ? 'con_datos' : 'sin_datos') : 
            'sin_datos';

          juegosData.push({
            id: juegoId,
            nombre: config.nombre,
            icono: config.icono,
            descripcion: config.descripcion,
            grupos: grupos,
            totalJugadores: totalJugadoresJuego,
            capacidadTotal: capacidadTotalJuego || (grupos.length * 12), // Fallback
            estado: estadoJuego
          });

          console.log(`✅ Juego ${config.nombre} procesado: ${totalJugadoresJuego}/${capacidadTotalJuego} jugadores en ${grupos.length} grupos`);

        } catch (juegoError) {
          console.error(`❌ Error procesando juego ${config.nombre}:`, juegoError);
          
          // Agregar juego vacío para mostrar que existe pero sin datos
          juegosData.push({
            id: juegoId,
            nombre: config.nombre,
            icono: config.icono,
            descripcion: config.descripcion,
            grupos: [],
            totalJugadores: 0,
            capacidadTotal: 0,
            estado: 'sin_datos'
          });
        }
      }

      console.log('🎉 Carga completa de juegos:', juegosData);
      setJuegos(juegosData);
      setUltimaActualizacion(new Date());

    } catch (error) {
      console.error('💥 Error general al cargar datos:', error);
      setError(`Error al cargar los datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosJuegos();
  }, []);

  if (cargando) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Loader2 size={20} />
          <span>Cargando datos desde Firebase...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
          <button 
            onClick={cargarDatosJuegos}
            style={{
              padding: '5px 10px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#1f2937' }}>
          Estado de Juegos y Grupos
        </h1>
        <p style={{ margin: '0', color: '#6b7280', fontSize: '16px' }}>
          Monitoreo del llenado de grupos (Estructura: /torneo/1/juego/*)
        </p>
        {ultimaActualizacion && (
          <p style={{ margin: '5px 0 0 0', color: '#9ca3af', fontSize: '14px' }}>
            Última actualización: {ultimaActualizacion.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Botón actualizar */}
      <button 
        onClick={cargarDatosJuegos}
        disabled={cargando}
        style={{
          padding: '10px 15px',
          backgroundColor: '#f3f4f6',
          color: '#374151',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <RefreshCw size={16} />
        Actualizar datos
      </button>

      {/* Grid de juegos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '20px'
      }}>
        {juegos.map((juego) => {
          const porcentajeTotal = juego.capacidadTotal > 0 ? 
            Math.round((juego.totalJugadores / juego.capacidadTotal) * 100) : 0;
          
          return (
            <div key={juego.id} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: 'white'
            }}>
              {/* Header del juego */}
              <div style={{
                backgroundColor: juego.estado === 'con_datos' ? '#16a34a' : 
                               juego.estado === 'sin_datos' ? '#6b7280' : '#3b82f6',
                color: 'white',
                padding: '15px',
                borderRadius: '8px 8px 0 0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>{juego.icono}</span>
                    <div>
                      <h3 style={{ margin: '0', fontSize: '18px' }}>{juego.nombre}</h3>
                      <span style={{ fontSize: '12px', opacity: '0.8' }}>
                        ID: {juego.id} | Estado: {juego.estado}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <UserCheck size={16} />
                    <span>{juego.totalJugadores}/{juego.capacidadTotal || 0}</span>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div style={{ padding: '15px' }}>
                {/* Descripción */}
                <p style={{ margin: '0 0 15px 0', color: '#6b7280', fontSize: '14px' }}>
                  {juego.descripcion}
                </p>

                {juego.grupos.length > 0 ? (
                  <>
                    {/* Progreso total */}
                    {juego.capacidadTotal > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '600' }}>Progreso Total</span>
                          <span style={{ fontSize: '14px' }}>{porcentajeTotal}%</span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '4px'
                        }}>
                          <div style={{
                            width: `${porcentajeTotal}%`,
                            height: '100%',
                            backgroundColor: '#3b82f6',
                            borderRadius: '4px'
                          }} />
                        </div>
                      </div>
                    )}

                    {/* Grupos */}
                    <div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        marginBottom: '15px',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        <Users size={16} style={{ color: '#3b82f6' }} />
                        <span>Grupos encontrados ({juego.grupos.length})</span>
                      </div>

                      {/* Lista de grupos */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {juego.grupos.map((grupo) => {
                          const porcentajeGrupo = grupo.capacidadMaxima > 0 ? 
                            Math.round((grupo.jugadores / grupo.capacidadMaxima) * 100) : 0;
                          
                          return (
                            <div key={grupo.id} style={{
                              padding: '10px',
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px'
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '8px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '14px', fontWeight: '600' }}>
                                    {grupo.nombre}
                                  </span>
                                  <span style={{
                                    fontSize: '12px',
                                    backgroundColor: '#e5e7eb',
                                    color: '#6b7280',
                                    padding: '2px 6px',
                                    borderRadius: '3px'
                                  }}>
                                    ID: {grupo.id}
                                  </span>
                                </div>
                                <span style={{
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  color: porcentajeGrupo === 100 ? '#dc2626' : 
                                         porcentajeGrupo >= 80 ? '#f59e0b' : '#16a34a'
                                }}>
                                  {porcentajeGrupo === 100 ? 'Completo' :
                                   porcentajeGrupo >= 80 ? 'Casi lleno' : 'Disponible'}
                                </span>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                <Users size={12} />
                                <span>{grupo.jugadores}/{grupo.capacidadMaxima} jugadores ({porcentajeGrupo}%)</span>
                              </div>
                              
                              {/* Barra de progreso del grupo */}
                              {grupo.capacidadMaxima > 0 && (
                                <div style={{
                                  width: '100%',
                                  height: '4px',
                                  backgroundColor: '#e5e7eb',
                                  borderRadius: '2px',
                                  marginTop: '6px'
                                }}>
                                  <div style={{
                                    width: `${porcentajeGrupo}%`,
                                    height: '100%',
                                    backgroundColor: porcentajeGrupo === 100 ? '#dc2626' :
                                                    porcentajeGrupo >= 80 ? '#f59e0b' : '#3b82f6',
                                    borderRadius: '2px'
                                  }} />
                                </div>
                              )}

                              {/* Mostrar datos adicionales si existen */}
                              {grupo.datos && Object.keys(grupo.datos).length > 0 && (
  <details style={{ marginTop: '8px' }}>
    <summary style={{ 
      fontSize: '12px', 
      color: '#6b7280', 
      cursor: 'pointer'
    }}>
      Ver datos del grupo
    </summary>
    <div style={{
      color: '#6b7280',
      fontSize: '12px',
      backgroundColor: '#f9fafb',
      padding: '8px',
      borderRadius: '4px',
      marginTop: '4px',
      overflow: 'auto',
      maxHeight: '150px',
      lineHeight: '1.4'
    }}>
      {Object.entries(grupo.datos).map(([clave, valor]) => {
        const nombresPersonalizados = {
          'participantes': 'Participantes',
          'id_futbolito': 'ID Futbolito',
          'id_juego': 'ID Juego',
          'id_grupo': 'ID Grupo',
          'num_grupo': 'Número de Grupo'
        };
        
        const nombreCampo = nombresPersonalizados[clave as keyof typeof nombresPersonalizados] || 
                           clave.replace(/([A-Z])/g, ' $1')
                               .replace(/^./, str => str.toUpperCase());
        
        let valorFormateado;
        if (valor === null || valor === undefined || valor === '') {
          valorFormateado = 'No especificado';
        } else if (clave === 'participantes' && Array.isArray(valor)) {
          if (valor.length === 0) {
            valorFormateado = 'Sin participantes';
          } else {
            valorFormateado = (
              <div style={{ marginTop: '4px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {valor.length} participante(s):
                </div>
                {/*  CAMBIO AQUÍ: Cada participante en su propia línea */}
                <div style={{ 
                  display: 'flex',           // ⬅️ Cambiar a 'block' para lista vertical
                  flexDirection: 'column',   // ⬅️ O eliminar esta línea si usas 'block'
                  gap: '2px'                 // ⬅️ Espacio entre elementos
                }}>
                  {valor.map((participante, index) => (
                    <div key={index} style={{ 
                      fontSize: '11px',
                      padding: '2px 4px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '3px',
                      // ✅ ELIMINÉ: display: 'inline-block' y marginRight
                      marginBottom: '2px'  // ⬅️ Espacio vertical entre participantes
                    }}>
                      {participante.nombre && participante.nombreAcompanante 
                        ? `${participante.nombre} y ${participante.nombreAcompanante}`
                        : participante.nombre || `Participante ${index + 1}`
                      }
                    </div>
                  ))}
                </div>
              </div>
            );
          }
        } else if (typeof valor === 'boolean') {
          valorFormateado = valor ? 'Sí' : 'No';
        } else {
          valorFormateado = String(valor);
        }

        return (
          <div key={clave} style={{ marginBottom: '6px' }}>
            <strong>{nombreCampo}:</strong> {valorFormateado}
          </div>
        );
      })}
    </div>
  </details>
)}
                             
                           
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Sin grupos */
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#6b7280',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '2px dashed #d1d5db'
                  }}>
                    <Database size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Sin datos de grupos</h4>
                    <p style={{ margin: '0', fontSize: '14px' }}>
                      No se encontraron datos en: /torneo/1/juego/{juego.id}
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: 0.7 }}>
                      Los jugadores pueden agregarse aquí cuando sea necesario
                    </p>
                  </div>
                )}

                {/* Resumen */}
                <div style={{ 
                  marginTop: '20px', 
                  paddingTop: '15px', 
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  fontSize: '13px',
                  color: '#6b7280'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Trophy size={12} />
                    <span>Grupos configurados: {juego.grupos.length}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={12} />
                    <span>Jugadores asignados: {juego.totalJugadores}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={12} />
                    <span>Capacidad total: {juego.capacidadTotal}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContenedorJuego;