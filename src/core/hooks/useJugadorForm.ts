import { useState } from 'react';
import { insertarJugador, validarJugador, type JugadorData } from '../api/agregarJugadores';

interface DatosJugador {
  nombre: string;
  nombreAcompanante: string;
  empresa: string;
  empresaAcompanante: string;
  nivel: number;
}

interface ErroresJugador {
  nombre?: string;
  nombreAcompanante?: string;
  empresa?: string;
  empresaAcompanante?: string;
  nivel?: string;
}

type ResultadoProcesamiento =
  | { exito: true; jugador: DatosJugador }
  | { exito: false; error: string };

export const useJugadorForm = (nombreInicial: string = '') => {
  const [datos, setDatos] = useState<DatosJugador>({
    nombre: nombreInicial,
    nombreAcompanante: '',
    empresa: '',
    empresaAcompanante: '',
    nivel: 0
  });
  
  const [errores, setErrores] = useState<ErroresJugador>({});
  const [cargando, setCargando] = useState(false);

  const validarFormulario = (): boolean => {
    console.log('🔍 Iniciando validación del formulario...');
    console.log('📝 Datos actuales:', datos);
    
    const nuevosErrores: ErroresJugador = {};

    // Validar nombre del jugador principal
    if (!datos.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del jugador principal es requerido';
      console.log('❌ Error: Nombre del jugador principal vacío');
    } else if (datos.nombre.trim().length < 2) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
      console.log('❌ Error: Nombre del jugador principal muy corto');
    } else {
      console.log('✅ Nombre del jugador principal válido:', datos.nombre.trim());
    }

    // Validar nombre del acompañante
    if (!datos.nombreAcompanante.trim()) {
      nuevosErrores.nombreAcompanante = 'El nombre del acompañante es requerido';
      console.log('❌ Error: Nombre del acompañante vacío');
    } else if (datos.nombreAcompanante.trim().length < 2) {
      nuevosErrores.nombreAcompanante = 'El nombre del acompañante debe tener al menos 2 caracteres';
      console.log('❌ Error: Nombre del acompañante muy corto');
    } else {
      console.log('✅ Nombre del acompañante válido:', datos.nombreAcompanante.trim());
    }

    // Validar empresa del jugador principal
    if (!datos.empresa.trim()) {
      nuevosErrores.empresa = 'La empresa del jugador principal es requerida';
      console.log('❌ Error: Empresa del jugador principal vacía');
    } else {
      console.log('✅ Empresa del jugador principal válida:', datos.empresa.trim());
    }

    // Validar empresa del acompañante
    if (!datos.empresaAcompanante.trim()) {
      nuevosErrores.empresaAcompanante = 'La empresa del acompañante es requerida';
      console.log('❌ Error: Empresa del acompañante vacía');
    } else {
      console.log('✅ Empresa del acompañante válida:', datos.empresaAcompanante.trim());
    }

    // Validar nivel (siempre debe ser 0 para nuevos jugadores)
    if (datos.nivel !== 0) {
      nuevosErrores.nivel = 'Los nuevos jugadores deben tener nivel 0';
      console.log('❌ Error: Nivel incorrecto:', datos.nivel);
    } else {
      console.log('✅ Nivel válido:', datos.nivel);
    }

    // Usar también la validación de la API
    try {
      const erroresApi = validarJugador({
        nombre: datos.nombre.trim(),
        nombreAcompanante: datos.nombreAcompanante.trim(),
        empresa: datos.empresa.trim(),
        empresaAcompanante: datos.empresaAcompanante.trim(),
        nivel: datos.nivel,
        activo: true
      });

      console.log('🔧 Errores de la API:', erroresApi);

      // Convertir errores de la API al formato del formulario
      erroresApi.forEach(error => {
        if (error.includes('nombre del jugador principal')) {
          nuevosErrores.nombre = error;
        } else if (error.includes('nombre del acompañante')) {
          nuevosErrores.nombreAcompanante = error;
        } else if (error.includes('empresa del jugador principal')) {
          nuevosErrores.empresa = error;
        } else if (error.includes('empresa del acompañante')) {
          nuevosErrores.empresaAcompanante = error;
        } else if (error.includes('nivel')) {
          nuevosErrores.nivel = error;
        }
      });
    } catch (error) {
      console.error('💥 Error en validación de API:', error);
    }

    console.log('🔍 Errores finales:', nuevosErrores);
    setErrores(nuevosErrores);
    
    const esValido = Object.keys(nuevosErrores).length === 0;
    console.log('✅ Formulario válido:', esValido);
    
    return esValido;
  };

  const actualizarDatos = (campo: keyof DatosJugador, valor: string | number) => {
    console.log(`📝 Actualizando ${campo}:`, valor);
    
    setDatos(prev => ({ 
      ...prev, 
      [campo]: campo === 'nivel' ? Number(valor) : valor 
    }));
    
    // Limpiar error del campo cuando se modifica
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: undefined }));
    }
  };

  const resetearFormulario = () => {
    console.log('🔄 Reseteando formulario...');
    setDatos({
      nombre: nombreInicial,
      nombreAcompanante: '',
      empresa: '',
      empresaAcompanante: '',
      nivel: 0
    });
    setErrores({});
    setCargando(false);
  };

  const procesarJugador = async (): Promise<ResultadoProcesamiento> => {
    console.log('🚀 Iniciando procesamiento del jugador...');
    setCargando(true);

    try {
      const jugadorData: Omit<JugadorData, 'activo'> = {
        nombre: datos.nombre.trim(),
        nombreAcompanante: datos.nombreAcompanante.trim(),
        empresa: datos.empresa.trim(),
        empresaAcompanante: datos.empresaAcompanante.trim(),
        nivel: datos.nivel
      };

      console.log('📤 Enviando datos a la API:', jugadorData);

      // Llamar a la API para insertar el jugador
      const resultado = await insertarJugador(jugadorData);

      console.log('📥 Respuesta de la API:', resultado);

      if (resultado.success) {
        console.log('✅ Jugador agregado exitosamente:', jugadorData);
        
        return {
          exito: true,
          jugador: jugadorData
        };
      } else {
        console.error('❌ Error de la API:', resultado.error);
        
        return {
          exito: false,
          error: resultado.error || 'Error desconocido al agregar jugador'
        };
      }

    } catch (error) {
      console.error('💥 Error al agregar jugador:', error);
      
      return {
        exito: false,
        error: error instanceof Error ? error.message : 'Error al procesar el jugador'
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