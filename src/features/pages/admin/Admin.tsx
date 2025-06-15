import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, X, LoaderCircle, AlertTriangle, Trash2, Swords, Layers } from 'lucide-react';

// --- INTERFACES ADAPTADAS A LA NUEVA RESPUESTA DE LA API ---
interface ApiJugador {
  id_jugador: number;
  nombre: string;
  empresa: string;
  nombreAcompanante: string;
  empresaAcompanante: string;
  nivel: number;
}

interface ApiPartida {
  id_partida: number;
  id_juego: number;
  id_grupo: number;
  ronda: number; // La ronda ahora viene en cada partida
  equiposX: ApiJugador[];
  equiposY: ApiJugador[];
  resultado: string;
}

interface ApiResponse {
  message: string;
  details: {
    juego: string;
    grupo: string;
    total_partidas: number;
    total_rondas: number; // Nuevo campo
  };
  rondas: { // Objeto con rondas
    [key: string]: ApiPartida[];
  };
}

// INTERFACES INTERNAS DEL COMPONENTE
interface Jugador {
  id: string;
  nombre: string;
  nombreAcompanante: string;
  nivel: number;
}

interface Partida {
  id: number;
  ronda: number; // Se añade la ronda para filtrar
  jugadores: Jugador[];
}

const AdministrarGrupoJuego = () => {
  // Estado para las partidas
  const [partidas, setPartidas] = useState<Partida[]>([]);
  
  // Estados para la UI
  const [idJuego, setIdJuego] = useState('1');
  const [idGrupo, setIdGrupo] = useState('1');
  const [filtroNivel] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para filtrar por ronda
  const [availableRondas, setAvailableRondas] = useState<number[]>([]);
  const [rondaSeleccionada, setRondaSeleccionada] = useState<string>('todas');

  // Estados para crear ronda
  const [numPartidas, setNumPartidas] = useState('');
  const [nivelPartida, setNivelPartida] = useState('');

  // Estados de carga y error
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [infoJuego, setInfoJuego] = useState<{juego: string, grupo: string, total: number, rondas: number} | null>(null);
  
  // Estados para acciones
  const [updatingLevel, setUpdatingLevel] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [winners, setWinners] = useState<{ [key: string]: string | null }>({});
  // --- ESTADOS PARA ELIMINAR TODAS LAS PARTIDAS ---
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  // Hook para obtener las partidas desde la API externa
  const fetchPartidas = useCallback(async (juegoId: string, grupoId: string) => {
    if (!juegoId || !grupoId) {
      setError("Por favor, proporciona un ID de Juego y un ID de Grupo válidos.");
      setPartidas([]);
      return;
    }
    
    setCargando(true);
    setError(null);
    setPartidas([]); 
    setWinners({});
    setAvailableRondas([]);
    setRondaSeleccionada('todas');

    try {
      const url = `https://api-e3mal3grqq-uc.a.run.app/api/partidas?id_juego=${juegoId}&id_grupo=${grupoId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Error en la API: ${response.status}`);
      const data: ApiResponse = await response.json();
      
      if (!data.rondas || Object.keys(data.rondas).length === 0) {
        setInfoJuego({
            juego: data.details.juego, 
            grupo: data.details.grupo, 
            total: 0,
            rondas: 0
        });
        setPartidas([]);
      } else {
        const todasLasPartidas: Partida[] = [];
        const rondasDisponibles: number[] = [];

        for (const rondaKey in data.rondas) {
            rondasDisponibles.push(parseInt(rondaKey.split('_')[1]));
            const partidasDeRonda = data.rondas[rondaKey];
            const partidasTransformadas = partidasDeRonda.map(p => ({
                id: p.id_partida,
                ronda: p.ronda,
                jugadores: [
                    ...p.equiposX.map(j => ({ id: String(j.id_jugador), nombre: j.nombre, nombreAcompanante: j.nombreAcompanante, nivel: j.nivel })),
                    ...p.equiposY.map(j => ({ id: String(j.id_jugador), nombre: j.nombre, nombreAcompanante: j.nombreAcompanante, nivel: j.nivel }))
                ]
            }));
            todasLasPartidas.push(...partidasTransformadas);
        }

        setPartidas(todasLasPartidas);
        setAvailableRondas(rondasDisponibles.sort((a, b) => a - b));
        setInfoJuego({
            juego: data.details.juego, 
            grupo: data.details.grupo, 
            total: data.details.total_partidas,
            rondas: data.details.total_rondas
        });
      }
    } catch (err) {
      console.error("Error al obtener las partidas:", err);
      setError(err instanceof Error ? err.message : "Ocurrió un error desconocido.");
      setPartidas([]);
      setInfoJuego(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    fetchPartidas(idJuego, idGrupo);
  }, [fetchPartidas, idJuego, idGrupo]);

  const handleBuscarPartidas = () => {
    fetchPartidas(idJuego, idGrupo);
  };

  const cambiarNivel = async (partidaId: number, ronda: number, jugadorId: string, incremento: number) => {
    const action = incremento > 0 ? 'aumentar' : 'disminuir';
    if (updatingLevel) return;
    
    const compositeKey = `ronda-${ronda}-partida-${partidaId}`;
    setUpdatingLevel(jugadorId);
    
    try {
        const url = `https://api-e3mal3grqq-uc.a.run.app/api/jugador/${jugadorId}/nivel/${action}`;
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Error en la API: ${response.status}` }));
            throw new Error(errorData.message);
        }
        
        setPartidas(current => current.map(p => 
            (p.id === partidaId && p.ronda === ronda) 
            ? { ...p, jugadores: p.jugadores.map(j => j.id === jugadorId ? { ...j, nivel: j.nivel + incremento } : j) } 
            : p
        ));
        
        if (incremento > 0) {
            setWinners(prev => ({ ...prev, [compositeKey]: jugadorId }));
        } else {
            if (winners[compositeKey] === jugadorId) {
                setWinners(prev => ({ ...prev, [compositeKey]: null }));
            }
        }

    } catch (err) {
        alert(`No se pudo actualizar el nivel: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
        setUpdatingLevel(null);
    }
  };

  // --- FUNCIÓN PARA ELIMINAR TODAS LAS PARTIDAS DEL GRUPO ---
  const handleDeleteAllPartidas = async () => {
    setShowDeleteConfirm(false);
    if (!idJuego || !idGrupo) {
        alert("ID de Juego o Grupo no especificado.");
        return;
    }
    setIsDeletingAll(true);
    try {
        const url = `https://api-e3mal3grqq-uc.a.run.app/api/partidas`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_juego: parseInt(idJuego),
                id_grupo: parseInt(idGrupo)
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Error en la API: ${response.status}` }));
            throw new Error(errorData.message || 'Error desconocido al eliminar.');
        }

        // Refrescar la lista de partidas, que ahora debería estar vacía.
        await fetchPartidas(idJuego, idGrupo);

    } catch (err) {
        alert(`No se pudieron eliminar las partidas: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
        setIsDeletingAll(false);
    }
  };

  const handleCreateRonda = async () => {
    if (!numPartidas || !nivelPartida || !idJuego || !idGrupo) {
        alert("Por favor, completa todos los campos para crear la ronda.");
        return;
    }
    setIsCreating(true);
    try {
        const url = `https://api-e3mal3grqq-uc.a.run.app/api/partidas`;
        const body = {
            id_juego: parseInt(idJuego),
            id_grupo: parseInt(idGrupo),
            num_partidas: parseInt(numPartidas),
            nivel_partida: parseInt(nivelPartida)
        };
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Error en la API: ${response.status}` }));
            throw new Error(errorData.message || 'Error desconocido al crear la ronda.');
        }
        
        setNumPartidas('');
        setNivelPartida('');
        await fetchPartidas(idJuego, idGrupo);

    } catch (err) {
        alert(`No se pudo crear la ronda: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
        setIsCreating(false);
    }
  };
  
  const partidasFiltradas = partidas.filter(partida => {
    const cumpleRonda = rondaSeleccionada === 'todas' || partida.ronda === parseInt(rondaSeleccionada);
    const cumpleNivel = filtroNivel === 'todos' || partida.jugadores.some(j => j.nivel === parseInt(filtroNivel));
    const cumpleBusqueda = busqueda.trim() === '' ||
      partida.id.toString().includes(busqueda.toLowerCase()) ||
      partida.jugadores.some(j =>
        j.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        j.nombreAcompanante.toLowerCase().includes(busqueda.toLowerCase())
      );
    return cumpleRonda && cumpleNivel && cumpleBusqueda;
  });

  const limpiarBusqueda = () => setBusqueda('');
  const handleVolver = () => console.log('Volver a la página anterior');
  
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
      padding: '12px', fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box'
    }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', flexShrink: 0 }}>
        <button onClick={handleVolver} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '13px',
            fontWeight: '500', backdropFilter: 'blur(10px)', transition: 'background 0.2s'
          }}
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '700', margin: '0', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>
          Administrador de Partidas
        </h1>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '12px', flex: 1, minHeight: 0 }}>
        {/* PANEL IZQUIERDO: LISTA DE PARTIDAS */}
        <div style={{ background: 'white', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', minHeight: 0 }}>
          <div style={{ background: '#10b981', color: 'white', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '16px', fontWeight: '600', textAlign: 'center', flexShrink: 0 }}>
            {infoJuego ? `Juego ${infoJuego.juego} - Grupo ${infoJuego.grupo} (${infoJuego.rondas} Rondas / ${infoJuego.total} Partidas)` : 'Partidas en curso'}
          </div>

          <div style={{ position: 'relative', marginBottom: '12px', flexShrink: 0 }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por ID o nombre..." style={{ width: '100%', padding: '10px 10px 10px 36px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
            {busqueda && <button onClick={limpiarBusqueda} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '4px' }}><X size={16} /></button>}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '2px 8px 2px 2px' }}>
            {cargando ? (
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280', gap: '10px'}}> <LoaderCircle className="animate-spin" size={40} /> <p>Cargando partidas...</p> </div>
            ) : error ? (
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ef4444', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '20px', gap: '10px', textAlign: 'center'}}> <AlertTriangle size={40} /> <b>Error al Cargar</b> <p>{error}</p> </div>
            ) : partidasFiltradas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280', background: '#f9fafb', borderRadius: '8px', border: '2px dashed #d1d5db', margin: 'auto 0' }}>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>{partidas.length === 0 && !cargando ? 'No hay partidas en este grupo.' : 'Sin resultados para la búsqueda.'}</div>
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {partidasFiltradas.map((partida) => {
                  const compositeKey = `ronda-${partida.ronda}-partida-${partida.id}`;
                  const winnerId = winners[compositeKey];
                  return (
                    <div key={compositeKey} style={{ border: `1px solid ${winnerId ? '#d1d5db' : '#10b981'}`, borderRadius: '8px', padding: '12px', background: winnerId ? '#f9fafb' : '#f8fffe', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.3s' }}>
                      <div style={{ color: winnerId ? '#6b7280' : '#dc2626', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Ronda {partida.ronda} - Partida {partida.id} {winnerId && '(Ganador Seleccionado)'}</div>
                      {partida.jugadores.map((jugador) => {
                        const isUpdating = updatingLevel === jugador.id;
                        const isLockedForThisPlayer = winnerId != null && winnerId !== jugador.id;
                        return (
                          <div key={jugador.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '8px 10px', marginBottom: '6px', fontSize: '14px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{jugador.nombre}</div>
                              <div style={{ color: '#6b7280', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  <span style={{color: '#4b5563', fontWeight: '500'}}>ID: {jugador.id}</span> &middot; Acompañante: {jugador.nombreAcompanante}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ background: winnerId === jugador.id ? '#f59e0b' : '#10b981', color: 'white', padding: '5px 10px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', minWidth: '40px', height: '28px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.3s' }}>
                                {isUpdating ? <LoaderCircle size={16} className="animate-spin" /> : jugador.nivel}
                              </div>
                              <button onClick={() => cambiarNivel(partida.id, partida.ronda, jugador.id, 1)} disabled={isUpdating || isLockedForThisPlayer || winnerId === jugador.id} style={{ background: '#22c55e', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (isUpdating || isLockedForThisPlayer || winnerId === jugador.id) ? 'not-allowed' : 'pointer', color: 'white', fontSize: '16px', fontWeight: 'bold', opacity: (isUpdating || isLockedForThisPlayer || winnerId === jugador.id) ? 0.5 : 1 }}>+</button>
                              <button onClick={() => cambiarNivel(partida.id, partida.ronda, jugador.id, -1)} disabled={isUpdating || isLockedForThisPlayer} style={{ background: '#ef4444', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (isUpdating || isLockedForThisPlayer) ? 'not-allowed' : 'pointer', color: 'white', fontSize: '16px', fontWeight: 'bold', opacity: (isUpdating || isLockedForThisPlayer) ? 0.5 : 1 }}>-</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: CONTROLES */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}>
              <div style={{ background: '#374151', color: 'white', padding: '10px 12px', borderRadius: '6px', fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>Buscar Partidas</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type="number" placeholder="ID del juego" value={idJuego} onChange={(e) => setIdJuego(e.target.value)} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                <input type="text" placeholder="ID del grupo" value={idGrupo} onChange={(e) => setIdGrupo(e.target.value)} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                <button onClick={handleBuscarPartidas} disabled={cargando || !idJuego || !idGrupo} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: (cargando || !idJuego || !idGrupo) ? 'not-allowed' : 'pointer', opacity: (cargando || !idJuego || !idGrupo) ? 0.6 : 1, transition: 'background 0.2s' }}>
                  {cargando ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}>
              <div style={{ background: '#6366f1', color: 'white', padding: '10px 12px', borderRadius: '6px', fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Layers size={16}/>Filtrar por Ronda</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button onClick={() => setRondaSeleccionada('todas')} style={{ padding: '10px', border: '1px solid', borderColor: rondaSeleccionada === 'todas' ? '#6366f1' : '#d1d5db', background: rondaSeleccionada === 'todas' ? '#eef2ff' : 'white', color: '#4338ca', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Todas</button>
                    {availableRondas.slice(0, 5).map(ronda => (
                        <button key={ronda} onClick={() => setRondaSeleccionada(String(ronda))} style={{ padding: '10px', border: '1px solid', borderColor: rondaSeleccionada === String(ronda) ? '#6366f1' : '#d1d5db', background: rondaSeleccionada === String(ronda) ? '#eef2ff' : 'white', color: '#4338ca', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Ronda {ronda}</button>
                    ))}
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}>
              <div style={{ background: '#16a34a', color: 'white', padding: '10px 12px', borderRadius: '6px', fontSize: '15px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><Swords size={16}/>Crear Nueva Ronda</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <select value={numPartidas} onChange={e => setNumPartidas(e.target.value)} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
                    <option value="" disabled>Número de Partidas</option>
                    <option value="1">1 Partida</option>
                    <option value="2">2 Partidas</option>
                    <option value="4">4 Partidas</option>
                    <option value="8">8 Partidas</option>
                    <option value="16">16 Partidas</option>
                </select>
                <input type="number" placeholder="Nivel de la Partida" value={nivelPartida} onChange={e => setNivelPartida(e.target.value)} style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                <button onClick={handleCreateRonda} disabled={isCreating} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: isCreating ? 'not-allowed' : 'pointer', opacity: isCreating ? 0.5 : 1, transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {isCreating ? <><LoaderCircle size={16} className="animate-spin" /> Creando...</> : 'Crear Ronda'}
                </button>
              </div>
            </div>

            {/* --- TARJETA DE ELIMINACIÓN GENERAL --- */}
            <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', border: '1px solid #f87171' }}>
              <div style={{ color: '#dc2626', padding: '10px 12px', borderRadius: '6px', fontSize: '15px', fontWeight: '600', marginBottom: '12px', background: '#fee2e2', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={16}/>Zona de Peligro</div>
              <p style={{fontSize: '13px', color: '#4b5563', margin: '0 0 12px 0'}}>Esta acción eliminará permanentemente todas las partidas y rondas del juego y grupo seleccionados.</p>
              <button onClick={() => setShowDeleteConfirm(true)} disabled={isDeletingAll || partidas.length === 0} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: (isDeletingAll || partidas.length === 0) ? 'not-allowed' : 'pointer', opacity: (isDeletingAll || partidas.length === 0) ? 0.5 : 1, transition: 'background 0.2s', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {isDeletingAll ? <><LoaderCircle size={16} className="animate-spin" /> Eliminando...</> : <><Trash2 size={16}/> Eliminar Todo</>}
              </button>
            </div>
        </aside>
      </main>

      {/* --- MODAL PARA CONFIRMAR ELIMINACIÓN TOTAL --- */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <h2 style={{marginTop: 0, color: '#1f2937'}}>¿Estás seguro?</h2>
            <p style={{color: '#4b5563'}}>Estás a punto de eliminar <strong>todas las partidas y rondas</strong> del Juego {idJuego} / Grupo {idGrupo}. Esta acción no se puede deshacer.</p>
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px'}}>
              <button onClick={() => setShowDeleteConfirm(false)} disabled={isDeletingAll} style={{padding: '10px 20px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontWeight: '500'}}>Cancelar</button>
              <button onClick={handleDeleteAllPartidas} disabled={isDeletingAll} style={{padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isDeletingAll ? <><LoaderCircle size={16} className="animate-spin"/> Eliminando...</> : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdministrarGrupoJuego;
