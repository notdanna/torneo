import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase'; // Asegúrate de que la ruta a tu config de firebase sea correcta

// Definimos una interfaz para el objeto Grupo que esperamos de Firestore
export interface GrupoFirestore {
  id: string; // Este será el ID del DOCUMENTO de Firestore
  id_grupo: number; // Este es el campo numérico que necesitas
  nombre: string;
  // ...otros campos que pueda tener tu grupo
}

/**
 * Obtiene los grupos de un juego específico dentro de un torneo.
 * @param torneoId - El ID del torneo (en tu ejemplo, '1').
 * @param juegoId - El ID del juego (en tu ejemplo, '1').
 * @returns Una promesa con un array de grupos.
 */
export const getGruposPorJuego = async (torneoId: string | number, juegoId: string | number): Promise<GrupoFirestore[]> => {
  // Construimos la ruta a la subcolección de grupos
  const rutaAGrupos = `torneo/${torneoId}/juego/${juegoId}/grupos`;
  const gruposCollectionRef = collection(db, rutaAGrupos);

  console.log(`Consultando grupos en la ruta: ${rutaAGrupos}`);

  try {
    const querySnapshot = await getDocs(gruposCollectionRef);
    
    if (querySnapshot.empty) {
      console.warn("No se encontraron grupos para este juego.");
      return [];
    }

    const grupos = querySnapshot.docs.map(doc => ({
      id: doc.id, // El ID alfanumérico único del documento
      ...doc.data() // Todos los campos dentro del documento
    })) as GrupoFirestore[];

    console.log("Grupos encontrados:", grupos);
    return grupos;

  } catch (error) {
    console.error("Error al obtener los grupos desde Firestore:", error);
    throw new Error("No se pudieron cargar los grupos.");
  }
};