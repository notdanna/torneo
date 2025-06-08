import type { Jugador } from '../../models/torneo.ts';
import { jugadoresInsert } from './jugadoresInsert.ts';

// Lista de ejemplo de jugadores para insertar (sin id_jugador)
const jugadoresParaInsertar: Omit<Jugador, 'id_jugador'>[] = [
    {
        nombre: "Miguel Gomez",
        empresa: "One",
        nivel: 3,
        activo: true
    },
    {
        nombre: "Pedro Ramirez",
        empresa: "Two",
        nivel: 2,
        activo: true
    },
    {
        nombre: "Luisa Martinez",
        empresa: "Three",
        nivel: 1,
        activo: false
    }
];

// Ejecutar la inserción
jugadoresInsert(jugadoresParaInsertar);