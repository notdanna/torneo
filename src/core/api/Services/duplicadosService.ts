
import { JugadorFirebase, obtenerTodosLosJugadores } from '../Services/jugadorService';

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

export class ValidacionDuplicadosService {
  
  static async validarJugadorDuplicado(
    criterios: CriteriosBusqueda,
    jugadorEditandoId?: number
  ): Promise<ValidacionDuplicado> {
    
    console.log('🔍 Iniciando validación de duplicados para:', criterios);
    
    try {
      // Usar tu función existente de Firebase
      const jugadoresExistentes = await obtenerTodosLosJugadores();
      
      console.log(`📊 Jugadores existentes encontrados: ${jugadoresExistentes.length}`);
      
      if (jugadoresExistentes.length > 0) {
        console.log('👀 Primeros 3 jugadores:', jugadoresExistentes.slice(0, 3).map(j => ({
          id: j.id_jugador,
          nombre: j.nombre,
          empresa: j.empresa,
          nombreAcompanante: j.nombreAcompanante
        })));
      }
      
      const criteriosNormalizados = this.normalizarCriterios(criterios);
      console.log('🔄 Criterios normalizados:', criteriosNormalizados);
      
      const duplicado = jugadoresExistentes.find(jugador => {
        if (jugadorEditandoId && jugador.id_jugador === jugadorEditandoId) {
          console.log(`⏭️ Saltando jugador en edición: ${jugador.id_jugador}`);
          return false;
        }
        
        const esIgual = this.sonIguales(criteriosNormalizados, jugador);
        
        if (esIgual) {
          console.log('🚨 DUPLICADO ENCONTRADO:', {
            existente: {
              id: jugador.id_jugador,
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
      
      return {
        esValido: false,
        mensaje: `⚠️ Error de sistema: ${error instanceof Error ? error.message : 'Error desconocido'}. Verifica la conexión e intenta nuevamente.`,
      };
    }
  }
  
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
    
    return this.compararAcompanantes(criterios, jugadorNormalizado);
  }
  
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
    
    if (!tieneAcompananteCriterios && !tieneAcompananteJugador) {
      return true;
    }
    
    if (tieneAcompananteCriterios !== tieneAcompananteJugador) {
      return false;
    }
    
    if (tieneAcompananteCriterios && tieneAcompananteJugador) {
      const acompananteIgual = criterios.nombreAcompanante === jugador.nombreAcompanante;
      console.log('🔍 Nombres acompañantes iguales:', acompananteIgual);
      return acompananteIgual;
    }
    
    return true;
  }
  
  private static generarMensajeDuplicado(jugador: JugadorFirebase){
    let mensaje = `Registro duplicado:\n\n`;
    
    mensaje += `Nombre: ${jugador.nombre}\n`;
    mensaje += `Nombre Acompañante: ${jugador.nombreAcompanante}\n`;
    return mensaje;
  }
  
  static async buscarSimilares(criterios: CriteriosBusqueda): Promise<JugadorFirebase[]> {
    try {
      const jugadores = await obtenerTodosLosJugadores();
      const criteriosNorm = this.normalizarCriterios(criterios);
      
      return jugadores.filter(jugador => {
        const jugadorNorm = this.normalizarCriterios({
          nombre: jugador.nombre || '',
          empresa: jugador.empresa || '',
          nombreAcompanante: jugador.nombreAcompanante,
          empresaAcompanante: jugador.empresaAcompanante,
        });
        
        const similitudNombre = this.calcularSimilitud(criteriosNorm.nombre, jugadorNorm.nombre);
        const similitudEmpresa = this.calcularSimilitud(criteriosNorm.empresa, jugadorNorm.empresa);
        
        return similitudNombre > 0.8 || similitudEmpresa > 0.8;
      });
    } catch (error) {
      console.error('Error al buscar similares:', error);
      return [];
    }
  }
  
  private static calcularSimilitud(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);
    
    if (maxLen === 0) return 1;
    
    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));
    
    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j - 1][i] + 1,
          matrix[j][i - 1] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    
    const distance = matrix[len2][len1];
    return 1 - (distance / maxLen);
  }
}
