// BusquedaJugador.ts - Versión corregida
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import type { Jugador } from '../../models/torneo';

export const buscarJugadoresPorNombreParcial = async (termino: string): Promise<Jugador[]> => {
  try {
    console.log('🔍 Buscando jugadores con término:', termino);
    
    // Obtener todos los jugadores de Firebase
    const jugadoresRef = collection(db, 'jugadores');
    const snapshot = await getDocs(jugadoresRef);
    
    console.log('📄 Total documentos en Firebase:', snapshot.size);
    
    // Convertir documentos a objetos con ID incluido
    const todosLosJugadores = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('📄 Documento:', { id: doc.id, data });
      
      return {
        id_jugador: doc.id, // ✅ INCLUIR EL ID DEL DOCUMENTO
        nombre: data.nombre || '',
        nombreAcompanante: data.nombreAcompanante || '',
        empresa: data.empresa || '',
        empresaAcompanante: data.empresaAcompanante || '',
        nivel: data.nivel || 0,
        activo: data.activo !== undefined ? data.activo : true,
        fechaCreacion: data.fechaCreacion,
        fechaActualizacion: data.fechaActualizacion
      } as Jugador;
    });
    
    console.log('👥 Todos los jugadores con IDs:', todosLosJugadores);
    
    // Filtrar por término de búsqueda
    const terminoLower = termino.toLowerCase().trim();
    const resultadosFiltrados = todosLosJugadores.filter(jugador => {
      const coincideNombre = jugador.nombre.toLowerCase().includes(terminoLower);
      const coincideAcompanante = jugador.nombreAcompanante && 
        jugador.nombreAcompanante.toLowerCase().includes(terminoLower);
      const coincideEmpresa = jugador.empresa.toLowerCase().includes(terminoLower);
      const coincideEmpresaAcompanante = jugador.empresaAcompanante && 
        jugador.empresaAcompanante.toLowerCase().includes(terminoLower);
      
      return coincideNombre || coincideAcompanante || coincideEmpresa || coincideEmpresaAcompanante;
    });
    
    console.log(`✅ Encontrados ${resultadosFiltrados.length} jugadores que coinciden con "${termino}":`, resultadosFiltrados);
    
    return resultadosFiltrados;
    
  } catch (error) {
    console.error('❌ Error en búsqueda de jugadores:', error);
    throw new Error(`Error al buscar jugadores: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

// ✅ FUNCIÓN ALTERNATIVA: Búsqueda más eficiente (si tienes muchos jugadores)
export const buscarJugadoresPorNombreParcialOptimizada = async (termino: string): Promise<Jugador[]> => {
  try {
    // Para búsquedas más eficientes en Firebase, podrías usar:
    // 1. Indexación en Firestore
    // 2. Algolia Search
    // 3. Cloud Functions con procesamiento del lado servidor
    
    // Por ahora, usar la función principal
    return await buscarJugadoresPorNombreParcial(termino);
  } catch (error) {
    console.error('❌ Error en búsqueda optimizada:', error);
    throw error;
  }
};