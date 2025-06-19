import { useState } from 'react';
import { PasoWizard } from '../../models/formulario.ts';

export const useWizardNavigation = () => {
  const [pasoActual, setPasoActual] = useState<PasoWizard>(PasoWizard.DATOS_PAREJA);

  const irAlSiguientePaso = () => {
    switch (pasoActual) {
      case PasoWizard.DATOS_PAREJA:
        setPasoActual(PasoWizard.SELECCION_JUEGO);
        break;
      case PasoWizard.SELECCION_JUEGO:
        setPasoActual(PasoWizard.SELECCION_GRUPO);
        break;
      case PasoWizard.SELECCION_GRUPO:
        // Ya está en el último paso
        break;
    }
  };

  const irAlPasoAnterior = () => {
    switch (pasoActual) {
      case PasoWizard.SELECCION_GRUPO:
        setPasoActual(PasoWizard.SELECCION_JUEGO);
        break;
      case PasoWizard.SELECCION_JUEGO:
        setPasoActual(PasoWizard.DATOS_PAREJA);
        break;
      case PasoWizard.DATOS_PAREJA:
        // Ya está en el primer paso
        break;
    }
  };

  const irAPaso = (paso: PasoWizard) => {
    setPasoActual(paso);
  };

  const reiniciarWizard = () => {
    setPasoActual(PasoWizard.DATOS_PAREJA);
  };

  const esElPrimerPaso = () => pasoActual === PasoWizard.DATOS_PAREJA;
  const esElUltimoPaso = () => pasoActual === PasoWizard.SELECCION_GRUPO;

  // Función para obtener el progreso actual (útil para barras de progreso)
  const obtenerProgreso = () => {
    const totalPasos = Object.keys(PasoWizard).length / 2; // Enum tiene keys duplicados
    return (pasoActual / totalPasos) * 100;
  };

  // Validar si se puede avanzar al siguiente paso
  const puedeAvanzar = (condiciones: {
    paso1Valido?: boolean;
    juegoSeleccionado?: boolean;
    grupoSeleccionado?: boolean;
  }) => {
    switch (pasoActual) {
      case PasoWizard.DATOS_PAREJA:
        return condiciones.paso1Valido ?? false;
      case PasoWizard.SELECCION_JUEGO:
        return condiciones.juegoSeleccionado ?? false;
      case PasoWizard.SELECCION_GRUPO:
        return condiciones.grupoSeleccionado ?? false;
      default:
        return false;
    }
  };

  // Función para obtener información del paso actual
  const obtenerInfoPaso = () => {
    switch (pasoActual) {
      case PasoWizard.DATOS_PAREJA:
        return {
          numero: 1,
          titulo: "Datos de la Pareja",
          descripcion: "Ingresa los datos de los participantes",
          icono: "👤"
        };
      case PasoWizard.SELECCION_JUEGO:
        return {
          numero: 2,
          titulo: "Seleccionar Juego",
          descripcion: "Elige el juego donde participará la pareja",
          icono: "🎮"
        };
      case PasoWizard.SELECCION_GRUPO:
        return {
          numero: 3,
          titulo: "Seleccionar Grupo",
          descripcion: "Elige el grupo donde competirá la pareja",
          icono: "📁"
        };
      default:
        return {
          numero: 1,
          titulo: "Paso desconocido",
          descripcion: "",
          icono: "❓"
        };
    }
  };

  return {
    // Estado
    pasoActual,
    
    // Acciones de navegación
    irAlSiguientePaso,
    irAlPasoAnterior,
    irAPaso,
    reiniciarWizard,
    
    // Información del estado
    esElPrimerPaso,
    esElUltimoPaso,
    obtenerProgreso,
    obtenerInfoPaso,
    puedeAvanzar,
    
    // Setter directo (por si necesitas control manual)
    setPasoActual,
  };
};