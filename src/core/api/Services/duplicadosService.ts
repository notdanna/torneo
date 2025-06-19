import { JugadorFirebase } from '../../../core/api/Services/jugadorService.ts';

export interface ValidacionDuplicado {
  esValido: boolean;
  mensaje?: string;
  jugadorExistente?: JugadorFirebase;
}

export interface CriteriosBusqueda {
  nombre: string;
  empresa: string;
  nombreAcompanante?: string;
  empresaAcompanante?: string;
}

/**
 * Servicio para validar duplicados de jugadores
 */
export class ValidacionDuplicadosService {
  
  /**
   * Valida si ya existe un jugador con los mismos datos
   */
  static async validarJugadorDuplicado(
    criterios: CriteriosBusqueda,
    jugadorEditandoId?: string
  ): Promise<ValidacionDuplicado> {
    
    console.log('🔍 Iniciando validación de duplicados para:', criterios);
    
    try {
      // Obtener jugadores existentes
      const jugadoresExistentes = await this.buscarJugadoresExistentes();
      
      console.log(`📊 Jugadores existentes encontrados: ${jugadoresExistentes.length}`);
      
      // DEBUG: Mostrar algunos jugadores para verificar
      if (jugadoresExistentes.length > 0) {
        console.log('👀 Primeros 3 jugadores:', jugadoresExistentes.slice(0, 3).map(j => ({
          id: j.id,
          nombre: j.nombre,
          empresa: j.empresa,
          nombreAcompanante: j.nombreAcompanante
        })));
      }
      
      // Normalizar criterios de búsqueda
      const criteriosNormalizados = this.normalizarCriterios(criterios);
      console.log('🔄 Criterios normalizados:', criteriosNormalizados);
      
      // Buscar duplicados
      const duplicado = jugadoresExistentes.find(jugador => {
        // Excluir el jugador que se está editando
        if (jugadorEditandoId && jugador.id === parseInt(jugadorEditandoId)) {
          console.log(`⏭️ Saltando jugador en edición: ${jugador.id}`);
          return false;
        }
        
        const esIgual = this.sonIguales(criteriosNormalizados, jugador);
        
        if (esIgual) {
          console.log('🚨 DUPLICADO ENCONTRADO:', {
            existente: {
              id: jugador.id,
              nombre: jugador.nombre,
              empresa: jugador.empresa,
              nombreAcompanante: jugador.nombreAcompanante
            },
            nuevo: criteriosNormalizados
          });
        }
        
        return esIgual;
      });
      
      if (duplicado) {
        const mensaje = this.generarMensajeDuplicado(duplicado);
        console.log('❌ Validación FALLIDA:', mensaje);
        
        return {
          esValido: false,
          mensaje: mensaje,
          jugadorExistente: duplicado
        };
      }
      
      console.log('✅ Validación EXITOSA: No se encontraron duplicados');
      return { esValido: true };
      
    } catch (error) {
      console.error('💥 ERROR en validación de duplicados:', error);
      
      // En desarrollo, mostrar error; en producción, permitir registro
      if (process.env.NODE_ENV === 'development') {
        return {
          esValido: false,
          mensaje: `⚠️ Error de sistema: ${error instanceof Error ? error.message : 'Error desconocido'}. Verifica la conexión e intenta nuevamente.`,
        };
      } else {
        console.log('⚠️ Error en producción, permitiendo registro por seguridad');
        return { esValido: true };
      }
    }
  }
  
