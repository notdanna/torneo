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
  const workflow = useJugadorWorkflow(wizard.pasoActual, formulario.jugadorCreado, onJugadorAgregado);

  // Manejadores de pasos con validación de duplicados
  const handleConfirmarPaso1 = async () => {
    console.log('🚀 Iniciando confirmación paso 1');
    const success = await formulario.guardarJugador();
    if (success) {
      console.log('✅ Paso 1 completado, avanzando...');
      setTimeout(() => {
        wizard.irAlSiguientePaso();
        formulario.setSuccess(null);
      }, 1500);
    } else {
      console.log('❌ Paso 1 falló, permaneciendo en el paso');
    }
  };

  const handleConfirmarPaso2 = async () => {
    console.log('🚀 Iniciando confirmación paso 2');
    const success = await workflow.confirmarPaso2();
    if (success) {
      console.log('✅ Paso 2 completado, avanzando...');
      setTimeout(() => {
        wizard.irAlSiguientePaso();
        workflow.setSuccess(null);
      }, 1500);
    }
  };

  const handleConfirmarPaso3 = async () => {
    console.log('🚀 Iniciando confirmación paso 3');
    await workflow.confirmarPaso3();
  };

  const handleCancelar = () => {
    console.log('❌ Cancelando formulario');
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
      validando: formulario.validando,
      mostrandoAlerta: formulario.mostrarAlertaDuplicados,
      similares: formulario.jugadoresSimilares.length,
      error: formulario.error,
      success: formulario.success
    });
  }, [
    wizard.pasoActual,
    formulario.jugadorCreado,
    formulario.validando,
    formulario.mostrarAlertaDuplicados,
    formulario.jugadoresSimilares.length,
    formulario.error,
    formulario.success
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

      {/* Botón de debug temporal */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-controls" style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
          <button
            onClick={async () => {
              console.log('🧪 INICIANDO TEST DE DUPLICADOS');
              const testResult = await formulario.validarDuplicados();
              console.log('🧪 Resultado del test:', testResult);
              alert(`Test resultado: ${testResult ? 'Válido' : 'Duplicado detectado'}`);
            }}
            style={{
              background: '#e74c3c',
              color: 'white',
              padding: '10px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🧪 TEST DUPLICADOS
          </button>
        </div>
      )}

      {/* Información de depuración (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info" style={{ marginTop: '20px', padding: '10px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '5px' }}>
          <details>
            <summary>🔧 Info de depuración</summary>
            <div className="debug-content">
              <div className="debug-section">
                <h6>Estado del Wizard:</h6>
                <p><strong>Paso actual:</strong> {wizard.pasoActual}</p>
                <p><strong>Modo edición:</strong> {modoEdicion ? 'Sí' : 'No'}</p>
              </div>
              
              <div className="debug-section">
                <h6>Estado del Formulario:</h6>
                <p><strong>Jugador creado:</strong> {formulario.jugadorCreado ? `Sí (ID: ${formulario.jugadorCreado.id})` : 'No'}</p>
                <p><strong>Validando duplicados:</strong> {formulario.validando ? 'Sí' : 'No'}</p>
                <p><strong>Similares encontrados:</strong> {formulario.jugadoresSimilares.length}</p>
                <p><strong>Mostrando alerta:</strong> {formulario.mostrarAlertaDuplicados ? 'Sí' : 'No'}</p>
                <p><strong>Error:</strong> {formulario.error || 'Ninguno'}</p>
                <p><strong>Datos actuales:</strong> {JSON.stringify({
                  nombre: formulario.formData.nombre,
                  empresa: formulario.formData.empresa,
                  acompanante: formulario.formData.nombreAcompanante
                })}</p>
              </div>
              
              <div className="debug-section">
                <h6>Estado del Workflow:</h6>
                <p><strong>Juego seleccionado:</strong> {workflow.juegoSeleccionado || 'Ninguno'}</p>
                <p><strong>Grupo seleccionado:</strong> {workflow.grupoSeleccionadoLocal || 'Ninguno'}</p>
                <p><strong>Grupos disponibles:</strong> {workflow.gruposDisponibles.length}</p>
              </div>
              
              {formulario.ultimaValidacion && (
                <div className="debug-section">
                  <h6>Última Validación:</h6>
                  <p><strong>Es válido:</strong> {formulario.ultimaValidacion.esValido ? 'Sí' : 'No'}</p>
                  {formulario.ultimaValidacion.mensaje && (
                    <p><strong>Mensaje:</strong> {formulario.ultimaValidacion.mensaje}</p>
                  )}
                  {formulario.ultimaValidacion.jugadorExistente && (
                    <p><strong>Jugador duplicado ID:</strong> {formulario.ultimaValidacion.jugadorExistente.id}</p>
                  )}
                </div>
              )}
            </div>
          </details>
        </div>
      )}
      
      {/* Información de ayuda sobre duplicados */}
      <div className="help-footer" style={{ marginTop: '20px', padding: '15px', background: '#e9ecef', borderRadius: '5px' }}>
        <details className="help-details">
          <summary>❓ Ayuda sobre validación de duplicados</summary>
          <div className="help-content" style={{ marginTop: '10px' }}>
            <h6>¿Cómo funciona la detección de duplicados?</h6>
            <ul>
              <li><strong>Duplicados exactos:</strong> Mismo nombre y empresa (bloquea el registro)</li>
              <li><strong>Registros similares:</strong> Nombres o empresas parecidas (muestra advertencia)</li>
              <li><strong>Acompañantes:</strong> También se verifican para evitar duplicados completos</li>
              <li><strong>Normalización:</strong> Se ignoran acentos, espacios extra y mayúsculas/minúsculas</li>
            </ul>
            
            <h6>¿Qué hacer si aparece un duplicado?</h6>
            <ul>
              <li>Verifica que no sea la misma persona</li>
              <li>Si es diferente, agrega apellido materno o segundo nombre</li>
              <li>Revisa la escritura de la empresa</li>
              <li>En modo edición, se permite modificar datos existentes</li>
            </ul>
            
            <h6>Estados del sistema:</h6>
            <ul>
              <li><span style={{color: 'red'}}>🚫 Duplicado exacto:</span> Registro bloqueado</li>
              <li><span style={{color: 'orange'}}>⚠️ Similar encontrado:</span> Advertencia, puede continuar</li>
              <li><span style={{color: 'green'}}>✅ Registro único:</span> Permite continuar</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
};

export default FormularioJugador;