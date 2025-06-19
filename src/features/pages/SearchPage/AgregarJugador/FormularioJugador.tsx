import * as React from 'react';
import { FormularioJugadorProps, PasoWizard } from '../../../../core/models/formulario.ts';
import { useWizardNavigation } from '../../../../core/hooks/formulario/useNavigation';
import { useFormularioJugador } from '../../../../core/hooks/formulario/useFormularioJugador';
import { useJugadorWorkflow } from '../../../../core/hooks/formulario/useJugadorWorkFlow';
// Componentes
import IndicadorProgreso from './IndicadorProgreso.tsx';
import PasoDatosPareja from './PasoDatosPareja.tsx';
import PasoSeleccionJuego from './PasosSeleccionJuego.tsx';
import PasoSeleccionGrupo from './PasoSeleccionGrupo.tsx';
import MensajesEstado from './MensajesEstados.tsx';

import './FormularioJugador.css';

const FormularioJugador: React.FC<FormularioJugadorProps> = (props) => {
  const {
    onCancelar,
    nombreInicial = '',
    jugadorParaEditar = null,
    modoEdicion = false,
    onJugadorAgregado
  } = props;
  
  // Hooks personalizados
  const wizard = useWizardNavigation();
  const formulario = useFormularioJugador({ nombreInicial, jugadorParaEditar, modoEdicion });
  
  // 🔍 VERIFICACIÓN RÁPIDA jugadorCreado ANTES DEL HOOK:
  console.log('🔍 VERIFICACIÓN RÁPIDA jugadorCreado:');
  console.log('- wizard.pasoActual:', wizard.pasoActual);
  console.log('- formulario.jugadorCreado:', formulario.jugadorCreado);
  console.log('- formulario.jugadorCreado?.id_jugador:', formulario.jugadorCreado?.id_jugador);
  console.log('- typeof formulario.jugadorCreado?.id_jugador:', typeof formulario.jugadorCreado?.id_jugador);
  console.log('- formulario.jugadorCreado?.id_jugador === "":', formulario.jugadorCreado?.id_jugador === "");
  console.log('- formulario.jugadorCreado?.id_jugador === null:', formulario.jugadorCreado?.id_jugador === null);
  console.log('- formulario.jugadorCreado?.id_jugador === undefined:', formulario.jugadorCreado?.id_jugador === undefined);
  console.log('- JSON.stringify(formulario.jugadorCreado):', JSON.stringify(formulario.jugadorCreado));
  
  const workflow = useJugadorWorkflow(wizard.pasoActual, formulario.jugadorCreado, onJugadorAgregado);

  // 🔍 VERIFICACIÓN DESPUÉS DEL HOOK:
  console.log('🔍 ESTADO DESPUÉS DE INICIALIZAR WORKFLOW:');
  console.log('- workflow.juegoSeleccionado:', workflow.juegoSeleccionado);
  console.log('- workflow.error:', workflow.error);

  // Manejadores de pasos con validación de duplicados
  const handleConfirmarPaso1 = async () => {
    console.log('🚀 EJECUTANDO handleConfirmarPaso1');
    console.log('- formulario.jugadorCreado ANTES de guardar:', formulario.jugadorCreado);
    
    const success = await formulario.guardarJugador();
    console.log('- success:', success);
    console.log('- formulario.jugadorCreado DESPUÉS de guardar:', formulario.jugadorCreado);
    
    if (success) {
      setTimeout(() => {
        wizard.irAlSiguientePaso();
        formulario.setSuccess(null);
      }, 1500);
    } else {
    }
  };

  const handleConfirmarPaso2 = async () => {
    console.log('🚀 EJECUTANDO handleConfirmarPaso2');
    console.log('- wizard.pasoActual:', wizard.pasoActual);
    console.log('- formulario.jugadorCreado:', formulario.jugadorCreado);
    console.log('- formulario.jugadorCreado?.id_jugador:', formulario.jugadorCreado?.id_jugador);
    console.log('- workflow.juegoSeleccionado:', workflow.juegoSeleccionado);
    
    const success = await workflow.confirmarPaso2();
    console.log('- Resultado de workflow.confirmarPaso2():', success);
    
    if (success) {
      setTimeout(() => {
        wizard.irAlSiguientePaso();
        workflow.setSuccess(null);
      }, 1500);
    }
  };

  const handleConfirmarPaso3 = async () => {
    console.log('🚀 EJECUTANDO handleConfirmarPaso3');
    await workflow.confirmarPaso3();
  };

  const handleCancelar = () => {
    formulario.resetForm();
    workflow.resetWorkflow();
    wizard.reiniciarWizard();
    onCancelar();
  };

  const sharedStepProps = {
    onCancelar: handleCancelar,
  };

  // Log del estado actual para debugging
  React.useEffect(() => {
    console.log('📊 Estado actual del formulario:', {
      paso: wizard.pasoActual,
      jugadorCreado: !!formulario.jugadorCreado,
      jugadorCreadoId: formulario.jugadorCreado?.id_jugador,
      validando: formulario.validando,
      mostrandoAlerta: formulario.mostrarAlertaDuplicados,
      similares: formulario.jugadoresSimilares.length,
      error: formulario.error,
      success: formulario.success,
      workflowError: workflow.error,
      juegoSeleccionado: workflow.juegoSeleccionado
    });
  }, [
    wizard.pasoActual,
    formulario.jugadorCreado,
    formulario.validando,
    formulario.mostrarAlertaDuplicados,
    formulario.jugadoresSimilares.length,
    formulario.error,
    formulario.success,
    workflow.error,
    workflow.juegoSeleccionado
  ]);

  return (
    <div className="formulario-wizard" role="main" aria-label="Formulario de registro de jugador">
      {/* Indicador de progreso */}
      <IndicadorProgreso 
        pasoActual={wizard.pasoActual}
        className="mb-4"
      />

      {/* Mensajes de estado globales */}
      <MensajesEstado
        error={formulario.error || workflow.error || undefined}
        errorSecundario={workflow.errorGrupo || undefined}
        success={formulario.success || workflow.success || undefined}
        warning={
          // Mostrar advertencia si hay similares pero no duplicados exactos
          !formulario.mostrarAlertaDuplicados && formulario.jugadoresSimilares.length > 0
            ? `Se encontraron ${formulario.jugadoresSimilares.length} registro(s) similar(es). Verifica antes de continuar.`
            : undefined
        }
        className="mb-4"
      />

      {/* Renderizado condicional de pasos */}
      <div className="wizard-content">
        {wizard.pasoActual === PasoWizard.DATOS_PAREJA && (
          <PasoDatosPareja
            formData={formulario.formData}
            loading={formulario.loading}
            onInputChange={formulario.handleInputChange}
            onConfirmar={handleConfirmarPaso1}
            getNivelTexto={formulario.getNivelTexto}
            
            // Props para validación de duplicados
            mostrarAlertaDuplicados={formulario.mostrarAlertaDuplicados}
            jugadoresSimilares={formulario.jugadoresSimilares}
            ultimaValidacion={formulario.ultimaValidacion}
            onCerrarAlertaDuplicados={formulario.cerrarAlertaDuplicados}
            onContinuarConSimilares={formulario.manejarContinuarConSimilares}
            validando={formulario.validando}
            
            {...sharedStepProps}
          />
        )}

        {wizard.pasoActual === PasoWizard.SELECCION_JUEGO && (
          <PasoSeleccionJuego
            jugadorCreado={formulario.jugadorCreado}
            juegos={workflow.juegos}
            juegoSeleccionado={workflow.juegoSeleccionado}
            cargandoJuegos={workflow.cargandoJuegos}
            loading={workflow.loading}
            errorJuegos={workflow.errorJuegos || undefined}
            onJuegoSeleccionado={workflow.handleJuegoSeleccionado}
            onConfirmar={handleConfirmarPaso2}
            obtenerNombreJuego={workflow.obtenerNombreJuego}
            {...sharedStepProps}
          />
        )}

        {wizard.pasoActual === PasoWizard.SELECCION_GRUPO && (
          <PasoSeleccionGrupo
            jugadorCreado={formulario.jugadorCreado}
            juegoSeleccionado={workflow.juegoSeleccionado}
            gruposDisponibles={workflow.gruposDisponibles}
            grupoSeleccionado={workflow.grupoSeleccionadoLocal}
            cargandoGrupos={workflow.cargandoGrupos}
            loadingGrupo={workflow.loadingGrupo}
            dataGrupo={workflow.dataGrupo}
            grupoSeleccionadoInfo={workflow.grupoSeleccionadoInfo}
            formDataNivel={formulario.formData.nivel}
            onSeleccionarGrupo={workflow.handleSeleccionarGrupo}
            onConfirmar={handleConfirmarPaso3}
            obtenerNombreJuego={workflow.obtenerNombreJuego}
            getNivelTexto={formulario.getNivelTexto}
            {...sharedStepProps}
          />
        )}
      </div>
    </div>
  );
};

export default FormularioJugador;