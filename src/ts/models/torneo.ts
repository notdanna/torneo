// Clases para la base de datos no relacional con Firebase

export interface Torneo {
    id_torneo: number;
    id_juego: number;
}


// Cuando esten activos ya no pueden jugar, la busqueda se hace por activo: false
export interface Jugador {
    id_jugador: number;
    nombre: string;
    empresa: string;
    // foto: string;
    nivel: number;
    activo: boolean;
}

export interface Grupo {
    id_grupo: number;
    id_juego: number;
    id_participante: number;
    num_grupo: number;
    id_ruelas: string;
    id_futbolito: string;
    id_futbolitos_soplados: string;
    id_beer_pong: string;
}

export interface Partida {
    id_partida: number;
    id_juego: number;
    id_grupo: number;
    // Conjunto de equipos en parejas o individuales en vs
    equiposA: string[];
    equiposB: string[];
    resultado: string;
}



export interface Juego {
    id_juego: number;
    nombre_juego: string;
    premio: string;
    tipo_juego: string;
    num_jugadores: number;
}

// JUEGOS
export interface Ruelas {
    id: string;
}

export interface Futbolito {
    id: string;
    parejas: string[];
}

export interface FutbolitoSoplado {
    id: string;
}

export interface BeerPong {
    id: string;
}