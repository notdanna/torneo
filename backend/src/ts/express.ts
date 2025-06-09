import express from 'express';
import gruposRouter from './main/grupos/api/grupoInsertExpress.ts';
import juegoRouter from './main/juego/api/juegoInitExpress.ts';

const app = express();
const PORT = 5173;

app.use(express.json());
app.use('/api', gruposRouter, juegoRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});