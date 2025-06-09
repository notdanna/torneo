import { useState } from 'react';

interface DatosJugador {
  nombre: string;
  empresa: string;
}

interface ErroresJugador {
  nombre?: string;
  empresa?: string;
}

type ResultadoProcesamiento =
  | { exito: true; jugador: DatosJugador }
  | { exito: false; error: string };

export const useJugadorForm = (nombreInicial: string = '') => {
  const [datos, setDatos] = useState<DatosJugador>({
    nombre: nombreInicial,
    empresa: ''
  });
  
  const [errores, setErrores] = useState<ErroresJugador>({});
  const [cargando, setCargando] = useState(false);

  const validarFormulario = (): boolean => {
    const nuevosErrores: ErroresJugador = {};

    if (!datos.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es requerido';
    } else if (datos.nombre.trim().length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!datos.empresa.trim()) {
      nuevosErrores.empresa = 'La empresa es requerida';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const actualizarDatos = (campo: keyof DatosJugador, valor: string) => {
    setDatos(prev => ({ ...prev, [campo]: valor }));
    
    // Limpiar error del campo cuando se modifica
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: undefined }));
    }
  };

  const resetearFormulario = () => {
    setDatos({
      nombre: nombreInicial,
      empresa: ''
    });
    setErrores({});
    setCargando(false);
  };

  const procesarJugador = async (): Promise<ResultadoProcesamiento> => {
    setCargando(true);

    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));

      const jugadorProcesado = {
        nombre: datos.nombre.trim(),
        empresa: datos.empresa.trim()
      };

      console.log('Jugador agregado:', jugadorProcesado);

      return {
        exito: true,
        jugador: jugadorProcesado
      };

    } catch (error) {
      console.error('Error al agregar jugador:', error);
      
      return {
        exito: false,
        error: 'Error al procesar el jugador'
      };
    } finally {
      setCargando(false);
    }
  };

  return {
    datos,
    errores,
    cargando,
    validarFormulario,
    actualizarDatos,
    resetearFormulario,
    procesarJugador
  };
};