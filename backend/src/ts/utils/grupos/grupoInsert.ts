// Recuperar de juego con el id y el numero de jugadores de ese juego para separarlos en grupos de 32 
// La coleccion de grupos está en torneo/{id_torneo}/juego/{id_juego}/grupos. Es importante que el juego debe existir antes de insertar grupos
// id_juego: number; -> 1 = Futbolito, 2 = Futbolito Soplado, 3 = Ruelas, 4 = Beer Pong

import { db } from "../../../firebase.ts";
import { collection, addDoc } from "firebase/firestore";
import type { Grupo } from "../../models/torneo.ts";





