import express from 'express';
import { crearGruposParaJuego } from '../grupoInsert.ts';

const gruposRouter = express.Router();

gruposRouter.post('/grupos/:idJuego', async (req, res) => {
  try {
    const idJuego = parseInt(req.params.idJuego); 
    const idTorneo = 1;

    console.log(`Recibida petición para crear grupos del juego ${idJuego}`);
    
    await crearGruposParaJuego(idJuego, idTorneo);

    // await obtenerUltimoIdGrupo(idJuego);  
    
    res.json({ message: `Grupos creados exitosamente para el juego ${idJuego}` });
    
  } catch (error) {
    console.error('Error en el endpoint:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

export default gruposRouter;










