// Recuperar de juego con el id y el numero de jugadores de ese juego para separarlos en grupos de 32 
// La coleccion de grupos está en torneo/{id_torneo}/juego/{id_juego}/grupos. Es importante que el juego debe existir antes de insertar grupos
// id_juego: number; -> 1 = Futbolito, 2 = Futbolito Soplado, 3 = Ruelas, 4 = Beer Pong

import { db } from "../../../firebase.ts";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import type { Grupo, Juegos } from "../../models/torneo.ts";

const crearNuevoGrupo = (idJuego: number): Grupo => {
    const baseGrupo = {
        id_grupo: 1,
        id_juego: idJuego,
        // Conjunto de equipos en parejas o individuales
        participantes: [],
        num_grupo: 1,
    };

    switch (idJuego) {
        case 1: // Futbolito
            return {
                ...baseGrupo,
                id_futbolito: "pending",
                id_ruelas: "",
                id_futbolitos_soplados: "",
                id_beer_pong: ""
            };
        case 2: // Futbolito Soplado
            return {
                ...baseGrupo,
                id_futbolito: "",
                id_ruelas: "",
                id_futbolitos_soplados: "pending",
                id_beer_pong: ""
            };
        case 3: // Ruelas
            return {
                ...baseGrupo,
                id_futbolito: "",
                id_ruelas: "pending",
                id_futbolitos_soplados: "",
                id_beer_pong: ""
            };
        case 4: // Beer Pong
            return {
                ...baseGrupo,
                id_futbolito: "",
                id_ruelas: "",
                id_futbolitos_soplados: "",
                id_beer_pong: "pending"
            };
        default:
            throw new Error(`Tipo de juego no válido: ${idJuego}`);
    }
};

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
                
                const nuevoGrupo = crearNuevoGrupo(idJuego);
                
                await addDoc(gruposRef, nuevoGrupo);
                gruposCreados++;
                console.log(`Grupo creado exitosamente para el juego ${juego.nombre_juego} en torneo ${torneoDoc.id}`);
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