  /**
   * Busca jugadores existentes usando múltiples estrategias
   */
  private static async buscarJugadoresExistentes(): Promise<JugadorFirebase[]> {
    try {
      console.log('🌐 Iniciando búsqueda de jugadores existentes...');
      
      // Estrategia 1: Usar función existente (si está disponible)
      try {
        // Importar dinámicamente para evitar errores si no existe
        const { obtenerTodosLosJugadores } = await import('../../../core/api/Services/jugadorService.ts');
        
        if (typeof obtenerTodosLosJugadores === 'function') {
          console.log('✅ Usando obtenerTodosLosJugadores()');
          const jugadores = await obtenerTodosLosJugadores();
          
          if (Array.isArray(jugadores) && jugadores.length >= 0) {
            console.log(`📊 Jugadores obtenidos: ${jugadores.length}`);
            return jugadores;
          }
        }
      } catch (importError) {
        importError
      }
      
      // Estrategia 2: Fallback usando localStorage (para testing)
      console.log('🔄 Usando fallback con localStorage...');
      return this.obtenerJugadoresDeLocalStorage();
      
    } catch (error) {
      console.error('💥 Error general al obtener jugadores:', error);
      // Retornar array vacío en caso de error total
      return [];
    }
  }
  
  /**
   * Fallback: Obtener de localStorage
   */
  private static obtenerJugadoresDeLocalStorage(): JugadorFirebase[] {
    try {
      const STORAGE_KEY = 'jugadores_registrados_cache';
      const jugadoresGuardados = localStorage.getItem(STORAGE_KEY);
      const jugadores = jugadoresGuardados ? JSON.parse(jugadoresGuardados) : [];
      
      console.log(`📦 Jugadores en localStorage: ${jugadores.length}`);
      return jugadores;
    } catch (error) {
      console.error('💥 Error al leer localStorage:', error);
      return [];
    }
  }
  
