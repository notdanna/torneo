import type {AgregarGrupoRequest, AgregarGrupoResponse} from '../../models/torneo';

/**
 * Agrega un jugador a un grupo específico
 * @param jugadorId ID del jugador
 * @param grupoId ID del grupo
 * @param juegoId ID del juego
 * @returns Promise con la respuesta de la API
 */
export const agregarJugadorAGrupo = async (
  jugadorId: number,
  grupoId: number,
  juegoId: number
): Promise<AgregarGrupoResponse> => {
  const url = 'https://api-e3mal3grqq-uc.a.run.app/api/jugador-grupo';
  
  const requestBody: AgregarGrupoRequest = {
    jugadorId,
    grupoId,
    juegoId
  };

  console.log('📤 Enviando solicitud para agregar jugador al grupo:', requestBody);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    // Log de la respuesta
    console.log('📥 Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    // Si la respuesta no es OK, intentar obtener el mensaje de error del servidor
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        // Intentar parsear el error del servidor
        const errorData = await response.json();
        console.error('❌ Error del servidor:', errorData);
        
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch (parseError) {
        // Si no se puede parsear el JSON, intentar obtener el texto
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = `Error ${response.status}: ${errorText}`;
          }
        } catch (textError) {
          console.error('No se pudo obtener el mensaje de error del servidor');
        }
      }
      
      throw new Error(errorMessage);
    }

    // Parsear la respuesta exitosa
    const data = await response.json();
    console.log('✅ Jugador agregado al grupo exitosamente:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error al agregar jugador al grupo:', error);
    
    // Re-lanzar el error con un mensaje más descriptivo si es necesario
    if (error instanceof Error) {
      // Si es un error de red
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Error de conexión. Por favor verifica tu conexión a internet.');
      }
      // Si es un error de timeout
      if (error.message.includes('NetworkError')) {
        throw new Error('Error de red. El servidor no responde.');
      }
      // Otros errores
      throw error;
    }
    
    // Si no es un Error object, crear uno nuevo
    throw new Error('Error desconocido al agregar jugador al grupo');
  }
};

/**
 * Función alternativa que acepta un objeto con los parámetros
 * @param params Objeto con jugadorId, grupoId y juegoId
 * @returns Promise con la respuesta de la API
 */
export const agregarJugadorAGrupoConParams = async (
  params: AgregarGrupoRequest
): Promise<AgregarGrupoResponse> => {
  return agregarJugadorAGrupo(params.jugadorId, params.grupoId, params.juegoId);
};