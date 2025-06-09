import express from 'express';
import { jugadoresIniciador } from '../jugadoresInit.ts';

const juegoRouter = express.Router();

juegoRouter.post('/initJuego', async (req, res) => {
  try {
    await inicializarJuegos();
    res.json({ message: 'Juegos inicializados correctamente' });
  } catch (error) {
    console.error('Error al inicializar los juegos:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

export default juegoRouter;