  /**
   * Actualizar cache en localStorage cuando se cree un jugador
   */
  static actualizarCacheJugador(jugador: JugadorFirebase) {
    try {
      const STORAGE_KEY = 'jugadores_registrados_cache';
      const jugadoresGuardados = localStorage.getItem(STORAGE_KEY);
      const jugadores: JugadorFirebase[] = jugadoresGuardados ? JSON.parse(jugadoresGuardados) : [];
      
      // Agregar nuevo jugador si no existe
      const existe = jugadores.find(j => j.id === jugador.id);
      if (!existe) {
        jugadores.push(jugador);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(jugadores));
        console.log('💾 Cache actualizado con nuevo jugador:', jugador.id);
      }
    } catch (error) {
      console.error('💥 Error al actualizar cache:', error);
    }
  }
  
  /**
   * Normaliza los criterios para comparación consistente
   */
  private static normalizarCriterios(criterios: CriteriosBusqueda): CriteriosBusqueda {
    return {
      nombre: this.normalizarTexto(criterios.nombre),
      empresa: this.normalizarTexto(criterios.empresa),
      nombreAcompanante: criterios.nombreAcompanante ? 
        this.normalizarTexto(criterios.nombreAcompanante) : undefined,
      empresaAcompanante: criterios.empresaAcompanante ? 
        this.normalizarTexto(criterios.empresaAcompanante) : undefined,
    };
  }
  
  /**
   * Normaliza texto removiendo espacios, acentos y convirtiendo a minúsculas
   */
  private static normalizarTexto(texto: string): string {
    if (!texto) return '';
    
    return texto
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/\s+/g, ' ') // Normalizar espacios múltiples
      .replace(/[.,\-_()]/g, ''); // Remover puntuación común
  }
  
  /**
   * Compara si dos jugadores son iguales
   */
  private static sonIguales(criterios: CriteriosBusqueda, jugador: JugadorFirebase): boolean {
    const jugadorNormalizado = this.normalizarCriterios({
      nombre: jugador.nombre || '',
      empresa: jugador.empresa || '',
      nombreAcompanante: jugador.nombreAcompanante || '',
      empresaAcompanante: jugador.empresaAcompanante || '',
    });
    
    // Verificar jugador principal (OBLIGATORIO)
    const principalIgual = 
      criterios.nombre === jugadorNormalizado.nombre &&
      criterios.empresa === jugadorNormalizado.empresa;
    
    console.log('🔍 Comparando principal:', {
      criterio: `"${criterios.nombre}" + "${criterios.empresa}"`,
      jugador: `"${jugadorNormalizado.nombre}" + "${jugadorNormalizado.empresa}"`,
      iguales: principalIgual
    });
    
    if (!principalIgual) {
      return false;
    }
    
    // Verificar acompañante
    return this.compararAcompanantes(criterios, jugadorNormalizado);
  }
  
  /**
   * Compara acompañantes considerando diferentes escenarios
   */
  private static compararAcompanantes(
    criterios: CriteriosBusqueda, 
    jugador: CriteriosBusqueda
  ): boolean {
    const tieneAcompananteCriterios = !!criterios.nombreAcompanante?.trim();
    const tieneAcompananteJugador = !!jugador.nombreAcompanante?.trim();
    
    console.log('🔍 Comparando acompañantes:', {
      criterioTiene: tieneAcompananteCriterios,
      criterioNombre: criterios.nombreAcompanante,
      jugadorTiene: tieneAcompananteJugador,
      jugadorNombre: jugador.nombreAcompanante
    });
    
    // Si ninguno tiene acompañante
    if (!tieneAcompananteCriterios && !tieneAcompananteJugador) {
      return true;
    }
    
    // Si solo uno tiene acompañante, NO son iguales
    if (tieneAcompananteCriterios !== tieneAcompananteJugador) {
      return false;
    }
    
    // Ambos tienen acompañante - comparar nombres
    if (tieneAcompananteCriterios && tieneAcompananteJugador) {
      const acompananteIgual = criterios.nombreAcompanante === jugador.nombreAcompanante;
      console.log('🔍 Nombres acompañantes iguales:', acompananteIgual);
      return acompananteIgual;
    }
    
    return true;
  }
  
  /**
   * Genera mensaje descriptivo del duplicado encontrado
   */
  private static generarMensajeDuplicado(jugador: JugadorFirebase): string {
    let mensaje = `🚫 YA EXISTE un registro idéntico:\n\n`;
    mensaje += `👤 Nombre: "${jugador.nombre}"\n`;
    mensaje += `🏢 Empresa: "${jugador.empresa}"\n`;
    
    if (jugador.nombreAcompanante) {
      mensaje += `👥 Acompañante: "${jugador.nombreAcompanante}"\n`;
      if (jugador.empresaAcompanante) {
        mensaje += `🏢 Empresa acompañante: "${jugador.empresaAcompanante}"\n`;
      }
    }
    
    mensaje += `\n🆔 ID del registro existente: ${jugador.id}\n\n`;
    mensaje += `❗ No se pueden crear registros duplicados.\n`;
    mensaje += `💡 Si es una persona diferente, modifica el nombre o empresa para distinguirlos.`;
    
    return mensaje;
  }
  
  /**
   * Busca posibles duplicados similares (fuzzy matching)
   */
  static async buscarSimilares(criterios: CriteriosBusqueda): Promise<JugadorFirebase[]> {
    try {
      const jugadores = await this.buscarJugadoresExistentes();
      const criteriosNorm = this.normalizarCriterios(criterios);
      
      return jugadores.filter(jugador => {
        const jugadorNorm = this.normalizarCriterios({
          nombre: jugador.nombre || '',
          empresa: jugador.empresa || '',
          nombreAcompanante: jugador.nombreAcompanante,
          empresaAcompanante: jugador.empresaAcompanante,
        });
        
        // Verificar similitud en nombre (80% similar)
        const similitudNombre = this.calcularSimilitud(criteriosNorm.nombre, jugadorNorm.nombre);
        const similitudEmpresa = this.calcularSimilitud(criteriosNorm.empresa, jugadorNorm.empresa);
        
        return similitudNombre > 0.8 || similitudEmpresa > 0.8;
      });
    } catch (error) {
      console.error('Error al buscar similares:', error);
      return [];
    }
  }
  
  /**
   * Calcula similitud entre dos strings (algoritmo simple)
   */
  private static calcularSimilitud(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);
    
    if (maxLen === 0) return 1;
    
    // Algoritmo simple de distancia Levenshtein
    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));
    
    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j - 1][i] + 1,     // deletion
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i - 1] + cost // substitution
        );
      }
    }
    
    const distance = matrix[len2][len1];
    return 1 - (distance / maxLen);
  }
}