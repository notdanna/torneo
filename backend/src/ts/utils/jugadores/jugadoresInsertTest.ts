import type { Jugador } from '../../models/torneo.ts';
import { jugadoresInsert } from './jugadoresInsert.ts';

// Lista de ejemplo de jugadores para insertar (sin id_jugador)
const jugadoresParaInsertar: Omit<Jugador, 'id_jugador'>[] = [
    {
        nombre: "Juan Pérez",
        empresa: "TechCorp",
        nivel: 3,
        activo: true
    },
    {
        nombre: "María García",
        empresa: "DataSoft",
        nivel: 2,
        activo: true
    },
    {
        nombre: "Carlos López",
        empresa: "InnovaSys",
        nivel: 1,
        activo: false
    }
];

// Ejecutar la inserción
jugadoresInsert(jugadoresParaInsertar);