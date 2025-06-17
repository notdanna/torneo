import type { ApiResponse } from '../../models/torneo';

const API_BASE_URL = 'https://api-e3mal3grqq-uc.a.run.app/api';

// Interfaces actualizadas para el formato correcto de tu API
export interface JugadorJuegoRequest {
  jugadorId: number;
  juegoId: number;
}

export const agregarJugadorAJuego = async (
  idJugador: number, 
  idJuego: number
): Promise<ApiResponse<any>> => {
  try {
    // Formato correcto que espera tu API
    const requestBody = {
      jugadorId: idJugador,
      juegoId: idJuego
    };

    console.log('📤 Enviando datos a la API jugador-juego:', JSON.stringify(requestBody, null, 2));
    console.log('🌐 URL del endpoint:', `${API_BASE_URL}/jugador-juego`);

    const response = await fetch(`${API_BASE_URL}/jugador-juego`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 Respuesta HTTP status:', response.status);
    console.log('📡 Respuesta HTTP statusText:', response.statusText);

    // Leer la respuesta
    let responseData;
    let responseText = '';
    
    try {
      responseText = await response.text();
      console.log('📡 Respuesta raw:', responseText);
      
      if (responseText) {
        responseData = JSON.parse(responseText);
        console.log('📡 Respuesta parseada:', responseData);
      }
    } catch (parseError) {
      console.error('❌ Error parsing response:', parseError);
      console.log('📡 Response text que no se pudo parsear:', responseText);
    }

    if (!response.ok) {
      let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`;
      
      // Extraer información del error
      if (responseData) {
        console.error('❌ Error data from API:', responseData);
        
        if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (responseData.details) {
          errorMessage = responseData.details;
        }
      }
      
      throw new Error(errorMessage);
    }

    // Respuesta exitosa
    console.log('✅ Respuesta exitosa de la API:', responseData);
    
    return {
      success: true,
      data: responseData,
      message: responseData?.message || 'Jugador agregado al juego exitosamente'
    };
  } catch (error) {
    console.error('💥 Error al agregar jugador al juego:', error);
    
    // Manejo específico de errores de red
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Error de conexión. Verifica tu conexión a internet y que la API esté disponible.'
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al agregar jugador al juego'
    };
  }
};

// Función de utilidad para validación mejorada
export const validarJugadorJuego = (idJugador: number, idJuego: number): string[] => {
  const errores: string[] = [];
  
  if (!idJugador || !Number.isInteger(idJugador) || idJugador <= 0) {
    errores.push('El ID del jugador es requerido y debe ser un número entero mayor a 0');
  }
  
  if (!idJuego || !Number.isInteger(idJuego) || idJuego <= 0) {
    errores.push('El ID del juego es requerido y debe ser un número entero mayor a 0');
  }
  
  // Validar que los IDs de juego estén en el rango esperado (1-4 según tu mapping)
  if (idJuego && (idJuego < 1 || idJuego > 4)) {
    errores.push('El ID del juego debe estar entre 1 y 4 (Futbolitos, Soplados, Beer Pong, Ruelas)');
  }
  
  return errores;
};

// Función de utilidad para obtener el nombre del juego por ID
export const obtenerNombreJuegoPorId = (idJuego: number): string => {
  const juegos: { [key: number]: string } = {
    1: 'Futbolitos',
    2: 'Soplados', 
    3: 'Beer Pong',
    4: 'Ruelas'
  };
  
  return juegos[idJuego] || `Juego ${idJuego}`;
};

// Función para usar una vez que identifiquemos el formato correcto
export const agregarJugadorAJuegoFormatoFijo = async (
  idJugador: number, 
  idJuego: number,
  formato: 'original' | 'directo' | 'strings' | 'alternativo' = 'original'
): Promise<ApiResponse<any>> => {
  try {
    let requestBody: any;
    
    switch (formato) {
      case 'directo':
        requestBody = {
          id_jugador: idJugador,
          id_juego: idJuego
        };
        break;
        
      case 'strings':
        requestBody = {
          jugador_juego: {
            id_jugador: idJugador.toString(),
            id_juego: idJuego.toString()
          }
        };
        break;
        
      case 'alternativo':
        requestBody = {
          jugador_juego: {
            idJugador: idJugador,
            idJuego: idJuego
          }
        };
        break;
        
      default: // 'original'
        requestBody = {
          jugador_juego: {
            id_jugador: idJugador,
            id_juego: idJuego
          }
        };
    }

    console.log(`📤 Enviando datos (formato ${formato}):`, JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${API_BASE_URL}/jugador-juego`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('📡 Response:', responseText);

    if (!response.ok) {
      const errorData = responseText ? JSON.parse(responseText) : {};
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    }

    const data = responseText ? JSON.parse(responseText) : {};
    return {
      success: true,
      data: data,
      message: data?.message || 'Jugador agregado al juego exitosamente'
    };
  } catch (error) {
    console.error('💥 Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// Función para hacer una petición de prueba con datos de ejemplo
export const testearAPIConDatosPrueba = async (): Promise<void> => {
  console.log('🧪 === INICIANDO TEST DE API ===');
    
  // Test 2: Probar con datos válidos
  console.log('🧪 Test 2: Probando con datos válidos...');
  try {
    const resultado = await agregarJugadorAJuego(1, 1); // IDs de ejemplo
    console.log('🧪 Resultado test:', resultado);
  } catch (error) {
    console.error('🧪 Error en test:', error);
  }
  
  console.log('🧪 === FIN DEL TEST ===');
};

// Función para validar la estructura de datos antes de enviar
export const validarEstructuraDatos = (idJugador: number, idJuego: number): { valido: boolean; errores: string[] } => {
  const errores: string[] = [];
  
  // Validaciones básicas
  if (typeof idJugador !== 'number') {
    errores.push(`idJugador debe ser un número, recibido: ${typeof idJugador}`);
  }
  
  if (typeof idJuego !== 'number') {
    errores.push(`idJuego debe ser un número, recibido: ${typeof idJuego}`);
  }
  
  if (!Number.isInteger(idJugador)) {
    errores.push(`idJugador debe ser un entero, recibido: ${idJugador}`);
  }
  
  if (!Number.isInteger(idJuego)) {
    errores.push(`idJuego debe ser un entero, recibido: ${idJuego}`);
  }
  
  if (idJugador <= 0) {
    errores.push(`idJugador debe ser mayor a 0, recibido: ${idJugador}`);
  }
  
  if (idJuego < 1 || idJuego > 4) {
    errores.push(`idJuego debe estar entre 1 y 4, recibido: ${idJuego}`);
  }
  
  return {
    valido: errores.length === 0,
    errores
  };
};