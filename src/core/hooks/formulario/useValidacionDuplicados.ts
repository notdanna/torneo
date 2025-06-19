import { useState, useCallback } from 'react';
import { ValidacionDuplicadosService, ValidacionDuplicado, CriteriosBusqueda } from '../../api/Services/duplicadosService';
import { JugadorFirebase } from '../../api/Services/jugadorService';

export const useValidacionDuplicados = () => {
  const [validando, setValidando] = useState(false);
  const [jugadoresSimilares, setJugadoresSimilares] = useState<JugadorFirebase[]>([]);
  const [ultimaValidacion, setUltimaValidacion] = useState<ValidacionDuplicado | null>(null);

  const validarDuplicado = useCallback(async (
    criterios: CriteriosBusqueda,
    jugadorEditandoId?: string
  ): Promise<ValidacionDuplicado> => {
    
    console.log('🚀 useValidacionDuplicados: Iniciando validación');
    console.log('📋 Criterios recibidos:', criterios);
    console.log('✏️ Modo edición:', jugadorEditandoId ? `Sí (ID: ${jugadorEditandoId})` : 'No');
    
    setValidando(true);
    
    try {
      const resultado = await ValidacionDuplicadosService.validarJugadorDuplicado(
        criterios,
        Number(jugadorEditandoId)
      );
      
      console.log('📊 Resultado de validación:', resultado);
      setUltimaValidacion(resultado);
      
      // Si no es duplicado exacto, buscar similares para advertir
      if (resultado.esValido) {
        try {
          const similares = await ValidacionDuplicadosService.buscarSimilares(criterios);
          setJugadoresSimilares(similares);
          console.log('🔍 Similares encontrados:', similares.length);
        } catch (error) {
          console.error('⚠️ Error al buscar similares:', error);
          setJugadoresSimilares([]);
        }
      } else {
        setJugadoresSimilares([]);
      }
      
      return resultado;
      
    } catch (error) {
      console.error('💥 Error en hook de validación:', error);
      
      const errorResult: ValidacionDuplicado = { 
        esValido: false,
        mensaje: '⚠️ Error de sistema al verificar duplicados. Por favor, intenta nuevamente.'
      };
      
      setUltimaValidacion(errorResult);
      return errorResult;
      
    } finally {
      setValidando(false);
      console.log('🏁 useValidacionDuplicados: Validación completada');
    }
  }, []);

  const limpiarValidacion = useCallback(() => {
    console.log('🧹 Limpiando validación');
    setUltimaValidacion(null);
    setJugadoresSimilares([]);
  }, []);

  return {
    validando,
    jugadoresSimilares,
    ultimaValidacion,
    validarDuplicado,
    limpiarValidacion
  };
};