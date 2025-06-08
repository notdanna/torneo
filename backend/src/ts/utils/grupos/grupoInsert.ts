// Recuperar de juego con el id y el numero de jugadores de ese juego para separarlos en grupos de 32 
// La coleccion de grupos está en torneo/{id_torneo}/juego/{id_juego}/grupos. Es importante que el juego debe existir antes de insertar grupos
// id_juego: number; -> 1 = Futbolito, 2 = Futbolito Soplado, 3 = Ruelas, 4 = Beer Pong

import { db } from "../../../../../src/firebase.ts";
import { collection, getDocs, query, where, setDoc, doc, getDoc } from "firebase/firestore";
import type { Grupo, Juegos } from "../../models/torneo.ts";

// Agregar esta función para obtener el último ID de grupo
const obtenerUltimoIdGrupo = async (gruposRef: any): Promise<number> => {
    const gruposSnapshot = await getDocs(gruposRef);
    if (gruposSnapshot.empty) return 0;
    
    let maxId = 0;
    gruposSnapshot.forEach((doc) => {
        const grupo = doc.data() as Grupo;
        if (grupo.id_grupo > maxId) {
            maxId = grupo.id_grupo;
        }
    });
    return maxId;
};

const JUEGO_ID_MAP = new Map<number, string>([
    [1, 'id_futbolito'],
    [2, 'id_futbolitos_soplados'],
    [3, 'id_ruelas'],
    [4, 'id_beer_pong']
]);

// Modificar la función crearNuevoGrupo para aceptar el uid del juego
const crearNuevoGrupo = (idJuego: number, idGrupo: number): Grupo => {
    if (!JUEGO_ID_MAP.has(idJuego)) {
        throw new Error(`Tipo de juego no válido: ${idJuego}`);
    }

    return {
        id_grupo: idGrupo,
        id_juego: idJuego,
        participantes: [],
        num_grupo: idGrupo,
        [JUEGO_ID_MAP.get(idJuego)!]: idGrupo // Usamos directamente el número secuencial
    };
};

// Modificar la función principal para pasar el id del juego y el id del torneo
export const crearGruposParaJuego = async (idJuego: number, idTorneo: number) => {
    try {
        let gruposCreados = 0;
        const torneoRef = doc(db, "torneo", idTorneo.toString());
        const torneoDoc = await getDoc(torneoRef);

        if (!torneoDoc.exists()) {
            throw new Error(`No se encontró el torneo con ID ${idTorneo}`);
        }

        const juegosRef = collection(torneoRef, "juego");
        const juegosQuery = query(juegosRef, where("id_juego", "==", idJuego));
        const juegosSnapshot = await getDocs(juegosQuery);

        if (juegosSnapshot.empty) {
            throw new Error(`No se encontró el juego ${idJuego} en el torneo ${idTorneo}`);
        }

        for (const juegoDoc of juegosSnapshot.docs) {
            const juego = juegoDoc.data() as Juegos;
            
            // Validar que el juego corresponda al tipo correcto
            if (juego.id_juego !== idJuego) {
                throw new Error(`El juego encontrado (${juego.id_juego}) no corresponde al tipo solicitado (${idJuego})`);
            }

            const gruposRef = collection(juegoDoc.ref, "grupos");
            const ultimoId = await obtenerUltimoIdGrupo(gruposRef);
            const nuevoId = ultimoId + 1;
            
            const nuevoGrupo = crearNuevoGrupo(idJuego, nuevoId);
            
            const grupoDocRef = doc(gruposRef, nuevoId.toString());
            await setDoc(grupoDocRef, nuevoGrupo);
            
            gruposCreados++;
            console.log(`Grupo ${nuevoId} creado para el juego ${juego.nombre_juego} en torneo ${idTorneo}`);
        }
        
        if (gruposCreados === 0) {
            console.log("No se crearon grupos");
        } else {
            console.log(`Total de grupos creados: ${gruposCreados}`);
        }
    } catch (error) {
        console.error("Error al crear los grupos:", error);
        throw error;
    }
};

// Ejemplo de uso:
// crearGruposParaJuego(1, 7); // Para Futbolito en el torneo 7
// crearGruposParaJuego(2, 7); // Para Futbolito Soplado en el torneo 7
// crearGruposParaJuego(3, 7); // Para Ruelas en el torneo 7
// crearGruposParaJuego(4, 7); // Para Beer Pong en el torneo 7





