// Recuperar de juego con el id y el numero de jugadores de ese juego para separarlos en grupos de 32 
// La coleccion de grupos está en torneo/{id_torneo}/juego/{id_juego}/grupos. Es importante que el juego debe existir antes de insertar grupos
// id_juego: number; -> 1 = Futbolito, 2 = Futbolito Soplado, 3 = Ruelas, 4 = Beer Pong

import { db } from "../../../firebase.ts";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
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

// Modificar la función crearNuevoGrupo para aceptar el uid del juego
const crearNuevoGrupo = (idJuego: number, idGrupo: number, juegoUid: string): Grupo => {
    const baseGrupo = {
        id_grupo: idGrupo,
        id_juego: idJuego,
        participantes: [],
        num_grupo: idGrupo,
    };

    switch (idJuego) {
        case 1: // Futbolito
            return {
                ...baseGrupo,                
                id_futbolito: juegoUid
            };
        case 2: // Futbolito Soplado
            return {
                ...baseGrupo,
                id_futbolitos_soplados: juegoUid
            };
        case 3: // Ruelas
            return {
                ...baseGrupo,
                id_ruelas: juegoUid
            };
        case 4: // Beer Pong
            return {
                ...baseGrupo,
                id_beer_pong: juegoUid
            };
        default:
            throw new Error(`Tipo de juego no válido: ${idJuego}`);
    }
};

// Modificar la función principal para pasar el uid del juego
export const crearGruposParaJuego = async (idJuego: number) => {
    try {
        let gruposCreados = 0;
        const torneosRef = collection(db, "torneo");
        const torneosSnapshot = await getDocs(torneosRef);

        for (const torneoDoc of torneosSnapshot.docs) {
            const juegosRef = collection(torneoDoc.ref, "juego");
            const juegosQuery = query(juegosRef, where("id_juego", "==", idJuego));
            const juegosSnapshot = await getDocs(juegosQuery);

            for (const juegoDoc of juegosSnapshot.docs) {
                const juego = juegoDoc.data() as Juegos;
                const gruposRef = collection(juegoDoc.ref, "grupos");
                
                // Obtener el último ID y sumar 1
                const ultimoId = await obtenerUltimoIdGrupo(gruposRef);
                const nuevoId = ultimoId + 1;
                
                // Pasar el uid del documento del juego
                const nuevoGrupo = crearNuevoGrupo(idJuego, nuevoId, juegoDoc.id);
                
                await addDoc(gruposRef, nuevoGrupo);
                gruposCreados++;
                console.log(`Grupo ${nuevoId} creado para el juego ${juego.nombre_juego} (${juegoDoc.id}) en torneo ${torneoDoc.id}`);
            }
        }
        
        if (gruposCreados === 0) {
            console.log("No se encontró ningún juego con el ID especificado");
        } else {
            console.log(`Total de grupos creados: ${gruposCreados}`);
        }
    } catch (error) {
        console.error("Error al crear los grupos:", error);
        throw error;
    }
};

// Ejemplo de uso:
// crearGruposParaJuego(1); // Para Futbolito
// crearGruposParaJuego(2); // Para Futbolito Soplado
// crearGruposParaJuego(3); // Para Ruelas
// crearGruposParaJuego(4); // Para Beer Pong





