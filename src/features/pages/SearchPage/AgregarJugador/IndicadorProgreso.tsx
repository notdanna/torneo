import * as React from 'react';
import { PasoWizard } from '../../../../core/models/formulario.ts';

interface IndicadorProgresoProps {
  pasoActual: PasoWizard;
  className?: string;
}

interface StepInfo {
  paso: PasoWizard;
  numero: number;
  label: string;
  icono: string;
}

const STEPS: StepInfo[] = [
  {
    paso: PasoWizard.DATOS_PAREJA,
    numero: 1,
    label: "Datos de Pareja",
    icono: ""
  },
  {
    paso: PasoWizard.SELECCION_JUEGO,
    numero: 2,
    label: "Seleccionar Juego",
    icono: ""
  },
  {
    paso: PasoWizard.SELECCION_GRUPO,
    numero: 3,
    label: "Seleccionar Grupo",
    icono: ""
  }
];

const IndicadorProgreso: React.FC<IndicadorProgresoProps> = ({ 
  pasoActual, 
  className = "" 
}) => {
  const getStepStatus = (paso: PasoWizard) => {
    if (pasoActual > paso) return 'completed';
    if (pasoActual === paso) return 'active';
    return 'pending';
  };

  const getProgressPercentage = () => {
    return ((pasoActual - 1) / (STEPS.length - 1)) * 100;
  };

  return (
    <div className={`wizard-progress ${className}`}>
      {/* Barra de progreso */}
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill"
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* Steps */}
      <div className="progress-steps">
        {STEPS.map((step) => {
          const status = getStepStatus(step.paso);
          return (
            <div 
              key={step.paso}
              className={`step ${status}`}
              data-step={step.numero}
            >
              <div className="step-circle">
                <span className="step-number">
                  {status === 'completed' ? '✓' : step.numero}
                </span>
              </div>
              <div className="step-content">
                <span className="step-icon">{step.icono}</span>
                <span className="step-label">{step.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Información del paso actual */}
      <div className="current-step-info">
        <span className="current-step-text">
        </span>
      </div>
    </div>
  );
};

export default IndicadorProgreso;