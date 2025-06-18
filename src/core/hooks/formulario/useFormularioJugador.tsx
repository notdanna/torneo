import { useState, useEffect } from 'react';
import { actualizarJugador, crearJugador } from '../../../core/api/Services/jugadorService.ts';
import { FormularioJugadorProps } from '../../../core/models/formulario.ts';
import { useValidacionDuplicados } from './useValidacionDuplicados';
import { ValidacionDuplicadosService } from '../../../core/api/Services/duplicadosService.ts';

interface FormData {
  nombre: string;
  nombreAcompanante: string;
  empresa: string;
  empresaAcompanante: string;
  nivel: number;
  activo: boolean;
}

export const useFormularioJugador = ({
  nombreInicial = '',
  jugadorParaEditar = null,
  modoEdicion = false,
}: Pick<FormularioJugadorProps, 'nombreInicial' | 'jugadorParaEditar' | 'modoEdicion'>) => {
  
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    nombreAcompanante: '',
    empresa: '',
    empresaAcompanante: '',
    nivel: 0,
    activo: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [jugadorCreado, setJugadorCreado] = useState<any>(null);
  const [mostrarAlertaDuplicados, setMostrarAlertaDuplicados] = useState(false);

  // Hook de validación de duplicados
  const {
    validando,
    jugadoresSimilares,
    ultimaValidacion,
    validarDuplicado,
    limpiarValidacion
  } = useValidacionDuplicados();

  // Inicializar datos del formulario
  useEffect(() => {
    if (modoEdicion && jugadorParaEditar) {
      setFormData({
        nombre: jugadorParaEditar.nombre || '',
        nombreAcompanante: jugadorParaEditar.nombreAcompanante || '',
        empresa: jugadorParaEditar.empresa || '',
        empresaAcompanante: jugadorParaEditar.empresaAcompanante || '',
        nivel: jugadorParaEditar.nivel || 0,
        activo: jugadorParaEditar.activo !== undefined ? jugadorParaEditar.activo : true,
      });
    } else if (!modoEdicion && nombreInicial) {
      setFormData(prev => ({ ...prev, nombre: nombreInicial }));
    }
  }, [modoEdicion, jugadorParaEditar, nombreInicial]);

  // Limpiar validación cuando cambien los datos
  useEffect(() => {
    limpiarValidacion();
    setMostrarAlertaDuplicados(false);
  }, [formData.nombre, formData.empresa, formData.nombreAcompanante, formData.empresaAcompanante, limpiarValidacion]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
        ? Number(value) 
        : value
    }));
    
    // Limpiar errores cuando el usuario está editando
    if (error) {
      setError(null);
    }
  };

  const validarPaso1 = (): boolean => {
    setError(null);
    if (!formData.nombre.trim()) {
      setError('❌ El nombre principal es requerido');
      return false;
    }
    if (!formData.empresa.trim()) {
      setError('❌ La empresa principal es requerida');
      return false;
    }
    return true;
  };

  const validarDuplicados = async (): Promise<boolean> => {
    console.log('🔍 Validando duplicados en formulario...');
    
    if (!validarPaso1()) {
      console.log('❌ Validación básica falló');
      return false;
    }

    const criterios = {
      nombre: formData.nombre.trim(),
      empresa: formData.empresa.trim(),
      nombreAcompanante: formData.nombreAcompanante.trim() || undefined,
      empresaAcompanante: formData.empresaAcompanante.trim() || undefined,
    };

    console.log('📋 Criterios para validación:', criterios);

    const resultado = await validarDuplicado(
      criterios,
      modoEdicion ? jugadorParaEditar?.id.toString() : undefined
    );

    console.log('📊 Resultado validación duplicados:', resultado);

    if (!resultado.esValido) {
      setError(resultado.mensaje || 'Registro duplicado detectado');
      setMostrarAlertaDuplicados(true);
      
      // Alerta visual adicional para asegurar que se vea
      setTimeout(() => {
        alert(`🚫 DUPLICADO DETECTADO\n\n${resultado.mensaje}`);
      }, 100);
      
      return false;
    }

    return true;
  };

  const guardarJugador = async (forzarGuardado = false): Promise<boolean> => {
    console.log('💾 Guardando jugador...', { 
      forzarGuardado, 
      modoEdicion, 
      jugadorId: jugadorParaEditar?.id 
    });
    
    // VALIDACIÓN OBLIGATORIA (excepto si es guardado forzado)
    if (!forzarGuardado) {
      console.log('🔒 Ejecutando validación de duplicados...');
      
      const duplicadosValidos = await validarDuplicados();
      if (!duplicadosValidos) {
        console.log('🚫 Guardado bloqueado por duplicados');
        return false;
      }
      
      console.log('✅ Validación de duplicados pasó, procediendo a guardar');
    } else {
      console.log('⚠️ Guardado forzado, saltando validación de duplicados');
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let resultado;
      if (modoEdicion && jugadorParaEditar?.id) {
        console.log('✏️ Actualizando jugador existente:', jugadorParaEditar.id);
        await actualizarJugador(jugadorParaEditar.id, formData);
        resultado = { ...jugadorParaEditar, ...formData };
        setSuccess('✅ Pareja actualizada exitosamente');
      } else {
        console.log('➕ Creando nuevo jugador');
        resultado = await crearJugador(formData);
        setSuccess('✅ Pareja creada exitosamente');
        
        // Actualizar cache local para futuras validaciones
        ValidacionDuplicadosService.actualizarCacheJugador(resultado);
      }
      
      setJugadorCreado(resultado);
      setMostrarAlertaDuplicados(false);
      limpiarValidacion();
      
      console.log('✅ Jugador guardado exitosamente:', resultado.id);
      return true;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar jugador';
      console.error('💥 Error al guardar jugador:', errorMessage);
      setError(`❌ ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const manejarContinuarConSimilares = async () => {
    console.log('⚠️ Usuario decidió continuar con similares');
    // Guardar forzadamente ignorando similares (no duplicados exactos)
    await guardarJugador(true);
  };

  const cerrarAlertaDuplicados = () => {
    console.log('❌ Cerrando alerta de duplicados');
    setMostrarAlertaDuplicados(false);
    setError(null);
  };

  const getNivelTexto = (nivel: number): string => {
    if (nivel === 0) return 'Nuevo jugador';
    if (nivel === 1) return 'Principiante';
    if (nivel <= 3) return 'Básico';
    if (nivel <= 6) return 'Intermedio';
    if (nivel <= 8) return 'Avanzado';
    return 'Experto';
  };

  const resetForm = () => {
    console.log('🔄 Reseteando formulario');
    setFormData({
      nombre: '',
      nombreAcompanante: '',
      empresa: '',
      empresaAcompanante: '',
      nivel: 0,
      activo: true,
    });
    setJugadorCreado(null);
    setError(null);
    setSuccess(null);
    setMostrarAlertaDuplicados(false);
    limpiarValidacion();
  };

  return {
    // Estado
    formData,
    loading: loading || validando,
    error,
    success,
    jugadorCreado,
    mostrarAlertaDuplicados,
    
    // Datos de validación
    validando,
    jugadoresSimilares,
    ultimaValidacion,
    
    // Acciones
    handleInputChange,
    guardarJugador,
    validarPaso1,
    validarDuplicados,
    getNivelTexto,
    resetForm,
    manejarContinuarConSimilares,
    cerrarAlertaDuplicados,
    
    // Setters
    setError,
    setSuccess,
  };
};